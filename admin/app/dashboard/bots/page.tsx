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
            return b.name.toLowerCase().includes(s) || b.owner?.email.toLowerCase().includes(s) || b.website?.url.toLowerCase().includes(s);
        }
        return true;
    });

    if (loading) return <div style={{ color: 'var(--muted)', padding: 40 }}>Loading bots...</div>;

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Bots ({bots.length})</h1>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search bots, owners, websites..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        padding: '8px 12px', borderRadius: 8, border: '1px solid var(--edge)',
                        background: 'var(--surface)', color: 'var(--fg)', fontSize: 13, width: 280,
                    }}
                />
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{
                        padding: '8px 12px', borderRadius: 8, border: '1px solid var(--edge)',
                        background: 'var(--surface)', color: 'var(--fg)', fontSize: 13,
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {filtered.map(bot => (
                    <div key={bot.id} style={{
                        background: 'var(--surface)', border: '1px solid var(--edge)',
                        borderRadius: 12, padding: 20,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{
                                        width: 10, height: 10, borderRadius: '50%',
                                        background: bot.is_active ? '#10b981' : '#ef4444',
                                    }} />
                                    <span style={{ fontWeight: 600, fontSize: 15 }}>{bot.name}</span>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                                    {bot.model} · temp {bot.temperature}
                                </div>
                            </div>
                            <div style={{
                                width: 8, height: 32, borderRadius: 4,
                                background: bot.primary_color || 'var(--primary)',
                            }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                            <div>
                                <span style={{ color: 'var(--muted)' }}>Conversations: </span>
                                <span style={{ fontWeight: 600 }}>{bot.total_conversations}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--muted)' }}>Max Tokens: </span>
                                <span>{bot.max_tokens}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--muted)' }}>Owner: </span>
                                <span style={{ fontSize: 12 }}>{bot.owner?.email || 'Unknown'}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--muted)' }}>Plan: </span>
                                <span style={{ textTransform: 'capitalize' }}>{bot.owner?.plan || 'free'}</span>
                            </div>
                        </div>

                        {bot.website && (
                            <div style={{
                                marginTop: 12, padding: '8px 12px', borderRadius: 8,
                                background: 'rgba(99,102,241,0.06)', fontSize: 12,
                            }}>
                                <span style={{ color: 'var(--muted)' }}>Website: </span>
                                <span>{bot.website.url}</span>
                                <span style={{ color: 'var(--muted)' }}> · {bot.website.pages_count} pages · {bot.website.status}</span>
                            </div>
                        )}

                        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
                            Created {new Date(bot.created_at).toLocaleDateString()}
                            {!bot.branding_enabled && <span style={{ color: '#f59e0b', marginLeft: 8 }}>Branding off</span>}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No bots found</div>
                )}
            </div>
        </div>
    );
}
