import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog — PageCortex',
  description: 'See what\'s new in PageCortex — product updates, new features, and improvements.',
};

const releases = [
  {
    version: '2.1.0',
    date: 'June 2025',
    tag: 'Major',
    tagColor: 'bg-primary/10 text-primary',
    changes: [
      'Per-plan AI model enforcement — Free/Starter plans use GPT-4.1 Mini; Growth/Scale/Enterprise unlock GPT-4.1 and smart auto-routing',
      'Live chat preview — test your bot directly from the dashboard before embedding',
      'Copy embed code — single-click copy with fallback for all browsers',
      'Admin client for dashboard stats — fixes plan display for premium users',
      'Bot management page — Overview, Settings, Knowledge, and Embed tabs in one place',
    ],
  },
  {
    version: '2.0.0',
    date: 'May 2025',
    tag: 'Major',
    tagColor: 'bg-primary/10 text-primary',
    changes: [
      'Per-user payment mode: developer account uses Dodo sandbox; all other users route to live payments',
      'Dodo Payments integration — Starter, Growth, Scale, Enterprise subscriptions live',
      'Add-on message packs (1K, 5K, 10K messages)',
      'Billing page with real-time plan polling after checkout',
      'Advanced RAG pipeline with streaming, smart model selection, and response caching',
      'Rate limiting and domain verification for embedded bots',
      'Admin dashboard with bot, user, and revenue analytics',
    ],
  },
  {
    version: '1.0.0',
    date: 'April 2025',
    tag: 'Launch',
    tagColor: 'bg-success/10 text-success',
    changes: [
      'Initial launch of PageCortex',
      'Website crawler with automatic content indexing via Pinecone vector DB',
      'GPT-4.1 powered chatbot with RAG',
      'Embeddable widget (widget.js) — single script tag integration',
      'Dashboard with bot creation, analytics, and conversation history',
      'Free plan: 1 bot, 50 messages/month, 100 pages indexed',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar />
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-[760px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[13px] font-medium mb-6">Changelog</div>
          <h1 className="text-[42px] md:text-[52px] font-bold tracking-[-0.03em] leading-[1.1] mb-4">What&apos;s new in PageCortex</h1>
          <p className="text-[17px] text-fg-secondary leading-relaxed mb-16">Product updates, new features, and improvements — shipped regularly.</p>

          <div className="space-y-12">
            {releases.map(r => (
              <div key={r.version} className="flex gap-6">
                <div className="shrink-0 w-[120px] pt-1">
                  <p className="text-[13px] font-semibold text-fg">{r.version}</p>
                  <p className="text-[12px] text-fg-muted mt-0.5">{r.date}</p>
                  <span className={`inline-flex mt-2 px-2 py-0.5 rounded-md text-[11px] font-semibold ${r.tagColor}`}>{r.tag}</span>
                </div>
                <div className="flex-1 pt-1 border-l border-edge pl-6">
                  <ul className="space-y-2.5">
                    {r.changes.map((c, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <svg className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3" /></svg>
                        <span className="text-[14px] text-fg-secondary">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
