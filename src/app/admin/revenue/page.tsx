'use client';

import { useEffect, useState } from 'react';

interface RevenueStats {
  mrr: number;
  totalRevenue: number;
  subscribers: number;
  conversionRate: number;
  planBreakdown: { plan: string; count: number; revenue: number }[];
}

export default function AdminRevenuePage() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/stats?type=revenue');
        const data = await res.json();
        const rev = data.revenue;
        setStats({
          mrr: rev.mrr || 0,
          totalRevenue: rev.totalRevenue || 0,
          subscribers: rev.paidUsers || 0,
          conversionRate: (rev.freeUsers + rev.paidUsers) > 0
            ? Math.round((rev.paidUsers / (rev.freeUsers + rev.paidUsers)) * 100)
            : 0,
          planBreakdown: (rev.planBreakdown || []).sort((a: any, b: any) => b.revenue - a.revenue),
        });
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const kpis = stats ? [
    { label: 'MRR', value: `$${stats.mrr.toLocaleString()}` },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}` },
    { label: 'Paid Subscribers', value: stats.subscribers },
    { label: 'Conversion Rate', value: `${stats.conversionRate}%` },
  ] : [];

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Revenue</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="p-4 rounded-xl border border-edge bg-surface/40">
            <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">{k.label}</span>
            <p className="text-[24px] font-bold text-fg mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-edge bg-surface/40 p-5 space-y-4">
        <h2 className="text-[15px] font-semibold text-fg">Plan Breakdown</h2>
        <div className="space-y-3">
          {(stats?.planBreakdown || []).map(p => {
            const maxRev = Math.max(...(stats?.planBreakdown || []).map(x => x.revenue), 1);
            const pct = Math.round((p.revenue / maxRev) * 100);
            return (
              <div key={p.plan}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-medium text-fg capitalize">{p.plan}</span>
                  <div className="flex items-center gap-3 text-[12px] text-fg-secondary">
                    <span>{p.count} users</span>
                    <span className="font-medium text-fg">${p.revenue.toLocaleString()}/mo</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-edge overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
