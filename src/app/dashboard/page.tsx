"use client";

import {
    Bot,
    MessageSquare,
    TrendingUp,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Globe,
    Zap,
    Plus,
    MoreHorizontal,
    ExternalLink,
} from "lucide-react";
import Link from "next/link";

const stats = [
    {
        label: "Total Conversations",
        value: "3,247",
        change: "+12.5%",
        up: true,
        icon: MessageSquare,
        color: "from-blue-500 to-cyan-400",
    },
    {
        label: "Active Bots",
        value: "3",
        change: "+1",
        up: true,
        icon: Bot,
        color: "from-purple-500 to-indigo-400",
    },
    {
        label: "Resolution Rate",
        value: "94.2%",
        change: "+2.3%",
        up: true,
        icon: TrendingUp,
        color: "from-emerald-500 to-teal-400",
    },
    {
        label: "Unique Visitors",
        value: "8,912",
        change: "-1.2%",
        up: false,
        icon: Users,
        color: "from-amber-500 to-orange-400",
    },
];

const recentBots = [
    {
        name: "ShopFlow Support",
        site: "shopflow.com",
        status: "active",
        conversations: 1247,
        accuracy: 96,
        pages: 34,
    },
    {
        name: "Docs Helper",
        site: "docs.myapp.io",
        status: "active",
        conversations: 892,
        accuracy: 98,
        pages: 156,
    },
    {
        name: "Blog Assistant",
        site: "myblog.com",
        status: "training",
        conversations: 0,
        accuracy: 0,
        pages: 12,
    },
];

const recentConversations = [
    {
        question: "How do I reset my password?",
        answer: "You can reset your password by visiting Settings > Security > Change Password...",
        bot: "ShopFlow Support",
        time: "2 min ago",
        satisfied: true,
    },
    {
        question: "What are the shipping rates to Europe?",
        answer: "Based on the Shipping page, European rates start at $9.99 for standard...",
        bot: "ShopFlow Support",
        time: "5 min ago",
        satisfied: true,
    },
    {
        question: "How to integrate the API with Python?",
        answer: "Check out the Python SDK documentation at /docs/sdk/python...",
        bot: "Docs Helper",
        time: "12 min ago",
        satisfied: true,
    },
    {
        question: "Do you have a referral program?",
        answer: "I couldn't find specific information about a referral program on the website...",
        bot: "ShopFlow Support",
        time: "18 min ago",
        satisfied: false,
    },
];

const topQuestions = [
    { question: "Shipping policy", count: 234 },
    { question: "Return process", count: 189 },
    { question: "API documentation", count: 156 },
    { question: "Pricing plans", count: 143 },
    { question: "Contact support", count: 98 },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Overview of your AI chatbot performance
                    </p>
                </div>
                <Link href="/dashboard/bots/new" className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Create New Bot
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="card">
                        <div className="flex items-center justify-between mb-3">
                            <div
                                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                            >
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <div
                                className={`flex items-center gap-1 text-xs font-medium ${stat.up ? "text-emerald-400" : "text-rose-400"
                                    }`}
                            >
                                {stat.up ? (
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                ) : (
                                    <ArrowDownRight className="w-3.5 h-3.5" />
                                )}
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-text-muted mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Bots Section */}
                <div className="lg:col-span-2">
                    <div className="card !p-0">
                        <div className="flex items-center justify-between p-5 border-b border-border">
                            <h2 className="text-lg font-semibold">Your Bots</h2>
                            <Link
                                href="/dashboard/bots"
                                className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                            >
                                View All <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="divide-y divide-border">
                            {recentBots.map((bot) => (
                                <div
                                    key={bot.name}
                                    className="flex items-center gap-4 px-5 py-4 hover:bg-surface-hover/50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/10">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{bot.name}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                            <Globe className="w-3 h-3" />
                                            {bot.site}
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-6 text-sm">
                                        <div className="text-center">
                                            <p className="font-medium">{bot.conversations.toLocaleString()}</p>
                                            <p className="text-xs text-text-muted">Chats</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-medium">{bot.pages}</p>
                                            <p className="text-xs text-text-muted">Pages</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-medium">{bot.accuracy > 0 ? `${bot.accuracy}%` : "—"}</p>
                                            <p className="text-xs text-text-muted">Accuracy</p>
                                        </div>
                                    </div>
                                    <div
                                        className={`badge text-xs ${bot.status === "active"
                                                ? "badge-emerald"
                                                : "badge-amber"
                                            }`}
                                    >
                                        {bot.status === "active" ? (
                                            <>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-3 h-3" />
                                                Training
                                            </>
                                        )}
                                    </div>
                                    <button className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Questions */}
                <div className="card !p-0">
                    <div className="flex items-center justify-between p-5 border-b border-border">
                        <h2 className="text-lg font-semibold">Top Questions</h2>
                        <span className="text-xs text-text-muted">This week</span>
                    </div>
                    <div className="p-5 space-y-4">
                        {topQuestions.map((q, i) => (
                            <div key={q.question} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-text-muted w-5">
                                    {i + 1}.
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{q.question}</p>
                                    <div className="mt-1 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                                        <div
                                            className="h-full gradient-bg rounded-full"
                                            style={{
                                                width: `${(q.count / topQuestions[0].count) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs text-text-muted font-medium">
                                    {q.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Conversations */}
            <div className="card !p-0">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <h2 className="text-lg font-semibold">Recent Conversations</h2>
                    <Link
                        href="/dashboard/conversations"
                        className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                    >
                        View All <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
                <div className="divide-y divide-border">
                    {recentConversations.map((conv, i) => (
                        <div
                            key={i}
                            className="px-5 py-4 hover:bg-surface-hover/50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-surface-card border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <MessageSquare className="w-4 h-4 text-text-muted" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-medium truncate">
                                            {conv.question}
                                        </p>
                                        <div
                                            className={`badge text-[10px] !py-0 ${conv.satisfied ? "badge-emerald" : "badge-rose"
                                                }`}
                                        >
                                            {conv.satisfied ? "Resolved" : "Unresolved"}
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-muted truncate">
                                        {conv.answer}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                                        <span className="flex items-center gap-1">
                                            <Bot className="w-3 h-3" />
                                            {conv.bot}
                                        </span>
                                        <span>{conv.time}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
