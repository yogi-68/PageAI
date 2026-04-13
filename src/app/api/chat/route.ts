import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { executeRAG, executeRAGStream } from '@/lib/rag';
import { rateLimitChat, verifyDomain, getClientIP, corsHeaders } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { trackEvent } from '@/lib/analytics';
import { recordOpenAIError } from '@/lib/alerts';

// POST /api/chat — Advanced RAG chat with streaming support
export async function POST(request: NextRequest) {
    const origin = request.headers.get('origin');

    try {
        const { query, botId, conversationId, visitorId, pageUrl, stream: useStream } = await request.json();

        if (!query || !botId) {
            return NextResponse.json({ error: 'query and botId are required' }, { status: 400, headers: corsHeaders(origin) });
        }

        // Rate limiting
        const ip = getClientIP(request);
        const rateLimit = rateLimitChat(ip);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded', retryAfter: rateLimit.retryAfterMs },
                { status: 429, headers: { ...corsHeaders(origin), 'Retry-After': String(Math.ceil(rateLimit.retryAfterMs / 1000)) } }
            );
        }

        const admin = getAdminClient();
        const startTime = Date.now();

        // 1. Fetch bot configuration
        const { data: bot, error: botErr } = await admin
            .from('bots')
            .select('*, website:websites(*)')
            .eq('id', botId)
            .single();

        if (botErr || !bot) {
            return NextResponse.json({ error: 'Bot not found' }, { status: 404, headers: corsHeaders(origin) });
        }

        if (!bot.is_active) {
            return NextResponse.json({ error: 'Bot is currently inactive' }, { status: 403, headers: corsHeaders(origin) });
        }

        // 2. Domain verification
        if (bot.allowed_domains && bot.allowed_domains.length > 0) {
            if (!verifyDomain(origin, bot.allowed_domains)) {
                return NextResponse.json({ error: 'Domain not authorized' }, { status: 403, headers: corsHeaders(origin) });
            }
        }

        // 3. Atomically check usage limit and increment counter
        // Uses a single DB UPDATE so concurrent requests cannot race past the limit
        const { data: allowed, error: usageErr } = await admin.rpc('check_and_increment_message', {
            p_user_id: bot.user_id,
            p_bot_id: botId,
        });

        if (usageErr) {
            console.error('Usage RPC error:', usageErr);
            return NextResponse.json({ error: 'Failed to check usage' }, { status: 500, headers: corsHeaders(origin) });
        }

        if (!allowed) {
            trackEvent('limit.reached', { botId }, bot.user_id);
            return NextResponse.json({
                error: 'Monthly message limit reached. Please upgrade your plan or buy an add-on pack.',
                limitReached: true,
            }, { status: 429, headers: corsHeaders(origin) });
        }

        // 4. Execute RAG pipeline
        // If RAG fails after increment, we roll back the usage charge.
        const ragConfig = {
            userId: bot.user_id,
            dataSourceIds: bot.data_source_ids?.length > 0 ? bot.data_source_ids : undefined,
            systemPrompt: bot.system_prompt || undefined,
            model: bot.model as 'gpt-4.1-mini' | 'gpt-4.1' | 'auto',
            temperature: bot.temperature || 0.2,
            maxTokens: bot.max_tokens || 1024,
            confidenceThreshold: bot.confidence_threshold || 0.65,
            fallbackMessage: bot.fallback_message || undefined,
        };

        // Streaming mode
        if (useStream) {
            const { stream, metadata } = await executeRAGStream(query, botId, ragConfig);

            // Save conversation async (don't block stream)
            metadata.then(async (meta) => {
                try {
                    await saveConversation(admin, {
                        botId,
                        conversationId,
                        visitorId,
                        pageUrl,
                        query,
                        answer: '[streamed]',
                        sources: meta.sources,
                        model: meta.model,
                        responseTimeMs: meta.responseTimeMs,
                        confidence: meta.confidence,
                        queryRewrite: meta.queryRewrite,
                        chunksRetrieved: meta.chunksRetrieved,
                    });
                } catch (e) {
                    console.error('Failed to save streamed conversation:', e);
                }
            });

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                    ...corsHeaders(origin),
                },
            });
        }

        // Non-streaming mode — wrap RAG in try/catch for rollback on failure
        let result;
        try {
            result = await executeRAG(query, botId, ragConfig);
        } catch (ragError: any) {
            // RAG failed AFTER usage was incremented — rollback so user isn't charged
            logger.warn('chat', 'RAG failed, rolling back usage', { error: ragError.message });
            recordOpenAIError(ragError);
            trackEvent('chat.failed', { botId, error: ragError.message }, bot.user_id);
            const { error: rollbackErr } = await admin.rpc('rollback_message_increment', {
                p_user_id: bot.user_id,
                p_bot_id: botId,
            });
            if (rollbackErr) logger.error('chat', 'Rollback failed', { error: rollbackErr.message });
            throw ragError; // re-throw to hit outer catch
        }

        // 5. Save conversation and message (usage already counted atomically above)
        const convId = await saveConversation(admin, {
            botId,
            conversationId,
            visitorId,
            pageUrl,
            query,
            answer: result.answer,
            sources: result.sources,
            model: result.model,
            responseTimeMs: result.responseTimeMs,
            confidence: result.confidence,
            queryRewrite: result.queryRewrite,
            chunksRetrieved: result.chunksRetrieved,
        });

        trackEvent('chat.completed', {
            botId,
            model: result.model,
            cached: result.cached || false,
            responseTimeMs: result.responseTimeMs,
        }, bot.user_id);

        return NextResponse.json({
            success: true,
            answer: result.answer,
            sources: result.sources,
            conversationId: convId,
            confidence: result.confidence,
            model: result.model,
            cached: result.cached,
            responseTimeMs: result.responseTimeMs,
        }, { headers: corsHeaders(origin) });

    } catch (error: any) {
        logger.error('chat', 'Chat request failed', { error: error.message });
        return NextResponse.json(
            { error: error.message || 'Failed to generate response' },
            { status: 500, headers: corsHeaders(request.headers.get('origin')) }
        );
    }
}

// Save conversation + messages helper
async function saveConversation(
    admin: any,
    params: {
        botId: string;
        conversationId?: string;
        visitorId?: string;
        pageUrl?: string;
        query: string;
        answer: string;
        sources: any[];
        model: string;
        responseTimeMs: number;
        confidence: number;
        queryRewrite: string | null;
        chunksRetrieved: number;
    }
): Promise<string> {
    let convId = params.conversationId;

    if (!convId) {
        const { data: conv, error: convErr } = await admin
            .from('conversations')
            .insert({
                bot_id: params.botId,
                visitor_id: params.visitorId || `anon_${Date.now()}`,
                visitor_page_url: params.pageUrl || null,
                status: 'active',
                message_count: 0,
            })
            .select()
            .single();
        if (convErr) throw convErr;
        convId = conv.id;
    }

    // Save user message
    await admin.from('messages').insert({
        conversation_id: convId,
        role: 'user',
        content: params.query,
    });

    // Save assistant message
    await admin.from('messages').insert({
        conversation_id: convId,
        role: 'assistant',
        content: params.answer,
        sources: params.sources,
        model_used: params.model,
        response_time_ms: params.responseTimeMs,
        confidence_score: params.confidence,
        query_rewrite: params.queryRewrite,
        chunks_retrieved: params.chunksRetrieved,
    });

    // Update conversation message count
    const { count } = await admin
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', convId);

    await admin
        .from('conversations')
        .update({
            message_count: count || 0,
            updated_at: new Date().toISOString(),
        })
        .eq('id', convId);

    return convId!;
}

// CORS preflight
export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, {
        headers: corsHeaders(request.headers.get('origin')),
    });
}
