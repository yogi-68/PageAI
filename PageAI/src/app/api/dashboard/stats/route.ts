import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/dashboard/stats — fetch live dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId');
        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        // Get user's bots
        const { data: bots, error: botsErr } = await supabase
            .from('bots')
            .select('*, website:websites(url, name, pages_count, total_words)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (botsErr) throw botsErr;
        const botList = bots || [];
        const botIds = botList.map(b => b.id);

        // Conversation stats
        let totalConversations = 0;
        let resolvedConversations = 0;
        let recentConversations: any[] = [];

        if (botIds.length > 0) {
            const { count: tcCount } = await supabase
                .from('conversations')
                .select('*', { count: 'exact', head: true })
                .in('bot_id', botIds);
            totalConversations = tcCount || 0;

            const { count: rcCount } = await supabase
                .from('conversations')
                .select('*', { count: 'exact', head: true })
                .in('bot_id', botIds)
                .eq('status', 'resolved');
            resolvedConversations = rcCount || 0;

            // Recent conversations
            const { data: recent } = await supabase
                .from('conversations')
                .select('*, bot:bots(name), messages(role, content, created_at)')
                .in('bot_id', botIds)
                .order('created_at', { ascending: false })
                .limit(10);
            recentConversations = recent || [];
        }

        // Profile usage
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan, monthly_message_count, monthly_message_limit')
            .eq('id', userId)
            .single();

        return NextResponse.json({
            stats: {
                totalConversations,
                activeBots: botList.filter(b => b.is_active).length,
                resolutionRate: totalConversations > 0
                    ? ((resolvedConversations / totalConversations) * 100).toFixed(1)
                    : '0.0',
                uniqueVisitors: totalConversations,
            },
            bots: botList,
            recentConversations: recentConversations.map(conv => {
                const firstUserMsg = conv.messages?.find((m: any) => m.role === 'user');
                const firstBotMsg = conv.messages?.find((m: any) => m.role === 'assistant');
                return {
                    id: conv.id,
                    question: firstUserMsg?.content || 'No question',
                    answer: firstBotMsg?.content || 'No answer',
                    botName: conv.bot?.name || 'Unknown',
                    status: conv.status,
                    time: conv.created_at,
                    messageCount: conv.message_count,
                };
            }),
            usage: profile || { plan: 'free', monthly_message_count: 0, monthly_message_limit: 50 },
        });
    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
