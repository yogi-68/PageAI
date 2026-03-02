'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import {
    Bot, Globe, Settings, Plus, Search, Zap, Eye,
    Copy, Loader2, Trash2, MoreHorizontal,
} from 'lucide-react';

export default function BotsPage() {
    const { user } = useAuth();
    const [bots, setBots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetch(`/api/bots?userId=${user.id}`)
            .then(r => r.json())
            .then(d => setBots(d.bots || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-500)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">My Bots</h1>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">Manage your AI chatbot assistants</p>
                </div>
                <Link href="/dashboard/bots/new" className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Create New Bot
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input type="text" placeholder="Search bots..." className="input !pl-10" />
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {bots.map((bot) => (
                    <div key={bot.id} className="card group">
                        {/* Status */}
                        <div className="absolute top-4 right-4">
                            <div className={`badge text-[10px] ${bot.is_active ? 'badge-emerald' : 'badge-amber'}`}>
                                {bot.is_active ? (
                                    <><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Active</>
                                ) : (
                                    <><Zap className="w-3 h-3" />Paused</>
                                )}
                            </div>
                        </div>

                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                            style={{ background: bot.primary_color || '#6366f1' }}
                        >
                            <Bot className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{bot.name}</h3>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mb-4">
                            <Globe className="w-3.5 h-3.5" />
                            {bot.website?.name || bot.website?.url || 'No website linked'}
                        </p>

                        <div className="grid grid-cols-3 gap-4 py-4 border-t border-[var(--border-subtle)]">
                            <div>
                                <p className="text-lg font-bold">{(bot.total_conversations || 0).toLocaleString()}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">Chats</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold">{bot.website?.pages_count || 0}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">Pages</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold">{bot.model?.split('-').pop() || 'N/A'}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">Model</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)]">
                            <button className="flex-1 btn-secondary !py-2 text-xs"><Eye className="w-3.5 h-3.5" />Preview</button>
                            <button className="flex-1 btn-secondary !py-2 text-xs"><Copy className="w-3.5 h-3.5" />Embed</button>
                            <Link href={`/dashboard/settings`} className="flex-1 btn-primary !py-2 text-xs">
                                <Settings className="w-3.5 h-3.5" />Manage
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Add card */}
                <Link
                    href="/dashboard/bots/new"
                    className="card card-interactive !border-dashed flex flex-col items-center justify-center min-h-[320px] text-center"
                >
                    <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center mb-4 group-hover:border-[var(--border-accent)] transition-colors">
                        <Plus className="w-7 h-7 text-[var(--text-muted)]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Create New Bot</h3>
                    <p className="text-sm text-[var(--text-muted)]">Set up a new AI assistant</p>
                </Link>
            </div>
        </div>
    );
}
