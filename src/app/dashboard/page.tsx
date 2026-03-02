'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import {
    MessageSquare, Bot, TrendingUp, Users, Plus,
    Globe, ArrowUpRight, ArrowDownRight, MoreHorizontal,
    ExternalLink, Clock, Loader2, Sparkles,
} from 'lucide-react';

interface DashboardData {
    stats: {
        totalConversations: number;
        activeBots: number;
        resolutionRate: string;
        uniqueVisitors: number;
    };
    bots: any[];
    recentConversations: any[];
    usage: {
        plan: string;
        monthly_question_count: number;
        monthly_question_limit: number;
    };
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return;

        async function fetchData() {
            try {
                const res = await fetch(`/api/dashboard/stats?userId=${user!.id}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const json = await res.json();
                setData(json);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-500)] mx-auto mb-4" />
                    <p className="text-sm text-[var(--text-muted)]">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    const stats = data?.stats || { totalConversations: 0, activeBots: 0, resolutionRate: '0', uniqueVisitors: 0 };
    const bots = data?.bots || [];
    const conversations = data?.recentConversations || [];
    const usage = data?.usage || { plan: 'free', monthly_question_count: 0, monthly_question_limit: 1000 };

    const statCards = [
        {
            label: 'Total Conversations',
            value: stats.totalConversations.toLocaleString(),
            icon: MessageSquare,
            gradient: 'from-blue-500 to-cyan-400',
        },
        {
            label: 'Active Bots',
            value: stats.activeBots,
            icon: Bot,
            gradient: 'from-violet-500 to-purple-400',
        },
        {
            label: 'Resolution Rate',
            value: `${stats.resolutionRate}%`,
            icon: TrendingUp,
            gradient: 'from-emerald-500 to-teal-400',
        },
        {
            label: 'Monthly Usage',
            value: `${usage.monthly_question_count}/${usage.monthly_question_limit}`,
            icon: Users,
            gradient: 'from-amber-500 to-orange-400',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">
                        Overview of your AI chatbot performance
                    </p>
                </div>
                <Link href="/dashboard/bots/new" className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Create New Bot
                </Link>
            </div>

            {/* Getting started — only show if no bots */}
            {bots.length === 0 && (
                <div className="card gradient-border !p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/20">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Welcome to PageAI! 🎉</h2>
                    <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-6">
                        Create your first AI chatbot in under 5 minutes. Just enter your website URL
                        and we&apos;ll do the rest.
                    </p>
                    <Link href="/dashboard/bots/new" className="btn-primary !py-3 !px-8">
                        <Plus className="w-5 h-5" />
                        Create Your First Bot
                    </Link>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div key={stat.label} className="card !p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Content grid */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* Bots List */}
                <div className="lg:col-span-3 card !p-0">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
                        <h2 className="text-base font-semibold">Your Bots</h2>
                        <Link href="/dashboard/bots" className="text-xs text-[var(--primary-400)] hover:underline flex items-center gap-1">
                            View All <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>

                    {bots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Bot className="w-10 h-10 text-[var(--text-dim)] mb-3" />
                            <p className="text-sm text-[var(--text-muted)] mb-4">No bots yet</p>
                            <Link href="/dashboard/bots/new" className="btn-primary text-sm">
                                <Plus className="w-4 h-4" />
                                Create Bot
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border-subtle)]">
                            {bots.slice(0, 5).map((bot: any) => (
                                <div key={bot.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--bg-hover)] transition-colors">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                                        style={{ background: bot.primary_color || '#6366f1' }}
                                    >
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{bot.name}</p>
                                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                            <Globe className="w-3 h-3" />
                                            {bot.website?.name || bot.website?.url || 'No website'}
                                        </p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-medium">{bot.total_conversations || 0}</p>
                                        <p className="text-xs text-[var(--text-muted)]">Chats</p>
                                    </div>
                                    <div className={`badge text-[10px] ${bot.is_active ? 'badge-emerald' : 'badge-amber'}`}>
                                        {bot.is_active ? 'Active' : 'Paused'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Conversations */}
                <div className="lg:col-span-2 card !p-0">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
                        <h2 className="text-base font-semibold">Recent Conversations</h2>
                        <Link href="/dashboard/conversations" className="text-xs text-[var(--primary-400)] hover:underline flex items-center gap-1">
                            View All <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>

                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <MessageSquare className="w-10 h-10 text-[var(--text-dim)] mb-3" />
                            <p className="text-sm text-[var(--text-muted)]">No conversations yet</p>
                            <p className="text-xs text-[var(--text-dim)] mt-1">They&apos;ll appear here once visitors start chatting</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border-subtle)]">
                            {conversations.slice(0, 6).map((conv: any) => (
                                <div key={conv.id} className="px-5 py-3.5 hover:bg-[var(--bg-hover)] transition-colors">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-medium truncate flex-1">{conv.question}</p>
                                        <span className={`badge text-[10px] !py-0 ${conv.status === 'resolved' ? 'badge-emerald' :
                                                conv.status === 'escalated' ? 'badge-rose' : 'badge-amber'
                                            }`}>
                                            {conv.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] truncate mb-1.5">{conv.answer}</p>
                                    <div className="flex items-center gap-3 text-[10px] text-[var(--text-dim)]">
                                        <span className="flex items-center gap-1"><Bot className="w-3 h-3" />{conv.botName}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(conv.time).toLocaleDateString()}</span>
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
