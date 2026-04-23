'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DayData { date: string; messages: number; }
interface PageData { url: string; }

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [topPages, setTopPages] = useState<PageData[]>([]);
  const [totals, setTotals] = useState({ messagesUsed: 0, messagesLimit: 0, knowledgePages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        // Fetch profile usage + indexed document count in parallel
        const [{ data: profile }, { count: docCount }] = await Promise.all([
          supabase
            .from('profiles')
            .select('monthly_message_count, monthly_message_limit')
            .eq('id', user.id)
            .single(),
          supabase
            .from('documents')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'indexed'),
        ]);

        setTotals({
          messagesUsed: profile?.monthly_message_count || 0,
          messagesLimit: profile?.monthly_message_limit || 0,
          knowledgePages: docCount || 0,
        });

        // Build a flat 7-day chart from uniform distribution of monthly messages
        // (no per-day data without conversation storage)
        const avgPerDay = Math.round((profile?.monthly_message_count || 0) / 30);
        const days: DayData[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000);
          days.push({
            date: d.toLocaleDateString('en-US', { weekday: 'short' }),
            messages: avgPerDay,
          });
        }
        setChartData(days);

        // Top indexed pages
        const { data: pages } = await supabase
          .from('documents')
          .select('url')
          .eq('user_id', user.id)
          .not('url', 'is', null)
          .eq('status', 'indexed')
          .limit(5);
        setTopPages((pages || []).map(p => ({ url: p.url || '' })));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [user]);

  const kpis = [
    { label: 'Messages Used (mo)', value: totals.messagesUsed.toLocaleString() },
    { label: 'Messages Remaining', value: Math.max(0, totals.messagesLimit - totals.messagesUsed).toLocaleString() },
    { label: 'Knowledge Pages', value: totals.knowledgePages.toLocaleString() },
  ];

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Analytics</h1>
        <p className="text-[14px] text-fg-secondary mt-0.5">Track message volume and knowledge base coverage</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="p-4 rounded-xl border border-edge bg-surface/40">
            <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">{k.label}</span>
            <p className="text-[24px] font-bold text-fg mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-5 rounded-xl border border-edge bg-surface/40">
        <h2 className="text-[15px] font-semibold text-fg mb-4">Daily Message Avg — Last 7 Days</h2>
        <div style={{ height: 260, width: '100%', minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2540" />
              <XAxis dataKey="date" tick={{ fill: '#8892b0', fontSize: 12 }} axisLine={{ stroke: '#1e2540' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#8892b0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid #2a3155', borderRadius: 8, fontSize: 13, color: '#edf0f7' }} cursor={{ fill: 'rgba(79,109,245,0.06)' }} />
              <Bar dataKey="messages" fill="#4f6df5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Pages */}
      <div className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-edge">
          <h2 className="text-[15px] font-semibold text-fg">Top Pages</h2>
        </div>
        {topPages.length > 0 ? (
          <div className="divide-y divide-edge">
            {topPages.map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-elevated/30 transition-colors">
                <span className="text-[12px] font-medium text-fg-muted w-5 shrink-0">{i + 1}.</span>
                <span className="text-[13px] text-fg truncate">{p.url}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center">
            <p className="text-[13px] text-fg-secondary">No knowledge base pages found.</p>
            <p className="text-[11px] text-fg-muted mt-1">Create a bot and crawl a website to see your indexed pages here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
