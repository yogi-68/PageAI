import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { PLANS } from '@/lib/dodo';

// Helper to check if user is admin
function isAdmin(email: string): boolean {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    return adminEmails.includes(email.toLowerCase());
}

// GET /api/admin/stats — Fetch admin statistics
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const checkAdmin = searchParams.get('checkAdmin');
    const userId = searchParams.get('userId');

    const admin = getAdminClient();

    // Admin check endpoint
    if (checkAdmin && userId) {
        const { data: profile } = await admin
            .from('profiles')
            .select('email')
            .eq('id', userId)
            .single();
        return NextResponse.json({ isAdmin: profile ? isAdmin(profile.email) : false });
    }

    // Main stats types
    try {
        if (type === 'users') {
            const { data: users } = await admin
                .from('profiles')
                .select('id, email, full_name, plan, monthly_question_count, monthly_question_limit, created_at')
                .order('created_at', { ascending: false });
            return NextResponse.json({ users: users || [] });
        }

        if (type === 'bots') {
            const { data: bots } = await admin
                .from('bots')
                .select('id, name, model, is_active, total_conversations, primary_color, created_at, user_id, website_id')
                .order('created_at', { ascending: false });

            // Enrich with owner emails and website URLs
            const enriched = await Promise.all((bots || []).map(async (bot) => {
                const { data: profile } = await admin.from('profiles').select('email').eq('id', bot.user_id).single();
                const { data: website } = await admin.from('websites').select('url').eq('id', bot.website_id).single();
                return {
                    ...bot,
                    ownerEmail: profile?.email,
                    websiteUrl: website?.url,
                };
            }));

            return NextResponse.json({ bots: enriched });
        }

        if (type === 'revenue') {
            const { data: profiles } = await admin
                .from('profiles')
                .select('plan');

            const planCounts: Record<string, number> = {};
            let freeUsers = 0;
            let paidUsers = 0;

            (profiles || []).forEach((p: any) => {
                planCounts[p.plan] = (planCounts[p.plan] || 0) + 1;
                if (p.plan === 'free') freeUsers++;
                else paidUsers++;
            });

            const planBreakdown = Object.entries(planCounts)
                .filter(([plan]) => plan !== 'free')
                .map(([plan, count]) => ({
                    plan,
                    count,
                    revenue: count * (PLANS[plan as keyof typeof PLANS]?.price || 0),
                }));

            const mrr = planBreakdown.reduce((sum, p) => sum + p.revenue, 0);

            return NextResponse.json({
                revenue: {
                    mrr,
                    totalRevenue: mrr, // For simplicity
                    planBreakdown,
                    freeUsers,
                    paidUsers,
                },
            });
        }

        // Default: dashboard overview stats
        const { count: totalUsers } = await admin.from('profiles').select('*', { count: 'exact', head: true });
        const { count: totalBots } = await admin.from('bots').select('*', { count: 'exact', head: true });
        const { count: totalConversations } = await admin.from('conversations').select('*', { count: 'exact', head: true });
        const { count: totalWebsites } = await admin.from('websites').select('*', { count: 'exact', head: true });

        const { data: profiles } = await admin.from('profiles').select('plan');
        let activeSubscriptions = 0;
        let monthlyRevenue = 0;
        (profiles || []).forEach((p: any) => {
            if (p.plan !== 'free') {
                activeSubscriptions++;
                monthlyRevenue += PLANS[p.plan as keyof typeof PLANS]?.price || 0;
            }
        });

        const { data: recentUsers } = await admin
            .from('profiles')
            .select('id, email, plan, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        return NextResponse.json({
            totalUsers: totalUsers || 0,
            totalBots: totalBots || 0,
            totalConversations: totalConversations || 0,
            totalWebsites: totalWebsites || 0,
            activeSubscriptions,
            monthlyRevenue,
            recentUsers: recentUsers || [],
        });
    } catch (error: any) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
