'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { Sk } from '@/components/ui/Skeleton';

interface UnansweredQuestion {
  id: string;
  bot_id: string;
  question: string;
  confidence: number;
  reason: string;
  is_resolved: boolean;
  resolved_at: string | null;
  notes: string | null;
  created_at: string;
  bot: { name: string } | null;
}

const REASON_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  no_chunks: { label: 'No data', color: 'text-danger', bg: 'bg-danger/10' },
  low_confidence: { label: 'Low confidence', color: 'text-warning', bg: 'bg-warning/10' },
  evasive_answer: { label: 'Evasive answer', color: 'text-[#f97316]', bg: 'bg-[#f97316]/10' },
  fallback_triggered: { label: 'Fallback', color: 'text-fg-muted', bg: 'bg-fg-muted/10' },
};

export default function ConversationsPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<UnansweredQuestion[]>([]);
  const [unresolvedCount, setUnresolvedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [resolving, setResolving] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!user) return;
    try {
      const resolvedParam = filter === 'all' ? '' : `&resolved=${filter === 'resolved'}`;
      const res = await fetch(`/api/dashboard/unanswered?userId=${user.id}${resolvedParam}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        setUnresolvedCount(data.unresolvedCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [user, filter]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const markResolved = async (questionId: string) => {
    setResolving(questionId);
    try {
      const res = await fetch('/api/dashboard/unanswered', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, resolved: true }),
      });
      if (res.ok) {
        setQuestions(prev => prev.map(q =>
          q.id === questionId ? { ...q, is_resolved: true, resolved_at: new Date().toISOString() } : q
        ));
        setUnresolvedCount(prev => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error(e);
    }
    setResolving(null);
  };

  const markUnresolved = async (questionId: string) => {
    setResolving(questionId);
    try {
      const res = await fetch('/api/dashboard/unanswered', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, resolved: false }),
      });
      if (res.ok) {
        setQuestions(prev => prev.map(q =>
          q.id === questionId ? { ...q, is_resolved: false, resolved_at: null } : q
        ));
        setUnresolvedCount(prev => prev + 1);
      }
    } catch (e) {
      console.error(e);
    }
    setResolving(null);
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="space-y-2"><Sk className="h-7 w-56" /><Sk className="h-4 w-72" /></div>
      <div className="flex gap-2"><Sk className="h-8 w-28 rounded-lg" /><Sk className="h-8 w-28 rounded-lg" /><Sk className="h-8 w-28 rounded-lg" /></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-edge bg-surface/40 space-y-2">
            <Sk className="h-4 w-full" /><Sk className="h-3 w-40" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Unanswered Questions</h1>
          {unresolvedCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-warning text-[11px] font-bold text-white min-w-[22px]">
              {unresolvedCount}
            </span>
          )}
        </div>
        <p className="text-[14px] text-fg-secondary mt-0.5">Questions your bot couldn&apos;t answer — review and add missing info to your knowledge base</p>
      </div>

      {/* Info banner */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/3">
        <p className="text-[12px] text-fg-secondary">
          <strong className="text-fg">How to fix:</strong> When you see questions here, it means your website&apos;s content doesn&apos;t cover that topic. Add the missing info to your website and{' '}
          <Link href="/dashboard/websites" className="text-primary hover:text-primary-hover transition-colors underline">re-crawl</Link>{' '}
          to update your bot&apos;s knowledge base. Then mark the question as resolved.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5">
        {([
          { key: 'unresolved', label: `Unresolved (${unresolvedCount})` },
          { key: 'all', label: 'All' },
          { key: 'resolved', label: 'Resolved' },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => { setLoading(true); setFilter(f.key); }}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              filter === f.key
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-fg-secondary hover:text-fg border border-transparent hover:border-edge'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="p-12 rounded-xl border border-edge bg-surface/40 text-center">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-fg mb-1">
            {filter === 'unresolved' ? 'All caught up!' : 'No questions found'}
          </p>
          <p className="text-[13px] text-fg-secondary max-w-[320px] mx-auto">
            {filter === 'unresolved'
              ? 'No unanswered questions right now. Your bot is answering everything correctly!'
              : 'No questions match this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map(q => {
            const reasonInfo = REASON_LABELS[q.reason] || REASON_LABELS.fallback_triggered;
            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border bg-surface/40 transition-all duration-200 ${
                  q.is_resolved ? 'border-edge opacity-60' : 'border-warning/20 hover:border-warning/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-medium ${q.is_resolved ? 'text-fg-muted line-through' : 'text-fg'}`}>
                      &ldquo;{q.question}&rdquo;
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${reasonInfo.bg} ${reasonInfo.color}`}>
                        {reasonInfo.label}
                      </span>
                      {q.bot && (
                        <span className="text-[11px] text-fg-muted">
                          Bot: {q.bot.name}
                        </span>
                      )}
                      <span className="text-[11px] text-fg-muted">
                        · {new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[11px] text-fg-muted">
                        · Confidence: {Math.round((q.confidence || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {q.is_resolved ? (
                      <button
                        onClick={() => markUnresolved(q.id)}
                        disabled={resolving === q.id}
                        className="px-3 py-1.5 rounded-lg border border-edge text-[11px] text-fg-muted hover:text-fg hover:border-edge-light disabled:opacity-50 transition-all"
                      >
                        {resolving === q.id ? '…' : 'Unresolve'}
                      </button>
                    ) : (
                      <button
                        onClick={() => markResolved(q.id)}
                        disabled={resolving === q.id}
                        className="px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 text-[11px] text-success font-medium hover:bg-success/20 disabled:opacity-50 transition-all"
                      >
                        {resolving === q.id ? '…' : '✓ Resolved'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
