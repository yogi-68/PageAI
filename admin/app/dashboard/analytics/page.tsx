'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

interface AnalyticsData {
  conversationsByDay: { date: string; conversations: number }[];
  messagesByDay: { date: string; messages: number }[];
  totalConversations: number;
  totalMessages: number;
  avgSatisfaction: string;
  avgResponseTime: number;
  totalTokens: number;
  modelUsage: Record<string, number>;
  eventCounts: Record<string, number>;
  usageBuckets: { low: number; medium: number; high: number; maxed: number };
}

const COLORS = ['#4f6df5', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const tooltipStyle = {
  contentStyle: { background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: 'var(--fg)' },
  cursor: { fill: 'rgba(79,109,245,0.04)' },
};

function KPICard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-muted)' }}>{label}</p>
      <p className="text-[24px] font-bold tabular-nums leading-none" style={{ color: 'var(--fg)' }}>{value}</p>
      {sub && <p className="text-[11px] mt-1" style={{ color: 'var(--fg-secondary)' }}>{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/stats?type=analytics&days=${days}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--fg)' }}>Analytics</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--fg-secondary)' }}>Platform usage metrics and engagement data</p>
        </div>
        <div className="flex items-center gap-1">
          {[7, 14, 30, 60, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
              style={days === d
                ? { background: 'var(--primary)', color: '#fff' }
                : { border: '1px solid var(--edge)', background: 'var(--surface)', color: 'var(--fg-secondary)' }
              }
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 gap-2.5" style={{ color: 'var(--fg-secondary)' }}>
          <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid var(--edge)', borderTopColor: 'var(--primary)' }} />
          Loading analytics…
        </div>
      )}

      {error && (
        <div className="py-12 text-center text-[13px]" style={{ color: 'var(--danger)' }}>{error}</div>
      )}

      {data && !loading && (() => {
        const combinedChart = data.conversationsByDay.map((c, i) => ({
          ...c,
          messages: data.messagesByDay[i]?.messages || 0,
        }));

        const modelData = Object.entries(data.modelUsage || {})
          .map(([name, value]) => ({ name: name.replace('gpt-', ''), value }))
          .sort((a, b) => b.value - a.value);

        const usageBucketData = [
          { name: 'Low (<30%)',   value: data.usageBuckets?.low    || 0, color: 'var(--success)' },
          { name: 'Medium',      value: data.usageBuckets?.medium  || 0, color: 'var(--primary)' },
          { name: 'High (>70%)', value: data.usageBuckets?.high    || 0, color: 'var(--warning)' },
          { name: 'Maxed',       value: data.usageBuckets?.maxed   || 0, color: 'var(--danger)'  },
        ];

        const topEvents = Object.entries(data.eventCounts || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8);

        return (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <KPICard label="Conversations" value={data.totalConversations.toLocaleString()} sub={`last ${days} days`} />
              <KPICard label="Messages"      value={data.totalMessages.toLocaleString()} />
              <KPICard label="Avg Rating"    value={data.avgSatisfaction} sub="satisfaction" />
              <KPICard label="Avg Response"  value={`${data.avgResponseTime}ms`} />
              <KPICard label="Tokens Used"   value={(data.totalTokens / 1000).toFixed(1) + 'K'} />
            </div>

            {/* Activity chart */}
            <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
              <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--fg)' }}>Conversations & Messages</h2>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={combinedChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: 'var(--fg-secondary)', fontSize: 11 }}
                      tickFormatter={(d: string) => d.split('-').slice(1).join('/')}
                      axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--fg-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12, color: 'var(--fg-secondary)' }} />
                    <Line type="monotone" dataKey="conversations" stroke="var(--primary)" strokeWidth={2} dot={false} name="Conversations" />
                    <Line type="monotone" dataKey="messages"      stroke="var(--success)" strokeWidth={2} dot={false} name="Messages" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom row: model usage + usage buckets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Model usage */}
              {modelData.length > 0 && (
                <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
                  <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--fg)' }}>Model Usage</h2>
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={modelData} layout="vertical" barSize={14}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: 'var(--fg-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fill: 'var(--fg-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                        <Tooltip {...tooltipStyle} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Requests" fill="var(--primary)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Usage distribution */}
              <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
                <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--fg)' }}>Usage Distribution</h2>
                <div style={{ height: 180 }} className="mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={usageBucketData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                        {usageBucketData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color as string} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {usageBucketData.map(b => (
                    <div key={b.name} className="flex items-center gap-1.5 text-[11.5px]" style={{ color: 'var(--fg-secondary)' }}>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: b.color as string }} />
                      {b.name}: <span className="font-semibold ml-0.5" style={{ color: 'var(--fg)' }}>{b.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top events */}
            {topEvents.length > 0 && (
              <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
                <h2 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--fg)' }}>Top Events</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {topEvents.map(([event, count], i) => (
                    <div key={event} className="flex items-center gap-2.5 p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--edge)' }}>
                      <span className="text-[10px] font-bold w-4 text-center shrink-0" style={{ color: COLORS[i % COLORS.length] }}>
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11.5px] font-medium truncate" style={{ color: 'var(--fg)' }}>{event.replace(/_/g, ' ')}</p>
                        <p className="text-[11px] tabular-nums font-bold" style={{ color: COLORS[i % COLORS.length] }}>
                          {(count as number).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}