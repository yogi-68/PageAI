'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Bot {
  id: string;
  name: string;
  welcome_message: string;
  primary_color: string;
  position: 'left' | 'right';
  model: string;
  system_prompt: string | null;
  is_active: boolean;
  branding_enabled: boolean;
  total_conversations: number;
  fallback_message: string;
  temperature: number;
  created_at: string;
  website_id: string | null;
}

interface Website {
  id: string;
  url: string;
  pages_count: number;
  status: string;
  last_crawled_at: string | null;
}

type Tab = 'overview' | 'settings' | 'embed' | 'knowledge';

export default function BotManagePage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const botId = params.id as string;

  const [bot, setBot] = useState<Bot | null>(null);
  const [website, setWebsite] = useState<Website | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [recrawling, setRecrawling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Editable settings state
  const [name, setName] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [position, setPosition] = useState<'left' | 'right'>('right');
  const [model, setModel] = useState('gpt-4.1-mini');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [brandingEnabled, setBrandingEnabled] = useState(true);

  const fetchBot = useCallback(async () => {
    if (!user || !botId) return;
    const { data } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .eq('user_id', user.id)
      .single();

    if (!data) { router.push('/dashboard/bots'); return; }

    setBot(data);
    setName(data.name);
    setWelcomeMessage(data.welcome_message || '');
    setFallbackMessage(data.fallback_message || '');
    setPrimaryColor(data.primary_color || '#6366f1');
    setPosition(data.position || 'right');
    setModel(data.model || 'gpt-4.1-mini');
    setSystemPrompt(data.system_prompt || '');
    setBrandingEnabled(data.branding_enabled ?? true);

    if (data.website_id) {
      const { data: ws } = await supabase
        .from('websites')
        .select('id, url, pages_count, status, last_crawled_at')
        .eq('id', data.website_id)
        .single();
      if (ws) setWebsite(ws);
    }

    setLoading(false);
  }, [user, botId, router]);

  useEffect(() => { fetchBot(); }, [fetchBot]);

  const toggleActive = async () => {
    if (!bot) return;
    const { error } = await supabase
      .from('bots')
      .update({ is_active: !bot.is_active })
      .eq('id', botId);
    if (!error) {
      setBot(prev => prev ? { ...prev, is_active: !prev.is_active } : prev);
      toast.success(bot.is_active ? 'Bot paused' : 'Bot activated');
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('bots').update({
        name,
        welcome_message: welcomeMessage,
        fallback_message: fallbackMessage,
        primary_color: primaryColor,
        position,
        model,
        system_prompt: systemPrompt || null,
        branding_enabled: brandingEnabled,
      }).eq('id', botId);
      if (error) throw error;
      setBot(prev => prev ? { ...prev, name, welcome_message: welcomeMessage, fallback_message: fallbackMessage, primary_color: primaryColor, position, model, system_prompt: systemPrompt || null, branding_enabled: brandingEnabled } : prev);
      toast.success('Settings saved');
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const deleteBot = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/bots?botId=${botId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Bot deleted');
      router.push('/dashboard/bots');
    } catch (e: any) {
      toast.error(e.message);
    }
    setDeleting(false);
  };

  const reCrawl = async () => {
    if (!website || !user) return;
    setRecrawling(true);
    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: website.url, userId: user.id, websiteId: website.id }),
      });
      if (!res.ok) throw new Error('Re-crawl failed');
      toast.success('Re-crawl started — this may take a minute');
      setTimeout(fetchBot, 5000);
    } catch (e: any) {
      toast.error(e.message);
    }
    setRecrawling(false);
  };

  const copyEmbed = async () => {
    const code = `<script src="${window.location.origin}/widget.js" data-bot-id="${botId}"><\/script>`;
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Embed code copied!');
    } catch {
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

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!bot) return null;

  const embedCode = `<script src="${typeof window !== 'undefined' ? window.location.origin : 'https://pageai-tau.vercel.app'}/widget.js" data-bot-id="${botId}"></script>`;
  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'settings', label: 'Settings' },
    { key: 'knowledge', label: 'Knowledge' },
    { key: 'embed', label: 'Embed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/bots" className="p-1.5 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-elevated/50 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-fg tracking-[-0.02em]">{bot.name}</h1>
              <button onClick={toggleActive} className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${bot.is_active ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-fg-muted/10 text-fg-muted hover:bg-fg-muted/20'}`}>
                {bot.is_active ? 'active' : 'paused'} · click to {bot.is_active ? 'pause' : 'activate'}
              </button>
            </div>
            <p className="text-[12px] text-fg-muted mt-0.5">Created {new Date(bot.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.open(`/chat-preview/${botId}`, '_blank')} className="px-3 py-1.5 rounded-lg border border-edge text-[12px] text-fg-secondary hover:text-fg hover:border-edge-light transition-all">
            Preview
          </button>
          <button onClick={copyEmbed} className="px-3 py-1.5 rounded-lg bg-primary text-white text-[12px] font-medium hover:bg-primary-hover transition-all">
            Copy Embed
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-edge">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all -mb-px ${
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-fg-secondary hover:text-fg'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-edge bg-surface/40">
              <p className="text-[11px] font-medium text-fg-muted uppercase tracking-wide mb-1">Total Conversations</p>
              <p className="text-[28px] font-bold text-fg">{(bot.total_conversations || 0).toLocaleString()}</p>
            </div>
            <div className="p-5 rounded-xl border border-edge bg-surface/40">
              <p className="text-[11px] font-medium text-fg-muted uppercase tracking-wide mb-1">Model</p>
              <p className="text-[15px] font-semibold text-fg capitalize">{bot.model === 'auto' ? 'Auto-routing' : bot.model}</p>
              <p className="text-[11px] text-fg-muted mt-0.5">{bot.model === 'gpt-4.1-mini' ? 'Fast & cost-efficient' : bot.model === 'gpt-4.1' ? 'Most capable' : 'Smart routing by complexity'}</p>
            </div>
            <div className="p-5 rounded-xl border border-edge bg-surface/40">
              <p className="text-[11px] font-medium text-fg-muted uppercase tracking-wide mb-1">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${bot.is_active ? 'bg-success' : 'bg-fg-muted'}`} />
                <p className="text-[15px] font-semibold text-fg capitalize">{bot.is_active ? 'Active' : 'Paused'}</p>
              </div>
              <p className="text-[11px] text-fg-muted mt-0.5">{bot.is_active ? 'Responding to visitors' : 'Not responding to visitors'}</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="p-5 rounded-xl border border-edge bg-surface/40 space-y-3">
            <h3 className="text-[14px] font-semibold text-fg">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => setTab('settings')} className="flex items-center gap-3 p-3 rounded-lg border border-edge hover:border-edge-light text-left transition-all">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-fg">Edit Settings</p>
                  <p className="text-[11px] text-fg-muted">Change name, colors, AI model, and prompts</p>
                </div>
              </button>
              <button onClick={() => setTab('embed')} className="flex items-center gap-3 p-3 rounded-lg border border-edge hover:border-edge-light text-left transition-all">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/></svg>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-fg">Get Embed Code</p>
                  <p className="text-[11px] text-fg-muted">Add this bot to your website in seconds</p>
                </div>
              </button>
              <button onClick={() => window.open(`/chat-preview/${botId}`, '_blank')} className="flex items-center gap-3 p-3 rounded-lg border border-edge hover:border-edge-light text-left transition-all">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-fg">Preview Bot</p>
                  <p className="text-[11px] text-fg-muted">Test your bot in a live chat window</p>
                </div>
              </button>
              <button onClick={() => setTab('knowledge')} className="flex items-center gap-3 p-3 rounded-lg border border-edge hover:border-edge-light text-left transition-all">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-fg">Knowledge Base</p>
                  <p className="text-[11px] text-fg-muted">View and re-crawl connected website</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Tab ── */}
      {tab === 'settings' && (
        <div className="space-y-5 max-w-150">
          {/* Name */}
          <div className="p-5 rounded-xl border border-edge bg-surface/40 space-y-4">
            <h3 className="text-[14px] font-semibold text-fg">Bot Identity</h3>
            <div>
              <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">Bot Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-edge bg-bg/60 text-[14px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all" placeholder="e.g. Support Assistant" />
              <p className="text-[11px] text-fg-muted mt-1">Shown to visitors in the chat widget</p>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">Welcome Message</label>
              <textarea value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)} rows={2} className="w-full px-3.5 py-2.5 rounded-lg border border-edge bg-bg/60 text-[14px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all resize-none" placeholder="Hi! How can I help you today?" />
              <p className="text-[11px] text-fg-muted mt-1">First message visitors see when they open the chat</p>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">Fallback Message</label>
              <textarea value={fallbackMessage} onChange={e => setFallbackMessage(e.target.value)} rows={2} className="w-full px-3.5 py-2.5 rounded-lg border border-edge bg-bg/60 text-[14px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all resize-none" placeholder="I don't have enough information to answer that." />
              <p className="text-[11px] text-fg-muted mt-1">Shown when the bot can't find a relevant answer</p>
            </div>
          </div>

          {/* Appearance */}
          <div className="p-5 rounded-xl border border-edge bg-surface/40 space-y-4">
            <h3 className="text-[14px] font-semibold text-fg">Appearance</h3>
            <div className="flex items-center gap-5">
              <div className="flex-1">
                <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg border border-edge bg-bg cursor-pointer" />
                  <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1 px-3.5 py-2.5 rounded-lg border border-edge bg-bg/60 text-[13px] text-fg font-mono focus:outline-none focus:border-primary/50 transition-all" maxLength={7} />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-[12px] font-medium text-fg-secondary mb-1.5">Widget Position</label>
                <div className="flex gap-2">
                  {(['right', 'left'] as const).map(p => (
                    <button key={p} onClick={() => setPosition(p)} className={`flex-1 py-2 rounded-lg border text-[12px] font-medium capitalize transition-all ${position === p ? 'border-primary bg-primary/10 text-primary' : 'border-edge text-fg-secondary hover:text-fg'}`}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-fg">PageAI Branding</p>
                <p className="text-[11px] text-fg-muted">Shows "Powered by PageAI" in the widget</p>
              </div>
              <button onClick={() => setBrandingEnabled(!brandingEnabled)} className={`relative w-10 h-6 rounded-full transition-colors ${brandingEnabled ? 'bg-primary' : 'bg-edge'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${brandingEnabled ? 'translate-x-4' : ''}`} />
              </button>
            </div>
          </div>

          {/* AI Model */}
          <div className="p-5 rounded-xl border border-edge bg-surface/40 space-y-4">
            <h3 className="text-[14px] font-semibold text-fg">AI Model</h3>
            <div className="space-y-2">
              {[
                { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', desc: 'Fast & cost-efficient. Best for most support bots.' },
                { id: 'auto', name: 'Auto-routing', desc: 'Smart routing — mini for simple queries, 4.1 for complex ones.' },
                { id: 'gpt-4.1', name: 'GPT-4.1', desc: 'Most capable. Best for technical or complex topics.' },
              ].map(m => (
                <button key={m.id} onClick={() => setModel(m.id)} className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${model === m.id ? 'border-primary bg-primary/5' : 'border-edge hover:border-edge-light'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${model === m.id ? 'border-primary' : 'border-edge'}`}>
                    {model === m.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-fg">{m.name}</p>
                    <p className="text-[11px] text-fg-muted mt-0.5">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div className="p-5 rounded-xl border border-edge bg-surface/40 space-y-3">
            <div>
              <h3 className="text-[14px] font-semibold text-fg">System Prompt</h3>
              <p className="text-[12px] text-fg-muted mt-0.5">Advanced: customize how the AI behaves. Leave blank to use the default knowledge-base prompt.</p>
            </div>
            <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={5} className="w-full px-3.5 py-2.5 rounded-lg border border-edge bg-bg/60 text-[13px] text-fg font-mono placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all resize-none" placeholder="You are a helpful assistant for {company}. Answer only questions about our products and services. Be concise and friendly." />
          </div>

          {/* Save */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => { setShowDeleteConfirm(true); }}
              className="px-4 py-2 rounded-lg border border-danger/30 text-[13px] text-danger hover:bg-danger/5 transition-all"
            >
              Delete Bot
            </button>
            <button onClick={saveSettings} disabled={saving} className="px-5 py-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover disabled:opacity-50 transition-all">
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="p-4 rounded-xl border border-danger/30 bg-danger/4">
              <p className="text-[13px] font-semibold text-danger mb-1">Delete this bot?</p>
              <p className="text-[12px] text-fg-secondary mb-3">This is permanent. All conversations and settings will be lost.</p>
              <div className="flex gap-2">
                <button onClick={deleteBot} disabled={deleting} className="px-4 py-1.5 rounded-lg bg-danger text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50 transition-all">
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-1.5 rounded-lg border border-edge text-[12px] text-fg-secondary hover:text-fg transition-all">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Knowledge Tab ── */}
      {tab === 'knowledge' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/3">
            <p className="text-[12px] text-fg-secondary">
              Your bot answers questions using the pages indexed from your connected website. Re-crawl whenever your site content changes.
            </p>
          </div>

          {website ? (
            <div className="p-5 rounded-xl border border-edge bg-surface/40 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-semibold text-fg break-all">{website.url}</p>
                  <p className="text-[12px] text-fg-muted mt-0.5">{website.pages_count} pages indexed{website.last_crawled_at ? ` · last crawled ${new Date(website.last_crawled_at).toLocaleDateString()}` : ''}</p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 ${website.status === 'indexed' ? 'bg-success/10 text-success' : website.status === 'crawling' ? 'bg-warning/10 text-warning' : 'bg-fg-muted/10 text-fg-muted'}`}>{website.status}</span>
              </div>

              <div className="pt-3 border-t border-edge flex gap-2">
                <button onClick={reCrawl} disabled={recrawling} className="px-4 py-2 rounded-lg bg-primary text-white text-[12px] font-medium hover:bg-primary-hover disabled:opacity-50 transition-all">
                  {recrawling ? 'Crawling…' : 'Re-crawl Website'}
                </button>
                <Link href="/dashboard/knowledge" className="px-4 py-2 rounded-lg border border-edge text-[12px] text-fg-secondary hover:text-fg hover:border-edge-light transition-all">
                  View All Pages
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-10 rounded-xl border border-edge bg-surface/40 text-center">
              <p className="text-[14px] font-medium text-fg mb-1">No website connected</p>
              <p className="text-[12px] text-fg-muted mb-4 max-w-[320px] mx-auto">This bot was created without a knowledge source. Delete it and create a new bot to connect a website.</p>
              <Link href="/dashboard/bots/new" className="inline-flex px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-all">
                Create New Bot
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Embed Tab ── */}
      {tab === 'embed' && (
        <div className="space-y-4 max-w-160">
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/3">
            <p className="text-[12px] text-fg-secondary">
              Copy the script tag below and paste it into your website's HTML — just before the closing <code className="text-[11px] bg-primary/10 text-primary px-1 rounded">&lt;/body&gt;</code> tag. The chat widget will appear automatically.
            </p>
          </div>

          {/* Embed code */}
          <div className="p-5 rounded-xl border border-edge bg-surface/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-fg">Script Tag</h3>
              <button onClick={copyEmbed} className="px-3 py-1 rounded-lg bg-primary text-white text-[11px] font-medium hover:bg-primary-hover transition-all">
                Copy
              </button>
            </div>
            <pre className="text-[12px] font-mono text-fg-secondary bg-bg/60 border border-edge rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all">{embedCode}</pre>
          </div>

          {/* Step by step */}
          <div className="p-5 rounded-xl border border-edge bg-surface/40 space-y-4">
            <h3 className="text-[13px] font-semibold text-fg">How to Add to Your Website</h3>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Open your HTML file', desc: 'Open the HTML file for the page where you want the chat widget.' },
                { step: '2', title: 'Find the </body> tag', desc: 'Scroll to the bottom of your HTML file and locate the closing </body> tag.' },
                { step: '3', title: 'Paste the script tag', desc: 'Paste the script tag above immediately before </body>. Save the file.' },
                { step: '4', title: 'That\'s it!', desc: 'The chat widget will appear in the bottom corner of your page. Click Preview above to test it.' },
              ].map(s => (
                <div key={s.step} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{s.step}</div>
                  <div>
                    <p className="text-[13px] font-medium text-fg">{s.title}</p>
                    <p className="text-[12px] text-fg-muted mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For React/Next.js */}
          <div className="p-5 rounded-xl border border-edge bg-surface/40 space-y-3">
            <h3 className="text-[13px] font-semibold text-fg">Using React or Next.js?</h3>
            <p className="text-[12px] text-fg-muted">Add the script using Next.js Script component in your root layout:</p>
            <pre className="text-[11px] font-mono text-fg-secondary bg-bg/60 border border-edge rounded-lg p-4 overflow-x-auto whitespace-pre">{`import Script from 'next/script'

// In your layout.tsx or _app.tsx:
<Script
  src="${typeof window !== 'undefined' ? window.location.origin : 'https://pageai-tau.vercel.app'}/widget.js"
  data-bot-id="${botId}"
  strategy="lazyOnload"
/>`}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
