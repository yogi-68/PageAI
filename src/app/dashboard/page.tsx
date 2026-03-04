'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Stats {
  activeBots: number;
  totalConversations: number;
  plan: string;
  monthly_question_count: number;
  monthly_question_limit: number;
}

interface BotRow {
  id: string;
  name: string;
  is_active: boolean;
  total_conversations: number;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
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
            totalConversations: d.stats?.totalConversations || 0,
            plan: d.usage?.plan || 'free',
            monthly_question_count: d.usage?.monthly_question_count || 0,
            monthly_question_limit: d.usage?.monthly_question_limit || 1000,
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

  const kpis = stats ? [
    { label: 'Active Bots', value: stats.activeBots },
    { label: 'Conversations', value: stats.totalConversations },
    { label: 'Plan', value: stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1) },
  ] : [];

  const usagePercent = stats ? Math.min(100, Math.round((stats.monthly_question_count / Math.max(stats.monthly_question_limit, 1)) * 100)) : 0;

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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="p-4 rounded-xl border border-edge bg-surface/40">
            <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">{k.label}</span>
            <p className="text-[24px] font-bold text-fg mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Message Usage */}
      {stats && (
        <div className="p-5 rounded-xl border border-edge bg-surface/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-fg">Question Usage</span>
            <span className="text-[13px] text-fg-secondary">{stats.monthly_question_count.toLocaleString()} / {stats.monthly_question_limit.toLocaleString()}</span>
          </div>
          <div className="h-2 rounded-full bg-edge overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${usagePercent > 80 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${usagePercent}%` }} />
          </div>
          {usagePercent > 80 && (
            <p className="text-[12px] text-warning mt-2">You&apos;ve used {usagePercent}% of your monthly messages. <Link href="/dashboard/billing" className="underline hover:text-fg transition-colors">Upgrade plan</Link></p>
          )}
        </div>
      )}

      {/* Bots List */}
      <div className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge">
          <h2 className="text-[15px] font-semibold text-fg">Your Bots</h2>
          <Link href="/dashboard/bots" className="text-[12px] text-primary hover:text-primary-hover transition-colors">View all</Link>
        </div>

        {bots.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[15px] font-medium text-fg mb-1">No bots yet</p>
            <p className="text-[13px] text-fg-secondary mb-4">Create your first AI chatbot to get started</p>
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
                  <span className="text-[12px] text-fg-secondary">{bot.total_conversations || 0} chats</span>
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
            { href: '/dashboard/analytics', label: 'View analytics', icon: '◈' },
            { href: '/dashboard/billing', label: 'Manage billing', icon: '◇' },
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
