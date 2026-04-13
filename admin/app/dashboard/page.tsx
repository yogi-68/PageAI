'use client';

import { useEffect, useState } from 'react';

interface OverviewData {
    totalUsers: number;
    totalBots: number;
    totalConversations: number;
    totalMessages: number;
    totalWebsites: number;
    totalDocuments: number;
    mrr: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    planCounts: Record<string, number>;
    weeklySignups: number;
    monthlySignups: number;
    weeklyConvos: number;
    recentUsers: any[];
}

const KPICard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
    <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge)',
        borderRadius: 12,
        padding: '20px 24px',
    }}>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--fg)' }}>{value}</div>
        {sub && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
);

export default function DashboardOverview() {
    const [data, setData] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/stats?type=overview')
            .then(r => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ color: 'var(--muted)', padding: 40 }}>Loading overview...</div>;
    if (!data) return <div style={{ color: 'var(--danger)' }}>Failed to load data</div>;

    const conversionRate = data.totalUsers > 0 ? ((data.activeSubscriptions / data.totalUsers) * 100).toFixed(1) : '0';

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Dashboard Overview</h1>

            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                <KPICard label="Total Users" value={data.totalUsers.toLocaleString()} sub={`+${data.weeklySignups} this week · +${data.monthlySignups} this month`} />
                <KPICard label="Active Bots" value={data.totalBots.toLocaleString()} />
                <KPICard label="Conversations" value={data.totalConversations.toLocaleString()} sub={`+${data.weeklyConvos} this week`} />
                <KPICard label="Total Messages" value={data.totalMessages.toLocaleString()} />
                <KPICard label="MRR" value={`$${data.mrr}`} sub={`ARR: $${data.mrr * 12}`} />
                <KPICard label="Active Subscribers" value={data.activeSubscriptions} sub={`${conversionRate}% conversion`} />
                <KPICard label="Cancelled" value={data.cancelledSubscriptions} sub="previously paid" />
                <KPICard label="Websites Crawled" value={data.totalWebsites.toLocaleString()} />
                <KPICard label="Documents" value={data.totalDocuments.toLocaleString()} />
            </div>

            {/* Plan Distribution */}
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--edge)',
                borderRadius: 12, padding: 24, marginBottom: 32,
            }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Plan Distribution</h2>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    {Object.entries(data.planCounts).sort((a, b) => b[1] - a[1]).map(([plan, count]) => {
                        const pct = data.totalUsers > 0 ? ((count / data.totalUsers) * 100).toFixed(1) : '0';
                        const colors: Record<string, string> = { free: '#6b7280', starter: '#3b82f6', growth: '#8b5cf6', scale: '#f59e0b' };
                        return (
                            <div key={plan} style={{ minWidth: 120 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 13, textTransform: 'capitalize', color: 'var(--fg)' }}>{plan}</span>
                                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>{count} ({pct}%)</span>
                                </div>
                                <div style={{ height: 6, background: 'var(--edge)', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, background: colors[plan] || 'var(--primary)', borderRadius: 3, minWidth: count > 0 ? 4 : 0, maxWidth: '100%' }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Signups */}
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--edge)',
                borderRadius: 12, padding: 24,
            }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Recent Signups</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--edge)' }}>
                                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--muted)', fontWeight: 500 }}>Email</th>
                                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--muted)', fontWeight: 500 }}>Name</th>
                                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--muted)', fontWeight: 500 }}>Plan</th>
                                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--muted)', fontWeight: 500 }}>Sub Status</th>
                                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--muted)', fontWeight: 500 }}>Usage</th>
                                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--muted)', fontWeight: 500 }}>Signed Up</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentUsers.map((u: any) => {
                                const subStatus = u.plan !== 'free' ? 'active' : u.dodo_subscription_id ? 'cancelled' : 'free';
                                return (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--edge)' }}>
                                    <td style={{ padding: '10px 12px' }}>{u.email}</td>
                                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{u.full_name || '—'}</td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                                            textTransform: 'uppercase',
                                            background: u.plan === 'free' ? 'rgba(107,114,128,0.15)' : 'rgba(99,102,241,0.15)',
                                            color: u.plan === 'free' ? '#9ca3af' : 'var(--primary)',
                                        }}>
                                            {u.plan || 'free'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <span style={{
                                            fontSize: 12, fontWeight: 500,
                                            color: subStatus === 'active' ? '#10b981' : subStatus === 'cancelled' ? '#ef4444' : '#6b7280',
                                        }}>
                                            {subStatus === 'active' ? '● Active' : subStatus === 'cancelled' ? '● Cancelled' : '○ Free'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>
                                        {u.monthly_message_count}/{u.monthly_message_limit}
                                    </td>
                                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
