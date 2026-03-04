'use client';

import { useEffect, useState } from 'react';

interface BotRow {
  id: string;
  name: string;
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

  const filtered = bots.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.ownerEmail?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">All Bots</h1>
        <span className="text-[13px] text-fg-secondary">{bots.length} total</span>
      </div>

      <div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bots or owners..." className="w-full max-w-[400px] px-4 py-2.5 rounded-lg border border-edge bg-bg/60 text-[13px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 rounded-xl border border-edge bg-surface/40 text-center">
          <p className="text-[13px] text-fg-secondary">No bots found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(bot => (
            <div key={bot.id} className="flex items-center justify-between p-4 rounded-xl border border-edge bg-surface/40 hover:border-edge-light transition-all">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 mb-0.5">
                  <h3 className="text-[14px] font-semibold text-fg">{bot.name}</h3>
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${bot.is_active ? 'bg-success/10 text-success' : 'bg-fg-muted/10 text-fg-muted'}`}>{bot.is_active ? 'active' : 'inactive'}</span>
                </div>
                <p className="text-[12px] text-fg-muted">{bot.ownerEmail || 'Unknown'}</p>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-fg-secondary shrink-0 ml-4">
                <span>{bot.total_conversations || 0} chats</span>
                <span>{new Date(bot.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
