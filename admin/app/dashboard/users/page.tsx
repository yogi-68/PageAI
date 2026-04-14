'use client';

import { useEffect, useState, useCallback } from 'react';

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
  botCount: number;
  created_at: string;
}

const PLAN_CONFIG: Record<string, { color: string; bg: string }> = {
  free:       { color: '#9ca3af', bg: 'rgba(107,114,128,0.12)' },
  starter:    { color: '#4f6df5', bg: 'rgba(79,109,245,0.12)'  },
  growth:     { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'  },
  scale:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  enterprise: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
};

function PlanBadge({ plan }: { plan: string }) {
  const cfg = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-semibold uppercase tracking-wide"
      style={{ background: cfg.bg, color: cfg.color }}>
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const resetTrial = useCallback(async (userId: string, email: string) => {
    setActionLoading(userId);
    setActionMsg(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const res = await fetch('/api/users/reset-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ userId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed');
      setActionMsg({ id: userId, text: d.alreadyAvailable ? 'Trial already available' : `Trial reset for ${email}`, ok: true });
    } catch (e: unknown) {
      setActionMsg({ id: userId, text: e instanceof Error ? e.message : 'Error', ok: false });
    }
    setActionLoading(null);
  }, []);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--fg)' }}>Users</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--fg-secondary)' }}>
            {total.toLocaleString()} total registered users
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid var(--edge)' }}>
          <input
            type="text"
            placeholder="Search by email or name…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="px-3.5 py-2 text-[13px] outline-none bg-transparent w-64"
            style={{ color: 'var(--fg)' }}
          />
          <button
            onClick={handleSearch}
            className="px-3.5 py-2 text-[13px] font-medium transition-colors"
            style={{ background: 'var(--surface-elevated)', color: 'var(--fg-secondary)', borderLeft: '1px solid var(--edge)' }}
          >
            Search
          </button>
        </div>

        <select
          value={planFilter}
          onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg text-[13px] outline-none"
          style={{ border: '1px solid var(--edge)', background: 'var(--surface)', color: 'var(--fg)' }}
        >
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
          <option value="scale">Scale</option>
          <option value="enterprise">Enterprise</option>
        </select>

        {(search || planFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setSearchInput(''); setPlanFilter('all'); setPage(1); }}
            className="px-3 py-2 rounded-lg text-[13px] transition-colors"
            style={{ color: 'var(--fg-secondary)', border: '1px solid var(--edge)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--edge)', background: 'rgba(255,255,255,0.015)' }}>
                {['User', 'Plan', 'Messages', 'Bots', 'Pages', 'Subscription', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium uppercase tracking-wide text-[11px] whitespace-nowrap"
                    style={{ color: 'var(--fg-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="inline-flex items-center gap-2" style={{ color: 'var(--fg-secondary)' }}>
                      <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid var(--edge)', borderTopColor: 'var(--primary)' }} />
                      Loading users…
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[13px]" style={{ color: 'var(--fg-secondary)' }}>
                    No users found
                  </td>
                </tr>
              ) : users.map(u => {
                const usagePct = u.monthly_message_limit > 0
                  ? Math.min((u.monthly_message_count / u.monthly_message_limit) * 100, 100) : 0;
                const barColor = usagePct >= 90 ? 'var(--danger)' : usagePct >= 70 ? 'var(--warning)' : 'var(--primary)';
                const isPaid = u.plan && u.plan !== 'free';
                return (
                  <tr key={u.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--edge)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-elevated)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ background: 'rgba(79,109,245,0.12)', color: 'var(--primary)' }}>
                          {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[180px]" style={{ color: 'var(--fg)' }}>{u.email}</p>
                          {u.full_name && (
                            <p className="text-[11px] truncate" style={{ color: 'var(--fg-muted)' }}>{u.full_name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={u.plan || 'free'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--edge)' }}>
                          <div className="h-full rounded-full" style={{ width: `${usagePct}%`, background: barColor }} />
                        </div>
                        <span className="text-[11px] tabular-nums whitespace-nowrap" style={{ color: 'var(--fg-secondary)' }}>
                          {u.monthly_message_count}/{u.monthly_message_limit}
                          {u.addon_message_balance > 0 && (
                            <span className="ml-1" style={{ color: 'var(--success)' }}>+{u.addon_message_balance}</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--fg-secondary)' }}>{u.botCount}</td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap" style={{ color: 'var(--fg-secondary)' }}>
                      {u.total_pages_indexed}
                      <span className="mx-0.5" style={{ color: 'var(--fg-muted)' }}>/</span>
                      {u.max_pages_indexed}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-[11.5px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: isPaid ? 'var(--success)' : u.dodo_subscription_id ? 'var(--danger)' : 'var(--fg-muted)' }} />
                        <span style={{ color: isPaid ? 'var(--success)' : u.dodo_subscription_id ? 'var(--danger)' : 'var(--fg-muted)' }}>
                          {isPaid ? 'Active' : u.dodo_subscription_id ? 'Cancelled' : 'None'}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[11.5px]" style={{ color: 'var(--fg-secondary)' }}>
                      {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          title="Reset 7-day trial eligibility"
                          disabled={actionLoading === u.id}
                          onClick={() => resetTrial(u.id, u.email)}
                          className="px-2 py-1 rounded text-[10.5px] font-medium transition-colors disabled:opacity-40"
                          style={{ background: 'rgba(79,109,245,0.10)', color: 'var(--primary)', border: '1px solid rgba(79,109,245,0.2)' }}
                        >
                          {actionLoading === u.id ? '…' : 'Reset Trial'}
                        </button>
                        {actionMsg?.id === u.id && (
                          <span className="text-[10.5px]" style={{ color: actionMsg.ok ? 'var(--success)' : 'var(--danger)' }}>
                            {actionMsg.text}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--edge)' }}>
            <span className="text-[12px]" style={{ color: 'var(--fg-muted)' }}>
              Page {page} of {totalPages} · {total.toLocaleString()} users
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg text-[12px] transition-colors disabled:opacity-40"
                style={{ border: '1px solid var(--edge)', background: 'var(--surface)', color: 'var(--fg-secondary)' }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg text-[12px] transition-colors disabled:opacity-40"
                style={{ border: '1px solid var(--edge)', background: 'var(--surface)', color: 'var(--fg-secondary)' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}