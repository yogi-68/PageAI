import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { useCases } from '../page';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return useCases.map((uc) => ({ slug: uc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const uc = useCases.find((u) => u.slug === slug);
  if (!uc) return {};

  return {
    title: uc.metaTitle,
    description: uc.metaDescription,
    alternates: { canonical: `https://pagecortex.com/use-cases/${slug}` },
    openGraph: {
      title: uc.metaTitle,
      description: uc.metaDescription,
      url: `https://pagecortex.com/use-cases/${slug}`,
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: uc.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: uc.metaTitle,
      description: uc.metaDescription,
      images: ['/og-image.png'],
    },
  };
}

// JSON-LD for each use-case page (Product + FAQ)
function getJsonLd(uc: (typeof useCases)[0]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: uc.metaTitle,
        description: uc.metaDescription,
        url: `https://pagecortex.com/use-cases/${uc.slug}`,
      },
      {
        '@type': 'FAQPage',
        mainEntity: uc.faqItems.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
}

export default async function UseCaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const uc = useCases.find((u) => u.slug === slug);
  if (!uc) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg pt-32 pb-24">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getJsonLd(uc)) }}
        />

        {/* Hero */}
        <section className="max-w-[800px] mx-auto px-6 text-center mb-20">
          <Link
            href="/use-cases"
            className="inline-flex items-center gap-1.5 text-[13px] text-fg-muted hover:text-fg transition-colors mb-8"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m0 0l7 7m-7-7l7-7"/></svg>
            All Use Cases
          </Link>
          <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-bold text-fg tracking-[-0.035em] leading-[1.1] mb-6">
            {uc.heroHeadline}
          </h1>
          <p className="text-[17px] text-fg-secondary leading-[1.6] max-w-[600px] mx-auto mb-10">
            {uc.heroSub}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-[15px] font-medium transition-all duration-300 hover:shadow-[0_0_32px_rgba(79,109,245,0.3)] hover:scale-[1.02]"
            >
              Start Free →
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-edge hover:border-edge-light text-fg-secondary hover:text-fg text-[15px] font-medium transition-all duration-300"
            >
              See How It Works
            </Link>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="max-w-[900px] mx-auto px-6 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uc.stats.map((s) => (
              <div key={s.label} className="text-center p-5 rounded-2xl border border-edge bg-surface/40">
                <p className="text-[28px] font-bold text-primary mb-1">{s.value}</p>
                <p className="text-[13px] text-fg-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pain Points */}
        <section className="max-w-[900px] mx-auto px-6 mb-20">
          <h2 className="text-[24px] font-bold text-fg tracking-[-0.02em] text-center mb-10">
            The Problem
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {uc.painPoints.map((p) => (
              <div key={p.title} className="p-6 rounded-2xl border border-edge bg-surface/40">
                <span className="text-[24px] mb-3 block">{p.icon}</span>
                <h3 className="text-[16px] font-semibold text-fg mb-2">{p.title}</h3>
                <p className="text-[13.5px] text-fg-secondary leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Solution */}
        <section id="how-it-works" className="max-w-[900px] mx-auto px-6 mb-20">
          <h2 className="text-[24px] font-bold text-fg tracking-[-0.02em] text-center mb-10">
            How PageCortex Solves This
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {uc.solution.map((s, i) => (
              <div key={s.title} className="p-6 rounded-2xl border border-edge bg-surface/40">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <span className="text-[13px] font-bold text-primary">{i + 1}</span>
                </div>
                <h3 className="text-[16px] font-semibold text-fg mb-2">{s.title}</h3>
                <p className="text-[13.5px] text-fg-secondary leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-[700px] mx-auto px-6 mb-20">
          <h2 className="text-[24px] font-bold text-fg tracking-[-0.02em] text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {uc.faqItems.map((item) => (
              <details key={item.q} className="group p-5 rounded-xl border border-edge bg-surface/40 transition-all hover:bg-surface/60">
                <summary className="text-[15px] font-medium text-fg cursor-pointer list-none flex items-center justify-between">
                  {item.q}
                  <svg className="w-4 h-4 text-fg-muted transition-transform group-open:rotate-180 shrink-0 ml-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </summary>
                <p className="text-[14px] text-fg-secondary leading-relaxed mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-[700px] mx-auto px-6">
          <div className="p-10 rounded-2xl border border-primary/20 bg-primary/[0.03] text-center">
            <h2 className="text-[22px] font-bold text-fg mb-3">Ready to try {uc.title}?</h2>
            <p className="text-[15px] text-fg-secondary mb-6 max-w-[440px] mx-auto">
              Start free — no credit card required. Set up in under 5 minutes and see results today.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-[15px] font-medium transition-all hover:shadow-[0_0_24px_rgba(79,109,245,0.25)]"
            >
              Get Started Free →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
