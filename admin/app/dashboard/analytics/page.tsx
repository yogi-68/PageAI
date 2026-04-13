'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
    conversationsByDay: { date: string; conversations: number }[];
    messagesByDay: { date: string; messages: number }[];
    totalConversations: number;
    totalMessages: number;
    avgSatisfaction: string;
    avgResponseTime: number;
    totalTokens: number;
    modelUsage: Record<string, number>;
    eventCounts: Record<string, number>;
    usageBuckets: { low: number; medium: number; high: number; maxed: number };
}

const KPICard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
    <div style={{
        background: 'var(--surface)', border: '1px solid var(--edge)',
        borderRadius: 12, padding: '20px 24px',
    }}>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--fg)' }}>{value}</div>
        {sub && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
);

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/stats?type=analytics&days=${days}`)
            .then(r => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [days]);

    if (loading) return <div style={{ color: 'var(--muted)', padding: 40 }}>Loading analytics...</div>;
    if (!data) return <div style={{ color: 'var(--danger)' }}>Failed to load analytics</div>;

    const usagePieData = [
        { name: 'Low (<30%)', value: data.usageBuckets.low },
        { name: 'Medium (30-70%)', value: data.usageBuckets.medium },
        { name: 'High (70-100%)', value: data.usageBuckets.high },
        { name: 'Maxed (100%)', value: data.usageBuckets.maxed },
    ].filter(d => d.value > 0);

    const modelData = Object.entries(data.modelUsage).map(([model, count]) => ({ model, count })).sort((a, b) => b.count - a.count);
    const topEvents = Object.entries(data.eventCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Analytics</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    {[7, 14, 30, 60, 90].map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            style={{
                                padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                                border: days === d ? 'none' : '1px solid var(--edge)',
                                background: days === d ? 'var(--primary)' : 'var(--surface)',
                                color: days === d ? '#fff' : 'var(--muted)',
                            }}
                        >
                            {d}d
                        </button>
                    ))}
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
                <KPICard label="Conversations" value={data.totalConversations.toLocaleString()} sub={`last ${days} days`} />
                <KPICard label="Messages" value={data.totalMessages.toLocaleString()} />
                <KPICard label="Avg Satisfaction" value={data.avgSatisfaction} />
                <KPICard label="Avg Response" value={`${data.avgResponseTime}ms`} />
                <KPICard label="Total Tokens" value={(data.totalTokens / 1000).toFixed(1) + 'K'} />
            </div>

            {/* Conversations Chart */}
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--edge)',
                borderRadius: 12, padding: 24, marginBottom: 24,
            }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Conversations & Messages</h2>
                <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.conversationsByDay.map((c, i) => ({
                            ...c,
                            messages: data.messagesByDay[i]?.messages || 0,
                        }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" />
                            <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={d => d.split('-').slice(1).join('/')} />
                            <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: 8 }} />
                            <Line type="monotone" dataKey="conversations" stroke="var(--primary)" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="messages" stroke="#10b981" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                {/* Usage Distribution */}
                <div style={{
                    background: 'var(--surface)', border: '1px solid var(--edge)',
                    borderRadius: 12, padding: 24,
                }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Usage Distribution</h2>
                    <div style={{ height: 220, display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={usagePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                                    {usagePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Model Usage */}
                <div style={{
                    background: 'var(--surface)', border: '1px solid var(--edge)',
                    borderRadius: 12, padding: 24,
                }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Model Usage</h2>
                    {modelData.length > 0 ? (
                        <div style={{ height: 220 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={modelData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" />
                                    <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                                    <YAxis type="category" dataKey="model" tick={{ fill: 'var(--muted)', fontSize: 11 }} width={120} />
                                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: 8 }} />
                                    <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 40 }}>No model usage data</div>
                    )}
                </div>
            </div>

            {/* Top Events */}
            {topEvents.length > 0 && (
                <div style={{
                    background: 'var(--surface)', border: '1px solid var(--edge)',
                    borderRadius: 12, padding: 24,
                }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Top Events</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                        {topEvents.map(([event, count], i) => (
                            <div key={event} style={{
                                padding: '12px 16px', borderRadius: 8,
                                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--edge)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <span style={{ fontSize: 13 }}>{event}</span>
                                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
