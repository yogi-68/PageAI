'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Sk } from '@/components/ui/Skeleton';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    confidence?: number;
    model?: string;
    responseTimeMs?: number;
    chunksRetrieved?: number;
    sources?: Array<{ url: string; title: string }>;
    unanswered?: boolean;
    queryRewrite?: string | null;
    cached?: boolean;
  };
}

interface Bot {
  id: string;
  name: string;
  primary_color: string;
  welcome_message: string;
  model: string;
  website_id: string | null;
}

export default function PlaygroundPage() {
  const { user } = useAuth();
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [botsLoading, setBotsLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch bots
  useEffect(() => {
    if (!user) return;
    supabase
      .from('bots')
      .select('id, name, primary_color, welcome_message, model, website_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setBots(data);
          setSelectedBot(data[0].id);
        }
        setBotsLoading(false);
      });
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const currentBot = bots.find(b => b.id === selectedBot);

  const sendMessage = useCallback(async () => {
    const q = input.trim();
    if (!q || loading || !selectedBot) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    const startTime = Date.now();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, botId: selectedBot, stream: true }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.error || 'Something went wrong.', metadata: { responseTimeMs: Date.now() - startTime } },
        ]);
        setLoading(false);
        return;
      }

      // Stream SSE tokens
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let streamedText = '';
      let metaData: Message['metadata'] = {};
      let buffer = '';

      // Add placeholder message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      const msgIndex = (messages.length + 1); // +1 for user msg

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();

            if (payload === '[DONE]') continue;

            try {
              const evt = JSON.parse(payload);
              if (evt.type === 'token') {
                streamedText += evt.content;
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                    updated[lastIdx] = { ...updated[lastIdx], content: streamedText };
                  }
                  return updated;
                });
              } else if (evt.type === 'done') {
                const elapsed = Date.now() - startTime;
                metaData = {
                  confidence: evt.confidence,
                  model: evt.model,
                  responseTimeMs: evt.responseTimeMs || elapsed,
                  chunksRetrieved: evt.chunksRetrieved,
                  sources: evt.sources,
                  unanswered: evt.unanswered,
                  queryRewrite: evt.queryRewrite || null,
                  cached: evt.cached,
                };
                // Attach metadata to the message
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      content: streamedText || updated[lastIdx].content,
                      metadata: metaData,
                    };
                  }
                  return updated;
                });
              } else if (evt.type === 'error') {
                streamedText = evt.message || 'An error occurred.';
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                    updated[lastIdx] = { ...updated[lastIdx], content: streamedText };
                  }
                  return updated;
                });
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      }

      // Fallback: if streaming produced no text, use non-streaming
      if (!streamedText) {
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant' && !updated[lastIdx].content) {
            updated[lastIdx] = { ...updated[lastIdx], content: 'No response received.' };
          }
          return updated;
        });
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Failed to connect. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, selectedBot, messages.length]);

  const clearChat = () => {
    setMessages([]);
    setSelectedMsg(null);
  };

  const getConfidenceColor = (c?: number) => {
    if (c === undefined) return 'text-fg-muted';
    if (c >= 0.7) return 'text-success';
    if (c >= 0.4) return 'text-warning';
    return 'text-danger';
  };

  const getConfidenceBg = (c?: number) => {
    if (c === undefined) return 'bg-fg-muted/10';
    if (c >= 0.7) return 'bg-success/10';
    if (c >= 0.4) return 'bg-warning/10';
    return 'bg-danger/10';
  };

  if (botsLoading) {
    return (
      <div className="space-y-4">
        <Sk className="h-8 w-60" />
        <Sk className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  if (bots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-[16px] font-semibold text-fg mb-2">No bots found</p>
        <p className="text-[13px] text-fg-muted">Create a bot first to use the AI Testing Playground.</p>
      </div>
    );
  }

  const lastAssistantMsg = selectedMsg !== null
    ? messages[selectedMsg]
    : messages.filter(m => m.role === 'assistant').slice(-1)[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-fg tracking-[-0.02em]">AI Testing Playground</h1>
          <p className="text-[13px] text-fg-muted mt-0.5">Test your bot&apos;s responses, inspect confidence scores, and debug RAG retrieval.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${showDebug ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface/60 text-fg-muted border border-edge'}`}
          >
            {showDebug ? '🔍 Debug ON' : '🔍 Debug OFF'}
          </button>
        </div>
      </div>

      {/* Bot selector */}
      <div className="flex items-center gap-3">
        <label className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">Bot:</label>
        <select
          value={selectedBot}
          onChange={e => { setSelectedBot(e.target.value); clearChat(); }}
          className="px-3 py-1.5 rounded-lg border border-edge bg-surface/40 text-[13px] text-fg focus:outline-none focus:border-primary/50"
        >
          {bots.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <span className="text-[11px] text-fg-muted px-2 py-0.5 rounded bg-surface-elevated/50 border border-edge">
          Model: {currentBot?.model === 'gpt-4.1' ? 'Advanced AI' : currentBot?.model === 'auto' ? 'Smart Routing' : 'Fast AI'}
        </span>
        <button onClick={clearChat} className="ml-auto px-3 py-1.5 rounded-lg border border-edge text-[12px] text-fg-muted hover:text-fg hover:border-edge-light transition-all">
          Clear Chat
        </button>
      </div>

      {/* Main layout */}
      <div className={`grid gap-4 ${showDebug ? 'grid-cols-1 lg:grid-cols-[1fr_340px]' : ''}`}>
        {/* Chat panel */}
        <div className="flex flex-col rounded-xl border border-edge bg-surface/30 overflow-hidden" style={{ height: '520px' }}>
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-edge bg-surface/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: currentBot?.primary_color || '#6366f1' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="white" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-fg">{currentBot?.name || 'AI Assistant'}</p>
              <p className="text-[11px] text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                Testing Mode
              </p>
            </div>
            <span className="ml-auto px-2 py-0.5 rounded-md bg-warning/10 text-warning text-[10px] font-medium">SANDBOX</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {/* Welcome */}
            {messages.length === 0 && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: currentBot?.primary_color || '#6366f1' }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="white" />
                  </svg>
                </div>
                <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-[13px] leading-relaxed bg-surface-elevated text-fg-secondary">
                  {currentBot?.welcome_message || 'Hi! 👋 Ask me anything about this website!'}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: currentBot?.primary_color || '#6366f1' }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="white" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed cursor-pointer transition-all ${
                    m.role === 'user'
                      ? 'rounded-br-sm text-white'
                      : `rounded-tl-sm bg-surface-elevated text-fg-secondary hover:bg-surface-elevated/80 ${selectedMsg === i ? 'ring-2 ring-primary/40' : ''}`
                  }`}
                  style={m.role === 'user' ? { background: currentBot?.primary_color || '#6366f1' } : undefined}
                  onClick={() => m.role === 'assistant' && setSelectedMsg(i === selectedMsg ? null : i)}
                >
                  {m.content}
                  {/* Inline confidence badge */}
                  {showDebug && m.role === 'assistant' && m.metadata?.confidence !== undefined && (
                    <div className="mt-2 flex items-center gap-2 pt-1.5 border-t border-edge/30">
                      <span className={`text-[10px] font-medium ${getConfidenceColor(m.metadata.confidence)}`}>
                        {Math.round(m.metadata.confidence * 100)}% confidence
                      </span>
                      {m.metadata.responseTimeMs && (
                        <span className="text-[10px] text-fg-muted">{m.metadata.responseTimeMs}ms</span>
                      )}
                      {m.metadata.unanswered && (
                        <span className="text-[10px] text-danger font-medium">⚠ Unanswered</span>
                      )}
                      {m.metadata.cached && (
                        <span className="text-[10px] text-primary font-medium">⚡ Cached</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: currentBot?.primary_color || '#6366f1' }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="white" />
                  </svg>
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface-elevated flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-fg-muted animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-fg-muted animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-fg-muted animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-1">
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-edge bg-bg/60">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Test a customer question…"
                className="flex-1 bg-transparent text-[13px] text-fg placeholder:text-fg-muted outline-none"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-40"
                style={{ background: currentBot?.primary_color || '#6366f1' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Debug panel */}
        {showDebug && (
          <div className="rounded-xl border border-edge bg-surface/30 overflow-hidden flex flex-col" style={{ height: '520px' }}>
            <div className="px-4 py-3 border-b border-edge bg-surface/50">
              <p className="text-[12px] font-semibold text-fg uppercase tracking-wide">Response Inspector</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {lastAssistantMsg?.metadata ? (
                <>
                  {/* Confidence */}
                  <div>
                    <p className="text-[11px] font-medium text-fg-muted uppercase tracking-wide mb-2">Confidence Score</p>
                    <div className="flex items-center gap-3">
                      <div className={`text-[28px] font-bold ${getConfidenceColor(lastAssistantMsg.metadata.confidence)}`}>
                        {lastAssistantMsg.metadata.confidence !== undefined
                          ? `${Math.round(lastAssistantMsg.metadata.confidence * 100)}%`
                          : '—'}
                      </div>
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-edge overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              (lastAssistantMsg.metadata.confidence || 0) >= 0.7 ? 'bg-success'
                                : (lastAssistantMsg.metadata.confidence || 0) >= 0.4 ? 'bg-warning'
                                : 'bg-danger'
                            }`}
                            style={{ width: `${(lastAssistantMsg.metadata.confidence || 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metadata grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg border border-edge bg-bg/40">
                      <p className="text-[10px] text-fg-muted mb-0.5">Model</p>
                      <p className="text-[12px] font-medium text-fg">{
                        lastAssistantMsg.metadata.model === 'gpt-4.1' ? 'Advanced AI'
                          : lastAssistantMsg.metadata.model === 'auto' ? 'Smart Routing'
                          : lastAssistantMsg.metadata.model === 'none' ? 'Fallback'
                          : lastAssistantMsg.metadata.model ? 'Fast AI'
                          : '—'
                      }</p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-edge bg-bg/40">
                      <p className="text-[10px] text-fg-muted mb-0.5">Latency</p>
                      <p className="text-[12px] font-medium text-fg">{lastAssistantMsg.metadata.responseTimeMs ? `${lastAssistantMsg.metadata.responseTimeMs}ms` : '—'}</p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-edge bg-bg/40">
                      <p className="text-[10px] text-fg-muted mb-0.5">Chunks Retrieved</p>
                      <p className="text-[12px] font-medium text-fg">{lastAssistantMsg.metadata.chunksRetrieved ?? '—'}</p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-edge bg-bg/40">
                      <p className="text-[10px] text-fg-muted mb-0.5">Status</p>
                      <p className={`text-[12px] font-medium ${lastAssistantMsg.metadata.unanswered ? 'text-danger' : 'text-success'}`}>
                        {lastAssistantMsg.metadata.unanswered ? '⚠ Unanswered' : '✓ Answered'}
                      </p>
                    </div>
                  </div>

                  {/* Flags */}
                  <div className="flex flex-wrap gap-1.5">
                    {lastAssistantMsg.metadata.cached && (
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium">⚡ Cached</span>
                    )}
                    {lastAssistantMsg.metadata.queryRewrite && (
                      <span className="px-2 py-0.5 rounded-md bg-violet/10 text-violet text-[10px] font-medium">✏️ Query Rewritten</span>
                    )}
                    {lastAssistantMsg.metadata.unanswered && (
                      <span className="px-2 py-0.5 rounded-md bg-danger/10 text-danger text-[10px] font-medium">⚠ Flagged</span>
                    )}
                  </div>

                  {/* Query Rewrite */}
                  {lastAssistantMsg.metadata.queryRewrite && (
                    <div>
                      <p className="text-[11px] font-medium text-fg-muted uppercase tracking-wide mb-1.5">Query Rewrite</p>
                      <p className="text-[12px] text-fg-secondary px-3 py-2 rounded-lg bg-bg/40 border border-edge italic">
                        &ldquo;{lastAssistantMsg.metadata.queryRewrite}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Sources */}
                  {lastAssistantMsg.metadata.sources && lastAssistantMsg.metadata.sources.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium text-fg-muted uppercase tracking-wide mb-1.5">
                        RAG Sources ({lastAssistantMsg.metadata.sources.length})
                      </p>
                      <div className="space-y-1">
                        {lastAssistantMsg.metadata.sources.map((s, i) => (
                          <div key={i} className="px-3 py-2 rounded-lg border border-edge bg-bg/40 flex items-center gap-2">
                            <span className="text-[10px] text-fg-muted font-mono shrink-0">#{i + 1}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] text-fg truncate">{s.title || 'Untitled'}</p>
                              <p className="text-[10px] text-fg-muted truncate">{s.url}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-[14px] text-fg-muted mb-1">No response yet</p>
                  <p className="text-[12px] text-fg-muted/60">Send a message to see debug information here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick test queries */}
      <div className="p-4 rounded-xl border border-edge bg-surface/30">
        <p className="text-[12px] font-medium text-fg-muted uppercase tracking-wide mb-3">Quick Test Queries</p>
        <div className="flex flex-wrap gap-2">
          {[
            'What is this product?',
            'What are your pricing plans?',
            'How does it work?',
            'Do you have a free trial?',
            'How is this different from competitors?',
            'Can I integrate with my website?',
          ].map((q) => (
            <button
              key={q}
              onClick={() => { setInput(q); }}
              className="px-3 py-1.5 rounded-lg border border-edge bg-bg/40 text-[12px] text-fg-secondary hover:text-fg hover:border-edge-light transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
