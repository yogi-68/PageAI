'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DayData { date: string; pages: number; }
interface PageData { url: string; }

const RANGE_OPTIONS = [
  { label: 'Last 7 days',  days: 7  },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [range, setRange] = useState(7);
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [topPages, setTopPages] = useState<PageData[]>([]);
  const [totals, setTotals] = useState({ messagesUsed: 0, messagesLimit: 0, knowledgePages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      try {
        const startDate = new Date(Date.now() - range * 86400000).toISOString();

        const [{ data: profile }, { count: docCount }, { data: docs }] = await Promise.all([
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
          supabase
            .from('documents')
            .select('created_at')
            .eq('user_id', user.id)
            .gte('created_at', startDate)
            .order('created_at', { ascending: true }),
        ]);

        setTotals({
          messagesUsed: profile?.monthly_message_count || 0,
          messagesLimit: profile?.monthly_message_limit || 0,
          knowledgePages: docCount || 0,
        });

        // Build date buckets for the selected range
        const buckets: Record<string, number> = {};
        for (let i = range - 1; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000);
          const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          buckets[key] = 0;
        }
        // Count real indexed documents per day
        for (const doc of docs || []) {
          const key = new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (key in buckets) buckets[key]++;
        }
        setChartData(Object.entries(buckets).map(([date, pages]) => ({ date, pages })));

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
  }, [user, range]);

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-fg">Pages Indexed Per Day</h2>
          <select
            value={range}
            onChange={e => setRange(Number(e.target.value))}
            className="text-[12px] bg-surface border border-edge text-fg-secondary rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
          >
            {RANGE_OPTIONS.map(o => (
              <option key={o.days} value={o.days}>{o.label}</option>
            ))}
          </select>
        </div>
        <div style={{ height: 260, width: '100%', minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2540" />
              <XAxis dataKey="date" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={{ stroke: '#1e2540' }} tickLine={false} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fill: '#8892b0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid #2a3155', borderRadius: 8, fontSize: 13, color: '#edf0f7' }} cursor={{ fill: 'rgba(79,109,245,0.06)' }} formatter={(v: unknown) => [`${v} pages indexed`] as any} />
              <Bar dataKey="pages" fill="#4f6df5" radius={[6, 6, 0, 0]} />
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
