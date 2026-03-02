'use client';

import { useEffect, useState } from 'react';
import {
    Users, Bot, MessageSquare, DollarSign,
    TrendingUp, Activity, Loader2, Globe,
} from 'lucide-react';

interface AdminStats {
    totalUsers: number;
    totalBots: number;
    totalConversations: number;
    totalWebsites: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    recentUsers: { id: string; email: string; plan: string; created_at: string }[];
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(r => r.json())
            .then(d => setStats(d))
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

    const s = stats || {
        totalUsers: 0, totalBots: 0, totalConversations: 0,
        totalWebsites: 0, activeSubscriptions: 0, monthlyRevenue: 0, recentUsers: [],
    };

    const kpis = [
        { label: 'Total Users', value: s.totalUsers, icon: Users, gradient: 'from-blue-500 to-cyan-400', change: '+12%' },
        { label: 'Active Bots', value: s.totalBots, icon: Bot, gradient: 'from-violet-500 to-purple-400', change: '+8%' },
        { label: 'Total Conversations', value: s.totalConversations, icon: MessageSquare, gradient: 'from-emerald-500 to-teal-400', change: '+24%' },
        { label: 'Websites Indexed', value: s.totalWebsites, icon: Globe, gradient: 'from-amber-500 to-orange-400', change: '+5%' },
        { label: 'Active Subscriptions', value: s.activeSubscriptions, icon: Activity, gradient: 'from-pink-500 to-rose-400', change: '+15%' },
        { label: 'Monthly Revenue', value: `$${s.monthlyRevenue.toLocaleString()}`, icon: DollarSign, gradient: 'from-indigo-500 to-blue-400', change: '+18%' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                    Platform overview and key metrics
                </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="card !p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg`}>
                                <kpi.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {kpi.change}
                            </span>
                        </div>
                        <p className="text-2xl font-bold">{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Users */}
            <div className="card">
                <h3 className="text-base font-semibold mb-4">Recent Signups</h3>
                {s.recentUsers.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)] text-center py-8">No users yet</p>
                ) : (
                    <div className="space-y-2">
                        {s.recentUsers.map((u) => (
                            <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors">
                                <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-sm font-bold text-white">
                                    {u.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{u.email}</p>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        Joined {new Date(u.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className={`badge text-[10px] ${u.plan === 'free' ? '' : 'badge-emerald'}`}>
                                    {u.plan}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
