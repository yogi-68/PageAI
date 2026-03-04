'use client';

import { useEffect, useState } from 'react';

interface UserRow {
  id: string;
  email: string;
  full_name?: string;
  plan: string;
  created_at: string;
  monthly_question_count: number;
  monthly_question_limit: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
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

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.plan?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Users</h1>
        <span className="text-[13px] text-fg-secondary">{users.length} total</span>
      </div>

      <div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full max-w-[400px] px-4 py-2.5 rounded-lg border border-edge bg-bg/60 text-[13px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all" />
      </div>

      <div className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-edge">
                <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Email</th>
                <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Plan</th>
                <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Usage</th>
                <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {filtered.map(u => {
                const pct = Math.min(100, Math.round(((u.monthly_question_count || 0) / Math.max(u.monthly_question_limit || 1000, 1)) * 100));
                return (
                  <tr key={u.id} className="hover:bg-surface-elevated/20 transition-colors">
                    <td className="px-5 py-3 text-[13px] text-fg">{u.email}</td>
                    <td className="px-5 py-3"><span className="inline-flex px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-medium capitalize">{u.plan || 'free'}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-edge overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[12px] text-fg-muted">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-fg-secondary">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-[13px] text-fg-secondary">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
