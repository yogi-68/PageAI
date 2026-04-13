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

function KPI({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] px-6 py-5">
            <div className="text-[var(--fg-secondary)] text-sm mb-1">{label}</div>
            <div className="text-3xl font-bold text-[var(--fg)]">{value}</div>
            {sub && <div className="text-[var(--fg-secondary)] text-xs mt-1">{sub}</div>}
        </div>
    );
}

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

    if (loading) return (
        <div className="flex items-center justify-center py-20 text-[var(--fg-secondary)]">Loading revenue data...</div>
    );
    if (!data) return (
        <div className="text-[var(--danger)]">Failed to load data</div>
    );

    return (
        <div>
            <h1 className="text-2xl font-bold text-[var(--fg)] mb-6">Revenue</h1>

            {/* KPIs */}
            <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                <KPI label="MRR" value={`$${data.mrr}`} sub={`ARR: $${data.arr}`} />
                <KPI label="Addon Revenue" value={`$${data.addonRevenue}`} />
                <KPI label="Paid Subscribers" value={data.paidUsers} sub={`${data.conversionRate}% conversion`} />
                <KPI label="ARPU" value={`$${data.arpu}`} sub="per paid user / month" />
                <KPI label="Free Users" value={data.freeUsers} />
                <KPI label="Total Users" value={data.freeUsers + data.paidUsers} />
            </div>

            {/* Plan Breakdown */}
            <div className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] p-6 mb-8">
                <h2 className="text-base font-semibold mb-5">Revenue by Plan</h2>
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.planBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" />
                            <XAxis dataKey="plan" tick={{ fill: 'var(--fg-secondary)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--fg-secondary)', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: 8 }}
                                labelStyle={{ color: 'var(--fg)' }}
                            />
                            <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                            <Bar dataKey="count" fill="rgba(99,102,241,0.3)" radius={[4, 4, 0, 0]} name="Users" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                    {data.planBreakdown.map(p => (
                        <div key={p.plan} className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--edge)] text-sm">
                            <span className="capitalize font-semibold">{p.plan}</span>
                            <span className="text-[var(--fg-secondary)] ml-2">{p.count} users</span>
                            <span className="text-[var(--primary)] ml-2">${p.revenue}/mo</span>
                            <span className="text-[var(--fg-secondary)] ml-2">({p.percentage}%)</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Signups Chart (30 days) */}
            <div className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] p-6">
                <h2 className="text-base font-semibold mb-5">Signups (Last 30 Days)</h2>
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.signupsByDay}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: 'var(--fg-secondary)', fontSize: 11 }}
                                tickFormatter={(d: string) => d.split('-').slice(1).join('/')}
                            />
                            <YAxis tick={{ fill: 'var(--fg-secondary)', fontSize: 12 }} />
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
