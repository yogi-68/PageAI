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

const planColors: Record<string, string> = {
    free: 'bg-[rgba(107,114,128,0.15)] text-[#9ca3af]',
    starter: 'bg-[rgba(99,102,241,0.12)] text-[var(--primary)]',
    growth: 'bg-[rgba(99,102,241,0.12)] text-[var(--primary)]',
    scale: 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b]',
};

function PlanBadge({ plan }: { plan: string }) {
    const cls = planColors[plan] || planColors.free;
    return (
        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${cls}`}>
            {plan || 'free'}
        </span>
    );
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-[var(--fg)]">Users ({total})</h1>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        className="w-64 px-3 py-2 rounded-lg border border-[var(--edge)] bg-[var(--surface)] text-[var(--fg)] text-sm outline-none focus:border-[var(--primary)]"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Search
                    </button>
                </div>
                <select
                    value={planFilter}
                    onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-lg border border-[var(--edge)] bg-[var(--surface)] text-[var(--fg)] text-sm outline-none"
                >
                    <option value="all">All Plans</option>
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="scale">Scale</option>
                </select>
            </div>

            {/* Table */}
            <div className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--edge)] bg-[rgba(255,255,255,0.02)]">
                                {['Email', 'Name', 'Plan', 'Messages', 'Bots', 'Pages', 'Subscription', 'Joined'].map(h => (
                                    <th key={h} className="text-left px-3 py-3 text-[var(--fg-secondary)] font-medium whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="py-10 text-center text-[var(--fg-secondary)]">Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={8} className="py-10 text-center text-[var(--fg-secondary)]">No users found</td></tr>
                            ) : users.map(u => {
                                const usagePct = u.monthly_message_limit > 0
                                    ? Math.min((u.monthly_message_count / u.monthly_message_limit) * 100, 100)
                                    : 0;
                                const barColor = usagePct >= 90 ? 'var(--danger)' : usagePct >= 70 ? '#f59e0b' : 'var(--primary)';
                                return (
                                    <tr key={u.id} className="border-b border-[var(--edge)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                        <td className="px-3 py-2.5 font-medium">{u.email}</td>
                                        <td className="px-3 py-2.5 text-[var(--fg-secondary)]">{u.full_name || '—'}</td>
                                        <td className="px-3 py-2.5"><PlanBadge plan={u.plan} /></td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-14 h-1 bg-[var(--edge)] rounded overflow-hidden">
                                                    <div style={{ width: `${usagePct}%`, background: barColor }} className="h-full rounded" />
                                                </div>
                                                <span className="text-[var(--fg-secondary)] text-xs whitespace-nowrap">
                                                    {u.monthly_message_count}/{u.monthly_message_limit}
                                                    {u.addon_message_balance > 0 && (
                                                        <span className="text-emerald-500 ml-1">+{u.addon_message_balance}</span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-[var(--fg-secondary)]">{u.botCount}</td>
                                        <td className="px-3 py-2.5 text-[var(--fg-secondary)]">{u.total_pages_indexed}/{u.max_pages_indexed}</td>
                                        <td className="px-3 py-2.5">
                                            {u.dodo_subscription_id
                                                ? <span className="text-emerald-500 text-xs">Active</span>
                                                : <span className="text-[var(--fg-secondary)] text-xs">None</span>
                                            }
                                        </td>
                                        <td className="px-3 py-2.5 text-[var(--fg-secondary)] whitespace-nowrap text-xs">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 px-4 py-3 border-t border-[var(--edge)]">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1}
                            className="px-3 py-1.5 rounded-lg border border-[var(--edge)] bg-[var(--surface)] text-sm disabled:opacity-40 hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1.5 text-[var(--fg-secondary)] text-sm">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page >= totalPages}
                            className="px-3 py-1.5 rounded-lg border border-[var(--edge)] bg-[var(--surface)] text-sm disabled:opacity-40 hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
