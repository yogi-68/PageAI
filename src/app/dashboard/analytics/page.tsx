'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DayData { date: string; conversations: number; }
interface PageData { url: string; visits: number; }

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [topPages, setTopPages] = useState<PageData[]>([]);
  const [totals, setTotals] = useState({ conversations: 0, messages: 0, avgPerDay: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: conversations } = await supabase
          .from('conversations')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString());

        const days: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000);
          days[d.toISOString().split('T')[0]] = 0;
        }
        (conversations || []).forEach(c => {
          const d = c.created_at.split('T')[0];
          if (days[d] !== undefined) days[d]++;
        });
        const chart = Object.entries(days).map(([date, conversations]) => ({
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          conversations,
        }));
        setChartData(chart);

        const total = (conversations || []).length;

        // Count actual messages from conversations
        const { count: msgCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString());

        setTotals({ conversations: total, messages: msgCount || 0, avgPerDay: Math.round(total / 7) });

        // Show top crawled pages (visit tracking not yet implemented)
        const { data: pages } = await supabase
          .from('crawled_pages')
          .select('url, title')
          .eq('user_id', user.id)
          .limit(5);
        setTopPages((pages || []).map(p => ({ url: p.url, visits: 0 })));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [user]);

  const kpis = [
    { label: 'Total Conversations', value: totals.conversations },
    { label: 'Total Messages', value: totals.messages },
    { label: 'Avg / Day', value: totals.avgPerDay },
  ];

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Analytics</h1>

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
        <h2 className="text-[15px] font-semibold text-fg mb-4">Conversations — Last 7 Days</h2>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2540" />
              <XAxis dataKey="date" tick={{ fill: '#8892b0', fontSize: 12 }} axisLine={{ stroke: '#1e2540' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#8892b0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid #2a3155', borderRadius: 8, fontSize: 13, color: '#edf0f7' }} cursor={{ fill: 'rgba(79,109,245,0.06)' }} />
              <Bar dataKey="conversations" fill="#4f6df5" radius={[6, 6, 0, 0]} />
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
              <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-surface-elevated/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[12px] font-medium text-fg-muted w-5 shrink-0">{i + 1}.</span>
                  <span className="text-[13px] text-fg truncate">{p.url}</span>
                </div>
                <span className="text-[13px] text-fg-secondary shrink-0 ml-4">{p.visits > 0 ? `${p.visits} visits` : 'Indexed'}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-[13px] text-fg-secondary">No page data available yet.</p>
        )}
      </div>
    </div>
  );
}
