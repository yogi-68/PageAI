'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Sk } from '@/components/ui/Skeleton';

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
  const [pageLoading, setPageLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!user) return;
    if (isFirstLoad.current) {
      setPageLoading(true);
    } else {
      setChartLoading(true);
    }
    (async () => {
      try {
        const startDate = new Date(Date.now() - range * 86400000).toISOString();

        // Always fetch chart data
        const { data: docs } = await supabase
          .from('documents')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .order('created_at', { ascending: true });

        // KPIs + top pages only on first load — no re-fetch on range change
        if (isFirstLoad.current) {
          const [{ data: profile }, { count: docCount }, { data: pages }] = await Promise.all([
            supabase.from('profiles').select('monthly_message_count, monthly_message_limit').eq('id', user.id).single(),
            supabase.from('documents').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'indexed'),
            supabase.from('documents').select('url').eq('user_id', user.id).not('url', 'is', null).eq('status', 'indexed').limit(5),
          ]);
          setTotals({
            messagesUsed: (profile as any)?.monthly_message_count || 0,
            messagesLimit: (profile as any)?.monthly_message_limit || 0,
            knowledgePages: docCount || 0,
          });
          setTopPages(((pages || []) as any[]).map((p: any) => ({ url: p.url || '' })));
        }

        // Build date buckets for selected range
        const buckets: Record<string, number> = {};
        for (let i = range - 1; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000);
          const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          buckets[key] = 0;
        }
        for (const doc of docs || []) {
          const key = new Date((doc as any).created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (key in buckets) buckets[key]++;
        }
        setChartData(Object.entries(buckets).map(([date, pages]) => ({ date, pages })));
      } catch (e) { console.error(e); }
      isFirstLoad.current = false;
      setPageLoading(false);
      setChartLoading(false);
    })();
  }, [user, range]);

  const kpis = [
    { label: 'Messages Used (mo)', value: totals.messagesUsed.toLocaleString() },
    { label: 'Messages Remaining', value: Math.max(0, totals.messagesLimit - totals.messagesUsed).toLocaleString() },
    { label: 'Knowledge Pages', value: totals.knowledgePages.toLocaleString() },
  ];

  if (pageLoading) return (
    <div className="space-y-6">
      <div className="space-y-2"><Sk className="h-7 w-28" /><Sk className="h-4 w-72" /></div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-edge bg-surface/40 space-y-3">
            <Sk className="h-3 w-32" /><Sk className="h-8 w-20" />
          </div>
        ))}
      </div>
      <div className="p-5 rounded-xl border border-edge bg-surface/40 space-y-4">
        <div className="flex justify-between"><Sk className="h-5 w-40" /><Sk className="h-8 w-28 rounded-lg" /></div>
        <Sk className="h-64 w-full" />
      </div>
      <div className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-edge"><Sk className="h-4 w-20" /></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-edge last:border-0">
            <Sk className="h-3 w-4" /><Sk className="h-3 w-64" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Analytics</h1>
        <p className="text-[14px] text-fg-secondary mt-0.5">Track message volume and knowledge base coverage</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="p-4 rounded-xl border border-edge bg-surface/40">
            <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">{k.label}</span>
            <p className="text-[24px] font-bold text-fg mt-1">{k.value}</p>
          </div>
        ))}
      </div>

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
        <div
          style={{ height: 260, width: '100%', minWidth: 0 }}
          className={chartLoading ? 'opacity-40 pointer-events-none transition-opacity' : 'transition-opacity'}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2540" />
              <XAxis dataKey="date" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={{ stroke: '#1e2540' }} tickLine={false} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fill: '#8892b0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1f35', border: '1px solid #2a3155', borderRadius: 8, fontSize: 13, color: '#edf0f7' }}
                cursor={{ fill: 'rgba(79,109,245,0.06)' }}
                formatter={(v: unknown) => [String(v) + ' pages indexed'] as any}
              />
              <Bar dataKey="pages" fill="#4f6df5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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
