import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About PageCortex — Our Mission & How It Works',
  description: 'PageCortex turns your website into a 24/7 AI sales assistant. Learn about our mission, how our RAG technology works, and why businesses trust us.',
  alternates: { canonical: 'https://www.pagecortex.com/about' },
  openGraph: {
    title: 'About PageCortex — Our Mission & How It Works',
    description: 'Learn how PageCortex turns your website content into a 24/7 AI sales assistant.',
    url: 'https://www.pagecortex.com/about',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'About PageCortex' }],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar />
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-[760px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[13px] font-medium mb-6">About us</div>
          <h1 className="text-[42px] md:text-[52px] font-bold tracking-[-0.03em] leading-[1.1] mb-6">Turning websites into<br /><span className="text-primary">intelligent sales assistants</span></h1>
          <p className="text-[18px] text-fg-secondary leading-relaxed mb-16">PageCortex makes it simple for any business to deploy an AI assistant trained on their own website — answering real customer questions, qualifying leads, and driving conversions around the clock.</p>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: '🌍', label: '95+ languages supported', value: 'Global' },
              { icon: '⚡', label: 'Average response time', value: 'Sub-2s' },
              { icon: '🔒', label: 'Data protection', value: 'Encrypted' },
            ].map(s => (
              <div key={s.label} className="p-5 rounded-xl border border-edge bg-surface/40">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[20px]">{s.icon}</span>
                  <p className="text-[24px] font-bold text-fg">{s.value}</p>
                </div>
                <p className="text-[13px] text-fg-secondary">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 space-y-10">
            <div>
              <h2 className="text-[22px] font-bold text-fg mb-3">Our mission</h2>
              <p className="text-[15px] text-fg-secondary leading-relaxed">Every website has a wealth of information trapped in pages that visitors never find. PageCortex bridges that gap — turning your existing content into an always-on AI assistant that speaks your language, knows your products, and helps your customers instantly.</p>
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-fg mb-3">How it works</h2>
              <p className="text-[15px] text-fg-secondary leading-relaxed">We use advanced Retrieval-Augmented Generation (RAG) technology. Your website content is automatically crawled, indexed, and stored as searchable embeddings. When visitors ask questions, we retrieve the most relevant content and generate accurate, grounded answers — never making things up, always citing your actual pages.</p>
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-fg mb-3">Why businesses choose us</h2>
              <ul className="space-y-3">
                {[
                  'Answers are always grounded in your actual website content — no hallucinations',
                  'Set up in minutes — paste one script tag, your bot is live',
                  'Handles pricing questions, feature comparisons, and buyer objections automatically',
                  'Tracks unanswered questions so you know exactly what content to add',
                  'Works on any platform — WordPress, Shopify, Wix, React, and more',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[15px] text-fg-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
