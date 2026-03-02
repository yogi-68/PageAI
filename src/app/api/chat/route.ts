import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding, generateAnswer } from '@/lib/openai';
import { queryEmbeddings } from '@/lib/pinecone';
import { getAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { query, botId, conversationId, visitorId, pageUrl } = await request.json();

        if (!query || !botId) {
            return NextResponse.json({ error: 'query and botId are required' }, { status: 400 });
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
            return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
        }

        if (!bot.is_active) {
            return NextResponse.json({ error: 'Bot is currently inactive' }, { status: 403 });
        }

        // 2. Check usage limits
        const { data: profile } = await admin
            .from('profiles')
            .select('monthly_question_count, monthly_question_limit')
            .eq('id', bot.user_id)
            .single();

        if (profile && profile.monthly_question_count >= profile.monthly_question_limit) {
            return NextResponse.json({
                error: 'Monthly question limit reached. Please upgrade your plan.',
                limitReached: true,
            }, { status: 429 });
        }

        // 3. Generate embedding for query
        const queryVector = await generateEmbedding(query);

        // 4. Search Pinecone for relevant content
        const matches = await queryEmbeddings(queryVector, 5, { botId });

        // Build context from matched chunks
        const contextChunks = matches
            .filter((m: any) => (m.score || 0) > 0.3)
            .map((m: any) => ({
                text: m.metadata?.text || '',
                pageUrl: m.metadata?.pageUrl || '',
                pageTitle: m.metadata?.pageTitle || '',
                score: m.score || 0,
            }));

        const context = contextChunks.map((c: any) => c.text).join('\n\n---\n\n');

        // 5. Generate answer using LLM
        const systemPrompt = bot.system_prompt ||
            `You are a helpful AI assistant for the website "${bot.website?.name || bot.name}". 
Answer questions based ONLY on the provided context. If the context doesn't contain the answer, 
say you don't have that information and suggest the user contact support. 
Always be friendly, concise, and professional. Do NOT make up information.`;

        const result = await generateAnswer(query, context, systemPrompt, bot.model);
        const answerText = result.answer || '';
        const responseTime = Date.now() - startTime;

        // 6. Build source citations
        const sources = contextChunks
            .filter((c: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.pageUrl === c.pageUrl) === i)
            .slice(0, 3)
            .map((c: any) => ({
                url: c.pageUrl,
                title: c.pageTitle,
                relevance: Math.round(c.score * 100) / 100,
            }));

        // 7. Save conversation and message to Supabase
        let convId = conversationId;
        if (!convId) {
            const { data: conv, error: convErr } = await admin
                .from('conversations')
                .insert({
                    bot_id: botId,
                    visitor_id: visitorId || `anon_${Date.now()}`,
                    visitor_page_url: pageUrl || null,
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
            content: query,
        });

        // Save assistant message
        await admin.from('messages').insert({
            conversation_id: convId,
            role: 'assistant',
            content: answerText,
            sources,
            model_used: bot.model,
            response_time_ms: responseTime,
        });

        // Update conversation message count
        await admin
            .from('conversations')
            .update({
                message_count: (await admin.from('messages').select('id', { count: 'exact', head: true }).eq('conversation_id', convId)).count || 0,
                updated_at: new Date().toISOString(),
            })
            .eq('id', convId);

        // 8. Increment usage
        await admin.rpc('increment_question_count', {
            p_user_id: bot.user_id,
            p_bot_id: botId,
        });

        return NextResponse.json({
            success: true,
            answer: answerText,
            sources,
            conversationId: convId,
            responseTimeMs: responseTime,
        });
    } catch (error: any) {
        console.error('Chat error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate response' },
            { status: 500 }
        );
    }
}

// CORS preflight
export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
