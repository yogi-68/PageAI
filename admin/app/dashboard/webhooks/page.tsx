'use client';

import { useEffect, useState } from 'react';

interface WebhookEvent {
  id: string;
  event_type: string;
  payload: unknown;
  status: string;
  error_message: string | null;
  created_at: string;
}

function statusStyle(s: string): { color: string; bg: string; dot: string } {
  if (s === 'processed' || s === 'success')
    return { color: 'var(--success)', bg: 'rgba(52,211,153,0.1)', dot: 'var(--success)' };
  if (s === 'failed' || s === 'error')
    return { color: 'var(--danger)',  bg: 'rgba(239,68,68,0.1)',   dot: 'var(--danger)'  };
  return     { color: 'var(--warning)', bg: 'rgba(251,191,36,0.1)', dot: 'var(--warning)' };
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round"
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
      <path d="M4 2l4 4-4 4" />
    </svg>
  );
}

export default function WebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/stats?type=webhooks')
      .then(r => r.json())
      .then(d => setEvents(d.events || []))
      .catch(() => setError('Failed to load webhook events'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-2.5" style={{ color: 'var(--fg-secondary)' }}>
      <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid var(--edge)', borderTopColor: 'var(--primary)' }} />
      Loading webhook events…
    </div>
  );

  if (error) return (
    <div className="py-12 text-center text-[13px]" style={{ color: 'var(--danger)' }}>{error}</div>
  );

  const counts = {
    all:       events.length,
    processed: events.filter(e => e.status === 'processed' || e.status === 'success').length,
    failed:    events.filter(e => e.status === 'failed'    || e.status === 'error').length,
    pending:   events.filter(e => e.status === 'pending').length,
  };

  const filtered = filter === 'all' ? events :
    events.filter(e => {
      if (filter === 'processed') return e.status === 'processed' || e.status === 'success';
      if (filter === 'failed')    return e.status === 'failed'    || e.status === 'error';
      return e.status === filter;
    });

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--fg)' }}>Webhooks</h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--fg-secondary)' }}>
          Dodo Payments webhook events and processing status
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Processed', key: 'processed', color: 'var(--success)' },
          { label: 'Failed',    key: 'failed',    color: 'var(--danger)'  },
          { label: 'Pending',   key: 'pending',   color: 'var(--warning)' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(filter === s.key ? 'all' : s.key)}
            className="p-4 rounded-xl transition-all text-left"
            style={{
              background: 'var(--surface)',
              border: filter === s.key ? `1px solid ${s.color}` : '1px solid var(--edge)',
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-muted)' }}>{s.label}</p>
            <p className="text-[26px] font-bold tabular-nums" style={{ color: s.color }}>
              {counts[s.key as keyof typeof counts]}
            </p>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      {filter !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-[12px]" style={{ color: 'var(--fg-secondary)' }}>
            Showing {filtered.length} {filter} events
          </span>
          <button onClick={() => setFilter('all')} className="text-[12px] underline" style={{ color: 'var(--primary)' }}>
            Show all
          </button>
        </div>
      )}

      {/* Event list */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[13px]" style={{ color: 'var(--fg-secondary)' }}>
            No {filter === 'all' ? '' : filter} webhook events
          </div>
        ) : filtered.map(e => {
          const st = statusStyle(e.status);
          const isOpen = expanded === e.id;
          return (
            <div key={e.id} style={{ borderBottom: '1px solid var(--edge)' }}>
              <button
                onClick={() => setExpanded(isOpen ? null : e.id)}
                className="w-full flex items-center gap-3 px-5 py-3.5 transition-colors text-left"
                style={{ background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-elevated)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: st.dot }} />
                <span className="text-[13px] font-medium flex-1 text-left truncate" style={{ color: 'var(--fg)' }}>
                  {e.event_type}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold uppercase shrink-0"
                  style={{ background: st.bg, color: st.color }}>
                  {e.status}
                </span>
                <span className="text-[11.5px] whitespace-nowrap shrink-0" style={{ color: 'var(--fg-secondary)' }}>
                  {new Date(e.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span style={{ color: 'var(--fg-muted)' }}>
                  <ChevronIcon open={isOpen} />
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1">
                  {e.error_message && (
                    <div className="mb-3 px-3.5 py-2.5 rounded-lg text-[12.5px] flex items-start gap-2"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)' }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="shrink-0 mt-0.5">
                        <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zM8 11a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd"/>
                      </svg>
                      {e.error_message}
                    </div>
                  )}
                  <pre
                    className="p-4 rounded-xl text-[11.5px] font-mono leading-relaxed overflow-auto max-h-[320px] whitespace-pre-wrap break-all"
                    style={{ background: 'var(--bg)', border: '1px solid var(--edge)', color: 'var(--fg-secondary)' }}
                  >
                    {JSON.stringify(e.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}