'use client';

import { useEffect, useState } from 'react';

interface OverviewData {
  totalUsers: number;
  totalBots: number;
  totalConversations: number;
  totalMessages: number;
  totalWebsites: number;
  totalDocuments: number;
  mrr: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  planCounts: Record<string, number>;
  weeklySignups: number;
  monthlySignups: number;
  weeklyConvos: number;
  recentUsers: any[];
}

const PLAN_COLORS: Record<string, string> = {
  free: '#6b7280', starter: '#4f6df5', growth: '#8b5cf6', scale: '#f59e0b', enterprise: '#ef4444',
};

function KPI({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--edge)]">
      <p className="text-[12px] text-[var(--fg-secondary)] mb-1.5">{label}</p>
      <p className="text-[26px] font-bold text-[var(--fg)] leading-none">{value}</p>
      {sub && <p className="text-[11.5px] text-[var(--fg-muted)] mt-1.5">{sub}</p>}
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    free: 'bg-[rgba(107,114,128,0.15)] text-[#9ca3af]',
    starter: 'bg-[rgba(79,109,245,0.15)] text-[#4f6df5]',
    growth: 'bg-[rgba(139,92,246,0.15)] text-[#8b5cf6]',
    scale: 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b]',
    enterprise: 'bg-[rgba(239,68,68,0.15)] text-[#ef4444]',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-semibold uppercase tracking-wide ${colors[plan] || colors.free}`}>
      {plan}
    </span>
  );
}

export default function DashboardOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats?type=overview').then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-[var(--fg-secondary)]">Loading…</div>;
  if (!data) return <div className="p-8 text-[var(--danger)]">Failed to load data</div>;

  const conversionRate = data.totalUsers > 0 ? ((data.activeSubscriptions / data.totalUsers) * 100).toFixed(1) : '0';

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-[22px] font-bold text-[var(--fg)] tracking-tight">Overview</h1>
        <p className="text-[13px] text-[var(--fg-secondary)] mt-0.5">Real-time platform metrics</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <KPI label="Total Users" value={data.totalUsers.toLocaleString()} sub={`+${data.weeklySignups} this week · +${data.monthlySignups} this month`} />
        <KPI label="Active Bots" value={data.totalBots.toLocaleString()} />
        <KPI label="Conversations" value={data.totalConversations.toLocaleString()} sub={`+${data.weeklyConvos} this week`} />
        <KPI label="Messages" value={data.totalMessages.toLocaleString()} />
        <KPI label="MRR" value={`$${data.mrr.toLocaleString()}`} sub={`ARR $${(data.mrr * 12).toLocaleString()}`} />
        <KPI label="Paid Subscribers" value={data.activeSubscriptions} sub={`${conversionRate}% conversion`} />
        <KPI label="Cancelled" value={data.cancelledSubscriptions} sub="previously paid" />
        <KPI label="Documents" value={data.totalDocuments.toLocaleString()} />
      </div>

      {/* Plan Distribution */}
      <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--edge)] mb-6">
        <h2 className="text-[14px] font-semibold mb-4">Plan Distribution</h2>
        <div className="space-y-3">
          {Object.entries(data.planCounts).sort((a, b) => b[1] - a[1]).map(([plan, count]) => {
            const pct = data.totalUsers > 0 ? Number(((count / data.totalUsers) * 100).toFixed(1)) : 0;
            return (
              <div key={plan} className="flex items-center gap-3">
                <span className="text-[12px] text-[var(--fg-secondary)] capitalize w-20 shrink-0">{plan}</span>
                <div className="flex-1 h-1.5 bg-[var(--edge)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: PLAN_COLORS[plan] || 'var(--primary)' }} />
                </div>
                <span className="text-[12px] text-[var(--fg-muted)] w-24 text-right shrink-0">{count} users ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Signups */}
      <div className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--edge)]">
          <h2 className="text-[14px] font-semibold">Recent Signups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-[var(--edge)] bg-[rgba(255,255,255,0.02)]">
                {['Email', 'Name', 'Plan', 'Status', 'Usage', 'Joined'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[var(--fg-secondary)] font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentUsers.map((u: any) => {
                const sub = u.plan !== 'free' ? 'active' : u.dodo_subscription_id ? 'cancelled' : 'free';
                const usagePct = u.monthly_message_limit > 0 ? Math.min((u.monthly_message_count / u.monthly_message_limit) * 100, 100) : 0;
                return (
                  <tr key={u.id} className="border-b border-[var(--edge)] hover:bg-[var(--surface-elevated)] transition-colors">
                    <td className="px-4 py-3 font-medium">{u.email}</td>
                    <td className="px-4 py-3 text-[var(--fg-secondary)]">{u.full_name || '—'}</td>
                    <td className="px-4 py-3"><PlanBadge plan={u.plan || 'free'} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-[11.5px] font-medium ${sub === 'active' ? 'text-[var(--success)]' : sub === 'cancelled' ? 'text-[var(--danger)]' : 'text-[var(--fg-muted)]'}`}>
                        {sub === 'active' ? '● Active' : sub === 'cancelled' ? '● Cancelled' : '○ Free'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-[var(--edge)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${usagePct}%`, background: usagePct >= 90 ? 'var(--danger)' : usagePct >= 70 ? 'var(--warning)' : 'var(--primary)' }} />
                        </div>
                        <span className="text-[var(--fg-muted)] text-[11px]">{u.monthly_message_count}/{u.monthly_message_limit}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--fg-secondary)] whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
