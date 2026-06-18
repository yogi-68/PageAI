'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function GrowthHubPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'seo' | 'social'>('seo');

  // Form states
  const [keyword, setKeyword] = useState('');
  const [redditPost, setRedditPost] = useState('');
  
  // UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (activeTab === 'seo' && !keyword.trim()) return setError('Please enter a keyword or objection.');
    if (activeTab === 'social' && !redditPost.trim()) return setError('Please paste the Reddit post text.');

    setIsGenerating(true);
    setError('');
    setGeneratedContent('');

    try {
      const response = await fetch('/api/dashboard/growth/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          input: activeTab === 'seo' ? keyword : redditPost,
          userId: user?.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate content');
      
      setGeneratedContent(data.content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-fg tracking-tight">Growth Hub</h1>
        <p className="text-sm text-fg-muted mt-1.5 leading-relaxed">
          Automate your top-of-funnel marketing. Generate SEO pages for common objections or craft native replies for Reddit and X using your website's knowledge base.
        </p>
      </div>

      <div className="bg-surface border border-edge rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-edge">
          <button
            onClick={() => setActiveTab('seo')}
            className={`flex-1 py-3.5 text-[13px] font-medium transition-colors ${
              activeTab === 'seo' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-fg-muted hover:text-fg hover:bg-bg/50'
            }`}
          >
            SEO Content Generator
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-3.5 text-[13px] font-medium transition-colors ${
              activeTab === 'social' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-fg-muted hover:text-fg hover:bg-bg/50'
            }`}
          >
            Social Reply Assistant
          </button>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === 'seo' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-fg mb-1.5">Target Objection / Keyword</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g., Why is chatbot integration so difficult?"
                  className="w-full bg-bg border border-edge rounded-lg px-4 py-2.5 text-[14px] text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <p className="text-[12px] text-fg-muted">
                PageCortex will write an SEO-optimized blog post answering this query using your trained knowledge base.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-fg mb-1.5">Reddit / X Post Text</label>
                <textarea
                  value={redditPost}
                  onChange={(e) => setRedditPost(e.target.value)}
                  placeholder="Paste the post text where someone is venting about a problem your product solves..."
                  rows={4}
                  className="w-full bg-bg border border-edge rounded-lg px-4 py-3 text-[14px] text-fg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <p className="text-[12px] text-fg-muted">
                PageCortex will generate a helpful, native-feeling reply that provides genuine value before introducing your product.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-[13px]">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-primary text-white text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>Generate {activeTab === 'seo' ? 'SEO Article' : 'Reply'}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {generatedContent && (
        <div className="bg-surface border border-edge rounded-xl shadow-sm overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-edge flex items-center justify-between bg-bg/50">
            <h3 className="text-[14px] font-semibold text-fg">Generated Content</h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedContent);
              }}
              className="text-[12px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
          <div className="p-6">
            <pre className="text-[13px] text-fg leading-relaxed whitespace-pre-wrap font-sans">
              {generatedContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
