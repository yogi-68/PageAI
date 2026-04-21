'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface DocPage { id: string; url: string; title: string; website_id: string; created_at: string; }
interface Website { id: string; url: string; pages: DocPage[]; dataSourceId: string | null; chunkCount: number; status: string; }
interface UploadedFile { name: string; dataSourceId: string; wordCount: number; status: 'syncing' | 'indexed' | 'error'; }

const PLAN_LIMITS: Record<string, { pagesIndexed: number; chatbots: number; messagesPerMonth: number; storageMB: number; name: string }> = {
  free:       { name: 'Free',    pagesIndexed: 200,   chatbots: 1,  messagesPerMonth: 100,   storageMB: 25    },
  starter:    { name: 'Starter', pagesIndexed: 1000,  chatbots: 1,  messagesPerMonth: 4000,  storageMB: 250   },
  growth:     { name: 'Growth',  pagesIndexed: 10000, chatbots: 3,  messagesPerMonth: 10000, storageMB: 2048  },
  scale:      { name: 'Scale',   pagesIndexed: 50000, chatbots: 10, messagesPerMonth: 40000, storageMB: 10240 },
  enterprise: { name: 'Enterprise', pagesIndexed: -1, chatbots: -1, messagesPerMonth: -1,   storageMB: -1    },
};

function UsageBar({ used, limit, label, unit }: { used: number; limit: number; label: string; unit: string }) {
  const pct = limit <= 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isUnlimited = limit <= 0;
  const isHigh = pct >= 90;
  const isMid = pct >= 70;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] font-medium text-fg-secondary">{label}</span>
        <span className={`text-[12px] font-semibold ${isHigh ? 'text-danger' : isMid ? 'text-warning' : 'text-fg'}`}>
          {isUnlimited ? '∞ unlimited' : `${used.toLocaleString()} / ${limit.toLocaleString()} ${unit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 rounded-full bg-edge overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isHigh ? 'bg-danger' : isMid ? 'bg-warning' : 'bg-primary'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function KnowledgePage() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPages: 0, totalWebsites: 0 });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [recrawling, setRecrawling] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<{ plan: string; monthly_message_count: number; monthly_message_limit: number } | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('plan, monthly_message_count, monthly_message_limit').eq('id', user.id).single();
    if (data) setProfile(data as any);
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const { data: ws } = await supabase.from('websites').select('id, url, data_source_id, status').eq('user_id', user.id);
    const { data: pages } = await supabase.from('documents').select('id, url, title, website_id, created_at').eq('user_id', user.id);
    // Fetch chunk counts per data_source so we can detect un-indexed sites
    const { data: chunkCounts } = await supabase
      .from('chunks')
      .select('data_source_id')
      .eq('user_id', user.id);

    const dsChunkMap: Record<string, number> = {};
    (chunkCounts || []).forEach((c: any) => {
      dsChunkMap[c.data_source_id] = (dsChunkMap[c.data_source_id] || 0) + 1;
    });

    const siteMap: Record<string, Website> = {};
    (ws || []).forEach((w: any) => {
      siteMap[w.id] = {
        ...w,
        pages: [],
        dataSourceId: w.data_source_id || null,
        chunkCount: w.data_source_id ? (dsChunkMap[w.data_source_id] || 0) : 0,
        status: w.status || 'indexed',
      };
    });
    (pages || []).forEach((p: any) => { if (siteMap[p.website_id]) siteMap[p.website_id].pages.push(p); });

    const result = Object.values(siteMap);
    setWebsites(result);
    setStats({ totalPages: (pages || []).length, totalWebsites: result.length });
    setExpanded(prev => prev.size === 0 && result.length > 0 ? new Set([result[0].id]) : prev);
  };

  useEffect(() => {
    if (!user) return;
    loadData().finally(() => setLoading(false));
    refreshProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggle = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!user || !files.length) return;
    setUploadingFile(true);
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { toast.error(`"${file.name}" exceeds 10 MB — skipped`); continue; }
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      const isDocx = file.name.toLowerCase().endsWith('.docx');
      const isBinaryFile = isPdf || isDocx;
      try {
        let body: Record<string, unknown>;
        if (isBinaryFile) {
          // Binary files must be sent as base64 — text extraction happens server-side
          const arrayBuffer = await file.arrayBuffer();
          const uint8 = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
          const contentBase64 = btoa(binary);
          body = { fileName: file.name, contentBase64, userId: user.id };
        } else {
          const content: string = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
          });
          body = { fileName: file.name, content, userId: user.id };
        }
        const res = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (res.status === 403 && data.planLimitReached) {
          toast.error(`Plan limit reached: ${data.error}`, { duration: 6000 });
          await refreshProfile();
          break; // stop processing remaining files
        }
        if (res.status === 422) {
          toast.error(`"${file.name}" — ${data.error || 'File could not be parsed. Check it is text-based (not a scanned image).'}`, { duration: 7000 });
          continue;
        }
        if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
        const entry: UploadedFile = { name: file.name, dataSourceId: data.dataSourceId, wordCount: data.wordCount, status: data.status === 'syncing' ? 'syncing' : 'indexed' };
        setUploadedFiles(prev => [...prev, entry]);
        toast.success(`"${file.name}" uploaded successfully`);
        if (data.status === 'syncing') {
          const pollId = data.dataSourceId;
          (async () => {
            for (let t = 0; t < 12; t++) {
              await new Promise(r => setTimeout(r, 5000));
              try {
                const sr = await fetch(`/api/ingest?dataSourceId=${pollId}`);
                const sd = await sr.json();
                if (sd.status === 'indexed' || sd.status === 'error') {
                  setUploadedFiles(prev => prev.map(f => f.dataSourceId === pollId ? { ...f, status: sd.status } : f));
                  if (sd.status === 'indexed') loadData();
                  break;
                }
              } catch { break; }
            }
          })();
        }
      } catch (err: any) {
        toast.error(`Failed to process "${file.name}": ${err.message}`);
      }
    }
    setUploadingFile(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRecrawl = async (site: Website) => {
    if (!user) return;
    setRecrawling(site.id);
    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: site.url, userId: user.id, maxPages: 50 }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Re-crawl failed');
      toast.success(`Re-crawled ${data.pages?.length || 0} pages from ${site.url.replace(/https?:\/\//, '')}`);
      await loadData();
    } catch (err: any) {
      toast.error(`Re-crawl failed: ${err.message}`);
    } finally {
      setRecrawling(null);
    }
  };

  const filtered = websites.filter(w =>
    w.url.toLowerCase().includes(search.toLowerCase()) ||
    w.pages.some(p => p.url.toLowerCase().includes(search.toLowerCase()) || p.title?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const planId = profile?.plan || 'free';
  const planLimits = PLAN_LIMITS[planId] || PLAN_LIMITS.free;
  const pagesUsed = stats.totalPages;
  const pagesLimit = planLimits.pagesIndexed;
  const isAtPageLimit = pagesLimit > 0 && pagesUsed >= pagesLimit;
  const isNearPageLimit = pagesLimit > 0 && pagesUsed >= Math.floor(pagesLimit * 0.9) && !isAtPageLimit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Knowledge Base</h1>
          <p className="text-[14px] text-fg-secondary mt-0.5">Crawled pages and uploaded files your bots use to answer questions</p>
        </div>
        <button
          onClick={() => !isAtPageLimit && fileInputRef.current?.click()}
          disabled={uploadingFile || isAtPageLimit}
          title={isAtPageLimit ? `You've reached your ${pagesLimit.toLocaleString()} page limit. Upgrade your plan to add more.` : undefined}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50 ${isAtPageLimit ? 'bg-edge/60 text-fg-muted cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-hover'}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          {isAtPageLimit ? 'Limit Reached' : uploadingFile ? 'Uploading…' : 'Upload Files'}
        </button>
        <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.txt,.md,.csv,.html,.htm" className="hidden" onChange={handleFileSelect} />
      </div>

      {/* Plan limit banners */}
      {isAtPageLimit && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-danger/30 bg-danger/5">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
            <p className="text-[13px] text-danger font-medium">
              You&apos;ve used all {pagesLimit.toLocaleString()} pages on your <span className="font-bold">{planLimits.name}</span> plan. Upload and crawling are disabled.
            </p>
          </div>
          <Link href="/dashboard/billing" className="shrink-0 px-3 py-1.5 rounded-lg bg-danger text-white text-[12px] font-semibold hover:bg-danger/90 transition-colors">
            Upgrade Plan
          </Link>
        </div>
      )}
      {isNearPageLimit && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-warning/30 bg-warning/5">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-warning shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/></svg>
            <p className="text-[13px] text-warning font-medium">
              You&apos;re using <span className="font-bold">{pagesUsed.toLocaleString()} of {pagesLimit.toLocaleString()}</span> pages on your {planLimits.name} plan. Upgrade before you run out.
            </p>
          </div>
          <Link href="/dashboard/billing" className="shrink-0 px-3 py-1.5 rounded-lg bg-warning text-[#1a1200] text-[12px] font-semibold hover:bg-warning/90 transition-colors">
            Upgrade
          </Link>
        </div>
      )}

      {/* Upload info */}
      <div className="p-4 rounded-xl border border-edge bg-surface/40 space-y-3">
        <div>
          <h2 className="text-[13px] font-semibold text-fg">Supported file types</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { ext: 'PDF', note: 'Text-based PDFs only (not scanned images)' },
              { ext: 'DOCX', note: 'Word documents' },
              { ext: 'TXT', note: 'Plain text files' },
              { ext: 'MD', note: 'Markdown files' },
              { ext: 'CSV', note: 'Spreadsheet data' },
              { ext: 'HTML', note: 'Web page files' },
            ].map(f => (
              <span key={f.ext} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-edge text-[12px] text-fg-secondary" title={f.note}>
                <span className="font-mono font-bold text-primary text-[11px]">.{f.ext.toLowerCase()}</span>
                <span>{f.note}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="border-t border-edge pt-3">
          <h2 className="text-[13px] font-semibold text-fg">How website crawling works</h2>
          <p className="text-[12px] text-fg-secondary mt-1 leading-relaxed">
            PageAI uses <strong>Cheerio</strong> (a fast HTML parser) to crawl your website. It fetches each page, strips navigation/scripts/styles, and extracts the readable text content. That text is split into overlapping chunks, embedded with OpenAI, and stored in a vector database (Supabase pgvector). When a visitor asks a question, the most relevant chunks are retrieved and passed to the AI to generate an answer.
          </p>
          <p className="text-[12px] text-fg-secondary mt-1.5">✅ SPA / JavaScript-heavy sites supported — PageAI automatically falls back to Jina AI Reader for sites where static HTML returns minimal content.</p>
        </div>
      </div>

      {/* Plan usage */}
      {(() => {
        const planId = profile?.plan || 'free';
        const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.free;
        const msgUsed = profile?.monthly_message_count ?? 0;
        const msgLimit = profile?.monthly_message_limit ?? limits.messagesPerMonth;
        const pagesUsed = stats.totalPages;
        const pagesLimit = limits.pagesIndexed;
        const pagesPct = pagesLimit > 0 ? Math.min(100, Math.round((pagesUsed / pagesLimit) * 100)) : 0;
        const isNearPageLimit = pagesLimit > 0 && pagesPct >= 80;
        return (
          <div className="p-4 rounded-xl border border-edge bg-surface/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-fg">Plan Usage</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">{limits.name}</span>
              </div>
              <Link href="/dashboard/billing" className="text-[12px] text-primary hover:text-primary-hover font-medium transition-colors">
                {isNearPageLimit ? '⚠ Upgrade plan →' : 'Manage plan →'}
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <UsageBar used={pagesUsed} limit={pagesLimit} label="Pages Indexed" unit="pages" />
              <UsageBar used={msgUsed} limit={msgLimit} label="Messages This Month" unit="msgs" />
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-fg-secondary">Chatbots</span>
                  <span className="text-[12px] font-semibold text-fg">
                    {limits.chatbots <= 0 ? '∞ unlimited' : `max ${limits.chatbots}`}
                  </span>
                </div>
                <div className="text-[11.5px] text-fg-muted">{stats.totalWebsites} website{stats.totalWebsites !== 1 ? 's' : ''} connected</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-fg-secondary">Storage</span>
                  <span className="text-[12px] font-semibold text-fg">
                    {limits.storageMB <= 0 ? '∞ unlimited' : limits.storageMB >= 1024 ? `${limits.storageMB / 1024} GB` : `${limits.storageMB} MB`}
                  </span>
                </div>
                <div className="text-[11.5px] text-fg-muted">Knowledge base limit</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Recently uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[13px] font-semibold text-fg">Recently Uploaded</h2>
          {uploadedFiles.map(f => (
            <div key={f.dataSourceId} className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${
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
                {f.status === 'syncing' ? 'Indexing…' : f.status === 'error' ? 'Failed' : `${f.wordCount.toLocaleString()} words`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pages or websites..." className="w-full max-w-100 px-4 py-2.5 rounded-lg border border-edge bg-bg/60 text-[13px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl border border-edge bg-surface/40 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
          </div>
          <h2 className="text-[17px] font-semibold text-fg mb-1">No knowledge base yet</h2>
          <p className="text-[13px] text-fg-secondary mb-3 max-w-95 mx-auto">Create a bot and crawl a website, or upload TXT / MD / CSV files using the button above.</p>
          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors">
            Upload Files Now
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(site => {
            const needsReindex = site.pages.length > 0 && site.chunkCount === 0;
            const hasError = site.status === 'error';
            return (
            <div key={site.id} className={`rounded-xl border overflow-hidden ${needsReindex || hasError ? 'border-warning/40 bg-warning/5' : 'border-edge bg-surface/40'}`}>
              <div className="flex items-center gap-3 px-5 py-3.5">
                <button onClick={() => toggle(site.id)} className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity min-w-0">
                  <svg className={`w-3.5 h-3.5 text-fg-muted transition-transform shrink-0 ${expanded.has(site.id) ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                  <span className="text-[14px] font-medium text-fg truncate">{site.url.replace(/https?:\/\//, '')}</span>
                  <span className="text-[12px] text-fg-muted shrink-0">— {site.pages.length} page{site.pages.length !== 1 ? 's' : ''}</span>
                  {needsReindex || hasError ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/20 text-warning text-[10px] font-semibold uppercase tracking-wide">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/></svg>
                      Not indexed — Re-crawl
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-semibold">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      {site.chunkCount} chunks
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleRecrawl(site)}
                  disabled={recrawling === site.id}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all disabled:opacity-50 ${needsReindex || hasError ? 'border-warning/40 text-warning hover:bg-warning/10' : 'border-edge text-fg-secondary hover:text-fg hover:border-edge-light'}`}
                >
                  {recrawling === site.id ? (
                    <><div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /><span>Re-crawling…</span></>
                  ) : (
                    <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg><span>{needsReindex || hasError ? 'Re-index Now' : 'Re-crawl'}</span></>
                  )}
                </button>
              </div>
              {(needsReindex || hasError) && (
                <div className="px-5 pb-3 flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/></svg>
                  <p className="text-[12px] text-warning/90">
                    This website has {site.pages.length} page{site.pages.length !== 1 ? 's' : ''} but no AI embeddings. Your bot cannot answer questions from it yet.
                    Click <strong>Re-index Now</strong> to fix this.
                  </p>
                </div>
              )}
              {expanded.has(site.id) && (
                <div className="border-t border-edge divide-y divide-edge">
                  {site.pages.map((page: DocPage) => (
                    <div key={page.id} className="flex items-center justify-between px-5 py-2.5 pl-12 hover:bg-surface-elevated/20 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-fg truncate">{page.title || page.url}</p>
                        <p className="text-[11px] text-fg-muted truncate">{page.url}</p>
                      </div>
                      <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:text-primary-hover transition-colors shrink-0 ml-3">Open</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
