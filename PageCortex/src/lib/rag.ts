/**
 * Advanced RAG + Tool-Calling Pipeline
 *
 * Flow: Query → Intent Router → [RAG | Tool | Both] → Merge → LLM → Answer
 * Target: 95-98% answer accuracy; ~2-3s perceived response time
 *
 * Key design decisions:
 * - Intent router classifies queries first; tool calls bypass RAG for live data
 * - Embedding + intent classification run in parallel to reduce latency
 * - Confidence threshold uses OR logic: low confidence OR no chunks → fallback
 * - Post-answer evasive detection catches when LLM gives generic answers
 * - Unanswered questions are tracked in DB for dashboard notifications
 * - Low-confidence answers are never cached
 */

import { getOpenAI, generateEmbedding } from './openai';
import { getAdminClient } from './supabase';
import { getCache, setCache } from './cache';
import { classifyQuery } from './intent-router';
import { executeToolCall, type ToolName } from './tools';
import type { ClientIntegration } from './api-integrations';
import crypto from 'crypto';

// ─── Types ────────────────────────────────────────────────
export interface RAGChunk {
    chunk_id: string;
    content: string;
    token_count: number;
    heading: string | null;
    page_url: string | null;
    page_title: string | null;
    doc_type: string | null;
    metadata: Record<string, unknown>;
    vector_score: number;
    text_score: number;
    combined_score: number;
}

export interface RAGResult {
    answer: string;
    sources: { url: string; title: string; relevance: number }[];
    confidence: number;
    model: string;
    queryRewrite: string | null;
    chunksRetrieved: number;
    responseTimeMs: number;
    cached: boolean;
    suggestions?: string[];
    unanswered?: boolean;
    toolUsed?: string | null;
}

export interface RAGConfig {
    userId: string;
    botId?: string;
    dataSourceIds?: string[];
    systemPrompt?: string;
    model?: 'gpt-4.1-mini' | 'gpt-4.1' | 'auto';
    temperature?: number;
    maxTokens?: number;
    confidenceThreshold?: number;
    fallbackMessage?: string;
    topK?: number;
    retrieveCount?: number;
    integrations?: ClientIntegration[];
}

// ─── Hybrid Search (Vector + BM25 via Supabase) ──────────
async function hybridSearch(
    queryEmbedding: number[],
    queryText: string,
    userId: string,
    dataSourceIds?: string[],
    matchCount: number = 12
): Promise<RAGChunk[]> {
    const admin = getAdminClient();

    // Empty array means this bot has no data sources yet — return nothing immediately
    // rather than searching all the user's chunks (which would leak other bots' content).
    if (dataSourceIds !== undefined && dataSourceIds.length === 0) {
        return [];
    }

    try {
        const { data, error } = await admin.rpc('hybrid_search', {
            p_query_embedding: queryEmbedding,
            p_query_text: queryText,
            p_user_id: userId,
            p_data_source_ids: dataSourceIds || null,
            p_match_count: matchCount,
            p_vector_weight: 0.7,
            p_text_weight: 0.3,
        });

        if (error) {
            console.error('Hybrid search error:', error);
            return vectorOnlySearch(queryEmbedding, userId, dataSourceIds, matchCount);
        }

        return (data || []) as RAGChunk[];
    } catch {
        return vectorOnlySearch(queryEmbedding, userId, dataSourceIds, matchCount);
    }
}

// Fallback: pure vector search
async function vectorOnlySearch(
    queryEmbedding: number[],
    userId: string,
    dataSourceIds?: string[],
    matchCount: number = 12
): Promise<RAGChunk[]> {
    const admin = getAdminClient();

    try {
        const { data, error } = await admin.rpc('match_chunks', {
            query_embedding: queryEmbedding,
            match_count: matchCount,
            filter_user_id: userId,
        });
        if (!error && data) return data as RAGChunk[];
    } catch {
        // fall through to manual
    }

    const { data } = await admin
        .from('chunks')
        .select('id, content, token_count, heading, page_url, page_title, doc_type, metadata')
        .eq('user_id', userId)
        .limit(matchCount);

    return ((data || []) as any[]).map((c) => ({
        chunk_id: c.id,
        content: c.content,
        token_count: c.token_count || 0,
        heading: c.heading,
        page_url: c.page_url,
        page_title: c.page_title,
        doc_type: c.doc_type,
        metadata: c.metadata || {},
        vector_score: 0.5,
        text_score: 0,
        combined_score: 0.5,
    }));
}

// ─── Re-Ranking ───────────────────────────────────────────
function reRankChunks(chunks: RAGChunk[], query: string, topK: number = 5): RAGChunk[] {
    if (chunks.length === 0) return [];

    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    const scored = chunks.map((chunk) => {
        let score = chunk.combined_score;

        const chunkTerms = new Set(chunk.content.toLowerCase().split(/\s+/));
        const overlap = queryTerms.filter(t => chunkTerms.has(t)).length;
        const termBoost = queryTerms.length > 0 ? (overlap / queryTerms.length) * 0.15 : 0;
        score += termBoost;

        if (chunk.heading) {
            const headingLower = chunk.heading.toLowerCase();
            const headingOverlap = queryTerms.filter(t => headingLower.includes(t)).length;
            if (headingOverlap > 0) score += 0.1;
        }

        if (chunk.token_count < 50) score *= 0.9;

        return { ...chunk, combined_score: score };
    });

    scored.sort((a, b) => b.combined_score - a.combined_score);
    return scored.slice(0, topK);
}

// ─── Confidence Estimation ────────────────────────────────
function estimateConfidence(chunks: RAGChunk[]): number {
    if (chunks.length === 0) return 0;
    const topScores = chunks.slice(0, 3).map(c => c.combined_score);
    const avgScore = topScores.reduce((a, b) => a + b, 0) / topScores.length;
    const confidence = Math.min(Math.max((avgScore - 0.2) / 0.6, 0), 1);
    return Math.round(confidence * 100) / 100;
}

// ─── Smart Model Selection ────────────────────────────────
function selectModel(query: string, confidence: number, requestedModel: string = 'auto'): string {
    if (requestedModel !== 'auto') return requestedModel;

    const isComplex =
        query.length > 200 ||
        query.split(' ').length > 30 ||
        /\b(compare|explain|analyze|summarize|detail|comprehensive)\b/i.test(query);

    return (isComplex || confidence < 0.5) ? 'gpt-4.1' : 'gpt-4.1-mini';
}

// ─── Context Builder ──────────────────────────────────────
function buildContext(chunks: RAGChunk[]): string {
    return chunks.map((c) => c.content).join('\n\n---\n\n');
}

// ─── Cache Key Generation ─────────────────────────────────
function getCacheKey(botId: string, query: string): string {
    const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
    return crypto.createHash('sha256').update(`${botId}:${normalized}`).digest('hex');
}

// ─── System Prompts ───────────────────────────────────────
const DEFAULT_SYSTEM_PROMPT = `You are a friendly, professional AI assistant for this website — similar to how Intercom works. Your job is to help visitors find answers quickly and guide them toward the right action.

RULES:
1. Answer based on the provided context. Be warm, concise, and helpful — like a knowledgeable team member, not a robot.
2. If the context contains the answer, provide it clearly with specific details. Use short paragraphs and bullet points for readability.
3. If the context does NOT fully answer the question, share what you DO know from the context and then say something like: "For more details on this, I'd suggest reaching out to our team — they'd be happy to help!"
4. NEVER make up information. If you don't have the data, be honest about it.
5. Keep responses concise (2-4 sentences when possible). Don't write essays.
6. Be conversational — use "we" and "our" when referring to the company.
7. End responses with a helpful follow-up when appropriate.`;

const STREAM_SYSTEM_PROMPT = `You are a helpful AI assistant. Answer questions ONLY from the provided context.

CRITICAL RULES — follow these EXACTLY:
1. Answer STRICTLY from the context provided below. Never use prior training data or general knowledge.
2. If the context contains the answer, provide it clearly with specific details (prices, features, plan names, etc.).
3. If the context does NOT contain the specific information asked about, respond EXACTLY with: "I don't have information about that in my knowledge base. The site owner has been notified."
4. If the user asks about something specific and the context only mentions different values, do NOT say the information exists — clearly state what IS available.
5. NEVER make up, guess, or approximate information. If you're unsure, say so.
6. Be specific and precise. Include exact numbers, plan names, and details from the context.
7. Do NOT mention source files, document names, or URLs in your answer.
8. ONLY provide information relevant to the user's specific request. NEVER reveal aggregate data, total orders per day, revenue, or other site-wide metrics.`;

const TOOL_SYSTEM_PROMPT = `You are a helpful customer service AI. You have been given live data from the store's systems to answer the customer's question accurately.

RULES:
1. Use the live data provided to give a specific, factual answer.
2. Be warm, helpful, and direct. Avoid jargon.
3. If the live data doesn't fully answer the question, be transparent and suggest contacting support.
4. NEVER fabricate order numbers, tracking numbers, dates, or status information.
5. Keep responses concise — 2-4 sentences is ideal.
6. ONLY provide information relevant to the user's specific request. NEVER reveal aggregate data, total orders per day, revenue, or other site-wide metrics.`;

// ─── Main RAG Pipeline ────────────────────────────────────
export async function executeRAG(
    query: string,
    botId: string,
    config: RAGConfig
): Promise<RAGResult> {
    const startTime = Date.now();
    const topK = config.topK || 5;
    const retrieveCount = config.retrieveCount || 12;
    const integrations = config.integrations || [];

    // 1. Check cache
    const cacheKey = getCacheKey(botId, query);
    const cached = await getCache(botId, cacheKey);
    if (cached) {
        return { ...cached, cached: true, responseTimeMs: Date.now() - startTime };
    }

    // 2. Parallelize: embedding + intent classification
    const hasIntegrations = integrations.length > 0;
    const [queryEmbedding, intent] = await Promise.all([
        generateEmbedding(query),
        classifyQuery(query, hasIntegrations),
    ]);

    // 3. Route based on intent
    let toolContext = '';
    let toolUsed: string | null = null;

    if ((intent.route === 'tool' || intent.route === 'both') && intent.toolName && integrations.length > 0) {
        const toolArgs: Record<string, string> = {};
        if (intent.entities.orderId) toolArgs.orderId = intent.entities.orderId;
        if (intent.entities.productId) toolArgs.productId = intent.entities.productId;
        if (intent.entities.location) toolArgs.location = intent.entities.location;
        if (intent.entities.variant) toolArgs.variant = intent.entities.variant;

        const toolResult = await executeToolCall(
            intent.toolName as ToolName,
            toolArgs,
            integrations,
            botId,
            config.userId
        );

        if (toolResult.success) {
            toolContext = toolResult.context;
            toolUsed = intent.toolName;
        }
    }

    // 4. RAG search (skip if tool-only and tool succeeded)
    let rankedChunks: RAGChunk[] = [];
    if (intent.route !== 'tool' || !toolContext) {
        const rawChunks = await hybridSearch(
            queryEmbedding,
            query,
            config.userId,
            config.dataSourceIds,
            retrieveCount
        );
        rankedChunks = reRankChunks(rawChunks, query, topK);
    }

    const confidence = estimateConfidence(rankedChunks);

    // 5. If no tool data and no chunks — fallback
    if (!toolContext && rankedChunks.length === 0) {
        await trackUnansweredQuestion(botId, config.userId, query, confidence, 'no_chunks');
        return {
            answer: config.fallbackMessage || "I don't have enough context to answer that yet, but I'd love to help! Could you try rephrasing your question, or would you like me to connect you with our team?",
            sources: [],
            confidence,
            model: 'none',
            queryRewrite: null,
            chunksRetrieved: 0,
            responseTimeMs: Date.now() - startTime,
            cached: false,
            unanswered: true,
            toolUsed: null,
        };
    }

    // 6. Build merged context: tool data (truth) + RAG context
    const ragContext = rankedChunks.length > 0 ? buildContext(rankedChunks) : '';
    const mergedContext = [
        toolContext && `=== Live Store Data ===\n${toolContext}`,
        ragContext && `=== Knowledge Base ===\n${ragContext}`,
    ].filter(Boolean).join('\n\n');

    const model = selectModel(query, confidence, config.model);
    const systemPrompt = config.systemPrompt || (toolContext ? TOOL_SYSTEM_PROMPT : DEFAULT_SYSTEM_PROMPT);

    const response = await getOpenAI().chat.completions.create({
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: `Context:\n---\n${mergedContext}\n---\n\nQuestion: ${query}`,
            },
        ],
        temperature: config.temperature ?? 0.2,
        max_tokens: config.maxTokens || 1024,
    });

    const answer = response.choices[0]?.message?.content?.trim() || '';

    const isEvasive = detectEvasiveAnswer(answer);
    if (isEvasive) {
        await trackUnansweredQuestion(botId, config.userId, query, confidence, 'evasive_answer');
    }

    const seenUrls = new Set<string>();
    const sources = rankedChunks
        .filter((c) => {
            if (!c.page_url || seenUrls.has(c.page_url)) return false;
            seenUrls.add(c.page_url);
            return true;
        })
        .slice(0, 5)
        .map((c) => ({
            url: c.page_url!,
            title: c.page_title || c.heading || c.page_url!,
            relevance: Math.round(c.combined_score * 100) / 100,
        }));

    const result: RAGResult = {
        answer,
        sources,
        confidence,
        model,
        queryRewrite: null,
        chunksRetrieved: rankedChunks.length,
        responseTimeMs: Date.now() - startTime,
        cached: false,
        unanswered: isEvasive,
        toolUsed,
    };

    if (!isEvasive && confidence >= 0.2 && !toolContext) {
        await setCache(botId, cacheKey, query, result);
    }

    return result;
}

// ─── Streaming RAG Pipeline ──────────────────────────────
export function executeRAGStream(
    query: string,
    botId: string,
    config: RAGConfig
): { stream: ReadableStream; metadata: Promise<Omit<RAGResult, 'answer'>> } {
    const startTime = Date.now();
    const topK = config.topK || 5;
    const retrieveCount = config.retrieveCount || 12;
    const integrations = config.integrations || [];

    let resolveMetadata!: (meta: Omit<RAGResult, 'answer'>) => void;
    const metadata = new Promise<Omit<RAGResult, 'answer'>>((resolve) => {
        resolveMetadata = resolve;
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            const send = (data: object) => {
                try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                } catch {
                    // controller already closed
                }
            };

            try {
                // Parallelize embedding + intent classification
                const hasIntegrations = integrations.length > 0;
                const [queryEmbedding, intent] = await Promise.all([
                    generateEmbedding(query),
                    classifyQuery(query, hasIntegrations),
                ]);

                // Tool call path — notify widget first (loading state)
                let toolContext = '';
                let toolUsed: string | null = null;

                if ((intent.route === 'tool' || intent.route === 'both') && intent.toolName && integrations.length > 0) {
                    send({ type: 'tool_call', toolName: intent.toolName, status: 'calling' });

                    const toolArgs: Record<string, string> = {};
                    if (intent.entities.orderId) toolArgs.orderId = intent.entities.orderId;
                    if (intent.entities.productId) toolArgs.productId = intent.entities.productId;
                    if (intent.entities.location) toolArgs.location = intent.entities.location;
                    if (intent.entities.variant) toolArgs.variant = intent.entities.variant;

                    const toolResult = await executeToolCall(
                        intent.toolName as ToolName,
                        toolArgs,
                        integrations,
                        botId,
                        config.userId
                    );

                    if (toolResult.success) {
                        toolContext = toolResult.context;
                        toolUsed = intent.toolName;
                        send({ type: 'tool_call', toolName: intent.toolName, status: 'done' });
                    } else {
                        send({ type: 'tool_call', toolName: intent.toolName, status: 'error', error: toolResult.error });
                    }
                }

                // RAG search (skip if tool-only and succeeded)
                let rankedChunks: RAGChunk[] = [];
                if (intent.route !== 'tool' || !toolContext) {
                    const rawChunks = await hybridSearch(
                        queryEmbedding,
                        query,
                        config.userId,
                        config.dataSourceIds,
                        retrieveCount
                    );
                    rankedChunks = reRankChunks(rawChunks, query, topK);
                }

                const confidence = estimateConfidence(rankedChunks);

                if (!toolContext && rankedChunks.length === 0) {
                    await trackUnansweredQuestion(botId, config.userId, query, confidence, 'no_chunks');

                    const fallback = config.fallbackMessage ||
                        "I don't have enough context to answer that yet, but I'd love to help! " +
                        "Could you try rephrasing your question, or would you like me to connect you with our team?";
                    send({ type: 'token', content: fallback });
                    send({ type: 'done', sources: [], confidence, model: 'none', queryRewrite: null, unanswered: true, toolUsed: null });
                    resolveMetadata({ sources: [], confidence, model: 'none', queryRewrite: null,
                        chunksRetrieved: 0, responseTimeMs: Date.now() - startTime, cached: false, unanswered: true, toolUsed: null });
                    return;
                }

                const model = selectModel(query, confidence, config.model);

                const ragContext = rankedChunks.length > 0 ? buildContext(rankedChunks) : '';
                const mergedContext = [
                    toolContext && `=== Live Store Data ===\n${toolContext}`,
                    ragContext && `=== Knowledge Base ===\n${ragContext}`,
                ].filter(Boolean).join('\n\n');

                const seenUrls = new Set<string>();
                const sources = rankedChunks
                    .filter((c) => {
                        if (!c.page_url || seenUrls.has(c.page_url)) return false;
                        seenUrls.add(c.page_url);
                        return true;
                    })
                    .slice(0, 5)
                    .map((c) => ({
                        url: c.page_url!,
                        title: c.page_title || c.heading || c.page_url!,
                        relevance: Math.round(c.combined_score * 100) / 100,
                    }));

                const systemPrompt = config.systemPrompt || (toolContext ? TOOL_SYSTEM_PROMPT : STREAM_SYSTEM_PROMPT);

                let tokensSent = 0;
                const openaiStream = await getOpenAI().chat.completions.create({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        {
                            role: 'user',
                            content: `Context:\n---\n${mergedContext}\n---\n\nQuestion: ${query}`,
                        },
                    ],
                    temperature: config.temperature ?? 0.2,
                    max_tokens: config.maxTokens || 1024,
                    stream: true,
                });

                for await (const chunk of openaiStream) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        tokensSent++;
                        send({ type: 'token', content });
                    }
                }

                if (tokensSent === 0) {
                    const fallback = config.fallbackMessage ||
                        "I couldn't generate a response based on the available information. Please try rephrasing your question.";
                    send({ type: 'token', content: fallback });
                }

                // Generate follow-up suggestions (non-blocking)
                let suggestions: string[] = [];
                try {
                    const suggestRes = await getOpenAI().chat.completions.create({
                        model: 'gpt-4.1-mini',
                        messages: [
                            { role: 'system', content: 'You are a helpful assistant. Given a user question, suggest 3 short follow-up questions the user might ask next. Return ONLY a JSON array of 3 strings, no explanation. Keep each question under 10 words.' },
                            { role: 'user', content: `Question: ${query}\n\nContext preview: ${mergedContext.slice(0, 400)}\n\nReturn JSON array of 3 follow-up questions.` },
                        ],
                        temperature: 0.7,
                        max_tokens: 120,
                    });
                    const raw = suggestRes.choices[0]?.message?.content?.trim() || '[]';
                    const parsed = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```\s*$/, ''));
                    if (Array.isArray(parsed)) suggestions = parsed.slice(0, 3).map(String);
                } catch { /* suggestions are optional */ }

                send({
                    type: 'done',
                    sources,
                    confidence,
                    model,
                    queryRewrite: null,
                    chunksRetrieved: rankedChunks.length,
                    responseTimeMs: Date.now() - startTime,
                    unanswered: false,
                    cached: false,
                    suggestions,
                    toolUsed,
                });

                resolveMetadata({
                    sources,
                    confidence,
                    model,
                    queryRewrite: null,
                    chunksRetrieved: rankedChunks.length,
                    responseTimeMs: Date.now() - startTime,
                    cached: false,
                    suggestions,
                    toolUsed,
                });
            } catch (err: any) {
                const isQuota = err?.code === 'insufficient_quota' ||
                    (err?.status === 429 && (err?.message?.includes('quota') || err?.message?.includes('billing')));
                const isRateLimit = err?.status === 429 && !isQuota;

                let userMsg: string;
                if (isQuota) {
                    userMsg = 'This assistant is temporarily unavailable. The AI service has reached its usage limit. Please contact the site owner.';
                } else if (isRateLimit) {
                    userMsg = 'Too many requests right now. Please wait a moment and try again.';
                } else {
                    userMsg = 'Sorry, I could not generate a response. Please try again.';
                }

                send({ type: 'error', message: userMsg });
                resolveMetadata({
                    sources: [],
                    confidence: 0,
                    model: 'error',
                    queryRewrite: null,
                    chunksRetrieved: 0,
                    responseTimeMs: Date.now() - startTime,
                    cached: false,
                    toolUsed: null,
                });
            } finally {
                try { controller.close(); } catch { /* already closed */ }
            }
        },
    });

    return { stream, metadata };
}

// ─── Post-Answer Evasive Detection ────────────────────────
function detectEvasiveAnswer(answer: string): boolean {
    const lower = answer.toLowerCase();
    const evasivePatterns = [
        "i don't have information about that",
        "i don't have enough information",
        "i don't have specific information",
        "not mentioned in",
        "not available in my knowledge",
        "i cannot find",
        "i couldn't find",
        "the site owner has been notified",
        "try rephrasing",
        "contact our support team",
        "i'm not able to provide",
        "information is not available",
        "not covered in the available",
    ];
    return evasivePatterns.some(p => lower.includes(p));
}

// ─── Track Unanswered Questions ───────────────────────────
async function trackUnansweredQuestion(
    botId: string,
    userId: string,
    question: string,
    confidence: number,
    reason: 'low_confidence' | 'no_chunks' | 'fallback_triggered' | 'evasive_answer'
): Promise<void> {
    try {
        const admin = getAdminClient();
        await admin.from('unanswered_questions').insert({
            bot_id: botId,
            user_id: userId,
            question: question.substring(0, 1000),
            confidence,
            reason,
        });
    } catch (err) {
        console.error('[rag] Failed to track unanswered question:', err);
    }
}
