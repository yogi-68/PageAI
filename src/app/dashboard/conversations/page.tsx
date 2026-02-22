"use client";

import {
    MessageSquare,
    Bot,
    Search,
    Filter,
    ThumbsUp,
    ThumbsDown,
    Clock,
    Globe,
    ExternalLink,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";

const conversations = [
    {
        id: "conv_1",
        visitor: "Visitor #4821",
        bot: "ShopFlow Support",
        question: "What are your shipping rates to Europe?",
        answer:
            "Based on the Shipping page, European shipping starts at $9.99 for standard delivery (7-14 business days). Express shipping to Europe is $24.99 (3-5 business days).",
        status: "resolved",
        satisfied: true,
        messages: 4,
        duration: "2m 15s",
        time: "2 min ago",
        page: "/products/widgets",
        sources: ["/shipping", "/faq"],
    },
    {
        id: "conv_2",
        visitor: "Visitor #4820",
        bot: "ShopFlow Support",
        question: "How do I return a defective item?",
        answer:
            "You can initiate a return for defective items within 90 days. Visit your order history, select the item, and choose 'Report Defective'. We'll provide a prepaid shipping label.",
        status: "resolved",
        satisfied: true,
        messages: 6,
        duration: "3m 42s",
        time: "8 min ago",
        page: "/help",
        sources: ["/returns", "/warranty"],
    },
    {
        id: "conv_3",
        visitor: "Visitor #4819",
        bot: "Docs Helper",
        question: "How to authenticate API requests?",
        answer:
            "All API requests require a Bearer token in the Authorization header. Get your API key from Dashboard > Settings > API Keys. Example: Authorization: Bearer pk_live_xxx",
        status: "resolved",
        satisfied: true,
        messages: 3,
        duration: "1m 30s",
        time: "15 min ago",
        page: "/docs/getting-started",
        sources: ["/docs/authentication"],
    },
    {
        id: "conv_4",
        visitor: "Visitor #4818",
        bot: "ShopFlow Support",
        question: "Do you have a loyalty program?",
        answer:
            "I couldn't find specific information about a loyalty program on the website. I'd recommend contacting the support team directly for more details.",
        status: "escalated",
        satisfied: false,
        messages: 5,
        duration: "4m 10s",
        time: "22 min ago",
        page: "/",
        sources: [],
    },
    {
        id: "conv_5",
        visitor: "Visitor #4817",
        bot: "ShopFlow Support",
        question: "What payment methods do you accept?",
        answer:
            "We accept Visa, Mastercard, American Express, PayPal, Apple Pay, and Google Pay. All transactions are secured with SSL encryption.",
        status: "resolved",
        satisfied: true,
        messages: 2,
        duration: "0m 45s",
        time: "35 min ago",
        page: "/checkout",
        sources: ["/payment-methods", "/faq"],
    },
];

export default function ConversationsPage() {
    const [selectedConv, setSelectedConv] = useState<string | null>(null);
    const selected = conversations.find((c) => c.id === selectedConv);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Conversations</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Review and analyze chatbot conversations
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select className="input !w-auto !py-2 text-sm">
                        <option>All Bots</option>
                        <option>ShopFlow Support</option>
                        <option>Docs Helper</option>
                    </select>
                    <select className="input !w-auto !py-2 text-sm">
                        <option>All Status</option>
                        <option>Resolved</option>
                        <option>Escalated</option>
                        <option>Active</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="input !pl-10"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* List */}
                <div className="lg:col-span-3 card !p-0">
                    <div className="divide-y divide-border">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedConv(conv.id)}
                                className={`px-5 py-4 cursor-pointer transition-colors ${selectedConv === conv.id
                                        ? "bg-primary-600/5 border-l-2 border-l-primary-500"
                                        : "hover:bg-surface-hover/50"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-surface-card border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <MessageSquare className="w-4 h-4 text-text-muted" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-medium truncate flex-1">
                                                {conv.question}
                                            </p>
                                            <div
                                                className={`badge text-[10px] !py-0 flex-shrink-0 ${conv.status === "resolved"
                                                        ? "badge-emerald"
                                                        : conv.status === "escalated"
                                                            ? "badge-rose"
                                                            : "badge-amber"
                                                    }`}
                                            >
                                                {conv.status}
                                            </div>
                                        </div>
                                        <p className="text-xs text-text-muted truncate mb-2">
                                            {conv.answer}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-text-muted">
                                            <span className="flex items-center gap-1">
                                                <Bot className="w-3 h-3" />
                                                {conv.bot}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {conv.time}
                                            </span>
                                            <span>
                                                {conv.satisfied ? (
                                                    <ThumbsUp className="w-3 h-3 text-emerald-400 inline" />
                                                ) : (
                                                    <ThumbsDown className="w-3 h-3 text-rose-400 inline" />
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0 mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-2">
                    {selected ? (
                        <div className="card space-y-4 sticky top-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">{selected.visitor}</h3>
                                <div
                                    className={`badge text-xs ${selected.status === "resolved"
                                            ? "badge-emerald"
                                            : "badge-rose"
                                        }`}
                                >
                                    {selected.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-surface-elevated rounded-xl p-3 border border-border">
                                    <p className="text-xs text-text-muted">Messages</p>
                                    <p className="text-lg font-bold">{selected.messages}</p>
                                </div>
                                <div className="bg-surface-elevated rounded-xl p-3 border border-border">
                                    <p className="text-xs text-text-muted">Duration</p>
                                    <p className="text-lg font-bold">{selected.duration}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-text-muted mb-1">Visitor Page</p>
                                <div className="flex items-center gap-2 text-sm text-primary-400">
                                    <Globe className="w-3.5 h-3.5" />
                                    {selected.page}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-text-muted mb-2">Question</p>
                                <p className="text-sm bg-surface-elevated rounded-xl p-3 border border-border">
                                    {selected.question}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-text-muted mb-2">Answer</p>
                                <p className="text-sm bg-surface-elevated rounded-xl p-3 border border-border">
                                    {selected.answer}
                                </p>
                            </div>

                            {selected.sources.length > 0 && (
                                <div>
                                    <p className="text-xs text-text-muted mb-2">Sources</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selected.sources.map((s) => (
                                            <div key={s} className="badge text-xs">
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-2 border-t border-border">
                                <span className="text-xs text-text-muted flex items-center gap-1">
                                    <Bot className="w-3 h-3" />
                                    {selected.bot}
                                </span>
                                <span className="text-xs text-text-muted">•</span>
                                <span className="text-xs text-text-muted">{selected.time}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="card text-center py-12">
                            <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-30" />
                            <p className="text-text-muted text-sm">
                                Select a conversation to view details
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
