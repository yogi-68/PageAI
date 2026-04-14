'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('bots').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setBots(data); setLoading(false); });
  }, [user]);

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

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Bots</h1>
          <p className="text-[14px] text-fg-secondary mt-0.5">{bots.length} bot{bots.length !== 1 ? 's' : ''} created</p>
        </div>
        <Link href="/dashboard/bots/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors">+ New Bot</Link>
      </div>

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
              </div>
            </div>
          ))}
          <Link href="/dashboard/bots/new" className="flex items-center justify-center p-4 rounded-xl border border-dashed border-edge text-[13px] text-fg-muted hover:text-fg hover:border-edge-light transition-all duration-200">+ Create New Bot</Link>
        </div>
      )}
    </div>
  );
}
