"use client";

import { useState } from "react";
import {
    Globe,
    Upload,
    ArrowRight,
    ArrowLeft,
    Bot,
    Palette,
    Check,
    Loader2,
    FileText,
    Link as LinkIcon,
    Sparkles,
    Settings,
    Eye,
    MessageSquare,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

type Step = "source" | "crawl" | "customize" | "deploy";

interface CrawledPage {
    url: string;
    title: string;
    wordCount: number;
    status: string;
}

export default function NewBotPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState<Step>("source");
    const [url, setUrl] = useState("");
    const [crawling, setCrawling] = useState(false);
    const [crawled, setCrawled] = useState(false);
    const [crawlError, setCrawlError] = useState("");
    const [crawledPages, setCrawledPages] = useState<CrawledPage[]>([]);
    const [crawlStats, setCrawlStats] = useState({ totalPages: 0, totalWords: 0, totalChunks: 0 });
    const [websiteId, setWebsiteId] = useState("");
    const [botName, setBotName] = useState("");
    const [welcomeMessage, setWelcomeMessage] = useState(
        "Hi! 👋 I know everything about this website. Ask me anything!"
    );
    const [primaryColor, setPrimaryColor] = useState("#6366f1");
    const [position, setPosition] = useState<"right" | "left">("right");
    const [creating, setCreating] = useState(false);
    const [botId, setBotId] = useState("");

    const handleCrawl = async () => {
        if (!user || !url) return;
        setCrawling(true);
        setCrawlError("");

        try {
            const res = await fetch("/api/crawl", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: url.trim(),
                    userId: user.id,
                    maxPages: 20,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Crawl failed");
            }

            setCrawledPages(data.pages || []);
            setCrawlStats(data.stats || {});
            setWebsiteId(data.websiteId);
            setCrawled(true);
        } catch (err: any) {
            setCrawlError(err.message || "Failed to crawl website");
        } finally {
            setCrawling(false);
        }
    };

    const handleCreateBot = async () => {
        if (!user || !websiteId) return;
        setCreating(true);

        try {
            const res = await fetch("/api/bots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    websiteId,
                    name: botName || "AI Assistant",
                    welcomeMessage,
                    primaryColor,
                    position,
                    model: "gpt-3.5-turbo",
                }),
            });

            const data = await res.json();
            if (data.bot) {
                setBotId(data.bot.id);

                // Now re-index with botId for Pinecone filter
                await fetch("/api/crawl", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        url: url.trim(),
                        userId: user.id,
                        websiteId,
                        botId: data.bot.id,
                        maxPages: 20,
                    }),
                });

                setStep("deploy");
            }
        } catch (err) {
            console.error("Bot creation error:", err);
        } finally {
            setCreating(false);
        }
    };

    const steps: { id: Step; label: string; icon: typeof Globe }[] = [
        { id: "source", label: "Content Source", icon: Globe },
        { id: "crawl", label: "Crawl & Index", icon: FileText },
        { id: "customize", label: "Customize", icon: Palette },
        { id: "deploy", label: "Deploy", icon: Sparkles },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Create New Bot</h1>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">
                        Set up your AI assistant in a few simple steps
                    </p>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2">
                {steps.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2 flex-1">
                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all w-full ${step === s.id
                                ? "gradient-bg text-white shadow-lg shadow-indigo-500/20"
                                : steps.indexOf(steps.find((st) => st.id === step)!) > i
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-default)]"
                                }`}
                        >
                            {steps.indexOf(steps.find((st) => st.id === step)!) > i ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <s.icon className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">{s.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="card !p-8">
                {/* Step 1: Source */}
                {step === "source" && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">
                                Where is your content?
                            </h2>
                            <p className="text-[var(--text-secondary)] text-sm">
                                Provide a website URL to crawl, or upload documents directly.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Website URL
                            </label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://your-website.com"
                                        className="input !pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--border-default)]" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-3 text-xs text-[var(--text-muted)] bg-[var(--bg-card)]">
                                    Or upload files
                                </span>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-[var(--border-default)] rounded-2xl p-8 text-center hover:border-[var(--primary-500)]/30 transition-colors cursor-pointer group">
                            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center mx-auto mb-4 group-hover:border-[var(--primary-500)]/30 transition-colors">
                                <Upload className="w-6 h-6 text-[var(--text-muted)]" />
                            </div>
                            <p className="text-sm font-medium mb-1">
                                Drag & drop files here
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                                PDF, DOCX, TXT, CSV, MD • Max 50MB per file
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => { if (url) setStep("crawl"); }}
                                disabled={!url}
                                className="btn-primary disabled:opacity-50"
                            >
                                Next: Crawl Site
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Crawl */}
                {step === "crawl" && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">
                                Crawl & Index Content
                            </h2>
                            <p className="text-[var(--text-secondary)] text-sm">
                                We&apos;ll extract and index all text content from your website.
                            </p>
                        </div>

                        {crawlError && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/15 text-rose-400 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {crawlError}
                            </div>
                        )}

                        {!crawling && !crawled && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                                    <Globe className="w-8 h-8 text-white" />
                                </div>
                                <p className="text-lg font-semibold mb-2">Ready to crawl</p>
                                <p className="text-sm text-[var(--text-muted)] mb-6">
                                    Target: <span className="text-[var(--text-secondary)]">{url}</span>
                                </p>
                                <button onClick={handleCrawl} className="btn-primary">
                                    <Sparkles className="w-4 h-4" />
                                    Start Crawling
                                </button>
                            </div>
                        )}

                        {crawling && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20 animate-pulse">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                                <p className="text-lg font-semibold mb-2">Crawling website...</p>
                                <p className="text-sm text-[var(--text-muted)]">
                                    Discovering pages, extracting content, creating embeddings
                                </p>
                                <div className="mt-4 max-w-xs mx-auto">
                                    <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                                        <div className="h-full gradient-bg rounded-full animate-shimmer w-2/3" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {crawled && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                                    <Check className="w-4 h-4" />
                                    Successfully crawled {crawledPages.length} pages
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                                    {crawledPages.map((page) => (
                                        <div
                                            key={page.url}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)]"
                                        >
                                            <FileText className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{page.title}</p>
                                                <p className="text-xs text-[var(--text-muted)] truncate">{page.url}</p>
                                            </div>
                                            <span className="text-xs text-[var(--text-muted)]">
                                                {(page.wordCount || 0).toLocaleString()} words
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="card !p-4 bg-emerald-500/5 !border-emerald-500/20">
                                    <div className="flex items-center gap-3">
                                        <Check className="w-5 h-5 text-emerald-400" />
                                        <div>
                                            <p className="text-sm font-medium text-emerald-400">
                                                Content indexed successfully
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)]">
                                                {crawlStats.totalWords?.toLocaleString() || 0} total words • {crawlStats.totalPages || 0} pages • {crawlStats.totalChunks || 0} chunks • Ready for AI
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <button onClick={() => setStep("source")} className="btn-secondary">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                                onClick={() => setStep("customize")}
                                disabled={!crawled}
                                className="btn-primary disabled:opacity-50"
                            >
                                Next: Customize
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Customize */}
                {step === "customize" && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Customize Your Bot</h2>
                            <p className="text-[var(--text-secondary)] text-sm">
                                Configure the appearance and behavior of your AI assistant.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Bot Name</label>
                                    <input
                                        type="text"
                                        value={botName}
                                        onChange={(e) => setBotName(e.target.value)}
                                        placeholder="e.g. ShopFlow Assistant"
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Welcome Message</label>
                                    <textarea
                                        value={welcomeMessage}
                                        onChange={(e) => setWelcomeMessage(e.target.value)}
                                        rows={3}
                                        className="input resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Primary Color</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-10 h-10 rounded-lg cursor-pointer border-0"
                                        />
                                        <input
                                            type="text"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="input !w-32"
                                        />
                                        <div className="flex gap-2">
                                            {["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => setPrimaryColor(c)}
                                                    className="w-7 h-7 rounded-lg border-2 transition-all"
                                                    style={{
                                                        backgroundColor: c,
                                                        borderColor: primaryColor === c ? "white" : "transparent",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Widget Position</label>
                                    <div className="flex gap-3">
                                        {(["right", "left"] as const).map((pos) => (
                                            <button
                                                key={pos}
                                                onClick={() => setPosition(pos)}
                                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${position === pos
                                                    ? "border-[var(--primary-500)] bg-[var(--primary-glow)] text-[var(--primary-400)]"
                                                    : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:border-[var(--border-light)]"
                                                    }`}
                                            >
                                                Bottom {pos.charAt(0).toUpperCase() + pos.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <Eye className="w-4 h-4 inline mr-1" />
                                    Live Preview
                                </label>
                                <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] p-4 min-h-[360px] relative">
                                    <div className="absolute top-4 left-4 right-4 space-y-2 opacity-20">
                                        <div className="h-6 w-32 bg-white/10 rounded" />
                                        <div className="h-3 w-full bg-white/5 rounded" />
                                        <div className="h-3 w-3/4 bg-white/5 rounded" />
                                    </div>
                                    <div className={`absolute bottom-4 ${position === "right" ? "right-4" : "left-4"} w-72`}>
                                        <div className="rounded-2xl border border-[var(--border-default)] shadow-2xl overflow-hidden bg-[var(--bg-card)]">
                                            <div className="px-4 py-3 flex items-center gap-3" style={{ background: primaryColor }}>
                                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                                    <Bot className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{botName || "AI Assistant"}</p>
                                                    <p className="text-xs text-white/70">Online</p>
                                                </div>
                                            </div>
                                            <div className="p-3 space-y-2 h-32">
                                                <div className="flex gap-2 items-start">
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: primaryColor }}>
                                                        <Bot className="w-3 h-3 text-white" />
                                                    </div>
                                                    <div className="bg-[var(--bg-elevated)] rounded-xl rounded-tl-sm px-3 py-1.5">
                                                        <p className="text-xs text-[var(--text-secondary)]">{welcomeMessage}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-3 pb-3">
                                                <div className="flex items-center gap-2 bg-[var(--bg-elevated)] rounded-xl px-3 py-2 border border-[var(--border-default)]">
                                                    <MessageSquare className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                                    <span className="text-xs text-[var(--text-muted)]">Ask anything...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button onClick={() => setStep("crawl")} className="btn-secondary">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                                onClick={handleCreateBot}
                                disabled={creating}
                                className="btn-primary disabled:opacity-50"
                            >
                                {creating ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating Bot...</>
                                ) : (
                                    <>Create & Deploy <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Deploy */}
                {step === "deploy" && (
                    <div className="space-y-6 animate-fade-in text-center">
                        <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/30">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">Your Bot is Ready! 🎉</h2>
                        <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                            Copy the embed code below and paste it before the{" "}
                            <code className="text-[var(--primary-400)]">&lt;/body&gt;</code> tag on your website.
                        </p>

                        <div className="text-left max-w-lg mx-auto">
                            <div className="bg-[var(--bg-elevated)] rounded-xl p-5 border border-[var(--border-default)] font-mono text-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs text-[var(--text-muted)]">Embed Code</span>
                                    <button
                                        onClick={() => {
                                            const code = `<script\n  src="${process.env.NEXT_PUBLIC_APP_URL || 'https://cdn.pageai.io'}/widget.js"\n  data-bot-id="${botId}"\n  data-color="${primaryColor}"\n  data-position="${position}"\n/>`;
                                            navigator.clipboard.writeText(code);
                                        }}
                                        className="badge text-xs cursor-pointer hover:bg-[var(--primary-glow)]"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <code className="text-xs leading-relaxed block">
                                    <span className="text-blue-400">&lt;script</span>
                                    <br />
                                    <span className="text-purple-400 ml-4">src</span>
                                    <span className="text-[var(--text-muted)]">=</span>
                                    <span className="text-emerald-400">&quot;https://cdn.pageai.io/widget.js&quot;</span>
                                    <br />
                                    <span className="text-purple-400 ml-4">data-bot-id</span>
                                    <span className="text-[var(--text-muted)]">=</span>
                                    <span className="text-emerald-400">&quot;{botId || 'bot_xxxxx'}&quot;</span>
                                    <br />
                                    <span className="text-purple-400 ml-4">data-color</span>
                                    <span className="text-[var(--text-muted)]">=</span>
                                    <span className="text-emerald-400">&quot;{primaryColor}&quot;</span>
                                    <br />
                                    <span className="text-purple-400 ml-4">data-position</span>
                                    <span className="text-[var(--text-muted)]">=</span>
                                    <span className="text-emerald-400">&quot;{position}&quot;</span>
                                    <br />
                                    <span className="text-blue-400">/&gt;</span>
                                </code>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link href="/dashboard" className="btn-primary">
                                <Settings className="w-4 h-4" />
                                Go to Dashboard
                            </Link>
                            <Link href="/dashboard/bots" className="btn-secondary">
                                <Bot className="w-4 h-4" />
                                Manage Bots
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
