'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface ConversationRow {
  id: string;
  bot_id: string;
  visitor_id: string;
  visitor_page_url: string;
  status: string;
  message_count: number;
  created_at: string;
  bot_name?: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export default function ConversationsPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [selected, setSelected] = useState<ConversationRow | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Step 1: get user's bots
      const { data: bots } = await supabase.from('bots').select('id, name').eq('user_id', user.id);
      const botMap: Record<string, string> = {};
      (bots || []).forEach(b => { botMap[b.id] = b.name; });
      const botIds = (bots || []).map(b => b.id);

      if (botIds.length === 0) { setLoading(false); return; }

      // Step 2: fetch conversations via bot_id (RLS also enforces ownership)
      const { data } = await supabase
        .from('conversations')
        .select('id, bot_id, visitor_id, visitor_page_url, status, message_count, created_at')
        .in('bot_id', botIds)
        .order('created_at', { ascending: false })
        .limit(50);

      const convos: ConversationRow[] = (data || []).map(c => ({
        ...c,
        bot_name: botMap[c.bot_id] || 'Unknown Bot',
      }));
      setConversations(convos);
      if (convos.length > 0) loadMessages(convos[0]);
      setLoading(false);
    })();
  }, [user]);

  const loadMessages = async (conv: ConversationRow) => {
    setSelected(conv);
    setMsgLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setMsgLoading(false);
  };

  const filtered = conversations.filter(c =>
    c.bot_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.visitor_id?.toLowerCase().includes(search.toLowerCase())
  );

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Conversations</h1>

      {conversations.length === 0 ? (
        <div className="p-12 rounded-xl border border-edge bg-surface/40 text-center">
          <h2 className="text-[17px] font-semibold text-fg mb-1">No conversations yet</h2>
          <p className="text-[13px] text-fg-secondary max-w-[380px] mx-auto">Conversations will appear here once visitors start chatting with your bots</p>
        </div>
      ) : (
        <div className="flex border border-edge rounded-xl overflow-hidden bg-surface/30 h-[calc(100vh-200px)] min-h-[500px]">
          {/* Sidebar */}
          <div className="w-[320px] border-r border-edge flex flex-col shrink-0">
            <div className="p-3 border-b border-edge">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." className="w-full px-3 py-2 rounded-lg border border-edge bg-bg/60 text-[13px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all" />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map(c => {
                const isActive = selected?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => loadMessages(c)}
                    className={`w-full text-left p-3.5 border-b border-edge transition-colors ${isActive ? 'bg-primary/[0.06]' : 'hover:bg-surface-elevated/30'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-medium text-fg truncate">{c.bot_name}</span>
                      <span className="text-[11px] text-fg-muted shrink-0 ml-2">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-[12px] text-fg-secondary truncate mb-1">
                      {c.visitor_page_url ? new URL(c.visitor_page_url).pathname : 'Direct chat'}
                    </p>
                    <span className="text-[11px] text-fg-muted">{c.message_count || 0} messages</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thread */}
          <div className="flex-1 flex flex-col min-w-0">
            {selected ? (
              <>
                <div className="flex items-center justify-between px-5 py-3 border-b border-edge bg-surface/40">
                  <div>
                    <h3 className="text-[14px] font-semibold text-fg">{selected.bot_name}</h3>
                    <p className="text-[12px] text-fg-muted">Visitor {selected.visitor_id?.slice(0, 8)} · {new Date(selected.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-surface-elevated text-[11px] text-fg-secondary">{selected.message_count || 0} messages</span>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {msgLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-center text-[13px] text-fg-muted py-8">No messages in this conversation</p>
                  ) : messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-surface-elevated border border-edge text-fg rounded-bl-sm'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[13px] text-fg-muted">Select a conversation</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
