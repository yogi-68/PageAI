'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalUsers: number;
  totalBots: number;
  totalConversations: number;
  totalMessages: number;
  totalWebsites: number;
  totalDocuments: number;
  mrr: number;
  activeSubscriptions: number;
  weeklySignups: number;
  monthlySignups: number;
  weeklyConvos: number;
  planCounts: Record<string, number>;
}

const QUICK_LINKS = [
  { label: 'Main App',           url: process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://pageai-tau.vercel.app', icon: '◈' },
  { label: 'Supabase Dashboard', url: 'https://supabase.com/dashboard',                                        icon: '◉' },
  { label: 'Dodo Payments',      url: 'https://dashboard.dodopayments.com',                                    icon: '◆' },
  { label: 'Vercel Dashboard',   url: 'https://vercel.com/dashboard',                                         icon: '▣' },
];

const PAGE_GUIDE = [
  {
    page: 'Overview',       path: '/admin/dashboard',
    desc: 'High-level KPIs: MRR, active users, bots, conversations, messages. Refreshed on load — check here for daily platform health.',
  },
  {
    page: 'Users',          path: '/admin/dashboard/users',
    desc: 'Full user list with plan, message usage, and join date. Use to investigate support tickets or flag abusive accounts.',
  },
  {
    page: 'Bots',           path: '/admin/dashboard/bots',
    desc: 'All chatbots across all accounts — owner, source website, message count, creation date. Use to audit content or disable a bot.',
  },
  {
    page: 'Revenue',        path: '/admin/dashboard/revenue',
    desc: 'Subscription breakdown by plan, MRR, and recent transactions. Use to track growth and churn week-over-week.',
  },
  {
    page: 'Settings',       path: '/admin/dashboard/settings',
    desc: 'Live platform health metrics, plan distribution, admin page guide, and quick links. You are here.',
  },
];

function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 10L10 2M5 2h5v5" />
    </svg>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
      <p className="text-[12px] font-medium mb-1.5" style={{ color: 'var(--fg-secondary)' }}>{label}</p>
      <p className="text-[22px] font-bold tabular-nums" style={{ color: 'var(--fg)' }}>{value}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-muted)' }}>{sub}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetch('/api/stats?type=overview')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => { setLoadError('Failed to load platform stats'); setLoading(false); });
  }, []);

  const planOrder = ['enterprise', 'scale', 'growth', 'starter', 'free'];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--fg)' }}>Settings &amp; Platform Health</h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--fg-secondary)' }}>
          Live platform metrics, admin page guide, and quick links to external dashboards
        </p>
      </div>

      {/* Live health */}
      <div>
        <h2 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--fg)' }}>Live Platform Health</h2>
        {loading && (
          <div className="flex items-center gap-2 px-4 py-8 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--edge)', color: 'var(--fg-muted)' }}>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="text-[13px]">Loading platform stats…</span>
          </div>
        )}
        {loadError && (
          <div className="px-4 py-3 rounded-xl text-[13px]" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)' }}>{loadError}</div>
        )}
        {stats && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <StatCard label="Monthly Recurring Revenue" value={`$${stats.mrr.toLocaleString()}`} sub="from paid subs" />
              <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} sub={`+${stats.weeklySignups} this week`} />
              <StatCard label="Active Subscriptions" value={stats.activeSubscriptions} sub={`${stats.monthlySignups} new / 30d`} />
              <StatCard label="Total Bots" value={stats.totalBots.toLocaleString()} />
              <StatCard label="Conversations" value={stats.totalConversations.toLocaleString()} sub={`${stats.weeklyConvos} this week`} />
              <StatCard label="Total Messages" value={stats.totalMessages.toLocaleString()} />
              <StatCard label="Indexed Websites" value={stats.totalWebsites.toLocaleString()} />
              <StatCard label="Indexed Documents" value={stats.totalDocuments.toLocaleString()} />
            </div>

            {/* Plan distribution */}
            <div className="mt-4 rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--edge)' }}>
                <h3 className="text-[13px] font-semibold" style={{ color: 'var(--fg)' }}>Plan Distribution</h3>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--edge)' }}>
                {planOrder.filter(p => (stats.planCounts[p] ?? 0) > 0 || p === 'free').map(plan => {
                  const count = stats.planCounts[plan] ?? 0;
                  const pct = stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0;
                  return (
                    <div key={plan} className="flex items-center gap-3 px-5 py-3">
                      <span className="text-[12px] font-bold uppercase tracking-wide w-20 shrink-0" style={{ color: 'var(--fg-secondary)' }}>{plan}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--edge)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: plan === 'free' ? 'var(--fg-muted)' : 'var(--primary)' }} />
                      </div>
                      <span className="text-[13px] font-semibold tabular-nums w-8 text-right shrink-0" style={{ color: 'var(--fg)' }}>{count}</span>
                      <span className="text-[11px] w-8 text-right shrink-0" style={{ color: 'var(--fg-muted)' }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Admin page guide */}
      <div>
        <h2 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--fg)' }}>Admin Page Guide</h2>
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
          <div className="divide-y" style={{ borderColor: 'var(--edge)' }}>
            {PAGE_GUIDE.map(item => (
              <div key={item.page} className="flex items-start gap-4 px-5 py-4">
                <div className="shrink-0 w-24">
                  <span className="text-[12px] font-bold" style={{ color: 'var(--primary)' }}>{item.page}</span>
                  <p className="text-[10px] font-mono mt-0.5 truncate" style={{ color: 'var(--fg-muted)' }}>{item.path}</p>
                </div>
                <p className="text-[13px] flex-1" style={{ color: 'var(--fg-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--fg)' }}>Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-3 rounded-lg transition-all"
              style={{ border: '1px solid var(--edge)', background: 'var(--bg)', color: 'var(--fg-secondary)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(79,109,245,0.3)';
                (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--edge)';
                (e.currentTarget as HTMLElement).style.color = 'var(--fg-secondary)';
              }}
            >
              <span className="text-[14px]">{link.icon}</span>
              <span className="text-[13px] font-medium flex-1">{link.label}</span>
              <ExternalLinkIcon />
            </a>
          ))}
        </div>
      </div>

      {/* Config notes */}
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
        <h2 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--fg)' }}>Configuration Notes</h2>
        <ul className="space-y-2">
          {[
            'ADMIN_EMAILS — update this Vercel env var to add or remove admin access (comma-separated).',
            'SUPABASE_SERVICE_ROLE_KEY — server-only secret, never exposed to the browser. Rotate in Supabase if compromised.',
            'This admin app shares the same Supabase database as the main PageAI app but is deployed separately.',
            'All admin API routes bypass Row Level Security via the service role — keep this app access-controlled.',
          ].map((note, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px]" style={{ color: 'var(--fg-secondary)' }}>
              <span className="mt-0.5 shrink-0" style={{ color: 'var(--fg-muted)' }}>◎</span>
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}