"use client";

import { useState } from "react";
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
        "Hi! I know everything about this website. Ask me anything!"
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

    const steps: { id: Step; label: string }[] = [
        { id: "source", label: "Content Source" },
        { id: "crawl", label: "Crawl & Index" },
        { id: "customize", label: "Customize" },
        { id: "deploy", label: "Deploy" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="p-1.5 rounded-lg border border-edge text-fg-muted hover:text-fg hover:border-edge-light transition-all">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/></svg>
                </Link>
                <div>
                    <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Create New Bot</h1>
                    <p className="text-[14px] text-fg-secondary mt-0.5">Set up your AI assistant in a few simple steps</p>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-surface/50 border border-edge w-fit">
                {steps.map((s, i) => {
                    const currentIdx = steps.findIndex(st => st.id === step);
                    const isDone = i < currentIdx;
                    const isActive = s.id === step;
                    return (
                        <span key={s.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                            isActive ? 'bg-primary/10 text-primary' : isDone ? 'text-success' : 'text-fg-muted'
                        }`}>
                            {isDone && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                            {s.label}
                        </span>
                    );
                })}
            </div>

            {/* Step Content */}
            <div className="rounded-xl border border-edge bg-surface/40 p-6">
                {step === "source" && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-[17px] font-semibold text-fg mb-1">Where is your content?</h2>
                            <p className="text-[13px] text-fg-secondary">Provide a website URL to crawl, or upload documents directly.</p>
                        </div>

                        <div>
                            <label className="block text-[13px] font-medium text-fg mb-2">Website URL</label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://your-website.com"
                                className="w-full px-4 py-2.5 rounded-lg border border-edge bg-bg/60 text-[14px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-edge" />
                            <span className="text-[12px] text-fg-muted">Or upload files</span>
                            <div className="flex-1 h-px bg-edge" />
                        </div>

                        <div className="p-8 rounded-xl border-2 border-dashed border-edge hover:border-edge-light text-center transition-colors cursor-pointer">
                            <p className="text-[14px] text-fg-secondary mb-1">Drag & drop files here</p>
                            <p className="text-[12px] text-fg-muted">PDF, DOCX, TXT, CSV, MD - Max 50MB per file</p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => { if (url) setStep("crawl"); }}
                                disabled={!url}
                                className="px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next: Crawl Site
                            </button>
                        </div>
                    </div>
                )}

                {step === "crawl" && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-[17px] font-semibold text-fg mb-1">Crawl & Index Content</h2>
                            <p className="text-[13px] text-fg-secondary">We&apos;ll extract and index all text content from your website.</p>
                        </div>

                        {crawlError && <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-[13px] text-danger">{crawlError}</div>}

                        {!crawling && !crawled && (
                            <div className="p-6 rounded-xl border border-edge bg-bg/40 text-center space-y-3">
                                <p className="text-[14px] font-medium text-fg">Ready to crawl</p>
                                <p className="text-[13px] text-fg-secondary">Target: <span className="text-fg">{url}</span></p>
                                <button onClick={handleCrawl} className="px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors">Start Crawling</button>
                            </div>
                        )}

                        {crawling && (
                            <div className="p-8 rounded-xl border border-primary/20 bg-primary/[0.04] text-center space-y-3">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-[14px] font-medium text-fg">Crawling website...</p>
                                <p className="text-[12px] text-fg-secondary">Discovering pages, extracting content, creating embeddings</p>
                            </div>
                        )}

                        {crawled && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-success">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                    <p className="text-[14px] font-medium">Successfully crawled {crawledPages.length} pages</p>
                                </div>
                                <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                                    {crawledPages.map((page) => (
                                        <div key={page.url} className="flex items-center justify-between p-3 rounded-lg bg-bg/40 border border-edge">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[13px] font-medium text-fg truncate">{page.title}</p>
                                                <p className="text-[11px] text-fg-muted truncate">{page.url}</p>
                                            </div>
                                            <span className="text-[11px] text-fg-secondary shrink-0 ml-3">{(page.wordCount || 0).toLocaleString()} words</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 rounded-lg bg-success/[0.06] border border-success/20">
                                    <p className="text-[13px] font-medium text-success mb-0.5">Content indexed successfully</p>
                                    <p className="text-[12px] text-fg-secondary">
                                        {crawlStats.totalWords?.toLocaleString() || 0} total words |{' '}
                                        {crawlStats.totalPages || 0} pages |{' '}
                                        {crawlStats.totalChunks || 0} chunks | Ready for AI
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <button onClick={() => setStep("source")} className="px-4 py-2 rounded-lg border border-edge text-[13px] text-fg-secondary hover:text-fg hover:border-edge-light transition-all">Back</button>
                            <button
                                onClick={() => setStep("customize")}
                                disabled={!crawled}
                                className="px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next: Customize
                            </button>
                        </div>
                    </div>
                )}

                {step === "customize" && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-[17px] font-semibold text-fg mb-1">Customize Your Bot</h2>
                            <p className="text-[13px] text-fg-secondary">Configure the appearance and behavior of your AI assistant.</p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-[13px] font-medium text-fg mb-2">Bot Name</label>
                                <input
                                    type="text"
                                    value={botName}
                                    onChange={(e) => setBotName(e.target.value)}
                                    placeholder="e.g. ShopFlow Assistant"
                                    className="w-full px-4 py-2.5 rounded-lg border border-edge bg-bg/60 text-[14px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-fg mb-2">Welcome Message</label>
                                <textarea
                                    value={welcomeMessage}
                                    onChange={(e) => setWelcomeMessage(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-lg border border-edge bg-bg/60 text-[14px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-fg mb-2">Primary Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-edge cursor-pointer bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="w-24 px-3 py-2 rounded-lg border border-edge bg-bg/60 text-[13px] text-fg font-mono focus:outline-none focus:border-primary/50 transition-all"
                                    />
                                    <div className="flex gap-1.5">
                                        {["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setPrimaryColor(c)}
                                                className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                                                style={{
                                                    backgroundColor: c,
                                                    borderColor: primaryColor === c ? 'white' : 'transparent',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-fg mb-2">Widget Position</label>
                                <div className="flex gap-2">
                                    {(["right", "left"] as const).map((pos) => (
                                        <button
                                            key={pos}
                                            onClick={() => setPosition(pos)}
                                            className={`px-4 py-2 rounded-lg border text-[13px] font-medium transition-all ${
                                                position === pos ? 'border-primary bg-primary/10 text-primary' : 'border-edge text-fg-secondary hover:text-fg hover:border-edge-light'
                                            }`}
                                        >
                                            Bottom {pos.charAt(0).toUpperCase() + pos.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button onClick={() => setStep("crawl")} className="px-4 py-2 rounded-lg border border-edge text-[13px] text-fg-secondary hover:text-fg hover:border-edge-light transition-all">Back</button>
                            <button
                                onClick={handleCreateBot}
                                disabled={creating}
                                className="px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
                            >
                                {creating ? 'Creating Bot...' : 'Create & Deploy'}
                            </button>
                        </div>
                    </div>
                )}

                {step === "deploy" && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-3">
                                <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                            </div>
                            <h2 className="text-[20px] font-bold text-fg">Your Bot is Ready!</h2>
                            <p className="text-[13px] text-fg-secondary mt-1">
                                Copy the embed code below and paste it before the &lt;/body&gt; tag on your website.
                            </p>
                        </div>

                        <div className="rounded-xl border border-edge bg-bg/60 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-surface/60 border-b border-edge">
                                <span className="text-[12px] font-medium text-fg-secondary">Embed Code</span>
                                <button
                                    onClick={() => {
                                        const code = `<script\n  src="${process.env.NEXT_PUBLIC_APP_URL || 'https://cdn.pageai.io'}/widget.js"\n  data-bot-id="${botId}"\n  data-color="${primaryColor}"\n  data-position="${position}"\n/>`;
                                        navigator.clipboard.writeText(code);
                                    }}
                                    className="px-3 py-1 rounded-md bg-primary/10 text-primary text-[12px] font-medium hover:bg-primary/20 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                            <pre className="p-4 text-[13px] text-fg/80 font-mono overflow-x-auto">
{`<script
  src="https://cdn.pageai.io/widget.js"
  data-bot-id="${botId || 'bot_xxxxx'}"
  data-color="${primaryColor}"
  data-position="${position}"
/>`}
                            </pre>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <Link href="/dashboard" className="px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors">Go to Dashboard</Link>
                            <Link href="/dashboard/bots" className="px-5 py-2.5 rounded-lg border border-edge text-[13px] text-fg-secondary hover:text-fg hover:border-edge-light transition-all">Manage Bots</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
