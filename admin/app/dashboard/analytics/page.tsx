'use client';

import { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

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

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function KPI({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] px-5 py-4">
            <div className="text-[var(--fg-secondary)] text-xs mb-1.5">{label}</div>
            <div className="text-2xl font-bold text-[var(--fg)] tabular-nums">{value}</div>
            {sub && <div className="text-[var(--fg-secondary)] text-xs mt-1">{sub}</div>}
        </div>
    );
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        fetch(`/api/stats?type=analytics&days=${days}`)
            .then(r => r.json())
            .then(setData)
            .catch(() => setError('Failed to load analytics'))
            .finally(() => setLoading(false));
    }, [days]);

    const chartTooltipStyle = {
        contentStyle: { background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: 8, fontSize: 12 },
        labelStyle: { color: 'var(--fg)' },
    };

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--fg)]">Analytics</h1>
                    <p className="text-sm text-[var(--fg-secondary)] mt-0.5">Platform usage metrics and growth data</p>
                </div>
                <div className="flex gap-1.5">
                    {[7, 14, 30, 60, 90].map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                days === d
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'border border-[var(--edge)] bg-[var(--surface)] text-[var(--fg-secondary)] hover:text-[var(--fg)]'
                            }`}
                        >
                            {d}d
                        </button>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20 text-[var(--fg-secondary)]">
                    <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mr-3" />
                    Loading analytics...
                </div>
            )}
            {error && <div className="py-10 text-center text-[var(--danger)]">{error}</div>}

            {data && !loading && (
                <>
                    {/* KPIs */}
                    <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                        <KPI label="Conversations" value={data.totalConversations.toLocaleString()} sub={`last ${days} days`} />
                        <KPI label="Messages" value={data.totalMessages.toLocaleString()} />
                        <KPI label="Avg Satisfaction" value={data.avgSatisfaction} />
                        <KPI label="Avg Response" value={`${data.avgResponseTime}ms`} />
                        <KPI label="Total Tokens" value={(data.totalTokens / 1000).toFixed(1) + 'K'} />
                    </div>

                    {/* Conversations & Messages Chart */}
                    <div className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] p-5 mb-5">
                        <h2 className="text-sm font-semibold mb-4 text-[var(--fg)]">Conversations & Messages</h2>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.conversationsByDay.map((c, i) => ({
                                    ...c,
                                    messages: data.messagesByDay[i]?.messages || 0,
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" />
                                    <XAxis dataKey="date" tick={{ fill: 'var(--fg-secondary)', fontSize: 11 }} tickFormatter={d => d.split('-').slice(1).join('/')} />
                                    <YAxis tick={{ fill: 'var(--fg-secondary)', fontSize: 11 }} />
                                    <Tooltip {...chartTooltipStyle} />
                                    <Line type="monotone" dataKey="conversations" stroke="var(--primary)" strokeWidth={2} dot={false} name="Conversations" />
                                    <Line type="monotone" dataKey="messages" stroke="#10b981" strokeWidth={2} dot={false} name="Messages" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bottom row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        {/* Usage distribution */}
                        <div className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] p-5">
                            <h2 className="text-sm font-semibold mb-4 text-[var(--fg)]">Usage Distribution</h2>
                            {(() => {
                                const pieData = [
                                    { name: 'Low (<30%)', value: data.usageBuckets.low },
                                    { name: 'Medium (30-70%)', value: data.usageBuckets.medium },
                                    { name: 'High (70-100%)', value: data.usageBuckets.high },
                                    { name: 'Maxed (100%)', value: data.usageBuckets.maxed },
                                ].filter(d => d.value > 0);
                                return (
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                                                    label={({ name, value }) => `${name}: ${value}`}
                                                    labelLine={false}>
                                                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip {...chartTooltipStyle} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Model Usage */}
                        <div className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] p-5">
                            <h2 className="text-sm font-semibold mb-4 text-[var(--fg)]">Model Usage</h2>
                            {(() => {
                                const modelData = Object.entries(data.modelUsage)
                                    .map(([model, count]) => ({ model, count }))
                                    .sort((a, b) => b.count - a.count);
                                return modelData.length > 0 ? (
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={modelData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" />
                                                <XAxis type="number" tick={{ fill: 'var(--fg-secondary)', fontSize: 11 }} />
                                                <YAxis type="category" dataKey="model" tick={{ fill: 'var(--fg-secondary)', fontSize: 11 }} width={120} />
                                                <Tooltip {...chartTooltipStyle} />
                                                <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} name="Usage" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-[var(--fg-secondary)] text-sm">No data yet</div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Top Events */}
                    {Object.keys(data.eventCounts).length > 0 && (
                        <div className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] p-5">
                            <h2 className="text-sm font-semibold mb-4 text-[var(--fg)]">Top Events</h2>
                            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                                {Object.entries(data.eventCounts)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 10)
                                    .map(([event, count]) => (
                                        <div key={event} className="flex justify-between items-center px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--edge)]">
                                            <span className="text-sm text-[var(--fg)]">{event}</span>
                                            <span className="font-bold text-[var(--primary)] text-base tabular-nums">{count}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}