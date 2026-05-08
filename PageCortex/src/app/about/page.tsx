import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About PageCortex — AI Chatbot Company, Mission & Story',
  description: 'PageCortex is on a mission to make AI-powered customer support accessible to every business. Learn about our team, RAG technology, and the story behind the platform.',
  alternates: { canonical: 'https://pagecortex.com/about' },
  openGraph: {
    title: 'About PageCortex — AI Chatbot Company, Mission & Story',
    description: "Learn how PageCortex is making AI-powered chatbots accessible to every business — our RAG technology, mission, and team.",
    url: 'https://pagecortex.com/about',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'About PageCortex' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About PageCortex — AI Chatbot Company',
    description: 'Our mission, technology, and the team building the future of AI-powered customer support.',
    images: ['/og-image.png'],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar />
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-[760px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[13px] font-medium mb-6">About us</div>
          <h1 className="text-[42px] md:text-[52px] font-bold tracking-[-0.03em] leading-[1.1] mb-6">We&apos;re building the future<br /><span className="text-primary">of customer support AI</span></h1>
          <p className="text-[18px] text-fg-secondary leading-relaxed mb-8">PageCortex makes it simple for any business to deploy intelligent AI chatbots — trained on their own website, answering real customer questions in real time, with no coding required.</p>
          <div className="grid sm:grid-cols-3 gap-5 mt-12">
            {[
              { label: 'Founded', value: '2025' },
              { label: 'AI Model', value: 'GPT-4.1' },
              { label: 'Setup Time', value: '< 5 min' },
            ].map(s => (
              <div key={s.label} className="p-5 rounded-xl border border-edge bg-surface/40">
                <p className="text-[28px] font-bold text-fg">{s.value}</p>
                <p className="text-[13px] text-fg-secondary mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 space-y-8">
            <div>
              <h2 className="text-[22px] font-bold text-fg mb-3">Our mission</h2>
              <p className="text-[15px] text-fg-secondary leading-relaxed">Every website has a wealth of information trapped in pages that users never find. PageCortex bridges that gap — turning your existing content into a 24/7 AI assistant that speaks your language, knows your products, and helps your customers instantly.</p>
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-fg mb-3">How it works</h2>
              <p className="text-[15px] text-fg-secondary leading-relaxed">We use Retrieval-Augmented Generation (RAG) — your website content is crawled, indexed, and stored as vector embeddings. When customers ask questions, we retrieve the most relevant content and feed it to GPT-4.1, grounding every answer in your actual documentation.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
