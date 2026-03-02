'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
    BookOpen, Globe, FileText, Search, Loader2,
    Clock, Hash, ChevronDown, ChevronRight,
} from 'lucide-react';

interface PageItem {
    id: string;
    url: string;
    title: string | null;
    word_count: number;
    status: string;
    last_indexed_at: string | null;
}

interface WebsiteGroup {
    id: string;
    name: string | null;
    url: string;
    pages: PageItem[];
}

export default function KnowledgePage() {
    const { user } = useAuth();
    const [groups, setGroups] = useState<WebsiteGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user) return;

        async function fetchKnowledge() {
            try {
                const { data: websites } = await supabase
                    .from('websites')
                    .select('id, name, url')
                    .eq('user_id', user!.id)
                    .order('created_at', { ascending: false });

                if (!websites || websites.length === 0) {
                    setLoading(false);
                    return;
                }

                const websiteGroups: WebsiteGroup[] = [];
                for (const site of websites) {
                    const { data: pages } = await supabase
                        .from('pages')
                        .select('id, url, title, word_count, status, last_indexed_at')
                        .eq('website_id', site.id)
                        .order('word_count', { ascending: false });

                    websiteGroups.push({
                        ...site,
                        pages: pages || [],
                    });
                }

                setGroups(websiteGroups);
                // Expand first site by default
                if (websiteGroups.length > 0) {
                    setExpandedSites(new Set([websiteGroups[0].id]));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchKnowledge();
    }, [user]);

    const toggleSite = (id: string) => {
        setExpandedSites(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const totalPages = groups.reduce((sum, g) => sum + g.pages.length, 0);
    const totalWords = groups.reduce((sum, g) => sum + g.pages.reduce((s, p) => s + p.word_count, 0), 0);

    const filteredGroups = searchQuery
        ? groups.map(g => ({
            ...g,
            pages: g.pages.filter(p =>
                p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.url.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        })).filter(g => g.pages.length > 0)
        : groups;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-500)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Knowledge Base</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                    View all indexed content powering your AI chatbots
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="card !p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                            <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xl font-bold">{groups.length}</p>
                            <p className="text-xs text-[var(--text-muted)]">Websites</p>
                        </div>
                    </div>
                </div>
                <div className="card !p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center shadow-lg">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xl font-bold">{totalPages}</p>
                            <p className="text-xs text-[var(--text-muted)]">Pages Indexed</p>
                        </div>
                    </div>
                </div>
                <div className="card !p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg">
                            <Hash className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xl font-bold">{totalWords.toLocaleString()}</p>
                            <p className="text-xs text-[var(--text-muted)]">Total Words</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search pages by title or URL..."
                    className="input !pl-10"
                />
            </div>

            {/* Content */}
            {filteredGroups.length === 0 ? (
                <div className="card text-center py-16">
                    <BookOpen className="w-12 h-12 text-[var(--text-dim)] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        {searchQuery ? 'No pages found' : 'No knowledge indexed yet'}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
                        {searchQuery
                            ? 'Try a different search query.'
                            : 'Create a bot and crawl a website to start building your knowledge base.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredGroups.map((group) => (
                        <div key={group.id} className="card !p-0 overflow-hidden">
                            <button
                                onClick={() => toggleSite(group.id)}
                                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-hover)] transition-colors"
                            >
                                {expandedSites.has(group.id) ? (
                                    <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                                )}
                                <Globe className="w-5 h-5 text-[var(--primary-400)]" />
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-semibold">{group.name || new URL(group.url).hostname}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{group.pages.length} pages · {group.pages.reduce((s, p) => s + p.word_count, 0).toLocaleString()} words</p>
                                </div>
                            </button>

                            {expandedSites.has(group.id) && (
                                <div className="border-t border-[var(--border-subtle)]">
                                    {group.pages.map((page) => (
                                        <div key={page.id} className="flex items-center gap-4 px-5 py-3 pl-14 hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-subtle)] last:border-0">
                                            <FileText className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{page.title || page.url}</p>
                                                <p className="text-xs text-[var(--text-muted)] truncate">{page.url}</p>
                                            </div>
                                            <div className="hidden sm:flex items-center gap-4">
                                                <span className="text-xs text-[var(--text-muted)]">{page.word_count.toLocaleString()} words</span>
                                                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {page.last_indexed_at ? new Date(page.last_indexed_at).toLocaleDateString() : '—'}
                                                </span>
                                            </div>
                                            <div className={`badge text-[10px] ${page.status === 'indexed' ? 'badge-emerald' : 'badge-amber'}`}>
                                                {page.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
