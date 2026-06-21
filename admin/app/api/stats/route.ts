import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { PLAN_PRICES } from '@/lib/plans';
import { cacheGet, cacheSet, getCacheBackend } from '@/lib/cache';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const bust = searchParams.get('bust') === '1'; // ?bust=1 forces a fresh DB fetch
    const admin = getAdminClient();

    try {
        switch (type) {
            case 'overview': {
                if (!bust) {
                    const cached = await cacheGet<object>('stats:overview');
                    if (cached) return NextResponse.json({ ...cached, cached: true, cacheBackend: getCacheBackend() });
                }

                const [
                    { count: totalUsers },
                    { count: totalBots },
                    { count: totalConversations },
                    { count: totalMessages },
                    { count: totalWebsites },
                    { count: totalDocuments },
                ] = await Promise.all([
                    admin.from('profiles').select('*', { count: 'exact', head: true }),
                    admin.from('bots').select('*', { count: 'exact', head: true }),
                    admin.from('conversations').select('*', { count: 'exact', head: true }),
                    admin.from('messages').select('*', { count: 'exact', head: true }),
                    admin.from('websites').select('*', { count: 'exact', head: true }),
                    admin.from('documents').select('*', { count: 'exact', head: true }),
                ]);

                const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
                const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

                // Run all remaining queries in parallel (was 6 sequential round-trips)
                const [
                    { data: profiles },
                    { count: cancelledCount },
                    { data: recentUsers },
                    { count: weeklySignups },
                    { count: monthlySignups },
                    { count: weeklyConvos },
                ] = await Promise.all([
                    admin.from('profiles').select('plan, dodo_subscription_id'),
                    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'free').not('dodo_subscription_id', 'is', null),
                    admin.from('profiles').select('id, email, full_name, plan, created_at, monthly_message_count, monthly_message_limit, dodo_subscription_id, subscription_expires_at, billing_interval').order('created_at', { ascending: false }).limit(10),
                    admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
                    admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo),
                    admin.from('conversations').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
                ]);

                let mrr = 0;
                let activeSubscriptions = 0;
                const planCounts: Record<string, number> = {};
                (profiles || []).forEach((p: any) => {
                    const plan = p.plan || 'free';
                    planCounts[plan] = (planCounts[plan] || 0) + 1;
                    if (plan !== 'free') {
                        activeSubscriptions++;
                        mrr += PLAN_PRICES[plan] || 0;
                    }
                });

                const result = {
                    totalUsers: totalUsers || 0,
                    totalBots: totalBots || 0,
                    totalConversations: totalConversations || 0,
                    totalMessages: totalMessages || 0,
                    totalWebsites: totalWebsites || 0,
                    totalDocuments: totalDocuments || 0,
                    mrr,
                    activeSubscriptions,
                    cancelledSubscriptions: cancelledCount || 0,
                    planCounts,
                    weeklySignups: weeklySignups || 0,
                    monthlySignups: monthlySignups || 0,
                    weeklyConvos: weeklyConvos || 0,
                    recentUsers: recentUsers || [],
                };
                await cacheSet('stats:overview', result, 300);
                return NextResponse.json(result);
            }

            case 'users': {
                const page = parseInt(searchParams.get('page') || '1');
                const limit = 50;
                const offset = (page - 1) * limit;
                const search = searchParams.get('search') || '';
                const planFilter = searchParams.get('plan') || '';

                let query = admin
                    .from('profiles')
                    .select('id, email, full_name, plan, monthly_message_count, monthly_message_limit, addon_message_balance, max_chatbots, max_pages_indexed, total_pages_indexed, dodo_subscription_id, subscription_expires_at, billing_interval, subscription_started_at, created_at, updated_at', { count: 'exact' })
                    .order('created_at', { ascending: false })
                    .range(offset, offset + limit - 1);

                if (planFilter && planFilter !== 'all') {
                    query = query.eq('plan', planFilter);
                }
                if (search) {
                    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
                }

                const { data: users, count } = await query;

                // Get bot counts per user
                const userIds = (users || []).map(u => u.id);
                let botCounts: Record<string, number> = {};
                if (userIds.length > 0) {
                    const { data: bots } = await admin.from('bots').select('user_id').in('user_id', userIds);
                    (bots || []).forEach(b => { botCounts[b.user_id] = (botCounts[b.user_id] || 0) + 1; });
                }

                return NextResponse.json({
                    users: (users || []).map(u => ({ ...u, botCount: botCounts[u.id] || 0 })),
                    total: count || 0,
                    page,
                    totalPages: Math.ceil((count || 0) / limit),
                });
            }

            case 'bots': {
                const { data: bots } = await admin
                    .from('bots')
                    .select('id, name, model, is_active, total_conversations, primary_color, temperature, max_tokens, created_at, user_id, website_id, data_source_ids, allowed_domains, branding_enabled')
                    .order('total_conversations', { ascending: false });

                const userIds = [...new Set((bots || []).map(b => b.user_id).filter(Boolean))];
                const websiteIds = [...new Set((bots || []).map(b => b.website_id).filter(Boolean))];

                const [{ data: profiles }, { data: websites }] = await Promise.all([
                    userIds.length > 0 ? admin.from('profiles').select('id, email, plan').in('id', userIds) : { data: [] as any[] },
                    websiteIds.length > 0 ? admin.from('websites').select('id, url, name, pages_count, status').in('id', websiteIds) : { data: [] as any[] },
                ]);

                const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
                const websiteMap = Object.fromEntries((websites || []).map(w => [w.id, w]));

                return NextResponse.json({
                    bots: (bots || []).map(b => ({
                        ...b,
                        owner: profileMap[b.user_id] || null,
                        website: websiteMap[b.website_id] || null,
                    })),
                });
            }

            case 'conversations': {
                const botId = searchParams.get('botId');
                const limit = parseInt(searchParams.get('limit') || '50');

                let query = admin
                    .from('conversations')
                    .select('id, bot_id, visitor_id, visitor_page_url, status, message_count, satisfaction_rating, created_at, updated_at')
                    .order('created_at', { ascending: false })
                    .limit(limit);

                if (botId) query = query.eq('bot_id', botId);

                const { data: conversations } = await query;

                // Enrich with bot names
                const botIds = [...new Set((conversations || []).map(c => c.bot_id))];
                const { data: bots } = botIds.length > 0
                    ? await admin.from('bots').select('id, name, user_id').in('id', botIds)
                    : { data: [] as any[] };
                const botMap = Object.fromEntries((bots || []).map(b => [b.id, b]));

                return NextResponse.json({
                    conversations: (conversations || []).map(c => ({
                        ...c,
                        bot: botMap[c.bot_id] || null,
                    })),
                });
            }

            case 'conversation-detail': {
                const convId = searchParams.get('id');
                if (!convId) return NextResponse.json({ error: 'id required' }, { status: 400 });

                const { data: conversation } = await admin
                    .from('conversations')
                    .select('*')
                    .eq('id', convId)
                    .single();

                const { data: messages } = await admin
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', convId)
                    .order('created_at', { ascending: true });

                return NextResponse.json({ conversation, messages: messages || [] });
            }

            case 'revenue': {
                const { data: profiles } = await admin.from('profiles').select('plan, dodo_subscription_id, created_at');
                const planCounts: Record<string, number> = {};
                let freeUsers = 0, paidUsers = 0, mrr = 0;
                (profiles || []).forEach((p: any) => {
                    const plan = p.plan || 'free';
                    planCounts[plan] = (planCounts[plan] || 0) + 1;
                    if (plan === 'free') freeUsers++;
                    else { paidUsers++; mrr += PLAN_PRICES[plan] || 0; }
                });

                const planBreakdown = Object.entries(planCounts).map(([plan, count]) => ({
                    plan,
                    count,
                    revenue: count * (PLAN_PRICES[plan] || 0),
                    percentage: ((count / Math.max((profiles || []).length, 1)) * 100).toFixed(1),
                })).sort((a, b) => b.revenue - a.revenue);

                // Addon revenue
                const { data: addons } = await admin
                    .from('message_addons')
                    .select('amount_paid_usd, created_at');
                const addonRevenue = (addons || []).reduce((s, a) => s + parseFloat(a.amount_paid_usd || '0'), 0);

                // Signups by day (last 30 days)
                const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
                const { data: recentProfiles } = await admin
                    .from('profiles')
                    .select('created_at, plan')
                    .gte('created_at', thirtyDaysAgo);

                const signupsByDay: Record<string, { total: number; paid: number }> = {};
                for (let i = 29; i >= 0; i--) {
                    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
                    signupsByDay[d] = { total: 0, paid: 0 };
                }
                (recentProfiles || []).forEach(p => {
                    const d = p.created_at.split('T')[0];
                    if (signupsByDay[d]) {
                        signupsByDay[d].total++;
                        if (p.plan !== 'free') signupsByDay[d].paid++;
                    }
                });

                return NextResponse.json({
                    mrr,
                    arr: mrr * 12,
                    totalRevenue: mrr,
                    addonRevenue: Math.round(addonRevenue * 100) / 100,
                    freeUsers,
                    paidUsers,
                    conversionRate: (freeUsers + paidUsers) > 0 ? ((paidUsers / (freeUsers + paidUsers)) * 100).toFixed(1) : '0',
                    arpu: paidUsers > 0 ? Math.round(mrr / paidUsers) : 0,
                    planBreakdown,
                    signupsByDay: Object.entries(signupsByDay).map(([date, data]) => ({ date, ...data })),
                });
            }

            case 'analytics': {
                const days = parseInt(searchParams.get('days') || '30');
                const since = new Date(Date.now() - days * 86400000).toISOString();

                // Conversations by day
                const { data: convos } = await admin
                    .from('conversations')
                    .select('created_at, status, message_count, satisfaction_rating')
                    .gte('created_at', since);

                const convosByDay: Record<string, number> = {};
                for (let i = days - 1; i >= 0; i--) {
                    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
                    convosByDay[d] = 0;
                }
                let totalRating = 0, ratedCount = 0;
                (convos || []).forEach(c => {
                    const d = c.created_at.split('T')[0];
                    if (convosByDay[d] !== undefined) convosByDay[d]++;
                    if (c.satisfaction_rating) { totalRating += c.satisfaction_rating; ratedCount++; }
                });

                // Messages by day
                const { data: msgs } = await admin
                    .from('messages')
                    .select('created_at, role, model_used, prompt_tokens, completion_tokens, response_time_ms')
                    .gte('created_at', since);

                const messagesByDay: Record<string, number> = {};
                let totalTokens = 0, totalResponseTime = 0, responseCount = 0;
                const modelUsage: Record<string, number> = {};
                for (let i = days - 1; i >= 0; i--) {
                    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
                    messagesByDay[d] = 0;
                }
                (msgs || []).forEach(m => {
                    const d = m.created_at.split('T')[0];
                    if (messagesByDay[d] !== undefined) messagesByDay[d]++;
                    totalTokens += (m.prompt_tokens || 0) + (m.completion_tokens || 0);
                    if (m.response_time_ms) { totalResponseTime += m.response_time_ms; responseCount++; }
                    if (m.model_used) { modelUsage[m.model_used] = (modelUsage[m.model_used] || 0) + 1; }
                });

                // Analytics events
                const { data: events } = await admin
                    .from('analytics_events')
                    .select('event, created_at')
                    .gte('created_at', since);

                const eventCounts: Record<string, number> = {};
                (events || []).forEach(e => {
                    eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
                });

                // Usage distribution
                const { data: profiles } = await admin
                    .from('profiles')
                    .select('monthly_message_count, monthly_message_limit, plan');

                const usageBuckets = { low: 0, medium: 0, high: 0, maxed: 0 };
                (profiles || []).forEach(p => {
                    const pct = p.monthly_message_limit > 0 ? (p.monthly_message_count / p.monthly_message_limit) * 100 : 0;
                    if (pct >= 100) usageBuckets.maxed++;
                    else if (pct >= 70) usageBuckets.high++;
                    else if (pct >= 30) usageBuckets.medium++;
                    else usageBuckets.low++;
                });

                return NextResponse.json({
                    conversationsByDay: Object.entries(convosByDay).map(([date, count]) => ({ date, conversations: count })),
                    messagesByDay: Object.entries(messagesByDay).map(([date, count]) => ({ date, messages: count })),
                    totalConversations: (convos || []).length,
                    totalMessages: (msgs || []).length,
                    avgSatisfaction: ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : 'N/A',
                    avgResponseTime: responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0,
                    totalTokens,
                    modelUsage,
                    eventCounts,
                    usageBuckets,
                });
            }

            case 'webhooks': {
                const { data: events } = await admin
                    .from('webhook_events')
                    .select('id, event_id, event_type, processed_at')
                    .order('processed_at', { ascending: false })
                    .limit(50);
                return NextResponse.json({
                    events: (events || []).map(e => ({
                        id: e.id,
                        event_type: e.event_type,
                        status: 'processed',
                        created_at: e.processed_at,
                        payload: { event_id: e.event_id },
                        error_message: null,
                    })),
                });
            }

            default:
                return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Admin API error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
