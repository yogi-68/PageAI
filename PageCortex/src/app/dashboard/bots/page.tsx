'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Sk } from '@/components/ui/Skeleton';

const PLAN_BOT_LIMITS: Record<string, number> = { free: 1, starter: 1, growth: 3, scale: 10, enterprise: -1 };
const PLAN_LABELS: Record<string, string> = { free: 'Free', starter: 'Starter', growth: 'Growth', scale: 'Scale', enterprise: 'Enterprise' };

interface BotRow {
  id: string;
  name: string;
  is_active: boolean;
  total_conversations: number;
  created_at: string;
  website_url?: string;
}

export default function BotsPage() {
  const { user } = useAuth();
  const [bots, setBots] = useState<BotRow[]>([]);
  const [plan, setPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('bots').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('plan').eq('id', user.id).single(),
    ]).then(([{ data: botsData }, { data: profileData }]) => {
      if (botsData) setBots(botsData);
      if (profileData?.plan) setPlan(profileData.plan);
      setLoading(false);
    });
  }, [user]);

  const botLimit = PLAN_BOT_LIMITS[plan] ?? 1;
  const atLimit = botLimit !== -1 && bots.length >= botLimit;
  const overLimit = botLimit !== -1 && bots.length > botLimit;

  const copyEmbed = async (botId: string) => {
    const code = `<script src="${window.location.origin}/widget.js" data-bot-id="${botId}"><\/script>`;
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Embed code copied!');
    } catch {
      // Fallback for browsers without clipboard permission
      const el = document.createElement('textarea');
      el.value = code;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      toast.success('Embed code copied!');
    }
  };

  const handleDelete = async (botId: string) => {
    setDeletingId(botId);
    try {
      const res = await fetch(`/api/bots?botId=${botId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setBots(prev => prev.filter(b => b.id !== botId));
      toast.success('Bot deleted');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete bot');
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2"><Sk className="h-7 w-16" /><Sk className="h-4 w-32" /></div>
        <Sk className="h-9 w-24 rounded-lg" />
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-edge bg-surface/40 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2"><Sk className="h-4 w-36" /><Sk className="h-5 w-14 rounded-md" /></div>
                <Sk className="h-3 w-28" />
              </div>
              <Sk className="h-4 w-16" />
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-edge">
              <Sk className="h-7 w-20 rounded-lg" /><Sk className="h-7 w-20 rounded-lg" /><Sk className="h-7 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Bots</h1>
          <p className="text-[14px] text-fg-secondary mt-0.5">
            {bots.length} / {botLimit === -1 ? '∞' : botLimit} bot{botLimit !== 1 ? 's' : ''} used
          </p>
        </div>
        {atLimit ? (
          <Link href="/dashboard/billing" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-warning/10 border border-warning/30 text-warning text-[13px] font-medium hover:bg-warning/20 transition-colors">⬆ Upgrade for more bots</Link>
        ) : (
          <Link href="/dashboard/bots/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors">+ New Bot</Link>
        )}
      </div>

      {/* Over-limit warning — user downgraded while having more bots than allowed */}
      {overLimit && (
        <div className="p-4 rounded-xl border border-danger/30 bg-danger/5 flex items-start gap-3">
          <svg className="w-4 h-4 text-danger mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-danger">Bot limit exceeded</p>
            <p className="text-[12px] text-fg-secondary mt-0.5">Your {PLAN_LABELS[plan]} plan allows {botLimit} bot{botLimit !== 1 ? 's' : ''}. You currently have {bots.length}. Extra bots are paused until you upgrade.</p>
          </div>
          <Link href="/dashboard/billing" className="shrink-0 px-3 py-1.5 rounded-lg bg-danger text-white text-[12px] font-medium hover:opacity-90 transition-opacity">Upgrade now</Link>
        </div>
      )}

      {/* At-limit nudge — not over, just at cap */}
      {atLimit && !overLimit && (
        <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 flex items-center gap-3">
          <svg className="w-4 h-4 text-warning shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.109-12.374c.866-1.5 3.032-1.5 3.898 0l7.598 12.374z"/></svg>
          <p className="text-[13px] text-fg-secondary flex-1">You&apos;ve reached the <strong className="text-fg">{botLimit}-bot limit</strong> on your {PLAN_LABELS[plan]} plan.</p>
          <Link href="/dashboard/billing" className="shrink-0 text-[12px] text-primary font-medium hover:text-primary-hover transition-colors">Upgrade →</Link>
        </div>
      )}

      {bots.length === 0 ? (
        <div className="p-12 rounded-xl border border-edge bg-surface/40 text-center">
          <h2 className="text-[17px] font-semibold text-fg mb-1">No bots yet</h2>
          <p className="text-[13px] text-fg-secondary mb-5 max-w-[380px] mx-auto">Create your first AI chatbot to start automating customer conversations</p>
          <Link href="/dashboard/bots/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors">+ Create Your First Bot</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bots.map(bot => (
            <div key={bot.id} className="p-5 rounded-xl border border-edge bg-surface/40 hover:border-edge-light transition-all duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <h3 className="text-[15px] font-semibold text-fg">{bot.name}</h3>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${bot.is_active ? 'bg-success/10 text-success' : 'bg-fg-muted/10 text-fg-muted'}`}>{bot.is_active ? 'active' : 'inactive'}</span>
                  </div>
                  <p className="text-[12px] text-fg-muted">Created {new Date(bot.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-fg-secondary">
                  <span>{bot.total_conversations || 0} chats</span>
                  {bot.website_url && <span className="text-fg-muted">· {bot.website_url.replace(/https?:\/\//, '')}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-edge">
                <Link href={`/dashboard/bots/${bot.id}`} className="px-3 py-1.5 rounded-lg border border-edge text-[12px] text-fg-secondary hover:text-fg hover:border-edge-light transition-all">Manage</Link>
                <button onClick={() => window.open(`/chat-preview/${bot.id}`, '_blank')} className="px-3 py-1.5 rounded-lg border border-edge text-[12px] text-fg-secondary hover:text-fg hover:border-edge-light transition-all">Preview</button>
                <button onClick={() => copyEmbed(bot.id)} className="px-3 py-1.5 rounded-lg border border-edge text-[12px] text-fg-secondary hover:text-fg hover:border-edge-light transition-all">Copy Embed</button>
                <button
                  onClick={() => setConfirmDeleteId(bot.id)}
                  className="ml-auto px-3 py-1.5 rounded-lg border border-danger/30 text-[12px] text-danger hover:bg-danger/10 transition-all"
                >
                  Delete
                </button>
              </div>
              {/* Inline delete confirmation */}
              {confirmDeleteId === bot.id && (
                <div className="mt-3 p-3 rounded-lg border border-danger/30 bg-danger/5 flex items-center justify-between gap-3">
                  <p className="text-[12px] text-danger font-medium">Delete <strong>{bot.name}</strong>? This cannot be undone.</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 rounded-lg border border-edge text-[12px] text-fg-secondary hover:text-fg transition-all">Cancel</button>
                    <button
                      onClick={() => handleDelete(bot.id)}
                      disabled={deletingId === bot.id}
                      className="px-3 py-1.5 rounded-lg bg-danger text-white text-[12px] font-medium hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {deletingId === bot.id ? 'Deleting…' : 'Yes, delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {atLimit ? (
            <Link href="/dashboard/billing" className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-warning/40 text-[13px] text-warning hover:bg-warning/5 transition-all duration-200">⬆ Upgrade to create more bots</Link>
          ) : (
            <Link href="/dashboard/bots/new" className="flex items-center justify-center p-4 rounded-xl border border-dashed border-edge text-[13px] text-fg-muted hover:text-fg hover:border-edge-light transition-all duration-200">+ Create New Bot</Link>
          )}
        </div>
      )}
    </div>
  );
}
