'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

interface Stats {
  activeBots: number;
}

interface Usage {
  plan: string;
  monthly_message_count: number;
  monthly_message_limit: number;
}

interface BotRow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

const PLAN_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  free: { label: 'Free', color: 'text-fg-muted', bg: 'bg-fg-muted/10' },
  starter: { label: 'Starter · $29/mo', color: 'text-success', bg: 'bg-success/10' },
  growth: { label: 'Growth · $69/mo', color: 'text-primary', bg: 'bg-primary/10' },
  scale: { label: 'Scale · $199/mo', color: 'text-warning', bg: 'bg-warning/10' },
  enterprise: { label: 'Enterprise', color: 'text-[#a78bfa]', bg: 'bg-[#a78bfa]/10' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [bots, setBots] = useState<BotRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch(`/api/dashboard/stats?userId=${user.id}`);
        if (res.ok) {
          const d = await res.json();
          setStats({
            activeBots: d.stats?.activeBots || 0,
          });
          setUsage({
            plan: d.usage?.plan || 'free',
            monthly_message_count: d.usage?.monthly_message_count || 0,
            monthly_message_limit: d.usage?.monthly_message_limit || 50,
          });
          if (d.bots) setBots(d.bots.slice(0, 4));
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const usagePercent = usage ? Math.min(100, Math.round((usage.monthly_message_count / Math.max(usage.monthly_message_limit, 1)) * 100)) : 0;
  const planInfo = PLAN_LABELS[usage?.plan || 'free'] || PLAN_LABELS.free;

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">{greeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}</h1>
          <p className="text-[14px] text-fg-secondary mt-0.5">Here&apos;s what&apos;s happening with your bots</p>
        </div>
        <Link href="/dashboard/bots/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors">+ Create Bot</Link>
      </div>

      {/* Quickstart guide — shown only for free users with no bots */}
      {bots.length === 0 && (!usage || usage.plan === 'free') && (
        <div className="p-5 rounded-xl border border-primary/20 bg-primary/3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-fg">Get started in 3 steps</h2>
            <Link href="/docs" className="text-[12px] text-primary hover:text-primary-hover transition-colors">Full guide →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { step: '1', title: 'Connect your website', desc: 'Enter your site URL. PageAI crawls and indexes every page automatically.', href: '/dashboard/bots/new', cta: 'Start' },
              { step: '2', title: 'Create your bot', desc: 'Name it, pick a color, and choose your AI model. Takes 30 seconds.', href: '/dashboard/bots/new', cta: 'Create Bot' },
              { step: '3', title: 'Embed on your site', desc: 'Copy one <script> tag, paste before </body>. Your bot is live!', href: '/docs', cta: 'See how' },
            ].map(s => (
              <div key={s.step} className="flex gap-3 p-4 rounded-xl border border-edge bg-bg/60">
                <div className="w-7 h-7 rounded-full bg-primary text-white text-[12px] font-bold flex items-center justify-center shrink-0">{s.step}</div>
                <div>
                  <p className="text-[13px] font-semibold text-fg">{s.title}</p>
                  <p className="text-[11px] text-fg-muted mt-0.5 mb-2">{s.desc}</p>
                  <Link href={s.href} className="text-[11px] text-primary font-medium hover:text-primary-hover transition-colors">{s.cta} →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription Status Card */}
      {usage && (
        <div className="p-5 rounded-xl border border-edge bg-surface/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className={`inline-flex px-2.5 py-1 rounded-lg text-[12px] font-semibold ${planInfo.bg} ${planInfo.color}`}>{planInfo.label}</span>
              {usage.plan === 'free' && (
                <Link href="/dashboard/billing" className="text-[12px] text-primary hover:text-primary-hover transition-colors font-medium">Upgrade →</Link>
              )}
            </div>
            <span className="text-[13px] text-fg-secondary">{usage.monthly_message_count.toLocaleString()} / {usage.monthly_message_limit.toLocaleString()} messages this month</span>
          </div>
          <div className="h-2 rounded-full bg-edge overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${usagePercent > 90 ? 'bg-danger' : usagePercent > 70 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${usagePercent}%` }} />
          </div>
          {usagePercent > 80 && (
            <p className="text-[12px] text-warning mt-2">You&apos;ve used {usagePercent}% of your monthly messages. <Link href="/dashboard/billing" className="underline hover:text-fg transition-colors">Upgrade plan</Link></p>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Bots', value: stats?.activeBots || 0 },
          { label: 'Messages Used', value: (usage?.monthly_message_count || 0).toLocaleString() },
          { label: 'Messages Left', value: Math.max(0, (usage?.monthly_message_limit || 0) - (usage?.monthly_message_count || 0)).toLocaleString() },
          { label: 'Plan', value: (usage?.plan || 'free').charAt(0).toUpperCase() + (usage?.plan || 'free').slice(1) },
        ].map(k => (
          <div key={k.label} className="p-4 rounded-xl border border-edge bg-surface/40 hover:border-edge-light transition-all duration-200">
            <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">{k.label}</span>
            <p className="text-[24px] font-bold text-fg mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Bots List */}
      <div className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge">
          <h2 className="text-[15px] font-semibold text-fg">Your Bots</h2>
          <Link href="/dashboard/bots" className="text-[12px] text-primary hover:text-primary-hover transition-colors">View all</Link>
        </div>

        {bots.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>
            </div>
            <p className="text-[15px] font-semibold text-fg mb-1">Create your first bot</p>
            <p className="text-[13px] text-fg-secondary mb-4 max-w-[320px] mx-auto">Connect your website, let PageAI crawl it, and deploy an AI assistant in minutes</p>
            <Link href="/dashboard/bots/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors">+ Create Bot</Link>
          </div>
        ) : (
          <div className="divide-y divide-edge">
            {bots.map(bot => (
              <div key={bot.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-elevated/30 transition-colors">
                <div>
                  <p className="text-[14px] font-medium text-fg">{bot.name}</p>
                  <p className="text-[12px] text-fg-muted mt-0.5">{new Date(bot.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${bot.is_active ? 'bg-success/10 text-success' : 'bg-fg-muted/10 text-fg-muted'}`}>{bot.is_active ? 'active' : 'inactive'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-[15px] font-semibold text-fg mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: '/dashboard/bots/new', label: 'Create new bot', icon: '✦' },
            { href: '/dashboard/websites', label: 'Add website', icon: '◎' },
            { href: '/dashboard/analytics', label: 'View analytics', icon: '▣' },
            { href: '/dashboard/billing', label: 'Manage billing', icon: '◆' },
          ].map(a => (
            <Link key={a.href} href={a.href} className="flex items-center gap-2.5 p-3.5 rounded-xl border border-edge bg-surface/30 hover:bg-surface/60 hover:border-edge-light text-[13px] text-fg-secondary hover:text-fg transition-all duration-200">
              <span className="text-primary">{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
