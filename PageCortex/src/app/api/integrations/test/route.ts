/**
 * /api/integrations/test — Test connectivity to an integration.
 * POSTs the integration ID; performs a live HEAD/GET and updates
 * last_test_at, last_test_status, and last_test_message in DB.
 */

import { NextRequest, NextResponse } from 'next/server';
import { testIntegration } from '@/lib/api-integrations';
import { getSessionUser } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
    const user = await getSessionUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { integrationId?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.integrationId) {
        return NextResponse.json({ error: 'integrationId is required' }, { status: 400 });
    }

    const result = await testIntegration(body.integrationId, user.id);

    return NextResponse.json({
        success: result.success,
        message: result.message,
        latencyMs: result.latencyMs,
    });
}
