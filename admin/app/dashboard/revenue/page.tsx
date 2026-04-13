'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

interface RevenueData {
    mrr: number;
    arr: number;
    totalRevenue: number;
    addonRevenue: number;
    freeUsers: number;
    paidUsers: number;
    conversionRate: string;
    arpu: number;
    planBreakdown: { plan: string; count: number; revenue: number; percentage: string }[];
    signupsByDay: { date: string; total: number; paid: number }[];
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

export default function RevenuePage() {
    const [data, setData] = useState<RevenueData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/stats?type=revenue')
            .then(r => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ color: 'var(--muted)', padding: 40 }}>Loading revenue data...</div>;
    if (!data) return <div style={{ color: 'var(--danger)' }}>Failed to load data</div>;

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Revenue</h1>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                <KPICard label="MRR" value={`$${data.mrr}`} sub={`ARR: $${data.arr}`} />
                <KPICard label="Addon Revenue" value={`$${data.addonRevenue}`} />
                <KPICard label="Paid Subscribers" value={data.paidUsers} sub={`${data.conversionRate}% conversion`} />
                <KPICard label="ARPU" value={`$${data.arpu}`} sub="per paid user / month" />
                <KPICard label="Free Users" value={data.freeUsers} />
                <KPICard label="Total Users" value={data.freeUsers + data.paidUsers} />
            </div>

            {/* Plan Breakdown */}
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--edge)',
                borderRadius: 12, padding: 24, marginBottom: 32,
            }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Revenue by Plan</h2>
                <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.planBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" />
                            <XAxis dataKey="plan" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: 8 }}
                                labelStyle={{ color: 'var(--fg)' }}
                            />
                            <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                            <Bar dataKey="count" fill="rgba(99,102,241,0.3)" radius={[4, 4, 0, 0]} name="Users" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
                    {data.planBreakdown.map(p => (
                        <div key={p.plan} style={{
                            padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--edge)', fontSize: 13,
                        }}>
                            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{p.plan}</span>
                            <span style={{ color: 'var(--muted)', marginLeft: 8 }}>{p.count} users</span>
                            <span style={{ color: 'var(--primary)', marginLeft: 8 }}>${p.revenue}/mo</span>
                            <span style={{ color: 'var(--muted)', marginLeft: 8 }}>({p.percentage}%)</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Signups Chart (30 days) */}
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--edge)',
                borderRadius: 12, padding: 24,
            }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Signups (Last 30 Days)</h2>
                <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.signupsByDay}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: 'var(--muted)', fontSize: 11 }}
                                tickFormatter={(d) => d.split('-').slice(1).join('/')}
                            />
                            <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: 8 }}
                                labelStyle={{ color: 'var(--fg)' }}
                            />
                            <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2} dot={false} name="Total Signups" />
                            <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} dot={false} name="Paid Signups" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
