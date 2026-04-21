import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

// GET /api/dashboard/stats — fetch live dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId');
        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        const admin = getAdminClient();

        // Fetch bots and profile in parallel
        const [
            { data: bots, error: botsErr },
            { data: profile },
        ] = await Promise.all([
            admin
                .from('bots')
                .select('*, website:websites(url, name, pages_count, total_words)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }),
            admin
                .from('profiles')
                .select('plan, monthly_message_count, monthly_message_limit')
                .eq('id', userId)
                .single(),
        ]);

        if (botsErr) throw botsErr;
        const botList = bots || [];

        return NextResponse.json({
            stats: {
                activeBots: botList.filter((b: any) => b.is_active).length,
            },
            bots: botList,
            usage: profile || { plan: 'free', monthly_message_count: 0, monthly_message_limit: 50 },
        }, {
            headers: { 'Cache-Control': 'no-store' },
        });
    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}