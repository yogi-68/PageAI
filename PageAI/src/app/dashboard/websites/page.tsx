'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Website {
  id: string;
  url: string;
  status: string;
  total_pages: number;
  last_crawled: string;
  created_at: string;
}

export default function WebsitesPage() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchWebsites = async () => {
    if (!user) return;
    const { data } = await supabase.from('websites').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setWebsites(data);
    setLoading(false);
  };

  useEffect(() => { fetchWebsites(); }, [user]);

  const reCrawl = async (websiteId: string, url: string) => {
    setCrawling(websiteId);
    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId, url, userId: user?.id }),
      });
      if (!res.ok) throw new Error('Crawl failed');
      toast.success('Re-crawl started');
      setTimeout(fetchWebsites, 3000);
    } catch (e: any) { toast.error(e.message); }
    setCrawling(null);
  };

  const deleteWebsite = async (websiteId: string) => {
    setDeleting(websiteId);
    try {
      await supabase.from('documents').delete().eq('website_id', websiteId);
      await supabase.from('websites').delete().eq('id', websiteId);
      setWebsites(prev => prev.filter(w => w.id !== websiteId));
      toast.success('Website deleted');
    } catch (e: any) { toast.error(e.message); }
    setDeleting(null);
  };

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Websites</h1>
          <p className="text-[14px] text-fg-secondary mt-0.5">{websites.length} website{websites.length !== 1 ? 's' : ''} connected</p>
        </div>
        <Link href="/dashboard/bots/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors">+ Add Website</Link>
      </div>

      {websites.length === 0 ? (
        <div className="p-12 rounded-xl border border-edge bg-surface/40 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3 12a8.959 8.959 0 01.284-2.253"/></svg>
          </div>
          <h2 className="text-[17px] font-semibold text-fg mb-1">Add your first website</h2>
          <p className="text-[13px] text-fg-secondary mb-2 max-w-[380px] mx-auto">PageAI crawls your website and indexes all its pages. Your bots then use this knowledge to answer visitor questions.</p>
          <p className="text-[12px] text-fg-muted mb-5">Tip: websites are added automatically when you create a new bot.</p>
          <Link href="/dashboard/bots/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors">+ Create Bot with Website</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {websites.map(site => (
            <div key={site.id} className="p-5 rounded-xl border border-edge bg-surface/40 hover:border-edge-light transition-all duration-200">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[15px] font-semibold text-fg">{site.url.replace(/https?:\/\//, '')}</h3>
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${site.status === 'active' ? 'bg-success/10 text-success' : site.status === 'crawling' ? 'bg-warning/10 text-warning' : 'bg-fg-muted/10 text-fg-muted'}`}>{site.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-fg-muted mb-3">
                <span>{site.total_pages || 0} pages</span>
                {site.last_crawled && (
                  <span>· Crawled {new Date(site.last_crawled).toLocaleDateString()}</span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-edge">
                <a href={site.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-edge text-[12px] text-fg-secondary hover:text-fg hover:border-edge-light transition-all">Open</a>
                <button
                  onClick={() => reCrawl(site.id, site.url)}
                  disabled={crawling === site.id}
                  className="px-3 py-1.5 rounded-lg border border-edge text-[12px] text-fg-secondary hover:text-fg hover:border-edge-light transition-all disabled:opacity-50"
                >
                  {crawling === site.id ? 'Crawling...' : 'Re-crawl'}
                </button>
                <button
                  onClick={() => deleteWebsite(site.id)}
                  disabled={deleting === site.id}
                  className="px-3 py-1.5 rounded-lg border border-danger/20 text-[12px] text-danger/70 hover:text-danger hover:border-danger/40 transition-all disabled:opacity-50"
                >
                  {deleting === site.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
