'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface DocPage { id: string; url: string; title: string; website_id: string; created_at: string; }
interface Website { id: string; url: string; pages: DocPage[]; }

export default function KnowledgePage() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPages: 0, totalWebsites: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: ws } = await supabase.from('websites').select('id, url').eq('user_id', user.id);
      const { data: pages } = await supabase.from('documents').select('id, url, title, website_id, created_at').eq('user_id', user.id);

      const siteMap: Record<string, Website> = {};
      (ws || []).forEach(w => { siteMap[w.id] = { ...w, pages: [] }; });
      (pages || []).forEach(p => { if (siteMap[p.website_id]) siteMap[p.website_id].pages.push(p); });

      const result = Object.values(siteMap);
      setWebsites(result);
      setStats({ totalPages: (pages || []).length, totalWebsites: result.length });
      if (result.length > 0) setExpanded(new Set([result[0].id]));
      setLoading(false);
    })();
  }, [user]);

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = websites.filter(w =>
    w.url.toLowerCase().includes(search.toLowerCase()) ||
    w.pages.some(p => p.url.toLowerCase().includes(search.toLowerCase()) || p.title?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Knowledge Base</h1>
        <p className="text-[14px] text-fg-secondary mt-0.5">Crawled pages your bots use to answer questions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 max-w-[400px]">
        <div className="p-4 rounded-xl border border-edge bg-surface/40">
          <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">Total Pages</span>
          <p className="text-[24px] font-bold text-fg mt-1">{stats.totalPages}</p>
        </div>
        <div className="p-4 rounded-xl border border-edge bg-surface/40">
          <span className="text-[12px] font-medium text-fg-muted uppercase tracking-wide">Websites</span>
          <p className="text-[24px] font-bold text-fg mt-1">{stats.totalWebsites}</p>
        </div>
      </div>

      {/* Search */}
      <div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pages or websites..." className="w-full max-w-[400px] px-4 py-2.5 rounded-lg border border-edge bg-bg/60 text-[13px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl border border-edge bg-surface/40 text-center">
          <h2 className="text-[17px] font-semibold text-fg mb-1">No knowledge yet</h2>
          <p className="text-[13px] text-fg-secondary max-w-[380px] mx-auto">Add a website and crawl it to build your knowledge base</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(site => (
            <div key={site.id} className="rounded-xl border border-edge bg-surface/40 overflow-hidden">
              <button onClick={() => toggle(site.id)} className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-surface-elevated/20 transition-colors">
                <svg className={`w-3.5 h-3.5 text-fg-muted transition-transform ${expanded.has(site.id) ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                <span className="text-[14px] font-medium text-fg">{site.url.replace(/https?:\/\//, '')}</span>
                <span className="text-[12px] text-fg-muted">— {site.pages.length} page{site.pages.length !== 1 ? 's' : ''}</span>
              </button>
              {expanded.has(site.id) && (
                <div className="border-t border-edge divide-y divide-edge">
                  {site.pages.map(page => (
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
          ))}
        </div>
      )}
    </div>
  );
}
