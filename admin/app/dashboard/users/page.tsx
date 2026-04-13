'use client';

import { useEffect, useState } from 'react';

interface User {
    id: string;
    email: string;
    full_name: string | null;
    plan: string;
    monthly_message_count: number;
    monthly_message_limit: number;
    addon_message_balance: number;
    max_chatbots: number;
    max_pages_indexed: number;
    total_pages_indexed: number;
    dodo_subscription_id: string | null;
    created_at: string;
    updated_at: string;
    botCount: number;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');

    const fetchUsers = (p: number, s: string, plan: string) => {
        setLoading(true);
        const params = new URLSearchParams({ type: 'users', page: String(p) });
        if (s) params.set('search', s);
        if (plan && plan !== 'all') params.set('plan', plan);
        fetch(`/api/stats?${params}`)
            .then(r => r.json())
            .then(d => {
                setUsers(d.users || []);
                setTotal(d.total || 0);
                setTotalPages(d.totalPages || 1);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(page, search, planFilter); }, [page, search, planFilter]);

    const handleSearch = () => {
        setPage(1);
        setSearch(searchInput);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Users ({total})</h1>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        style={{
                            padding: '8px 12px', borderRadius: 8, border: '1px solid var(--edge)',
                            background: 'var(--surface)', color: 'var(--fg)', fontSize: 13, width: 260,
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        style={{
                            padding: '8px 16px', borderRadius: 8, border: 'none',
                            background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 13,
                        }}
                    >
                        Search
                    </button>
                </div>
                <select
                    value={planFilter}
                    onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
                    style={{
                        padding: '8px 12px', borderRadius: 8, border: '1px solid var(--edge)',
                        background: 'var(--surface)', color: 'var(--fg)', fontSize: 13,
                    }}
                >
                    <option value="all">All Plans</option>
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="scale">Scale</option>
                </select>
            </div>

            {/* Table */}
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--edge)',
                borderRadius: 12, overflow: 'hidden',
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--edge)', background: 'rgba(255,255,255,0.02)' }}>
                                {['Email', 'Name', 'Plan', 'Messages', 'Bots', 'Pages', 'Subscription', 'Joined'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '12px', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No users found</td></tr>
                            ) : users.map(u => {
                                const usagePct = u.monthly_message_limit > 0 ? Math.min((u.monthly_message_count / u.monthly_message_limit) * 100, 100) : 0;
                                return (
                                    <tr key={u.id} style={{ borderBottom: '1px solid var(--edge)' }}>
                                        <td style={{ padding: '10px 12px', fontWeight: 500 }}>{u.email}</td>
                                        <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{u.full_name || '—'}</td>
                                        <td style={{ padding: '10px 12px' }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                                                textTransform: 'uppercase',
                                                background: u.plan === 'free' ? 'rgba(107,114,128,0.15)' : u.plan === 'scale' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)',
                                                color: u.plan === 'free' ? '#9ca3af' : u.plan === 'scale' ? '#f59e0b' : 'var(--primary)',
                                            }}>
                                                {u.plan || 'free'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 60, height: 4, background: 'var(--edge)', borderRadius: 2, overflow: 'hidden' }}>
                                                    <div style={{
                                                        height: '100%', borderRadius: 2,
                                                        width: `${usagePct}%`,
                                                        background: usagePct >= 90 ? 'var(--danger)' : usagePct >= 70 ? '#f59e0b' : 'var(--primary)',
                                                    }} />
                                                </div>
                                                <span style={{ color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                                                    {u.monthly_message_count}/{u.monthly_message_limit}
                                                    {u.addon_message_balance > 0 && <span style={{ color: '#10b981' }}> +{u.addon_message_balance}</span>}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{u.botCount}</td>
                                        <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{u.total_pages_indexed}/{u.max_pages_indexed}</td>
                                        <td style={{ padding: '10px 12px' }}>
                                            {u.dodo_subscription_id ? (
                                                <span style={{ color: '#10b981', fontSize: 12 }}>Active</span>
                                            ) : (
                                                <span style={{ color: 'var(--muted)', fontSize: 12 }}>None</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '10px 12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex', justifyContent: 'center', gap: 8,
                        padding: 16, borderTop: '1px solid var(--edge)',
                    }}>
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1}
                            style={{
                                padding: '6px 12px', borderRadius: 6, border: '1px solid var(--edge)',
                                background: 'var(--surface)', color: 'var(--fg)', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                                opacity: page <= 1 ? 0.5 : 1, fontSize: 13,
                            }}
                        >
                            Previous
                        </button>
                        <span style={{ padding: '6px 12px', color: 'var(--muted)', fontSize: 13 }}>
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page >= totalPages}
                            style={{
                                padding: '6px 12px', borderRadius: 6, border: '1px solid var(--edge)',
                                background: 'var(--surface)', color: 'var(--fg)', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                                opacity: page >= totalPages ? 0.5 : 1, fontSize: 13,
                            }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
