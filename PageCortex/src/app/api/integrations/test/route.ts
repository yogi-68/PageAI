/**
 * /api/integrations/test — Test connectivity to an integration.
 * POSTs the integration ID; performs a live HEAD/GET and updates
 * last_test_at, last_test_status, and last_test_message in DB.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { testIntegration } from '@/lib/api-integrations';

async function getSessionUser() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function POST(request: NextRequest) {
    const user = await getSessionUser();
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
