import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Reference — REST API for AI Chatbot Integration',
  description: 'PageCortex REST API reference. Embed bots, stream AI chat responses, and query your chatbot programmatically. Full endpoint documentation with code examples.',
  alternates: { canonical: 'https://pagecortex.com/api-reference' },
  openGraph: {
    title: 'PageCortex API Reference — AI Chatbot REST API',
    description: 'Full REST API documentation for integrating PageCortex AI chatbots into your app.',
    url: 'https://pagecortex.com/api-reference',
    type: 'article',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PageCortex API Reference' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PageCortex API Reference',
    description: 'Full REST API documentation for PageCortex AI chatbot integration.',
    images: ['/og-image.png'],
  },
};

const endpoints = [
  {
    method: 'POST',
    path: '/api/chat',
    desc: 'Send a message to a bot and receive an AI answer. Supports streaming via SSE.',
    badge: 'Public',
    badgeColor: 'bg-success/10 text-success',
    body: `{
  "query": "What is your return policy?",
  "botId": "bot_abc123",
  "stream": false,
  "conversationId": "conv_xyz",   // optional
  "visitorId": "visitor_123",      // optional
  "pageUrl": "https://example.com" // optional
}`,
    response: `{
  "answer": "Our return policy allows returns within 30 days...",
  "sources": [{ "url": "https://example.com/returns", "title": "Returns" }],
  "confidence": 0.92,
  "model": "gpt-4.1-mini",
  "responseTimeMs": 850
}`,
  },
  {
    method: 'GET',
    path: '/api/bots?id={botId}',
    desc: 'Fetch public bot configuration — name, color, welcome message.',
    badge: 'Public',
    badgeColor: 'bg-success/10 text-success',
    body: null,
    response: `{
  "id": "bot_abc123",
  "name": "Support Assistant",
  "primary_color": "#6366f1",
  "welcome_message": "Hi! How can I help?",
  "is_active": true
}`,
  },
  {
    method: 'POST',
    path: '/api/bots',
    desc: 'Create a new bot for a user.',
    badge: 'Authenticated',
    badgeColor: 'bg-warning/10 text-warning',
    body: `{
  "userId": "user_abc",
  "name": "My Bot",
  "model": "gpt-4.1-mini",
  "systemPrompt": "You are a helpful assistant...",
  "welcomeMessage": "Hi! Ask me anything.",
  "primaryColor": "#6366f1"
}`,
    response: `{ "bot": { "id": "bot_xyz", "name": "My Bot", ... } }`,
  },
  {
    method: 'GET',
    path: '/api/dashboard/stats?userId={userId}',
    desc: 'Fetch dashboard stats — bot count, conversations, plan usage.',
    badge: 'Authenticated',
    badgeColor: 'bg-warning/10 text-warning',
    body: null,
    response: `{
  "stats": { "activeBots": 3, "totalConversations": 412, "resolutionRate": "87.4" },
  "usage": { "plan": "growth", "monthly_message_count": 1420, "monthly_message_limit": 10000 },
  "bots": [...]
}`,
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-success/10 text-success',
  POST: 'bg-primary/10 text-primary',
  DELETE: 'bg-danger/10 text-danger',
  PATCH: 'bg-warning/10 text-warning',
};

export default function ApiReferencePage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar />
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-[820px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[13px] font-medium mb-6">API Reference</div>
          <h1 className="text-[42px] md:text-[52px] font-bold tracking-[-0.03em] leading-[1.1] mb-4">REST API</h1>
          <p className="text-[17px] text-fg-secondary leading-relaxed mb-4">Base URL: <code className="text-primary bg-surface px-2 py-0.5 rounded-md text-[14px]">https://pagecortex.vercel.app</code></p>
          <p className="text-[15px] text-fg-secondary mb-12">All requests accept and return JSON. Authenticated endpoints require a valid Supabase session token in the <code className="text-fg text-[13px] bg-surface px-1.5 py-0.5 rounded">Authorization: Bearer {'<token>'}</code> header.</p>

          <div className="space-y-8">
            {endpoints.map(ep => (
              <div key={ep.path} className="rounded-xl border border-edge overflow-hidden">
                <div className="px-5 py-4 bg-surface/60 flex flex-wrap items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-md text-[12px] font-bold ${methodColors[ep.method] || 'bg-fg-muted/10 text-fg-muted'}`}>{ep.method}</span>
                  <code className="text-[14px] font-mono text-fg">{ep.path}</code>
                  <span className={`ml-auto px-2 py-0.5 rounded-md text-[11px] font-medium ${ep.badgeColor}`}>{ep.badge}</span>
                </div>
                <div className="px-5 py-4 border-t border-edge">
                  <p className="text-[14px] text-fg-secondary mb-4">{ep.desc}</p>
                  {ep.body && (
                    <div className="mb-3">
                      <p className="text-[12px] font-semibold text-fg-muted uppercase tracking-wide mb-2">Request body</p>
                      <pre className="p-4 rounded-xl bg-[#0d0f14] text-[12.5px] text-[#a5b4fc] font-mono overflow-x-auto border border-white/5">{ep.body}</pre>
                    </div>
                  )}
                  <div>
                    <p className="text-[12px] font-semibold text-fg-muted uppercase tracking-wide mb-2">Response</p>
                    <pre className="p-4 rounded-xl bg-[#0d0f14] text-[12.5px] text-[#86efac] font-mono overflow-x-auto border border-white/5">{ep.response}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-5 rounded-xl border border-edge bg-surface/30">
            <p className="text-[14px] font-semibold text-fg mb-2">Rate limits</p>
            <p className="text-[13px] text-fg-secondary">The <code className="text-fg">/api/chat</code> endpoint is rate-limited to <strong className="text-fg">20 requests per minute</strong> per IP. Exceeding this returns HTTP 429 with a <code className="text-fg">retryAfter</code> field in milliseconds.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
