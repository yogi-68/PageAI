'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface BotConfig {
  id: string;
  name: string;
  primary_color?: string;
  welcome_message?: string;
}

export default function ChatPreviewPage() {
  const { id: botId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [bot, setBot] = useState<BotConfig | null>(null);
  const [botLoading, setBotLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!botId) return;
    fetch(`/api/bots?id=${botId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setBot(data);
      })
      .catch(() => {})
      .finally(() => setBotLoading(false));
  }, [botId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || loading || !botId) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, botId, stream: false }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer || data.message || 'No response.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'Something went wrong.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to connect. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const accent = bot?.primary_color || '#6366f1';
  const welcomeMsg = bot?.welcome_message || 'Hi! 👋 Ask me anything about this website!';

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center p-4">
      {/* Preview banner */}
      <div className="w-full max-w-[440px] mb-3 flex items-center justify-between">
        <span className="text-[11px] text-[#6b7280] font-medium uppercase tracking-wide">Preview mode</span>
        <span className="text-[11px] text-[#6b7280]">Bot ID: {botId?.slice(0, 8)}…</span>
      </div>

      {/* Chat window */}
      <div className="w-full max-w-[440px] rounded-2xl border border-white/10 bg-[#1a1c23] shadow-2xl flex flex-col" style={{ height: '600px' }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-t-2xl border-b border-white/10" style={{ background: accent + '18' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: accent }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="white" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-white leading-tight">
              {botLoading ? '...' : (bot?.name || 'AI Assistant')}
            </p>
            <p className="text-[11px]" style={{ color: accent + 'cc' }}>AI-powered chatbot</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400" title="Online" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
          {/* Welcome message */}
          {messages.length === 0 && !loading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: accent }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="white" />
                </svg>
              </div>
              <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-[13.5px] leading-relaxed bg-white/8 text-white/90">
                {welcomeMsg}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: accent }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="white" />
                  </svg>
                </div>
              )}
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'rounded-br-sm text-white'
                    : 'rounded-tl-sm text-white/90 bg-white/8'
                }`}
                style={m.role === 'user' ? { background: accent } : undefined}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: accent }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="white" />
                </svg>
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/8 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask a question…"
              className="flex-1 bg-transparent text-[13.5px] text-white placeholder:text-white/30 outline-none"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-40"
              style={{ background: accent }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-white/20 mt-2">Powered by PageAI</p>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-[#6b7280]">This is a live preview — responses use real AI.</p>
    </div>
  );
}
