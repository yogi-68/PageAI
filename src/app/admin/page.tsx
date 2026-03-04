'use client';

import { useEffect, useState } from 'react';

interface AdminStats {
  totalUsers: number;
  totalBots: number;
  totalConversations: number;
  totalWebsites: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  recentUsers: { id: string; email: string; created_at: string; plan: string }[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const kpis = stats ? [
    { label: 'Total Users', value: stats.totalUsers },
    { label: 'Total Bots', value: stats.totalBots },
    { label: 'Conversations', value: stats.totalConversations },
    { label: 'Websites', value: stats.totalWebsites },
    { label: 'MRR', value: `$${(stats.monthlyRevenue || 0).toLocaleString()}` },
    { label: 'Subscribers', value: stats.activeSubscriptions || 0 },
  ] : [];

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="p-4 rounded-xl border border-edge bg-surface/40">
            <span className="text-[11px] font-medium text-fg-muted uppercase tracking-wide">{k.label}</span>
            <p className="text-[22px] font-bold text-fg mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-edge">
          <h2 className="text-[15px] font-semibold text-fg">Recent Signups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-edge">
                <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Email</th>
                <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Plan</th>
                <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {(stats?.recentUsers || []).map(u => (
                <tr key={u.id} className="hover:bg-surface-elevated/20 transition-colors">
                  <td className="px-5 py-3 text-[13px] text-fg">{u.email}</td>
                  <td className="px-5 py-3"><span className="inline-flex px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-medium capitalize">{u.plan || 'free'}</span></td>
                  <td className="px-5 py-3 text-[13px] text-fg-secondary">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-[13px] text-fg-secondary">No signups yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
