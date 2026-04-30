"use client";

import { useState, useRef } from "react";
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
    const [dataSourceId, setDataSourceId] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string; dataSourceId: string; wordCount: number; status: 'syncing' | 'indexed' | 'error' }[]>([]);
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [botName, setBotName] = useState("");
    const [welcomeMessage, setWelcomeMessage] = useState(
        "Hi! I know everything about this website. Ask me anything!"
    );
    const [primaryColor, setPrimaryColor] = useState("#6366f1");
    const [position, setPosition] = useState<"right" | "left">("right");
    const [creating, setCreating] = useState(false);
    const [botId, setBotId] = useState("");
    const [limitReached, setLimitReached] = useState(false);
    const [crawlMode, setCrawlMode] = useState<'auto' | 'spa'>('auto');

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
                    mode: crawlMode,
                }),
            });

            const data = await res.json();
            if (res.status === 403 && data.planLimitReached) {
                throw new Error(data.error || "Plan page limit reached. Upgrade your plan to crawl more pages.");
            }
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Crawl failed");
            }

            setCrawledPages(data.pages || []);
            setCrawlStats(data.stats || {});
            setWebsiteId(data.websiteId);
            setDataSourceId(data.dataSourceId || "");
            setCrawled(true);
        } catch (err: any) {
            setCrawlError(err.message || "Failed to crawl website");
        } finally {
            setCrawling(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!user || !files.length) return;
        setUploadingFile(true);
        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                alert(`"${file.name}" exceeds 10 MB — skipped`);
                continue;
            }
            const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
            const isBinary = ext === 'pdf' || ext === 'docx';
            let body: Record<string, unknown>;
            if (isBinary) {
                const arrayBuffer = await file.arrayBuffer();
                const uint8 = new Uint8Array(arrayBuffer);
                let binary = '';
                for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
                body = { fileName: file.name, contentBase64: btoa(binary), userId: user.id };
            } else {
                const content: string = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsText(file);
                });
                body = { fileName: file.name, content, userId: user.id };
            }
            let success = false;
            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    const res = await fetch("/api/ingest", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                    });
                    const data = await res.json();
                    if (data.success) {
                        setUploadedFiles(prev => [...prev, { name: file.name, dataSourceId: data.dataSourceId, wordCount: data.wordCount, status: data.status === 'syncing' ? 'syncing' : 'indexed' }]);
                        // Poll for completion if indexing is async
                        if (data.status === 'syncing') {
                            const pollId = data.dataSourceId;
                            const poll = async () => {
                                for (let t = 0; t < 12; t++) {
                                    await new Promise(r => setTimeout(r, 5000));
                                    try {
                                        const sr = await fetch(`/api/ingest?dataSourceId=${pollId}`);
                                        const sd = await sr.json();
                                        if (sd.status === 'indexed' || sd.status === 'error') {
                                            setUploadedFiles(prev => prev.map(f => f.dataSourceId === pollId ? { ...f, status: sd.status as 'indexed' | 'error' } : f));
                                            break;
                                        }
                                    } catch { break; }
                                }
                            };
                            poll();
                        }
                        success = true;
                        break;
                    }
                    if (attempt === 2) throw new Error(data.error || 'Upload failed');
                } catch (err: any) {
                    if (attempt === 2) {
                        alert(`Failed to process "${file.name}" after 2 attempts: ${err.message}`);
                    }
                }
            }
            if (!success) console.warn('File upload failed for', file.name);
        }
        setUploadingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCreateBot = async () => {
        if (!user) return;
        const hasWebsite = !!websiteId;
        const hasFiles = uploadedFiles.length > 0;
        if (!hasWebsite && !hasFiles) return;
        setCreating(true);

        try {
            const allDataSourceIds = [
                ...(dataSourceId ? [dataSourceId] : []),
                ...uploadedFiles.map(f => f.dataSourceId),
            ];

            const res = await fetch("/api/bots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    websiteId: websiteId || null,
                    name: botName || "AI Assistant",
                    welcomeMessage,
                    primaryColor,
                    position,
                    model: "gpt-4.1-mini",
                    dataSourceIds: allDataSourceIds,
                }),
            });

            const data = await res.json();
            if (data.limitReached) {
                setLimitReached(true);
                return;
            }
            if (data.bot) {
                setBotId(data.bot.id);
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

                        <div
                            className="p-8 rounded-xl border-2 border-dashed border-edge hover:border-primary/40 text-center transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.docx,.txt,.md,.csv,.html,.htm"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            {uploadingFile ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <p className="text-[13px] text-fg-secondary">Processing files…</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-[14px] text-fg-secondary mb-1">Click to upload files</p>
                                    <p className="text-[12px] text-fg-muted">TXT, MD, CSV — max 10 MB per file</p>
                                </>
                            )}
                        </div>
                        {uploadedFiles.length > 0 && (
                            <div className="space-y-1.5">
                                {uploadedFiles.map(f => (
                                    <div key={f.dataSourceId} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                                        f.status === 'error' ? 'bg-danger/6 border-danger/20' :
                                        f.status === 'syncing' ? 'bg-warning/6 border-warning/20' :
                                        'bg-success/6 border-success/20'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            {f.status === 'syncing' && <div className="w-3 h-3 border border-warning border-t-transparent rounded-full animate-spin shrink-0" />}
                                            {f.status === 'indexed' && <svg className="w-3.5 h-3.5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                                            {f.status === 'error' && <svg className="w-3.5 h-3.5 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>}
                                            <span className="text-[13px] text-fg">{f.name}</span>
                                        </div>
                                        <span className="text-[11px] text-fg-secondary">
                                            {f.status === 'syncing' ? 'Indexing…' : f.status === 'error' ? 'Failed' : `${f.wordCount.toLocaleString()} words indexed`}
                                        </span>
                                    </div>
                                ))}
                                {uploadedFiles.some(f => f.status === 'syncing') && (
                                    <p className="text-[12px] text-warning/90 mt-2 flex items-center gap-1.5">
                                        <span>&#9888;&#xFE0F;</span>
                                        Files are indexing in the background — create your bot now, knowledge will be ready within 60 seconds.
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    if (url) setStep("crawl");
                                    else if (uploadedFiles.length > 0) setStep("customize");
                                }}
                                disabled={!url && uploadedFiles.length === 0}
                                className="px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {url ? "Next: Crawl Site" : "Next: Customize"}
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
                            <div className="p-6 rounded-xl border border-edge bg-bg/40 text-center space-y-4">
                                <p className="text-[14px] font-medium text-fg">Ready to crawl</p>
                                <p className="text-[13px] text-fg-secondary">Target: <span className="text-fg">{url}</span></p>
                                {/* Deep Crawl toggle */}
                                <div className="flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => setCrawlMode(crawlMode === 'auto' ? 'spa' : 'auto')}
                                        className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${crawlMode === 'spa' ? 'bg-primary' : 'bg-edge-light'}`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${crawlMode === 'spa' ? 'left-4' : 'left-0.5'}`} />
                                    </button>
                                    <div className="text-left">
                                        <p className="text-[13px] font-medium text-fg">Deep Crawl (SPA / React sites)</p>
                                        <p className="text-[11px] text-fg-secondary">Uses Jina AI Reader to render JS-heavy pages. Slower but captures content Cheerio misses.</p>
                                    </div>
                                </div>
                                <button onClick={handleCrawl} className="px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors">Start Crawling</button>
                            </div>
                        )}

                        {crawling && (
                            <div className="p-8 rounded-xl border border-primary/20 bg-primary/4 text-center space-y-3">
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
                                <div className="space-y-1.5 max-h-60 overflow-y-auto">
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
                                <div className="p-3 rounded-lg bg-success/6 border border-success/20">
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
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* ─── Form ─────────────────────────── */}
                        <div className="flex-1 space-y-6">
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

                        {/* Bot limit reached — show upgrade CTA */}
                        {limitReached && (
                            <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 flex items-start gap-3">
                                <svg className="w-4 h-4 text-warning mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.109-12.374c.866-1.5 3.032-1.5 3.898 0l7.598 12.374z"/></svg>
                                <div className="flex-1">
                                    <p className="text-[13px] font-semibold text-warning">Bot limit reached</p>
                                    <p className="text-[12px] text-fg-secondary mt-0.5">You&apos;ve used all bot slots on your current plan. Upgrade to create more bots.</p>
                                </div>
                                <Link href="/dashboard/billing" className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-white text-[12px] font-medium hover:bg-primary-hover transition-colors">Upgrade →</Link>
                            </div>
                        )}
                        </div>{/* end form */}

                        {/* ─── Live Preview ──────────────────── */}
                        <div className="hidden lg:flex flex-col items-center gap-3 w-75 shrink-0">
                            <p className="text-[11px] font-medium text-fg-muted uppercase tracking-widest">Live Preview</p>
                            {/* Browser chrome mockup */}
                            <div className="relative w-full h-115 rounded-2xl border border-edge bg-[#0f1117] overflow-hidden shadow-2xl">
                                {/* Title bar */}
                                <div className="flex items-center gap-1.5 px-3 h-8 bg-[#1a1d27] border-b border-edge/60">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                                    <div className="flex-1 mx-3 h-4 rounded bg-edge/60 flex items-center px-2">
                                        <span className="text-[9px] text-fg-muted truncate">yourwebsite.com</span>
                                    </div>
                                </div>
                                {/* Page content (faint lines) */}
                                <div className="p-4 space-y-2 opacity-30">
                                    {[80,60,70,40,65,50].map((w,i) => (
                                        <div key={i} className="h-2 rounded bg-fg/20" style={{ width: `${w}%` }} />
                                    ))}
                                </div>
                                {/* Widget */}
                                <div
                                    className="absolute bottom-4 flex flex-col items-end gap-2"
                                    style={{ [position === 'right' ? 'right' : 'left']: '12px' }}
                                >
                                    {/* Chat window */}
                                    <div className="w-60 rounded-2xl shadow-2xl border border-edge/60 overflow-hidden bg-[#0f1117]">
                                        {/* Header */}
                                        <div className="px-3 py-2.5 flex items-center justify-between" style={{ background: primaryColor }}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2a7 7 0 0 1 7 7v1a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/><path d="M8 16s1.5 2 4 2 4-2 4-2"/></svg>
                                                </div>
                                                <span className="text-white text-[12px] font-semibold truncate max-w-35">{botName || 'AI Assistant'}</span>
                                            </div>
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                                        </div>
                                        {/* Messages */}
                                        <div className="p-3 space-y-2.5 min-h-35">
                                            {/* Bot message */}
                                            <div className="flex gap-2 items-start">
                                                <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center" style={{ background: primaryColor }}>
                                                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2a7 7 0 0 1 7 7v1a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/></svg>
                                                </div>
                                                <div className="rounded-xl rounded-tl-none px-2.5 py-1.5 bg-[#1a1d27] border border-edge/40 text-[10px] text-fg/80 max-w-42 leading-relaxed">
                                                    {welcomeMessage || 'Hi! How can I help you today?'}
                                                </div>
                                            </div>
                                            {/* Sample user message */}
                                            <div className="flex justify-end">
                                                <div className="rounded-xl rounded-tr-none px-2.5 py-1.5 text-white text-[10px] max-w-32 leading-relaxed" style={{ background: primaryColor }}>
                                                    What can you help me with?
                                                </div>
                                            </div>
                                            {/* Typing indicator */}
                                            <div className="flex gap-2 items-end">
                                                <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center" style={{ background: primaryColor }}>
                                                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2a7 7 0 0 1 7 7v1a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/></svg>
                                                </div>
                                                <div className="rounded-xl rounded-tl-none px-3 py-2 bg-[#1a1d27] border border-edge/40 flex gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-fg-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-1.5 h-1.5 rounded-full bg-fg-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-1.5 h-1.5 rounded-full bg-fg-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Input */}
                                        <div className="px-3 pb-3">
                                            <div className="flex items-center gap-2 rounded-lg bg-[#1a1d27] border border-edge/40 px-2.5 py-1.5">
                                                <span className="flex-1 text-[10px] text-fg-muted">Ask a question...</span>
                                                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: primaryColor }}>
                                                    <svg viewBox="0 0 24 24" width="10" height="10" fill="white"><path d="M2 12L22 2l-10 20-2-8-8-2z"/></svg>
                                                </div>
                                            </div>
                                            <p className="text-[8px] text-fg-muted/60 text-center mt-1.5">Powered by PageCortex</p>
                                        </div>
                                    </div>
                                    {/* Launcher button */}
                                    <div
                                        className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg cursor-pointer self-end"
                                        style={{ background: primaryColor }}
                                    >
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[11px] text-fg-muted text-center">This is how your bot appears on your website</p>
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
                                    onClick={async () => {
                                        const code = `<script\n  src="${process.env.NEXT_PUBLIC_APP_URL || 'https://pagecortex.vercel.app'}/widget.js"\n  data-bot-id="${botId}"\n  data-color="${primaryColor}"\n  data-position="${position}"\n  async\n><\/script>`;
                                        try { await navigator.clipboard.writeText(code); } catch { const el = document.createElement('textarea'); el.value = code; el.style.position = 'fixed'; el.style.opacity = '0'; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); }
                                    }}
                                    className="px-3 py-1 rounded-md bg-primary/10 text-primary text-[12px] font-medium hover:bg-primary/20 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                            <pre className="p-4 text-[13px] text-fg/80 font-mono overflow-x-auto">
{`<script
  src="https://pagecortex.vercel.app/widget.js"
  data-bot-id="${botId || 'bot_xxxxx'}"
  data-color="${primaryColor}"
  data-position="${position}"
  async
></script>`}
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
