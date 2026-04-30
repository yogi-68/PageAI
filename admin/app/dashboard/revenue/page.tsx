'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend,
} from 'recharts';

interface RevenueData {
  mrr: number;
  arr: number;
  totalRevenue: number;
  addonRevenue: number;
  freeUsers: number;
  paidUsers: number;
  conversionRate: string;
  arpu: number;
  planBreakdown: { plan: string; count: number; revenue: number; percentage: string }[];
  signupsByDay: { date: string; total: number; paid: number }[];
}

const PLAN_COLORS: Record<string, string> = {
  free: '#6b7280', starter: '#4f6df5', growth: '#8b5cf6', scale: '#f59e0b', enterprise: '#ef4444',
};

function KPICard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-muted)' }}>{label}</p>
      <p className="text-[28px] font-bold leading-none tabular-nums" style={{ color: accent || 'var(--fg)' }}>{value}</p>
      {sub && <p className="text-[11.5px] mt-1.5" style={{ color: 'var(--fg-secondary)' }}>{sub}</p>}
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: 'var(--fg)' },
  cursor: { fill: 'rgba(79,109,245,0.05)' },
};

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats?type=revenue')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid var(--edge)', borderTopColor: 'var(--primary)' }} />
    </div>
  );
  if (!data) return (
    <div className="py-32 text-center text-[13px]" style={{ color: 'var(--danger)' }}>Failed to load revenue data</div>
  );

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--fg)' }}>Revenue</h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--fg-secondary)' }}>Subscription revenue and growth metrics</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KPICard label="MRR"          value={`$${data.mrr.toLocaleString()}`}  sub={`ARR $${data.arr.toLocaleString()}`} accent="var(--success)" />
        <KPICard label="Paid users"   value={data.paidUsers}                   sub={`${data.conversionRate}% conversion`} accent="var(--primary)" />
        <KPICard label="ARPU"         value={`$${data.arpu}`}                  sub="per paid user / month" />
        <KPICard label="Addon rev."   value={`$${data.addonRevenue}`}          sub="add-on purchases" />
        <KPICard label="Free users"   value={data.freeUsers.toLocaleString()}  />
        <KPICard label="Total users"  value={(data.freeUsers + data.paidUsers).toLocaleString()} />
      </div>

      {/* Plan breakdown table + chart side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan table */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--edge)' }}>
            <h2 className="text-[14px] font-semibold" style={{ color: 'var(--fg)' }}>Revenue by Plan</h2>
          </div>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--edge)', background: 'rgba(255,255,255,0.015)' }}>
                {['Plan', 'Users', 'Revenue/mo', 'Share'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-[11px] uppercase tracking-wide"
                    style={{ color: 'var(--fg-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.planBreakdown.map(p => (
                <tr key={p.plan}
                  style={{ borderBottom: '1px solid var(--edge)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-elevated)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                >
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: PLAN_COLORS[p.plan] || '#6b7280' }} />
                      <span className="capitalize font-medium" style={{ color: 'var(--fg)' }}>{p.plan}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--fg-secondary)' }}>{p.count}</td>
                  <td className="px-4 py-3 tabular-nums font-semibold" style={{ color: 'var(--success)' }}>
                    ${p.revenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--edge)' }}>
                        <div className="h-full rounded-full" style={{ width: `${p.percentage}%`, background: PLAN_COLORS[p.plan] || 'var(--primary)' }} />
                      </div>
                      <span className="text-[11px] tabular-nums" style={{ color: 'var(--fg-muted)' }}>{p.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bar chart */}
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
          <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--fg)' }}>Revenue per Plan</h2>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.planBreakdown} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" vertical={false} />
                <XAxis dataKey="plan" tick={{ fill: 'var(--fg-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--fg-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} name="Revenue ($)"
                  fill="var(--primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Signups chart */}
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
        <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--fg)' }}>Signups — Last 30 Days</h2>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.signupsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--fg-secondary)', fontSize: 11 }}
                tickFormatter={(d: string) => d.split('-').slice(1).join('/')}
                axisLine={false} tickLine={false}
              />
              <YAxis tick={{ fill: 'var(--fg-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--fg-secondary)' }} />
              <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2} dot={false} name="Total" />
              <Line type="monotone" dataKey="paid"  stroke="var(--success)" strokeWidth={2} dot={false} name="Paid" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}