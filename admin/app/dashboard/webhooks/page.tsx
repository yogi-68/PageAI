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

function statusColor(s: string) {
    if (s === 'processed' || s === 'success') return 'text-emerald-500 bg-emerald-500/10';
    if (s === 'failed' || s === 'error') return 'text-[var(--danger)] bg-[var(--danger)]/10';
    return 'text-amber-500 bg-amber-500/10';
}
function dotColor(s: string) {
    if (s === 'processed' || s === 'success') return 'bg-emerald-500';
    if (s === 'failed' || s === 'error') return 'bg-[var(--danger)]';
    return 'bg-amber-500';
}

export default function WebhooksPage() {
    const [events, setEvents] = useState<WebhookEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/stats?type=webhooks')
            .then(r => r.json())
            .then(d => setEvents(d.events || []))
            .catch(() => setError('Failed to load webhook events'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-20 text-[var(--fg-secondary)]">
            <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mr-3" />
            Loading webhook events...
        </div>
    );
    if (error) return <div className="py-10 text-center text-[var(--danger)]">{error}</div>;

    const counts = {
        processed: events.filter(e => e.status === 'processed' || e.status === 'success').length,
        failed: events.filter(e => e.status === 'failed' || e.status === 'error').length,
        pending: events.filter(e => e.status === 'pending').length,
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--fg)]">Webhook Events ({events.length})</h1>
                <p className="text-sm text-[var(--fg-secondary)] mt-0.5">Dodo Payments webhook events and processing status</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Processed', count: counts.processed, cls: 'text-emerald-500' },
                    { label: 'Failed', count: counts.failed, cls: 'text-[var(--danger)]' },
                    { label: 'Pending', count: counts.pending, cls: 'text-amber-500' },
                ].map(({ label, count, cls }) => (
                    <div key={label} className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] px-5 py-4">
                        <div className="text-xs text-[var(--fg-secondary)] mb-1.5">{label}</div>
                        <div className={`text-2xl font-bold tabular-nums ${cls}`}>{count}</div>
                    </div>
                ))}
            </div>

            {/* Event list */}
            <div className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] overflow-hidden">
                {events.length === 0 ? (
                    <div className="py-16 text-center text-[var(--fg-secondary)] text-sm">No webhook events recorded yet</div>
                ) : events.map(e => (
                    <div key={e.id} className="border-b border-[var(--edge)] last:border-0">
                        <button
                            onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-elevated)] transition-colors text-left"
                        >
                            <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor(e.status)}`} />
                            <span className="font-medium text-sm text-[var(--fg)] min-w-[180px]">{e.event_type}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${statusColor(e.status)}`}>
                                {e.status}
                            </span>
                            <span className="flex-1" />
                            <span className="text-xs text-[var(--fg-secondary)] whitespace-nowrap mr-2">
                                {new Date(e.created_at).toLocaleString()}
                            </span>
                            <span className="text-[var(--fg-secondary)] text-xs">{expanded === e.id ? 'v' : '>'}</span>
                        </button>

                        {expanded === e.id && (
                            <div className="px-4 pb-4">
                                {e.error_message && (
                                    <div className="mb-3 px-3 py-2 rounded-lg bg-[var(--danger)]/10 text-[var(--danger)] text-sm border border-[var(--danger)]/20">
                                        Error: {e.error_message}
                                    </div>
                                )}
                                <pre className="p-4 rounded-xl bg-[rgba(0,0,0,0.2)] border border-[var(--edge)] text-[var(--fg-secondary)] text-xs font-mono overflow-auto max-h-[280px] leading-relaxed whitespace-pre-wrap break-all">
                                    {JSON.stringify(e.payload, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}