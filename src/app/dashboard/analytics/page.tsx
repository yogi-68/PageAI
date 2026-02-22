"use client";

import {
    BarChart3,
    TrendingUp,
    MessageSquare,
    Users,
    Clock,
    ThumbsUp,
    ThumbsDown,
    Globe,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

const weeklyData = [
    { day: "Mon", conversations: 145, resolved: 138 },
    { day: "Tue", conversations: 212, resolved: 201 },
    { day: "Wed", conversations: 189, resolved: 182 },
    { day: "Thu", conversations: 256, resolved: 245 },
    { day: "Fri", conversations: 198, resolved: 190 },
    { day: "Sat", conversations: 87, resolved: 84 },
    { day: "Sun", conversations: 65, resolved: 62 },
];

const maxConversations = Math.max(...weeklyData.map((d) => d.conversations));

const kpis = [
    {
        label: "Avg. Response Time",
        value: "1.2s",
        change: "-0.3s",
        up: true,
        icon: Clock,
        color: "from-blue-500 to-cyan-400",
    },
    {
        label: "Satisfaction Rate",
        value: "94.2%",
        change: "+2.1%",
        up: true,
        icon: ThumbsUp,
        color: "from-emerald-500 to-teal-400",
    },
    {
        label: "Total Sessions",
        value: "12,847",
        change: "+18.5%",
        up: true,
        icon: Users,
        color: "from-purple-500 to-indigo-400",
    },
    {
        label: "Unanswered Rate",
        value: "3.1%",
        change: "-0.8%",
        up: true,
        icon: MessageSquare,
        color: "from-amber-500 to-orange-400",
    },
];

const topPages = [
    { page: "/products", visits: 3420, questions: 245 },
    { page: "/pricing", visits: 2180, questions: 189 },
    { page: "/faq", visits: 1890, questions: 156 },
    { page: "/shipping", visits: 1456, questions: 134 },
    { page: "/returns", visits: 1234, questions: 98 },
];

const sentimentData = [
    { label: "Very Satisfied", value: 62, color: "bg-emerald-500" },
    { label: "Satisfied", value: 24, color: "bg-blue-500" },
    { label: "Neutral", value: 8, color: "bg-amber-500" },
    { label: "Unsatisfied", value: 6, color: "bg-rose-500" },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Track performance across all your bots
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select className="input !w-auto !py-2 text-sm">
                        <option>All Bots</option>
                        <option>ShopFlow Support</option>
                        <option>Docs Helper</option>
                    </select>
                    <div className="flex items-center gap-1 bg-surface-card rounded-xl border border-border p-1">
                        {["7D", "30D", "90D"].map((range) => (
                            <button
                                key={range}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${range === "7D"
                                        ? "gradient-bg text-white shadow"
                                        : "text-text-muted hover:text-white"
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="card">
                        <div className="flex items-center justify-between mb-3">
                            <div
                                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}
                            >
                                <kpi.icon className="w-5 h-5 text-white" />
                            </div>
                            <div
                                className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? "text-emerald-400" : "text-rose-400"
                                    }`}
                            >
                                {kpi.up ? (
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                ) : (
                                    <ArrowDownRight className="w-3.5 h-3.5" />
                                )}
                                {kpi.change}
                            </div>
                        </div>
                        <p className="text-2xl font-bold">{kpi.value}</p>
                        <p className="text-sm text-text-muted mt-1">{kpi.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Conversations Chart */}
                <div className="lg:col-span-2 card !p-0">
                    <div className="flex items-center justify-between p-5 border-b border-border">
                        <div>
                            <h2 className="text-lg font-semibold">Conversations</h2>
                            <p className="text-xs text-text-muted mt-0.5">This week</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full gradient-bg" />
                                <span className="text-text-muted">Total</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <span className="text-text-muted">Resolved</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex items-end gap-3 h-52">
                            {weeklyData.map((d) => (
                                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex gap-1 items-end h-40">
                                        <div className="flex-1 flex flex-col justify-end">
                                            <div
                                                className="w-full gradient-bg rounded-t-md transition-all duration-500"
                                                style={{
                                                    height: `${(d.conversations / maxConversations) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-end">
                                            <div
                                                className="w-full bg-emerald-500 rounded-t-md transition-all duration-500"
                                                style={{
                                                    height: `${(d.resolved / maxConversations) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs text-text-muted">{d.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sentiment */}
                <div className="card !p-0">
                    <div className="p-5 border-b border-border">
                        <h2 className="text-lg font-semibold">User Sentiment</h2>
                        <p className="text-xs text-text-muted mt-0.5">Last 7 days</p>
                    </div>
                    <div className="p-5 space-y-4">
                        {/* Donut visual */}
                        <div className="flex items-center gap-4 mb-2">
                            <div className="relative w-28 h-28">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    {(() => {
                                        let offset = 0;
                                        const colors = ["#10b981", "#3b82f6", "#f59e0b", "#f43f5e"];
                                        return sentimentData.map((d, i) => {
                                            const dash = d.value;
                                            const gap = 100 - dash;
                                            const el = (
                                                <circle
                                                    key={d.label}
                                                    cx="18"
                                                    cy="18"
                                                    r="15.9"
                                                    fill="transparent"
                                                    stroke={colors[i]}
                                                    strokeWidth="3"
                                                    strokeDasharray={`${dash} ${gap}`}
                                                    strokeDashoffset={`${-offset}`}
                                                    strokeLinecap="round"
                                                />
                                            );
                                            offset += dash;
                                            return el;
                                        });
                                    })()}
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-2xl font-bold">86%</p>
                                    <p className="text-[10px] text-text-muted">Happy</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {sentimentData.map((d) => (
                                    <div key={d.label} className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${d.color}`} />
                                        <span className="text-xs text-text-muted">{d.label}</span>
                                        <span className="text-xs font-medium ml-auto">{d.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Pages */}
            <div className="card !p-0">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <h2 className="text-lg font-semibold">Top Pages by Questions</h2>
                    <Calendar className="w-4 h-4 text-text-muted" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-text-muted border-b border-border">
                                <th className="text-left px-5 py-3 font-medium">Page</th>
                                <th className="text-right px-5 py-3 font-medium">Visits</th>
                                <th className="text-right px-5 py-3 font-medium">Questions</th>
                                <th className="text-right px-5 py-3 font-medium">Question Rate</th>
                                <th className="px-5 py-3 font-medium">Distribution</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {topPages.map((page) => (
                                <tr key={page.page} className="hover:bg-surface-hover/50 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-text-muted" />
                                            <span className="text-sm font-medium">{page.page}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-right text-sm text-text-secondary">
                                        {page.visits.toLocaleString()}
                                    </td>
                                    <td className="px-5 py-3 text-right text-sm font-medium">
                                        {page.questions}
                                    </td>
                                    <td className="px-5 py-3 text-right text-sm text-text-secondary">
                                        {((page.questions / page.visits) * 100).toFixed(1)}%
                                    </td>
                                    <td className="px-5 py-3 w-40">
                                        <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                                            <div
                                                className="h-full gradient-bg rounded-full"
                                                style={{
                                                    width: `${(page.questions / topPages[0].questions) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
