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

const PLAN_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  free:       { label: 'Free',       color: '#9ca3af', bg: 'rgba(107,114,128,0.12)', dot: '#6b7280' },
  starter:    { label: 'Starter',    color: '#4f6df5', bg: 'rgba(79,109,245,0.12)',  dot: '#4f6df5' },
  growth:     { label: 'Growth',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', dot: '#8b5cf6' },
  scale:      { label: 'Scale',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b' },
  enterprise: { label: 'Enterprise', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: '#ef4444' },
};

function PlanBadge({ plan }: { plan: string }) {
  const cfg = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold uppercase tracking-wide"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function KPICard({
  label, value, sub, accent,
}: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div
      className="p-5 rounded-xl flex flex-col gap-1"
      style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>{label}</p>
      <p className="text-[28px] font-bold leading-none tabular-nums" style={{ color: accent || 'var(--fg)' }}>{value}</p>
      {sub && <p className="text-[11.5px]" style={{ color: 'var(--fg-secondary)' }}>{sub}</p>}
    </div>
  );
}

export default function DashboardOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/stats?type=overview')
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('Failed to load overview data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid var(--edge)', borderTopColor: 'var(--primary)' }} />
    </div>
  );

  if (error || !data) return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <p className="text-[15px] font-medium" style={{ color: 'var(--danger)' }}>{error || 'No data'}</p>
        <button onClick={() => window.location.reload()} className="mt-3 text-[13px] underline" style={{ color: 'var(--fg-secondary)' }}>Retry</button>
      </div>
    </div>
  );

  const conversionRate = data.totalUsers > 0
    ? ((data.activeSubscriptions / data.totalUsers) * 100).toFixed(1)
    : '0';

  const totalPlanUsers = Object.values(data.planCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--fg)' }}>Platform Overview</h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--fg-secondary)' }}>
          Real-time metrics across all users, bots, and revenue
        </p>
      </div>

      {/* KPI grid — top row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard
          label="Total Users"
          value={data.totalUsers.toLocaleString()}
          sub={`+${data.weeklySignups} this week · +${data.monthlySignups} this month`}
        />
        <KPICard
          label="MRR"
          value={`$${data.mrr.toLocaleString()}`}
          sub={`ARR $${(data.mrr * 12).toLocaleString()}`}
          accent="var(--success)"
        />
        <KPICard
          label="Paid Subscribers"
          value={data.activeSubscriptions}
          sub={`${conversionRate}% conversion rate`}
          accent="var(--primary)"
        />
        <KPICard
          label="Conversations"
          value={data.totalConversations.toLocaleString()}
          sub={`+${data.weeklyConvos} this week`}
        />
      </div>

      {/* Secondary KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Active Bots"     value={data.totalBots.toLocaleString()} />
        <KPICard label="Messages"        value={data.totalMessages.toLocaleString()} />
        <KPICard label="Websites"        value={data.totalWebsites?.toLocaleString() ?? '—'} />
        <KPICard label="Documents"       value={data.totalDocuments.toLocaleString()} />
      </div>

      {/* Two-column lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Plan distribution */}
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold" style={{ color: 'var(--fg)' }}>Plan Distribution</h2>
            <span className="text-[12px]" style={{ color: 'var(--fg-muted)' }}>{totalPlanUsers} users</span>
          </div>
          <div className="space-y-3">
            {Object.entries(data.planCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([plan, count]) => {
                const pct = totalPlanUsers > 0 ? ((count / totalPlanUsers) * 100).toFixed(1) : '0';
                const cfg = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: 'var(--fg)' }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
                        {cfg.label}
                      </span>
                      <span className="text-[12px] tabular-nums" style={{ color: 'var(--fg-secondary)' }}>
                        {count.toLocaleString()} <span style={{ color: 'var(--fg-muted)' }}>({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--edge)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: cfg.dot }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
          {/* Cancelled stat */}
          {data.cancelledSubscriptions > 0 && (
            <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--edge)' }}>
              <span className="text-[12px]" style={{ color: 'var(--fg-secondary)' }}>Cancelled subscriptions</span>
              <span className="text-[12px] font-semibold" style={{ color: 'var(--danger)' }}>{data.cancelledSubscriptions}</span>
            </div>
          )}
        </div>

        {/* Quick stats cards */}
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--fg)' }}>Business Health</h2>
          <div className="space-y-3">
            {[
              { label: 'Paid / Total users', value: `${data.activeSubscriptions} / ${data.totalUsers}`, pct: data.totalUsers > 0 ? (data.activeSubscriptions / data.totalUsers * 100) : 0, color: 'var(--primary)' },
              { label: 'Avg bots per user', value: data.totalUsers > 0 ? (data.totalBots / data.totalUsers).toFixed(2) : '0', pct: Math.min((data.totalBots / Math.max(data.totalUsers, 1)) * 30, 100), color: '#8b5cf6' },
              { label: 'Avg msgs per conversation', value: data.totalConversations > 0 ? (data.totalMessages / data.totalConversations).toFixed(1) : '0', pct: Math.min((data.totalMessages / Math.max(data.totalConversations, 1)) * 5, 100), color: 'var(--success)' },
              { label: 'Docs per website', value: data.totalWebsites > 0 ? (data.totalDocuments / data.totalWebsites).toFixed(1) : '0', pct: Math.min((data.totalDocuments / Math.max(data.totalWebsites, 1)) * 2, 100), color: 'var(--warning)' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px]" style={{ color: 'var(--fg-secondary)' }}>{stat.label}</span>
                  <span className="text-[13px] font-semibold tabular-nums" style={{ color: 'var(--fg)' }}>{stat.value}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--edge)' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(stat.pct, 100)}%`, background: stat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Signups table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--edge)' }}>
          <h2 className="text-[14px] font-semibold" style={{ color: 'var(--fg)' }}>Recent Signups</h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(79,109,245,0.1)', color: 'var(--primary)' }}>
            {data.recentUsers.length} users
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--edge)', background: 'rgba(255,255,255,0.015)' }}>
                {['User', 'Plan', 'Status', 'Usage', 'Joined'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium uppercase tracking-wide text-[11px]"
                    style={{ color: 'var(--fg-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentUsers.map((u: any) => {
                const isPaid = u.plan && u.plan !== 'free';
                const wasPaid = !isPaid && u.dodo_subscription_id;
                const usagePct = u.monthly_message_limit > 0
                  ? Math.min((u.monthly_message_count / u.monthly_message_limit) * 100, 100) : 0;
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
                          <p className="font-medium truncate max-w-[160px]" style={{ color: 'var(--fg)' }}>{u.email}</p>
                          {u.full_name && <p className="text-[11px] truncate" style={{ color: 'var(--fg-muted)' }}>{u.full_name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={u.plan || 'free'} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-[11.5px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: isPaid ? 'var(--success)' : wasPaid ? 'var(--danger)' : 'var(--fg-muted)' }} />
                        <span style={{ color: isPaid ? 'var(--success)' : wasPaid ? 'var(--danger)' : 'var(--fg-muted)' }}>
                          {isPaid ? 'Active' : wasPaid ? 'Cancelled' : 'Free'}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--edge)' }}>
                          <div className="h-full rounded-full" style={{
                            width: `${usagePct}%`,
                            background: usagePct >= 90 ? 'var(--danger)' : usagePct >= 70 ? 'var(--warning)' : 'var(--primary)',
                          }} />
                        </div>
                        <span className="text-[11px] tabular-nums" style={{ color: 'var(--fg-muted)' }}>
                          {u.monthly_message_count}/{u.monthly_message_limit}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--fg-secondary)' }}>
                      {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
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