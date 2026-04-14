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
  const [selected, setSelected] = useState<Conversation | null>(null);

  useEffect(() => {
    fetch('/api/stats?type=conversations&limit=100')
      .then(r => r.json())
      .then(d => setConversations(d.conversations || []))
      .catch(() => setError('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  const loadMessages = (conv: Conversation) => {
    setSelectedId(conv.id);
    setSelected(conv);
    setLoadingMessages(true);
    setMessages([]);
    fetch(`/api/stats?type=conversation-detail&id=${encodeURIComponent(conv.id)}`)
      .then(r => r.json())
      .then(d => setMessages(d.messages || []))
      .catch(console.error)
      .finally(() => setLoadingMessages(false));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-2.5" style={{ color: 'var(--fg-secondary)' }}>
      <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid var(--edge)', borderTopColor: 'var(--primary)' }} />
      Loading conversations…
    </div>
  );

  if (error) return (
    <div className="py-12 text-center text-[13px]" style={{ color: 'var(--danger)' }}>{error}</div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--fg)' }}>Conversations</h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--fg-secondary)' }}>
          {conversations.length} sessions loaded
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-4" style={{ height: 'calc(100vh - 220px)', minHeight: 500 }}>
        {/* Left: conversation list */}
        <div className="w-[320px] shrink-0 rounded-xl overflow-hidden flex flex-col"
          style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
          <div className="px-4 py-3 shrink-0 text-[11px] font-semibold uppercase tracking-wider"
            style={{ borderBottom: '1px solid var(--edge)', color: 'var(--fg-muted)' }}>
            Recent Sessions
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="py-16 text-center text-[13px]" style={{ color: 'var(--fg-secondary)' }}>No conversations yet</div>
            ) : conversations.map(c => (
              <button
                key={c.id}
                onClick={() => loadMessages(c)}
                className="w-full text-left px-4 py-3 transition-colors"
                style={{
                  borderBottom: '1px solid var(--edge)',
                  background: selectedId === c.id ? 'rgba(79,109,245,0.07)' : 'transparent',
                }}
                onMouseEnter={e => selectedId !== c.id && ((e.currentTarget as HTMLElement).style.background = 'var(--surface-elevated)')}
                onMouseLeave={e => selectedId !== c.id && ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-[13px] font-medium truncate" style={{ color: selectedId === c.id ? 'var(--primary)' : 'var(--fg)' }}>
                    {c.bot?.name || 'Unknown Bot'}
                  </span>
                  <span className="text-[10.5px] whitespace-nowrap shrink-0" style={{ color: 'var(--fg-muted)' }}>
                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px]" style={{ color: 'var(--fg-secondary)' }}>{c.message_count} msgs</span>
                  <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: c.status === 'active' ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)',
                      color: c.status === 'active' ? 'var(--success)' : 'var(--fg-muted)',
                    }}>
                    {c.status}
                  </span>
                  {c.satisfaction_rating != null && (
                    <span className="text-[10.5px] font-medium" style={{ color: 'var(--warning)' }}>
                      {c.satisfaction_rating}/5
                    </span>
                  )}
                </div>
                {c.visitor_page_url && (
                  <p className="text-[10.5px] truncate mt-0.5" style={{ color: 'var(--fg-muted)' }}>{c.visitor_page_url}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: thread */}
        <div className="flex-1 rounded-xl flex flex-col overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
          {/* Thread header */}
          {selected && (
            <div className="px-5 py-3 shrink-0 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--edge)' }}>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--fg)' }}>{selected.bot?.name}</p>
                <p className="text-[11px]" style={{ color: 'var(--fg-muted)' }}>
                  {new Date(selected.created_at).toLocaleString()} · {messages.length} messages
                </p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: selected.status === 'active' ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)',
                  color: selected.status === 'active' ? 'var(--success)' : 'var(--fg-muted)',
                }}>
                {selected.status}
              </span>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-5">
            {!selectedId ? (
              <div className="h-full flex flex-col items-center justify-center gap-3" style={{ color: 'var(--fg-secondary)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-elevated)' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H8.5l-4 4V14H5a2 2 0 01-2-2V5z" fill="var(--fg-muted)"/>
                  </svg>
                </div>
                <p className="text-[13px]">Select a conversation to view messages</p>
              </div>
            ) : loadingMessages ? (
              <div className="flex items-center justify-center h-full gap-2" style={{ color: 'var(--fg-secondary)' }}>
                <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid var(--edge)', borderTopColor: 'var(--primary)' }} />
                Loading messages…
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[13px]" style={{ color: 'var(--fg-secondary)' }}>No messages</div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] group`}>
                      <div
                        className="px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                        style={m.role === 'user' ? {
                          background: 'var(--primary)',
                          color: '#fff',
                          borderBottomRightRadius: 4,
                        } : {
                          background: 'var(--surface-elevated)',
                          color: 'var(--fg)',
                          border: '1px solid var(--edge)',
                          borderBottomLeftRadius: 4,
                        }}
                      >
                        {m.content}
                      </div>
                      <div className="flex gap-2 mt-1 text-[10px] px-1" style={{ color: 'var(--fg-muted)', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <span>{new Date(m.created_at).toLocaleTimeString()}</span>
                        {m.model_used && <span>{m.model_used.replace('gpt-', '')}</span>}
                        {m.response_time_ms != null && <span>{m.response_time_ms}ms</span>}
                        {(m.prompt_tokens || m.completion_tokens) && (
                          <span>{(m.prompt_tokens || 0) + (m.completion_tokens || 0)} tkn</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}