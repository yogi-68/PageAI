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
    const [error, setError] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    useEffect(() => {
        fetch('/api/stats?type=conversations&limit=100')
            .then(r => r.json())
            .then(d => setConversations(d.conversations || []))
            .catch(() => setError('Failed to load conversations'))
            .finally(() => setLoading(false));
    }, []);

    const loadMessages = (convId: string) => {
        setSelectedId(convId);
        setLoadingMessages(true);
        setMessages([]);
        fetch(`/api/stats?type=conversation-detail&id=${encodeURIComponent(convId)}`)
            .then(r => r.json())
            .then(d => setMessages(d.messages || []))
            .catch(console.error)
            .finally(() => setLoadingMessages(false));
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20 text-[var(--fg-secondary)]">
            <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mr-3" />
            Loading conversations...
        </div>
    );
    if (error) return <div className="py-10 text-center text-[var(--danger)]">{error}</div>;

    return (
        <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 8rem)' }}>
            <div className="mb-5">
                <h1 className="text-2xl font-bold text-[var(--fg)]">Conversations ({conversations.length})</h1>
                <p className="text-sm text-[var(--fg-secondary)] mt-0.5">View all user chat sessions and message threads</p>
            </div>

            <div className="flex gap-4 flex-1 min-h-0" style={{ height: 'calc(100vh - 12rem)' }}>
                {/* Conversation list */}
                <div className="w-[340px] shrink-0 rounded-xl bg-[var(--surface)] border border-[var(--edge)] overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="py-16 text-center text-[var(--fg-secondary)] text-sm">No conversations yet</div>
                    ) : conversations.map(c => (
                        <button
                            key={c.id}
                            onClick={() => loadMessages(c.id)}
                            className={`w-full text-left px-4 py-3.5 border-b border-[var(--edge)] last:border-0 transition-colors ${
                                selectedId === c.id
                                    ? 'bg-[rgba(79,109,245,0.08)]'
                                    : 'hover:bg-[var(--surface-elevated)]'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-[13px] text-[var(--fg)]">
                                    {c.bot?.name || 'Unknown Bot'}
                                </span>
                                <span className="text-[11px] text-[var(--fg-secondary)] ml-2 shrink-0">
                                    {new Date(c.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[var(--fg-secondary)]">
                                <span>{c.message_count} msgs</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    c.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--edge)] text-[var(--fg-secondary)]'
                                }`}>{c.status}</span>
                                {c.satisfaction_rating && (
                                    <span className="text-amber-500">{c.satisfaction_rating}/5</span>
                                )}
                            </div>
                            {c.visitor_page_url && (
                                <div className="text-[11px] text-[var(--fg-muted)] mt-1 truncate">{c.visitor_page_url}</div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Message thread */}
                <div className="flex-1 rounded-xl bg-[var(--surface)] border border-[var(--edge)] overflow-y-auto p-5">
                    {!selectedId ? (
                        <div className="h-full flex items-center justify-center text-[var(--fg-secondary)] text-sm">
                            <div className="text-center">
                                <div className="text-4xl mb-3 opacity-20">💬</div>
                                <p>Select a conversation to view messages</p>
                            </div>
                        </div>
                    ) : loadingMessages ? (
                        <div className="flex items-center gap-2 text-[var(--fg-secondary)] text-sm">
                            <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                            Loading messages...
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-10 text-[var(--fg-secondary)] text-sm">No messages in this conversation</div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {messages.map(m => (
                                <div
                                    key={m.id}
                                    className={`max-w-[80%] ${m.role === 'user' ? 'self-end items-end' : 'self-start items-start'} flex flex-col`}
                                >
                                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                        m.role === 'user'
                                            ? 'bg-[var(--primary)] text-white rounded-br-sm'
                                            : 'bg-[var(--surface-elevated)] text-[var(--fg)] rounded-bl-sm border border-[var(--edge)]'
                                    }`}>
                                        {m.content}
                                    </div>
                                    <div className={`flex gap-2 mt-1 text-[10px] text-[var(--fg-muted)] ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <span>{new Date(m.created_at).toLocaleTimeString()}</span>
                                        {m.model_used && <span>{m.model_used}</span>}
                                        {m.response_time_ms && <span>{m.response_time_ms}ms</span>}
                                        {(m.prompt_tokens || m.completion_tokens) && (
                                            <span>{(m.prompt_tokens || 0) + (m.completion_tokens || 0)} tokens</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}