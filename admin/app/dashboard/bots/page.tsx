'use client';

import { useEffect, useState } from 'react';

interface Bot {
  id: string;
  name: string;
  model: string;
  is_active: boolean;
  total_conversations: number;
  primary_color: string;
  temperature: number;
  max_tokens: number;
  created_at: string;
  branding_enabled: boolean;
  owner: { id: string; email: string; plan: string } | null;
  website: { id: string; url: string; name: string; pages_count: number; status: string } | null;
}

const PLAN_CONFIG: Record<string, { color: string; bg: string }> = {
  free:       { color: '#9ca3af', bg: 'rgba(107,114,128,0.12)' },
  starter:    { color: '#4f6df5', bg: 'rgba(79,109,245,0.12)'  },
  growth:     { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'  },
  scale:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  enterprise: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
};

export default function BotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch('/api/stats?type=bots')
      .then(r => r.json())
      .then(d => setBots(d.bots || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = bots.filter(b => {
    if (statusFilter === 'active' && !b.is_active) return false;
    if (statusFilter === 'inactive' && b.is_active) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        b.name.toLowerCase().includes(s) ||
        (b.owner?.email ?? '').toLowerCase().includes(s) ||
        (b.website?.url ?? '').toLowerCase().includes(s)
      );
    }
    return true;
  });

  const activeCount = bots.filter(b => b.is_active).length;

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid var(--edge)', borderTopColor: 'var(--primary)' }} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--fg)' }}>Bots</h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--fg-secondary)' }}>
          {bots.length.toLocaleString()} total · {activeCount} active
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3">
        {[
          { label: 'Total', count: bots.length, color: 'var(--fg-secondary)' },
          { label: 'Active', count: activeCount, color: 'var(--success)' },
          { label: 'Inactive', count: bots.length - activeCount, color: 'var(--danger)' },
        ].map(s => (
          <div key={s.label} className="px-4 py-2.5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
            <p className="text-[11px] uppercase tracking-wide font-medium mb-0.5" style={{ color: 'var(--fg-muted)' }}>{s.label}</p>
            <p className="text-[20px] font-bold tabular-nums" style={{ color: s.color }}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          type="text"
          placeholder="Search bots, owners, websites…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3.5 py-2 rounded-lg text-[13px] outline-none w-72"
          style={{ border: '1px solid var(--edge)', background: 'var(--surface)', color: 'var(--fg)' }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-[13px] outline-none"
          style={{ border: '1px solid var(--edge)', background: 'var(--surface)', color: 'var(--fg)' }}
        >
          <option value="all">All status</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
        {filtered.length !== bots.length && (
          <span className="text-[12px]" style={{ color: 'var(--fg-muted)' }}>
            Showing {filtered.length} of {bots.length}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--edge)', background: 'rgba(255,255,255,0.015)' }}>
                {['Bot', 'Status', 'Owner', 'Conversations', 'Model', 'Website', 'Created'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium uppercase tracking-wide text-[11px] whitespace-nowrap"
                    style={{ color: 'var(--fg-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[13px]" style={{ color: 'var(--fg-secondary)' }}>
                    No bots found
                  </td>
                </tr>
              ) : filtered.map(bot => {
                const ownerCfg = PLAN_CONFIG[bot.owner?.plan || 'free'] || PLAN_CONFIG.free;
                return (
                  <tr key={bot.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--edge)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-elevated)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-6 rounded shrink-0" style={{ background: bot.primary_color || 'var(--primary)' }} />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--fg)' }}>{bot.name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--fg-muted)' }}>temp {bot.temperature} · {bot.max_tokens} tkn</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-[11.5px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: bot.is_active ? 'var(--success)' : 'var(--danger)' }} />
                        <span style={{ color: bot.is_active ? 'var(--success)' : 'var(--danger)' }}>
                          {bot.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {bot.owner ? (
                        <div>
                          <p className="truncate max-w-[140px]" style={{ color: 'var(--fg)' }}>{bot.owner.email}</p>
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase"
                            style={{ background: ownerCfg.bg, color: ownerCfg.color }}>
                            {bot.owner.plan || 'free'}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--fg-muted)' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium" style={{ color: 'var(--fg)' }}>
                      {bot.total_conversations.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono"
                        style={{ background: 'rgba(79,109,245,0.08)', color: 'var(--primary)' }}>
                        {bot.model?.replace('gpt-', '') || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      {bot.website ? (
                        <div>
                          <p className="truncate text-[11.5px]" style={{ color: 'var(--fg-secondary)' }}>{bot.website.url}</p>
                          <p className="text-[11px]" style={{ color: 'var(--fg-muted)' }}>
                            {bot.website.pages_count} pages · {bot.website.status}
                          </p>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--fg-muted)' }}>No website</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[11.5px]" style={{ color: 'var(--fg-secondary)' }}>
                      {new Date(bot.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      {!bot.branding_enabled && (
                        <span className="ml-1.5 text-[10px] px-1 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>no brand</span>
                      )}
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