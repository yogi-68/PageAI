'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
    Globe, RefreshCw, Trash2, Search, Plus,
    Loader2, Clock, FileText, CheckCircle, AlertCircle,
    ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface Website {
    id: string;
    url: string;
    name: string | null;
    status: string;
    pages_count: number;
    total_words: number;
    last_crawled_at: string | null;
    created_at: string;
}

export default function WebsitesPage() {
    const { user } = useAuth();
    const [websites, setWebsites] = useState<Website[]>([]);
    const [loading, setLoading] = useState(true);
    const [recrawling, setRecrawling] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        supabase
            .from('websites')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                setWebsites(data || []);
                setLoading(false);
            });
    }, [user]);

    const handleRecrawl = async (site: Website) => {
        if (!user) return;
        setRecrawling(site.id);
        try {
            const res = await fetch('/api/crawl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: site.url,
                    userId: user.id,
                    websiteId: site.id,
                    maxPages: 30,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setWebsites(prev =>
                    prev.map(w =>
                        w.id === site.id
                            ? { ...w, status: 'indexed', pages_count: data.stats.totalPages, total_words: data.stats.totalWords, last_crawled_at: new Date().toISOString() }
                            : w
                    )
                );
            }
        } catch (err) {
            console.error('Recrawl error:', err);
        } finally {
            setRecrawling(null);
        }
    };

    const handleDelete = async (siteId: string) => {
        if (!confirm('Delete this website and all its indexed data?')) return;
        await supabase.from('websites').delete().eq('id', siteId);
        setWebsites(prev => prev.filter(w => w.id !== siteId));
    };

    const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
        indexed: { icon: CheckCircle, color: 'text-emerald-400', label: 'Indexed' },
        crawling: { icon: RefreshCw, color: 'text-amber-400', label: 'Crawling' },
        pending: { icon: Clock, color: 'text-[var(--text-muted)]', label: 'Pending' },
        error: { icon: AlertCircle, color: 'text-rose-400', label: 'Error' },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-500)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Websites</h1>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">
                        Manage your crawled websites and indexed content
                    </p>
                </div>
                <Link href="/dashboard/bots/new" className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Add Website
                </Link>
            </div>

            {websites.length === 0 ? (
                <div className="card text-center py-16">
                    <Globe className="w-12 h-12 text-[var(--text-dim)] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No websites yet</h3>
                    <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto mb-6">
                        Add a website to crawl and index its content for your AI chatbots.
                    </p>
                    <Link href="/dashboard/bots/new" className="btn-primary">
                        <Plus className="w-4 h-4" />
                        Add Your First Website
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {websites.map((site) => {
                        const status = statusConfig[site.status] || statusConfig.pending;
                        const StatusIcon = status.icon;
                        return (
                            <div key={site.id} className="card !p-0">
                                <div className="flex items-center gap-5 p-5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg flex-shrink-0">
                                        <Globe className="w-6 h-6 text-white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-base font-semibold truncate">{site.name || new URL(site.url).hostname}</h3>
                                            <div className={`badge text-[10px] ${site.status === 'indexed' ? 'badge-emerald' : site.status === 'error' ? 'badge-rose' : 'badge-amber'}`}>
                                                <StatusIcon className={`w-3 h-3 ${status.color}`} />
                                                {status.label}
                                            </div>
                                        </div>
                                        <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--text-muted)] hover:text-[var(--primary-400)] flex items-center gap-1 transition-colors">
                                            {site.url}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>

                                    <div className="hidden md:flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-lg font-bold">{site.pages_count}</p>
                                            <p className="text-[10px] text-[var(--text-muted)]">Pages</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold">{(site.total_words || 0).toLocaleString()}</p>
                                            <p className="text-[10px] text-[var(--text-muted)]">Words</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-[var(--text-secondary)]">
                                                {site.last_crawled_at ? new Date(site.last_crawled_at).toLocaleDateString() : 'Never'}
                                            </p>
                                            <p className="text-[10px] text-[var(--text-muted)]">Last Crawled</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleRecrawl(site)}
                                            disabled={recrawling === site.id}
                                            className="btn-secondary !py-2 !px-3 text-xs"
                                            title="Re-crawl website"
                                        >
                                            {recrawling === site.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(site.id)}
                                            className="btn-secondary !py-2 !px-3 text-xs !text-rose-400 !border-rose-500/15 hover:!bg-rose-500/5"
                                            title="Delete website"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
