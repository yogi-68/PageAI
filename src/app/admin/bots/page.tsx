'use client';

import { useEffect, useState } from 'react';

interface BotRow {
  id: string;
  name: string;
  model: string;
  is_active: boolean;
  user_id: string;
  total_conversations: number;
  created_at: string;
  ownerEmail?: string;
  websiteUrl?: string;
}

export default function AdminBotsPage() {
  const [bots, setBots] = useState<BotRow[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/stats?type=bots');
        const data = await res.json();
        setBots(data.bots || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const filtered = bots
    .filter(b =>
      (statusFilter === 'all' || (statusFilter === 'active' ? b.is_active : !b.is_active)) &&
      (b.name?.toLowerCase().includes(search.toLowerCase()) ||
       b.ownerEmail?.toLowerCase().includes(search.toLowerCase()) ||
       b.websiteUrl?.toLowerCase().includes(search.toLowerCase()))
    );

  const activeCount = bots.filter(b => b.is_active).length;
  const totalConvos = bots.reduce((s, b) => s + (b.total_conversations || 0), 0);

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">All Bots</h1>
          <p className="text-[14px] text-fg-secondary mt-0.5">{bots.length} bots · {activeCount} active · {totalConvos.toLocaleString()} total conversations</p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'active', 'inactive'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-all ${
                statusFilter === s
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-surface/40 text-fg-muted border border-edge hover:text-fg'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bots, owners, or websites..." className="w-full max-w-[400px] px-4 py-2.5 rounded-lg border border-edge bg-bg/60 text-[13px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all" />

      {filtered.length === 0 ? (
        <div className="p-8 rounded-xl border border-edge bg-surface/40 text-center">
          <p className="text-[13px] text-fg-secondary">No bots found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-edge">
                  <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Bot</th>
                  <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Owner</th>
                  <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Model</th>
                  <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Status</th>
                  <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Chats</th>
                  <th className="px-5 py-2.5 text-[12px] font-medium text-fg-muted uppercase tracking-wide">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {filtered.map(bot => (
                  <tr key={bot.id} className="hover:bg-surface-elevated/20 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-[13px] font-medium text-fg">{bot.name}</p>
                      {bot.websiteUrl && <p className="text-[11px] text-fg-muted truncate max-w-[200px]">{bot.websiteUrl.replace(/https?:\/\//, '')}</p>}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-fg-secondary">{bot.ownerEmail || 'Unknown'}</td>
                    <td className="px-5 py-3"><span className="text-[11px] text-fg-muted font-mono">{bot.model || 'auto'}</span></td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${bot.is_active ? 'bg-success/10 text-success' : 'bg-fg-muted/10 text-fg-muted'}`}>{bot.is_active ? 'active' : 'inactive'}</span>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-fg-secondary">{(bot.total_conversations || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-[13px] text-fg-secondary">{new Date(bot.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
