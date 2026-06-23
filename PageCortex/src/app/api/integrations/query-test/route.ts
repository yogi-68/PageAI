/**
 * /api/integrations/query-test — Simulate how a customer query routes through
 * intent classification and live API tool execution (dashboard Live Test Console).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-server';
import { getIntegrationsForUser } from '@/lib/api-integrations';
import { classifyQuery } from '@/lib/intent-router';
import { executeToolCall, type ToolName } from '@/lib/tools';

export async function POST(request: NextRequest) {
    const user = await getSessionUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { query?: string; integrationId?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const query = body.query?.trim();
    if (!query) {
        return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const start = Date.now();
    const classifyStart = Date.now();
    const allIntegrations = await getIntegrationsForUser(user.id);
    let integrations = allIntegrations.filter((i) => i.is_enabled);

    if (body.integrationId) {
        integrations = integrations.filter((i) => i.id === body.integrationId);
    }

    const hasIntegrations = integrations.length > 0;
    const intent = await classifyQuery(query, hasIntegrations);
    const intentClassificationMs = Date.now() - classifyStart;

    if (intent.route === 'rag' || !intent.toolName) {
        return NextResponse.json({
            query,
            timestamp: new Date().toISOString(),
            intent: 'rag' as const,
            confidence: intent.confidence,
            latencyMs: Date.now() - start,
            response:
                'This query would be answered from your indexed website content (RAG), not a live API call. Try an order or shipping question if you have integrations connected.',
            routingDetails: {
                intentClassificationMs,
                ragRetrievalMs: 0,
                toolExecutionMs: 0,
                llmGenerationMs: 0,
            },
        });
    }

    const toolName = intent.toolName as ToolName;
    const args: Record<string, string> = {};

    if (intent.entities.orderId) args.orderId = intent.entities.orderId;
    if (intent.entities.productId) args.productId = intent.entities.productId;
    if (intent.entities.location) args.location = intent.entities.location;
    if (intent.entities.variant) args.variant = intent.entities.variant;

    const toolStart = Date.now();
    const toolResult = await executeToolCall(toolName, args, integrations, '', user.id);
    const toolExecutionMs = Date.now() - toolStart;

    return NextResponse.json({
        query,
        timestamp: new Date().toISOString(),
        intent: intent.route === 'both' ? ('both' as const) : ('tool' as const),
        toolUsed: toolName,
        confidence: intent.confidence,
        latencyMs: Date.now() - start,
        response: toolResult.success
            ? toolResult.context
            : toolResult.error || 'Tool execution failed.',
        sanitizedData: toolResult.success ? toolResult.rawData : undefined,
        error: toolResult.success ? undefined : toolResult.error,
        routingDetails: {
            intentClassificationMs,
            ragRetrievalMs: 0,
            toolExecutionMs,
            llmGenerationMs: 0,
        },
    });
}
