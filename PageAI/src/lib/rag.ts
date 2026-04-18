/**
 * Advanced RAG (Retrieval-Augmented Generation) Pipeline
 *
 * Flow: Query → Rewrite → Hybrid Search (Vector + BM25) → Re-rank → Top K → LLM → Answer
 * Target: 95-98% answer accuracy with source citations
 */

import { getOpenAI, generateEmbedding } from './openai';
import { getAdminClient } from './supabase';
import { getCache, setCache } from './cache';
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
}

export interface RAGConfig {
    userId: string;
    dataSourceIds?: string[];
    systemPrompt?: string;
    model?: 'gpt-4.1-mini' | 'gpt-4o-mini' | 'gpt-4.1' | 'gpt-4o' | 'gpt-4.1-nano' | 'o4-mini' | 'o3-mini' | 'auto';
    temperature?: number;
    maxTokens?: number;
    confidenceThreshold?: number;
    fallbackMessage?: string;
    topK?: number;
    retrieveCount?: number;
}

// ─── Query Rewriting ──────────────────────────────────────
async function rewriteQuery(query: string): Promise<string> {
    // Skip rewriting for very short or simple queries
    if (query.split(' ').length <= 3) return query;

    try {
        const response = await getOpenAI().chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a search query optimizer. Rewrite the user's question to be more specific and better suited for semantic search. Keep the same intent but expand abbreviations, add context, and make it clearer. Return ONLY the rewritten query, nothing else. If the query is already clear and specific, return it unchanged.`,
                },
                { role: 'user', content: query },
            ],
            temperature: 0,
            max_tokens: 150,
        });
        return response.choices[0]?.message?.content?.trim() || query;
    } catch {
        return query; // Fallback to original on error
    }
}

// ─── Hybrid Search (Vector + BM25 via Supabase) ──────────
async function hybridSearch(
    queryEmbedding: number[],
    queryText: string,
    userId: string,
    dataSourceIds?: string[],
    matchCount: number = 20
): Promise<RAGChunk[]> {
    const admin = getAdminClient();

    // Empty array means this bot has no data sources yet — return nothing immediately
    // rather than searching all the user's chunks (which would leak other bots' content).
    if (dataSourceIds !== undefined && dataSourceIds.length === 0) {
        return [];
    }

    try {
        // Use the hybrid_search database function
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
            // Fallback to vector-only search
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
    matchCount: number = 20
): Promise<RAGChunk[]> {
    const admin = getAdminClient();
    let query = admin.rpc('match_chunks', {
        query_embedding: queryEmbedding,
        match_count: matchCount,
        filter_user_id: userId,
    });

    // If RPC not available, do manual vector search
    try {
        const { data, error } = await query;
        if (!error && data) return data as RAGChunk[];
    } catch {
        // Manual fallback
    }

    // Manual vector search via raw SQL through the admin client
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
function reRankChunks(
    chunks: RAGChunk[],
    query: string,
    topK: number = 5
): RAGChunk[] {
    if (chunks.length === 0) return [];

    // Multi-signal re-ranking:
    // 1. Combined score from hybrid search (already weighted)
    // 2. Query term overlap boost
    // 3. Heading relevance boost
    // 4. Content length penalty (prefer concise chunks)

    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    const scored = chunks.map((chunk) => {
        let score = chunk.combined_score;

        // Term overlap boost (Jaccard-like)
        const chunkTerms = new Set(chunk.content.toLowerCase().split(/\s+/));
        const overlap = queryTerms.filter(t => chunkTerms.has(t)).length;
        const termBoost = queryTerms.length > 0 ? (overlap / queryTerms.length) * 0.15 : 0;
        score += termBoost;

        // Heading relevance boost
        if (chunk.heading) {
            const headingLower = chunk.heading.toLowerCase();
            const headingOverlap = queryTerms.filter(t => headingLower.includes(t)).length;
            if (headingOverlap > 0) score += 0.1;
        }

        // Penalize very short chunks (< 50 tokens) slightly
        if (chunk.token_count < 50) score *= 0.9;

        return { ...chunk, combined_score: score };
    });

    // Sort by final score and take top K
    scored.sort((a, b) => b.combined_score - a.combined_score);
    return scored.slice(0, topK);
}

// ─── Confidence Estimation ────────────────────────────────
function estimateConfidence(chunks: RAGChunk[]): number {
    if (chunks.length === 0) return 0;

    // Average of top chunk scores, normalized
    const topScores = chunks.slice(0, 3).map(c => c.combined_score);
    const avgScore = topScores.reduce((a, b) => a + b, 0) / topScores.length;

    // Scale to 0-1 range (scores typically range 0.3-0.95)
    const confidence = Math.min(Math.max((avgScore - 0.2) / 0.6, 0), 1);
    return Math.round(confidence * 100) / 100;
}

// ─── Smart Model Selection ────────────────────────────────
function selectModel(
    query: string,
    confidence: number,
    requestedModel: string = 'auto'
): string {
    if (requestedModel !== 'auto') return requestedModel;

    // Use GPT-4.1 for complex queries or low confidence
    const isComplex =
        query.length > 200 ||
        query.split(' ').length > 30 ||
        /\b(compare|explain|analyze|summarize|detail|comprehensive)\b/i.test(query);

    const isLowConfidence = confidence < 0.5;

    if (isComplex || isLowConfidence) {
        return 'gpt-4.1';
    }

    return 'gpt-4.1-mini';
}

// ─── Context Builder ──────────────────────────────────────
function buildContext(chunks: RAGChunk[]): string {
    return chunks
        .map((c, i) => {
            const header = c.page_title || c.heading || `Source ${i + 1}`;
            const url = c.page_url ? ` (${c.page_url})` : '';
            return `[${header}${url}]\n${c.content}`;
        })
        .join('\n\n---\n\n');
}

// ─── Cache Key Generation ─────────────────────────────────
function getCacheKey(botId: string, query: string): string {
    const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
    return crypto.createHash('sha256').update(`${botId}:${normalized}`).digest('hex');
}

// ─── Main RAG Pipeline ────────────────────────────────────
export async function executeRAG(
    query: string,
    botId: string,
    config: RAGConfig
): Promise<RAGResult> {
    const startTime = Date.now();
    const topK = config.topK || 5;
    const retrieveCount = config.retrieveCount || 20;

    // 1. Check cache
    const cacheKey = getCacheKey(botId, query);
    const cached = await getCache(botId, cacheKey);
    if (cached) {
        return {
            ...cached,
            cached: true,
            responseTimeMs: Date.now() - startTime,
        };
    }

    // 2. Rewrite query for better retrieval
    const rewrittenQuery = await rewriteQuery(query);

    // 3. Generate embedding
    const queryEmbedding = await generateEmbedding(rewrittenQuery);

    // 4. Hybrid search (vector + BM25)
    const rawChunks = await hybridSearch(
        queryEmbedding,
        rewrittenQuery,
        config.userId,
        config.dataSourceIds,
        retrieveCount
    );

    // 5. Re-rank to top K
    const rankedChunks = reRankChunks(rawChunks, rewrittenQuery, topK);

    // 6. Estimate confidence
    const confidence = estimateConfidence(rankedChunks);

    // 7. Check confidence threshold
    const threshold = config.confidenceThreshold || 0.65;
    if (confidence < threshold && rankedChunks.length === 0) {
        return {
            answer: config.fallbackMessage || "I don't have enough information to answer that question. Could you try rephrasing or ask something else?",
            sources: [],
            confidence,
            model: 'none',
            queryRewrite: rewrittenQuery !== query ? rewrittenQuery : null,
            chunksRetrieved: 0,
            responseTimeMs: Date.now() - startTime,
            cached: false,
        };
    }

    // 8. Select model
    const model = selectModel(query, confidence, config.model);

    // 9. Build context and generate answer
    const context = buildContext(rankedChunks);

    const systemPrompt = config.systemPrompt || `You are a helpful AI assistant. Answer questions ONLY based on the provided context. Follow these rules strictly:

1. Answer based ONLY on the provided context. Do not use prior knowledge.
2. If the context doesn't contain enough information, say so honestly.
3. Cite your sources by mentioning the page title or URL when relevant.
4. Be concise, professional, and helpful.
5. If multiple sources provide information, synthesize them into a coherent answer.
6. Never make up information that isn't in the context.`;

    const response = await getOpenAI().chat.completions.create({
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: `Context from knowledge base:\n---\n${context}\n---\n\nQuestion: ${query}\n\nProvide a helpful, accurate answer based only on the context above. If relevant, mention which source the information comes from.`,
            },
        ],
        temperature: config.temperature ?? 0.2,
        max_tokens: config.maxTokens || 1024,
    });

    const answer = response.choices[0]?.message?.content?.trim() || '';

    // 10. Build source citations (deduplicated)
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
        queryRewrite: rewrittenQuery !== query ? rewrittenQuery : null,
        chunksRetrieved: rankedChunks.length,
        responseTimeMs: Date.now() - startTime,
        cached: false,
    };

    // 11. Cache the result
    await setCache(botId, cacheKey, query, result);

    return result;
}

// ─── Streaming RAG Pipeline ──────────────────────────────
// All heavy async work runs INSIDE the ReadableStream controller so the HTTP
// response starts immediately and Vercel serverless timeouts are avoided.
export function executeRAGStream(
    query: string,
    botId: string,
    config: RAGConfig
): { stream: ReadableStream; metadata: Promise<Omit<RAGResult, 'answer'>> } {
    const startTime = Date.now();
    const topK = config.topK || 5;
    const retrieveCount = config.retrieveCount || 20;

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
                // 1. Rewrite query
                const rewrittenQuery = await rewriteQuery(query);

                // 2. Generate embedding
                const queryEmbedding = await generateEmbedding(rewrittenQuery);

                // 3. Hybrid search
                const rawChunks = await hybridSearch(
                    queryEmbedding,
                    rewrittenQuery,
                    config.userId,
                    config.dataSourceIds,
                    retrieveCount
                );

                // 4. Re-rank
                const rankedChunks = reRankChunks(rawChunks, rewrittenQuery, topK);

                // 5. Confidence + model selection
                const confidence = estimateConfidence(rankedChunks);

                // Short-circuit: no knowledge base data — send fallback rather than calling OpenAI
                if (rankedChunks.length === 0) {
                    // Use a specific message that hints the KB may not be indexed yet,
                    // rather than the generic "I don't have enough information" fallback.
                    const fallback = config.fallbackMessage ||
                        "I don't have any indexed content to answer from yet. " +
                        "Please make sure the website has been crawled and fully indexed, " +
                        "or try again in a few moments.";
                    send({ type: 'token', content: fallback });
                    send({ type: 'done', sources: [], confidence: 0, model: 'none',
                        queryRewrite: rewrittenQuery !== query ? rewrittenQuery : null });
                    resolveMetadata({ sources: [], confidence: 0, model: 'none',
                        queryRewrite: rewrittenQuery !== query ? rewrittenQuery : null,
                        chunksRetrieved: 0, responseTimeMs: Date.now() - startTime, cached: false });
                    return;
                }

                const model = selectModel(query, confidence, config.model);
                const context = buildContext(rankedChunks);

                // Build sources
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

                const systemPrompt = config.systemPrompt || `You are a helpful AI assistant. Answer questions ONLY based on the provided context. Follow these rules strictly:

1. Answer based ONLY on the provided context. Do not use prior knowledge.
2. If the context doesn't contain enough information, say so honestly.
3. Cite your sources by mentioning the page title or URL when relevant.
4. Be concise, professional, and helpful.
5. If multiple sources provide information, synthesize them into a coherent answer.
6. Never make up information that isn't in the context.`;

                // 6. Stream OpenAI response token by token
                let tokensSent = 0;
                const openaiStream = await getOpenAI().chat.completions.create({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        {
                            role: 'user',
                            content: `Context from knowledge base:\n---\n${context}\n---\n\nQuestion: ${query}\n\nProvide a helpful, accurate answer based only on the context above.`,
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

                // Guard: OpenAI returned no content — send fallback token so bubble is never empty
                if (tokensSent === 0) {
                    const fallback = config.fallbackMessage ||
                        "I couldn't generate a response based on the available information. Please try rephrasing your question.";
                    send({ type: 'token', content: fallback });
                }

                // Send final metadata event
                send({
                    type: 'done',
                    sources,
                    confidence,
                    model,
                    queryRewrite: rewrittenQuery !== query ? rewrittenQuery : null,
                });

                resolveMetadata({
                    sources,
                    confidence,
                    model,
                    queryRewrite: rewrittenQuery !== query ? rewrittenQuery : null,
                    chunksRetrieved: rankedChunks.length,
                    responseTimeMs: Date.now() - startTime,
                    cached: false,
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
                });
            } finally {
                try { controller.close(); } catch { /* already closed */ }
            }
        },
    });

    return { stream, metadata };
}
