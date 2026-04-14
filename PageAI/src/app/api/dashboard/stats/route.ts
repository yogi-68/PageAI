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

        // Fetch bots and profile in parallel — reduces 2 sequential round-trips to 1
        // Admin client bypasses RLS so profile is always readable
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
        const botIds = botList.map((b: any) => b.id);

        // Conversation stats
        let totalConversations = 0;
        let resolvedConversations = 0;
        let recentConversations: any[] = [];

        if (botIds.length > 0) {
            // 3 conversation queries in parallel; strip nested messages join (was fetching ALL messages)
            const [
                { count: tcCount },
                { count: rcCount },
                { data: recent },
            ] = await Promise.all([
                admin.from('conversations').select('*', { count: 'exact', head: true }).in('bot_id', botIds),
                admin.from('conversations').select('*', { count: 'exact', head: true }).in('bot_id', botIds).eq('status', 'resolved'),
                admin
                    .from('conversations')
                    .select('id, bot_id, status, message_count, created_at, bot:bots(name)')
                    .in('bot_id', botIds)
                    .order('created_at', { ascending: false })
                    .limit(10),
            ]);
            totalConversations = tcCount || 0;
            resolvedConversations = rcCount || 0;

            // Batch-fetch first message pair for all recent convos (1 query instead of N)
            const convIds = (recent || []).map((c: any) => c.id);
            const { data: previewMsgs } = convIds.length > 0
                ? await admin
                    .from('messages')
                    .select('conversation_id, role, content')
                    .in('conversation_id', convIds)
                    .order('created_at', { ascending: true })
                    .limit(convIds.length * 2)
                : { data: [] as any[] };

            const msgsByConvo: Record<string, { user?: string; bot?: string }> = {};
            (previewMsgs || []).forEach((m: any) => {
                if (!msgsByConvo[m.conversation_id]) msgsByConvo[m.conversation_id] = {};
                if (m.role === 'user' && !msgsByConvo[m.conversation_id].user) msgsByConvo[m.conversation_id].user = m.content;
                if (m.role === 'assistant' && !msgsByConvo[m.conversation_id].bot) msgsByConvo[m.conversation_id].bot = m.content;
            });

            recentConversations = (recent || []).map((conv: any) => ({
                id: conv.id,
                question: msgsByConvo[conv.id]?.user || 'No question',
                answer: msgsByConvo[conv.id]?.bot || 'No answer',
                botName: conv.bot?.name || 'Unknown',
                status: conv.status,
                time: conv.created_at,
                messageCount: conv.message_count,
            }));
        }

        return NextResponse.json({
            stats: {
                totalConversations,
                activeBots: botList.filter((b: any) => b.is_active).length,
                resolutionRate: totalConversations > 0
                    ? ((resolvedConversations / totalConversations) * 100).toFixed(1)
                    : '0.0',
                uniqueVisitors: totalConversations,
            },
            bots: botList,
            recentConversations,
            usage: profile || { plan: 'free', monthly_message_count: 0, monthly_message_limit: 50 },
        }, {
            headers: { 'Cache-Control': 'no-store' },
        });
    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
