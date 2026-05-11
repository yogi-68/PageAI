/**
 * /api/integrations/logs — Tool execution history and stats.
 * GET returns recent logs + aggregated stats for the dashboard.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAdminClient } from '@/lib/supabase';

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

export async function GET(request: NextRequest) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const botId = searchParams.get('botId');
    const status = searchParams.get('status'); // success | error | timeout | blocked

    const admin = getAdminClient();

    let logsQuery = admin
        .from('tool_execution_logs')
        .select(`
            id,
            tool_name,
            input_params,
            output_summary,
            status,
            latency_ms,
            error_message,
            created_at,
            bot_id,
            integration_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (botId) logsQuery = logsQuery.eq('bot_id', botId);
    if (status) logsQuery = logsQuery.eq('status', status);

    const { data: logs, error: logsError } = await logsQuery;

    if (logsError) {
        return NextResponse.json({ error: logsError.message }, { status: 500 });
    }

    // Aggregated stats per tool
    const { data: stats } = await admin
        .from('tool_execution_logs')
        .select('tool_name, status, latency_ms')
        .eq('user_id', user.id);

    const aggregated: Record<string, {
        total: number;
        successful: number;
        failed: number;
        avgLatencyMs: number;
    }> = {};

    for (const row of (stats || [])) {
        if (!aggregated[row.tool_name]) {
            aggregated[row.tool_name] = { total: 0, successful: 0, failed: 0, avgLatencyMs: 0 };
        }
        aggregated[row.tool_name].total++;
        if (row.status === 'success') aggregated[row.tool_name].successful++;
        else aggregated[row.tool_name].failed++;
        if (row.latency_ms) {
            aggregated[row.tool_name].avgLatencyMs =
                Math.round((aggregated[row.tool_name].avgLatencyMs * (aggregated[row.tool_name].total - 1) + row.latency_ms) / aggregated[row.tool_name].total);
        }
    }

    return NextResponse.json({ logs: logs || [], stats: aggregated });
}
