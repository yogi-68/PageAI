'use client';

import { useEffect, useState } from 'react';

interface Conversation {
    id: string;
    bot_id: string;
    visitor_id: string;
    visitor_page_url: string | null;
    status: string;
    message_count: number;
    satisfaction_rating: number | null;
    created_at: string;
    updated_at: string;
    bot: { id: string; name: string; user_id: string } | null;
}

interface Message {
    id: string;
    role: string;
    content: string;
    created_at: string;
    prompt_tokens: number | null;
    completion_tokens: number | null;
    response_time_ms: number | null;
    model_used: string | null;
}

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    useEffect(() => {
        fetch('/api/stats?type=conversations&limit=100')
            .then(r => r.json())
            .then(d => setConversations(d.conversations || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const loadMessages = (convId: string) => {
        setSelectedId(convId);
        setLoadingMessages(true);
        fetch(`/api/stats?type=conversation-detail&id=${encodeURIComponent(convId)}`)
            .then(r => r.json())
            .then(d => setMessages(d.messages || []))
            .catch(console.error)
            .finally(() => setLoadingMessages(false));
    };

    if (loading) return <div style={{ color: 'var(--muted)', padding: 40 }}>Loading conversations...</div>;

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Conversations ({conversations.length})</h1>

            <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 160px)' }}>
                {/* Conversation List */}
                <div style={{
                    width: 380, flexShrink: 0,
                    background: 'var(--surface)', border: '1px solid var(--edge)',
                    borderRadius: 12, overflow: 'auto',
                }}>
                    {conversations.map(c => (
                        <button
                            key={c.id}
                            onClick={() => loadMessages(c.id)}
                            style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                padding: '14px 16px',
                                background: selectedId === c.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                                border: 'none', borderBottom: '1px solid var(--edge)',
                                color: 'var(--fg)', cursor: 'pointer',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{c.bot?.name || 'Unknown Bot'}</span>
                                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                                    {new Date(c.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 12 }}>
                                <span>{c.message_count} msgs</span>
                                <span>{c.status}</span>
                                {c.satisfaction_rating && <span>⭐ {c.satisfaction_rating}</span>}
                            </div>
                            {c.visitor_page_url && (
                                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {c.visitor_page_url}
                                </div>
                            )}
                        </button>
                    ))}
                    {conversations.length === 0 && (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No conversations yet</div>
                    )}
                </div>

                {/* Message Thread */}
                <div style={{
                    flex: 1,
                    background: 'var(--surface)', border: '1px solid var(--edge)',
                    borderRadius: 12, overflow: 'auto', padding: 24,
                }}>
                    {!selectedId ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)' }}>
                            Select a conversation to view messages
                        </div>
                    ) : loadingMessages ? (
                        <div style={{ color: 'var(--muted)' }}>Loading messages...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {messages.map(m => (
                                <div key={m.id} style={{
                                    maxWidth: '80%',
                                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                }}>
                                    <div style={{
                                        padding: '10px 14px',
                                        borderRadius: 12,
                                        background: m.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                        color: m.role === 'user' ? '#fff' : 'var(--fg)',
                                        fontSize: 13,
                                        lineHeight: 1.5,
                                    }}>
                                        {m.content}
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, display: 'flex', gap: 8, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                        <span>{new Date(m.created_at).toLocaleTimeString()}</span>
                                        {m.model_used && <span>{m.model_used}</span>}
                                        {m.response_time_ms && <span>{m.response_time_ms}ms</span>}
                                        {m.prompt_tokens && <span>{m.prompt_tokens + (m.completion_tokens || 0)} tokens</span>}
                                    </div>
                                </div>
                            ))}
                            {messages.length === 0 && (
                                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>No messages</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
