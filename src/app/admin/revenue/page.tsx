'use client';

import { useEffect, useState } from 'react';
import {
    DollarSign, TrendingUp, Users, Activity, Loader2,
    CreditCard, BarChart3, Sparkles,
} from 'lucide-react';

interface RevenueData {
    mrr: number;
    totalRevenue: number;
    planBreakdown: { plan: string; count: number; revenue: number }[];
    freeUsers: number;
    paidUsers: number;
}

export default function AdminRevenuePage() {
    const [data, setData] = useState<RevenueData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats?type=revenue')
            .then(r => r.json())
            .then(d => setData(d.revenue))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-500)]" />
            </div>
        );
    }

    const d = data || { mrr: 0, totalRevenue: 0, planBreakdown: [], freeUsers: 0, paidUsers: 0 };
    const totalUsers = d.freeUsers + d.paidUsers;
    const conversionRate = totalUsers > 0 ? ((d.paidUsers / totalUsers) * 100).toFixed(1) : '0';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Revenue</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                    Subscription metrics and revenue overview
                </p>
            </div>

            {/* Main metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card !p-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg mb-3">
                        <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold">${d.mrr.toLocaleString()}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Monthly Recurring Revenue</p>
                </div>
                <div className="card !p-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg mb-3">
                        <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold">${d.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Total Revenue</p>
                </div>
                <div className="card !p-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center shadow-lg mb-3">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold">{d.paidUsers}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Paid Subscribers</p>
                </div>
                <div className="card !p-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-lg mb-3">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold">{conversionRate}%</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Conversion Rate</p>
                </div>
            </div>

            {/* Plan Breakdown */}
            <div className="card">
                <h3 className="text-base font-semibold mb-6">Subscription Breakdown</h3>
                <div className="space-y-5">
                    {[
                        { name: 'Enterprise', planId: 'premium', price: 399, gradient: 'from-violet-500 to-purple-400' },
                        { name: 'Professional', planId: 'pro', price: 129, gradient: 'from-indigo-500 to-blue-400' },
                        { name: 'Growth', planId: 'basic', price: 39, gradient: 'from-emerald-500 to-teal-400' },
                        { name: 'Starter (Free)', planId: 'free', price: 0, gradient: 'from-gray-500 to-gray-400' },
                    ].map((plan) => {
                        const info = d.planBreakdown.find(p => p.plan === plan.planId) || { count: plan.planId === 'free' ? d.freeUsers : 0, revenue: 0 };
                        const maxCount = Math.max(...d.planBreakdown.map(p => p.count), d.freeUsers, 1);
                        return (
                            <div key={plan.planId} className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">{plan.name}</p>
                                            <span className="text-xs text-[var(--text-muted)]">${plan.price}/mo</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold">{info.count} users</span>
                                            {plan.price > 0 && (
                                                <span className="text-xs text-emerald-400">${info.revenue}/mo</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${plan.gradient} transition-all duration-500`}
                                            style={{ width: `${Math.max((info.count / maxCount) * 100, 2)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
