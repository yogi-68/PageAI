'use client';

import { useEffect, useState } from 'react';

interface UserRow {
  id: string;
  email: string;
  full_name?: string;
  plan: string;
  created_at: string;
  monthly_message_count: number;
  monthly_message_limit: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'usage'>('newest');
  const [planFilter, setPlanFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/stats?type=users');
        const data = await res.json();
        setUsers(data.users || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const filtered = users
    .filter(u =>
      (planFilter === 'all' || (u.plan || 'free') === planFilter) &&
      (u.email?.toLowerCase().includes(search.toLowerCase()) ||
       u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
       u.plan?.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'usage') {
        const aP = (a.monthly_message_count || 0) / Math.max(a.monthly_message_limit || 50, 1);
        const bP = (b.monthly_message_count || 0) / Math.max(b.monthly_message_limit || 50, 1);
        return bP - aP;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const planCounts = users.reduce((acc, u) => {
    const p = u.plan || 'free';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Users</h1>
          <p className="text-[14px] text-fg-secondary mt-0.5">{users.length} total users</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'free', 'starter', 'growth', 'scale', 'enterprise'].map(p => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-all ${
                planFilter === p
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-surface/40 text-fg-muted border border-edge hover:text-fg'
              }`}
            >
              {p}{p !== 'all' && planCounts[p] ? ` (${planCounts[p]})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="flex-1 max-w-[400px] px-4 py-2.5 rounded-lg border border-edge bg-bg/60 text-[13px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all" />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'newest' | 'usage')}
          className="px-3 py-2.5 rounded-lg border border-edge bg-bg/60 text-[13px] text-fg focus:outline-none focus:border-primary/50"
        >
          <option value="newest">Newest first</option>
          <option value="usage">Highest usage</option>
        </select>
      </div>

      <div className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-edge">
                <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">User</th>
                <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Plan</th>
                <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Message Usage</th>
                <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {filtered.map(u => {
                const used = u.monthly_message_count || 0;
                const limit = u.monthly_message_limit || 50;
                const pct = Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
                return (
                  <tr key={u.id} className="hover:bg-surface-elevated/20 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-[13px] font-medium text-fg">{u.full_name || u.email?.split('@')[0]}</p>
                      <p className="text-[11px] text-fg-muted">{u.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${
                        (u.plan || 'free') === 'free' ? 'bg-fg-muted/10 text-fg-muted'
                        : (u.plan || 'free') === 'growth' ? 'bg-primary/10 text-primary'
                        : (u.plan || 'free') === 'scale' ? 'bg-warning/10 text-warning'
                        : 'bg-success/10 text-success'
                      }`}>{u.plan || 'free'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-edge overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${pct > 90 ? 'bg-danger' : pct > 70 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] text-fg-muted whitespace-nowrap">{used.toLocaleString()} / {limit.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-fg-secondary">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-[13px] text-fg-secondary">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
