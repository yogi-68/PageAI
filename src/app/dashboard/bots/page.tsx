"use client";

import {
    Bot,
    Globe,
    Settings,
    MoreHorizontal,
    Plus,
    Search,
    Zap,
    Eye,
    Trash2,
    Copy,
    ExternalLink,
} from "lucide-react";
import Link from "next/link";

const bots = [
    {
        id: "bot_1",
        name: "ShopFlow Support",
        website: "shopflow.com",
        status: "active",
        model: "GPT-4 Turbo",
        conversations: 1247,
        accuracy: 96,
        pages: 34,
        color: "#6366f1",
        lastActive: "2 min ago",
    },
    {
        id: "bot_2",
        name: "Docs Helper",
        website: "docs.myapp.io",
        status: "active",
        model: "GPT-3.5 Turbo",
        conversations: 892,
        accuracy: 98,
        pages: 156,
        color: "#3b82f6",
        lastActive: "5 min ago",
    },
    {
        id: "bot_3",
        name: "Blog Assistant",
        website: "myblog.com",
        status: "training",
        model: "GPT-3.5 Turbo",
        conversations: 0,
        accuracy: 0,
        pages: 12,
        color: "#10b981",
        lastActive: "Training...",
    },
];

export default function BotsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">My Bots</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Manage your AI chatbot assistants
                    </p>
                </div>
                <Link href="/dashboard/bots/new" className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Create New Bot
                </Link>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search bots..."
                        className="input !pl-10"
                    />
                </div>
                <select className="input !w-auto">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Training</option>
                    <option>Paused</option>
                </select>
            </div>

            {/* Bots Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {bots.map((bot) => (
                    <div key={bot.id} className="card group relative">
                        {/* Status indicator */}
                        <div className="absolute top-4 right-4">
                            <div
                                className={`badge text-xs ${bot.status === "active" ? "badge-emerald" : "badge-amber"
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
                        </div>

                        {/* Bot Icon */}
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                            style={{ background: bot.color }}
                        >
                            <Bot className="w-7 h-7 text-white" />
                        </div>

                        {/* Info */}
                        <h3 className="text-lg font-semibold mb-1">{bot.name}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-text-muted mb-4">
                            <Globe className="w-3.5 h-3.5" />
                            {bot.website}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 py-4 border-t border-border">
                            <div>
                                <p className="text-lg font-bold">{bot.conversations.toLocaleString()}</p>
                                <p className="text-xs text-text-muted">Chats</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold">{bot.pages}</p>
                                <p className="text-xs text-text-muted">Pages</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold">
                                    {bot.accuracy > 0 ? `${bot.accuracy}%` : "—"}
                                </p>
                                <p className="text-xs text-text-muted">Accuracy</p>
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="text-xs text-text-muted">
                                <span className="badge text-[10px]">{bot.model}</span>
                            </div>
                            <span className="text-xs text-text-muted">{bot.lastActive}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                            <button
                                className="flex-1 btn-secondary !py-2 text-xs"
                                title="Preview"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                Preview
                            </button>
                            <button
                                className="flex-1 btn-secondary !py-2 text-xs"
                                title="Get Embed Code"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                Embed
                            </button>
                            <Link
                                href={`/dashboard/bots/${bot.id}`}
                                className="flex-1 btn-primary !py-2 text-xs"
                            >
                                <Settings className="w-3.5 h-3.5" />
                                Manage
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Add New Bot Card */}
                <Link
                    href="/dashboard/bots/new"
                    className="card card-interactive !border-dashed flex flex-col items-center justify-center min-h-[320px] text-center group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center mb-4 group-hover:border-primary-500/30 transition-colors">
                        <Plus className="w-7 h-7 text-text-muted group-hover:text-primary-400 transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1 group-hover:text-white transition-colors">
                        Create New Bot
                    </h3>
                    <p className="text-sm text-text-muted">
                        Set up a new AI assistant for your website
                    </p>
                </Link>
            </div>
        </div>
    );
}
