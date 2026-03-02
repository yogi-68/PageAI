'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
    BarChart3, Clock, ThumbsUp, Users, MessageSquare,
    Loader2, Globe, TrendingUp, TrendingDown,
} from 'lucide-react';

interface AnalyticsData {
    totalSessions: number;
    avgResponseTime: string;
    satisfactionRate: string;
    unansweredRate: string;
    dailyData: { day: string; total: number; resolved: number }[];
    topPages: { page: string; visits: number; questions: number }[];
}

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        if (!user) return;

        async function fetchAnalytics() {
            try {
                // Get bots
                const { data: bots } = await supabase
                    .from('bots')
                    .select('id')
                    .eq('user_id', user!.id);

                if (!bots || bots.length === 0) {
                    setData({
                        totalSessions: 0,
                        avgResponseTime: '0s',
                        satisfactionRate: '0',
                        unansweredRate: '0',
                        dailyData: [],
                        topPages: [],
                    });
                    setLoading(false);
                    return;
                }

                const botIds = bots.map(b => b.id);

                // Total conversations
                const { count: totalConvs } = await supabase
                    .from('conversations')
                    .select('*', { count: 'exact', head: true })
                    .in('bot_id', botIds);

                // Resolved
                const { count: resolvedConvs } = await supabase
                    .from('conversations')
                    .select('*', { count: 'exact', head: true })
                    .in('bot_id', botIds)
                    .eq('status', 'resolved');

                // Avg response time from messages
                const { data: msgs } = await supabase
                    .from('messages')
                    .select('response_time_ms')
                    .not('response_time_ms', 'is', null)
                    .limit(100);

                const avgMs = msgs && msgs.length > 0
                    ? msgs.reduce((sum: number, m: any) => sum + (m.response_time_ms || 0), 0) / msgs.length
                    : 0;

                // Conversations by day (last 7 days)
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                const { data: recentConvs } = await supabase
                    .from('conversations')
                    .select('created_at, status')
                    .in('bot_id', botIds)
                    .gte('created_at', sevenDaysAgo);

                const dayMap: Record<string, { total: number; resolved: number }> = {};
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                    const key = days[d.getDay()];
                    dayMap[key] = { total: 0, resolved: 0 };
                }
                (recentConvs || []).forEach((c: any) => {
                    const d = new Date(c.created_at);
                    const key = days[d.getDay()];
                    if (dayMap[key]) {
                        dayMap[key].total++;
                        if (c.status === 'resolved') dayMap[key].resolved++;
                    }
                });

                // Top pages
                const { data: convPages } = await supabase
                    .from('conversations')
                    .select('visitor_page_url')
                    .in('bot_id', botIds)
                    .not('visitor_page_url', 'is', null)
                    .limit(500);

                const pageCount: Record<string, number> = {};
                (convPages || []).forEach((c: any) => {
                    if (c.visitor_page_url) {
                        const path = new URL(c.visitor_page_url, 'http://x').pathname;
                        pageCount[path] = (pageCount[path] || 0) + 1;
                    }
                });

                const total = totalConvs || 0;
                const resolved = resolvedConvs || 0;
                const satRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0';
                const unansRate = total > 0 ? (((total - resolved) / total) * 100).toFixed(1) : '0';

                setData({
                    totalSessions: total,
                    avgResponseTime: avgMs > 0 ? `${(avgMs / 1000).toFixed(1)}s` : '0s',
                    satisfactionRate: satRate,
                    unansweredRate: unansRate,
                    dailyData: Object.entries(dayMap).map(([day, v]) => ({
                        day,
                        total: v.total,
                        resolved: v.resolved,
                    })),
                    topPages: Object.entries(pageCount)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([page, count]) => ({ page, visits: count * 3, questions: count })),
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-500)]" />
            </div>
        );
    }

    const d = data!;
    const maxBarValue = Math.max(...d.dailyData.map(x => x.total), 1);

    const kpis = [
        { label: 'Avg. Response Time', value: d.avgResponseTime, icon: Clock, gradient: 'from-blue-500 to-cyan-400' },
        { label: 'Satisfaction Rate', value: `${d.satisfactionRate}%`, icon: ThumbsUp, gradient: 'from-emerald-500 to-teal-400' },
        { label: 'Total Sessions', value: d.totalSessions.toLocaleString(), icon: Users, gradient: 'from-violet-500 to-purple-400' },
        { label: 'Unanswered Rate', value: `${d.unansweredRate}%`, icon: MessageSquare, gradient: 'from-amber-500 to-orange-400' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">
                        Track performance across all your bots
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-secondary text-xs">7D</button>
                    <button className="btn-ghost text-xs">30D</button>
                    <button className="btn-ghost text-xs">90D</button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="card !p-5">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                            <kpi.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold">{kpi.value}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{kpi.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Bar chart */}
                <div className="lg:col-span-2 card">
                    <h3 className="text-base font-semibold mb-1">Conversations</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-6">Last 7 days</p>

                    {d.dailyData.length === 0 ? (
                        <div className="text-center py-12">
                            <BarChart3 className="w-10 h-10 text-[var(--text-dim)] mx-auto mb-3" />
                            <p className="text-sm text-[var(--text-muted)]">No conversation data yet</p>
                        </div>
                    ) : (
                        <div className="flex items-end gap-3 h-48">
                            {d.dailyData.map((item) => (
                                <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-[10px] text-[var(--text-muted)]">{item.total}</span>
                                    <div className="w-full flex flex-col gap-0.5" style={{ height: `${Math.max((item.total / maxBarValue) * 160, 4)}px` }}>
                                        <div
                                            className="flex-1 rounded-t-lg bg-gradient-to-t from-indigo-600 to-violet-500 min-h-[2px]"
                                            style={{ flex: item.resolved || 1 }}
                                        />
                                        <div
                                            className="rounded-b-lg bg-[var(--bg-hover)] min-h-[2px]"
                                            style={{ flex: Math.max(item.total - item.resolved, 0) || 1, maxHeight: '40%' }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-[var(--text-muted)]">{item.day}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--border-subtle)]">
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                            <div className="w-3 h-3 rounded bg-gradient-to-r from-indigo-600 to-violet-500" />
                            Resolved
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                            <div className="w-3 h-3 rounded bg-[var(--bg-hover)]" />
                            Unresolved
                        </div>
                    </div>
                </div>

                {/* Top pages */}
                <div className="card">
                    <h3 className="text-base font-semibold mb-1">Top Pages</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-4">By question volume</p>

                    {d.topPages.length === 0 ? (
                        <div className="text-center py-8">
                            <Globe className="w-8 h-8 text-[var(--text-dim)] mx-auto mb-2" />
                            <p className="text-xs text-[var(--text-muted)]">No page data yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {d.topPages.map((page, i) => (
                                <div key={page.page} className="flex items-center gap-3">
                                    <span className="text-xs text-[var(--text-dim)] w-5">{i + 1}.</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium flex items-center gap-1.5">
                                            <Globe className="w-3 h-3 text-[var(--text-muted)]" />
                                            {page.page}
                                        </p>
                                        <p className="text-[10px] text-[var(--text-muted)]">{page.questions} questions</p>
                                    </div>
                                    <div className="w-16 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                                        <div className="h-full gradient-bg rounded-full" style={{ width: `${Math.min(100, (page.questions / Math.max(...d.topPages.map(p => p.questions))) * 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
