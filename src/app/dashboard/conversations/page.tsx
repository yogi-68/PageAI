'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
    MessageSquare, Bot, Search, ThumbsUp, ThumbsDown,
    Clock, Globe, ChevronRight, Loader2,
} from 'lucide-react';

export default function ConversationsPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        async function fetchConversations() {
            try {
                // Get user's bot IDs
                const { data: bots } = await supabase
                    .from('bots')
                    .select('id, name')
                    .eq('user_id', user!.id);

                if (!bots || bots.length === 0) {
                    setLoading(false);
                    return;
                }

                const botIds = bots.map(b => b.id);
                const { data: convs } = await supabase
                    .from('conversations')
                    .select('*, messages(role, content, sources, created_at, response_time_ms)')
                    .in('bot_id', botIds)
                    .order('created_at', { ascending: false })
                    .limit(50);

                // Map bot names
                const botMap = Object.fromEntries(bots.map(b => [b.id, b.name]));
                const mapped = (convs || []).map(c => ({
                    ...c,
                    botName: botMap[c.bot_id] || 'Unknown',
                    question: c.messages?.find((m: any) => m.role === 'user')?.content || 'No question',
                    answer: c.messages?.find((m: any) => m.role === 'assistant')?.content || 'No answer',
                    sources: c.messages?.find((m: any) => m.role === 'assistant')?.sources || [],
                }));

                setConversations(mapped);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchConversations();
    }, [user]);

    const selected = conversations.find(c => c.id === selectedId);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-500)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Conversations</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">Review chatbot conversations</p>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input type="text" placeholder="Search conversations..." className="input !pl-10" />
            </div>

            {conversations.length === 0 ? (
                <div className="card text-center py-16">
                    <MessageSquare className="w-12 h-12 text-[var(--text-dim)] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                    <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
                        Conversations will appear here once visitors start chatting with your bots.
                        Make sure you&apos;ve embedded the widget on your website.
                    </p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 card !p-0">
                        <div className="divide-y divide-[var(--border-subtle)]">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedId(conv.id)}
                                    className={`px-5 py-4 cursor-pointer transition-colors ${selectedId === conv.id
                                            ? 'bg-[var(--primary-glow)] border-l-2 border-l-[var(--primary-500)]'
                                            : 'hover:bg-[var(--bg-hover)]'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center flex-shrink-0">
                                            <MessageSquare className="w-4 h-4 text-[var(--text-muted)]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-medium truncate flex-1">{conv.question}</p>
                                                <span className={`badge text-[10px] !py-0 flex-shrink-0 ${conv.status === 'resolved' ? 'badge-emerald' :
                                                        conv.status === 'escalated' ? 'badge-rose' : 'badge-amber'
                                                    }`}>
                                                    {conv.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[var(--text-muted)] truncate mb-1.5">{conv.answer}</p>
                                            <div className="flex items-center gap-3 text-[10px] text-[var(--text-dim)]">
                                                <span className="flex items-center gap-1"><Bot className="w-3 h-3" />{conv.botName}</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(conv.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        {selected ? (
                            <div className="card space-y-4 sticky top-20">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm">{selected.visitor_id || 'Anonymous'}</h3>
                                    <span className={`badge text-xs ${selected.status === 'resolved' ? 'badge-emerald' : 'badge-rose'}`}>
                                        {selected.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
                                        <p className="text-[10px] text-[var(--text-muted)]">Messages</p>
                                        <p className="text-lg font-bold">{selected.message_count || selected.messages?.length || 0}</p>
                                    </div>
                                    <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
                                        <p className="text-[10px] text-[var(--text-muted)]">Rating</p>
                                        <p className="text-lg font-bold">{selected.satisfaction_rating ? `${selected.satisfaction_rating}/5` : '—'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[var(--text-muted)] mb-1.5">Question</p>
                                    <p className="text-sm bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">{selected.question}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[var(--text-muted)] mb-1.5">Answer</p>
                                    <p className="text-sm bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">{selected.answer}</p>
                                </div>
                                {selected.sources?.length > 0 && (
                                    <div>
                                        <p className="text-[10px] text-[var(--text-muted)] mb-1.5">Sources</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selected.sources.map((s: any, i: number) => (
                                                <span key={i} className="badge text-[10px]">{s.title || s.url}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="card text-center py-12">
                                <MessageSquare className="w-10 h-10 text-[var(--text-dim)] mx-auto mb-3 opacity-30" />
                                <p className="text-sm text-[var(--text-muted)]">Select a conversation</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
