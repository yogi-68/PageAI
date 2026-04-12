'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
    { label: 'Total Users', value: stats.totalUsers, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Bots', value: stats.totalBots, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Conversations', value: stats.totalConversations, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Websites', value: stats.totalWebsites, color: 'text-[#a78bfa]', bg: 'bg-[#a78bfa]/10' },
    { label: 'MRR', value: `$${(stats.monthlyRevenue || 0).toLocaleString()}`, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Subscribers', value: stats.activeSubscriptions || 0, color: 'text-primary', bg: 'bg-primary/10' },
  ] : [];

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Admin Dashboard</h1>
          <p className="text-[14px] text-fg-secondary mt-0.5">Platform overview and metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/users" className="px-3 py-1.5 rounded-lg border border-edge text-[12px] text-fg-secondary hover:text-fg hover:border-edge-light transition-all">View Users</Link>
          <Link href="/admin/revenue" className="px-3 py-1.5 rounded-lg bg-primary text-white text-[12px] font-medium hover:bg-primary-hover transition-colors">Revenue →</Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="p-4 rounded-xl border border-edge bg-surface/40 hover:border-edge-light transition-all duration-200">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${k.bg}`}>
                <div className={`w-2 h-2 rounded-full ${k.color.replace('text-', 'bg-')}`} />
              </div>
              <span className="text-[11px] font-medium text-fg-muted uppercase tracking-wide">{k.label}</span>
            </div>
            <p className="text-[22px] font-bold text-fg">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Stats Row */}
      {stats && stats.totalUsers > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-edge bg-surface/40">
            <span className="text-[12px] font-medium text-fg-muted">Avg Bots per User</span>
            <p className="text-[18px] font-bold text-fg mt-1">{stats.totalUsers > 0 ? (stats.totalBots / stats.totalUsers).toFixed(1) : '0'}</p>
          </div>
          <div className="p-4 rounded-xl border border-edge bg-surface/40">
            <span className="text-[12px] font-medium text-fg-muted">Conversion Rate</span>
            <p className="text-[18px] font-bold text-fg mt-1">{stats.totalUsers > 0 ? ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1) : '0'}%</p>
          </div>
          <div className="p-4 rounded-xl border border-edge bg-surface/40">
            <span className="text-[12px] font-medium text-fg-muted">ARPU</span>
            <p className="text-[18px] font-bold text-fg mt-1">${stats.activeSubscriptions > 0 ? (stats.monthlyRevenue / stats.activeSubscriptions).toFixed(0) : '0'}</p>
          </div>
        </div>
      )}

      {/* Recent Signups */}
      <div className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge">
          <h2 className="text-[15px] font-semibold text-fg">Recent Signups</h2>
          <Link href="/admin/users" className="text-[12px] text-primary hover:text-primary-hover transition-colors">View all →</Link>
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
                  <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${u.plan === 'free' ? 'bg-fg-muted/10 text-fg-muted' : 'bg-primary/10 text-primary'}`}>{u.plan || 'free'}</span></td>
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
