'use client';

import { useEffect, useState } from 'react';

interface Bot {
    id: string;
    name: string;
    model: string;
    is_active: boolean;
    total_conversations: number;
    primary_color: string;
    temperature: number;
    max_tokens: number;
    created_at: string;
    user_id: string;
    website_id: string | null;
    branding_enabled: boolean;
    owner: { id: string; email: string; plan: string } | null;
    website: { id: string; url: string; name: string; pages_count: number; status: string } | null;
}

export default function BotsPage() {
    const [bots, setBots] = useState<Bot[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetch('/api/stats?type=bots')
            .then(r => r.json())
            .then(d => setBots(d.bots || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = bots.filter(b => {
        if (statusFilter === 'active' && !b.is_active) return false;
        if (statusFilter === 'inactive' && b.is_active) return false;
        if (search) {
            const s = search.toLowerCase();
            return b.name.toLowerCase().includes(s) ||
                b.owner?.email.toLowerCase().includes(s) ||
                (b.website?.url || '').toLowerCase().includes(s);
        }
        return true;
    });

    if (loading) return (
        <div className="flex items-center justify-center py-20 text-[var(--fg-secondary)]">Loading bots...</div>
    );

    return (
        <div>
            <h1 className="text-2xl font-bold text-[var(--fg)] mb-6">Bots ({bots.length})</h1>

            <div className="flex flex-wrap gap-3 mb-5">
                <input
                    type="text"
                    placeholder="Search bots, owners, websites..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-72 px-3 py-2 rounded-lg border border-[var(--edge)] bg-[var(--surface)] text-[var(--fg)] text-sm outline-none focus:border-[var(--primary)]"
                />
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[var(--edge)] bg-[var(--surface)] text-[var(--fg)] text-sm outline-none"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
                {filtered.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-[var(--fg-secondary)]">No bots found</div>
                ) : filtered.map(bot => (
                    <div key={bot.id} className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] p-5 hover:border-[rgba(79,109,245,0.3)] transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${bot.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <span className="font-semibold text-[15px]">{bot.name}</span>
                                </div>
                                <div className="text-xs text-[var(--fg-secondary)] mt-1">
                                    {bot.model} - temp {bot.temperature}
                                </div>
                            </div>
                            <div
                                className="w-2 h-8 rounded flex-shrink-0"
                                style={{ background: bot.primary_color || 'var(--primary)' }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-[var(--fg-secondary)]">Conversations: </span>
                                <span className="font-semibold">{bot.total_conversations}</span>
                            </div>
                            <div>
                                <span className="text-[var(--fg-secondary)]">Max Tokens: </span>
                                <span>{bot.max_tokens}</span>
                            </div>
                            <div>
                                <span className="text-[var(--fg-secondary)]">Owner: </span>
                                <span className="text-xs">{bot.owner?.email || 'Unknown'}</span>
                            </div>
                            <div>
                                <span className="text-[var(--fg-secondary)]">Plan: </span>
                                <span className="capitalize">{bot.owner?.plan || 'free'}</span>
                            </div>
                        </div>

                        {bot.website && (
                            <div className="mt-3 px-3 py-2 rounded-lg bg-[rgba(99,102,241,0.06)] text-xs">
                                <span className="text-[var(--fg-secondary)]">Website: </span>
                                <span>{bot.website.url}</span>
                                <span className="text-[var(--fg-secondary)]"> - {bot.website.pages_count} pages - {bot.website.status}</span>
                            </div>
                        )}

                        <div className="mt-2 text-[11px] text-[var(--fg-secondary)]">
                            Created {new Date(bot.created_at).toLocaleDateString()}
                            {!bot.branding_enabled && (
                                <span className="text-amber-500 ml-2">Branding off</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}