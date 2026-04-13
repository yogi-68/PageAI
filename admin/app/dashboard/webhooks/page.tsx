'use client';

import { useEffect, useState } from 'react';

interface WebhookEvent {
    id: string;
    event_type: string;
    payload: any;
    status: string;
    error_message: string | null;
    created_at: string;
}

export default function WebhooksPage() {
    const [events, setEvents] = useState<WebhookEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/stats?type=webhooks')
            .then(r => r.json())
            .then(d => setEvents(d.events || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ color: 'var(--muted)', padding: 40 }}>Loading webhooks...</div>;

    const statusColor = (s: string) => {
        if (s === 'processed' || s === 'success') return '#10b981';
        if (s === 'failed' || s === 'error') return '#ef4444';
        return '#f59e0b';
    };

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Webhook Events ({events.length})</h1>

            {/* Summary */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                {['processed', 'failed', 'pending'].map(status => {
                    const count = events.filter(e => e.status === status || (status === 'processed' && e.status === 'success')).length;
                    return (
                        <div key={status} style={{
                            background: 'var(--surface)', border: '1px solid var(--edge)',
                            borderRadius: 12, padding: '16px 24px', minWidth: 120,
                        }}>
                            <div style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'capitalize', marginBottom: 4 }}>{status}</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: statusColor(status) }}>{count}</div>
                        </div>
                    );
                })}
            </div>

            {/* Event List */}
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--edge)',
                borderRadius: 12, overflow: 'hidden',
            }}>
                {events.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No webhook events recorded yet</div>
                ) : events.map(e => (
                    <div key={e.id} style={{ borderBottom: '1px solid var(--edge)' }}>
                        <button
                            onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                            style={{
                                display: 'flex', width: '100%', alignItems: 'center', gap: 16,
                                padding: '14px 16px', background: 'none', border: 'none',
                                color: 'var(--fg)', cursor: 'pointer', textAlign: 'left',
                            }}
                        >
                            <span style={{
                                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                background: statusColor(e.status),
                            }} />
                            <span style={{ fontWeight: 500, fontSize: 13, minWidth: 200 }}>{e.event_type}</span>
                            <span style={{
                                padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                                background: `${statusColor(e.status)}20`, color: statusColor(e.status),
                                textTransform: 'uppercase',
                            }}>
                                {e.status}
                            </span>
                            <span style={{ flex: 1 }} />
                            <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                                {new Date(e.created_at).toLocaleString()}
                            </span>
                            <span style={{ fontSize: 14, color: 'var(--muted)' }}>{expanded === e.id ? '▼' : '▶'}</span>
                        </button>

                        {expanded === e.id && (
                            <div style={{ padding: '0 16px 16px', fontSize: 12 }}>
                                {e.error_message && (
                                    <div style={{
                                        padding: '8px 12px', borderRadius: 6, marginBottom: 8,
                                        background: 'rgba(239,68,68,0.1)', color: 'var(--danger)',
                                    }}>
                                        Error: {e.error_message}
                                    </div>
                                )}
                                <pre style={{
                                    padding: 12, borderRadius: 8,
                                    background: 'rgba(0,0,0,0.3)',
                                    overflow: 'auto', maxHeight: 300,
                                    color: 'var(--muted)',
                                    fontFamily: 'monospace', fontSize: 11,
                                    whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                                }}>
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
