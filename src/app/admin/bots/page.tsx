'use client';

import { useEffect, useState } from 'react';
import {
    Bot, Search, Loader2, Globe, MessageSquare,
    User, Zap, CheckCircle, XCircle,
} from 'lucide-react';

interface BotRow {
    id: string;
    name: string;
    model: string;
    is_active: boolean;
    total_conversations: number;
    primary_color: string;
    created_at: string;
    ownerEmail?: string;
    websiteUrl?: string;
}

export default function AdminBotsPage() {
    const [bots, setBots] = useState<BotRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/admin/stats?type=bots')
            .then(r => r.json())
            .then(d => setBots(d.bots || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = search
        ? bots.filter(b =>
            b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.ownerEmail?.toLowerCase().includes(search.toLowerCase())
        )
        : bots;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-500)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">All Bots</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                    {bots.length} bots across all users
                </p>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search bots or owner email..."
                    className="input !pl-10"
                />
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((bot) => (
                    <div key={bot.id} className="card !p-5">
                        <div className="flex items-start gap-3 mb-4">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                                style={{ background: bot.primary_color || '#6366f1' }}
                            >
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold truncate">{bot.name}</h3>
                                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 truncate">
                                    <User className="w-3 h-3 flex-shrink-0" />
                                    {bot.ownerEmail || 'Unknown'}
                                </p>
                            </div>
                            {bot.is_active ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            ) : (
                                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-3 py-3 border-t border-[var(--border-subtle)]">
                            <div>
                                <p className="text-base font-bold">{bot.total_conversations}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">Chats</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-[var(--text-secondary)]">{bot.model?.split('-').pop()}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">Model</p>
                            </div>
                            <div>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {new Date(bot.created_at).toLocaleDateString()}
                                </p>
                                <p className="text-[10px] text-[var(--text-muted)]">Created</p>
                            </div>
                        </div>

                        {bot.websiteUrl && (
                            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 pt-2 border-t border-[var(--border-subtle)] truncate">
                                <Globe className="w-3 h-3 flex-shrink-0" />
                                {bot.websiteUrl}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="card text-center py-16">
                    <Bot className="w-12 h-12 text-[var(--text-dim)] mx-auto mb-4" />
                    <p className="text-sm text-[var(--text-muted)]">
                        {search ? 'No bots match your search' : 'No bots created yet'}
                    </p>
                </div>
            )}
        </div>
    );
}
