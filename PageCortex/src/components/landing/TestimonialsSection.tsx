'use client';

import { motion } from 'framer-motion';
import { inViewOnce } from '@/lib/landing-motion';
import { CheckCircle2 } from 'lucide-react';

const guarantees = [
  {
    title: 'Answers grounded in your content',
    body: "Every response PageCortex gives is pulled directly from your website pages — no hallucinations, no made-up facts. If it doesn't know, it says so.",
    tag: 'RAG Technology',
    tagColor: 'text-primary',
    tagBg: 'bg-primary/8',
    tagBorder: 'border-primary/15',
  },
  {
    title: 'Live in under 5 minutes',
    body: "Paste your URL, wait for the crawl, copy one script tag into your site. That's the entire setup. No developer needed.",
    tag: 'No-code setup',
    tagColor: 'text-success',
    tagBg: 'bg-success/8',
    tagBorder: 'border-success/15',
  },
  {
    title: 'Free forever — no tricks',
    body: "Our free plan doesn't expire. You get a real working chatbot at no cost. Upgrade only when you're ready for more capacity.",
    tag: 'Free plan',
    tagColor: 'text-warning',
    tagBg: 'bg-warning/8',
    tagBorder: 'border-warning/15',
  },
  {
    title: 'Advanced AI on every plan',
    body: 'Even the free tier runs on the latest AI technology. No downgraded AI for lower tiers — everyone gets the same quality answers.',
    tag: 'Premium AI',
    tagColor: 'text-violet',
    tagBg: 'bg-violet/8',
    tagBorder: 'border-violet/15',
  },
  {
    title: 'Every answer cites its source',
    body: 'Users see exactly which page each answer came from. That transparency builds trust and lets your visitors verify information themselves.',
    tag: 'Source citations',
    tagColor: 'text-primary',
    tagBg: 'bg-primary/8',
    tagBorder: 'border-primary/15',
  },
  {
    title: 'Cancel anytime, own your data',
    body: 'No annual lock-in, no cancellation fees. Your conversations and knowledge base are always exportable. We earn your subscription every month.',
    tag: 'No lock-in',
    tagColor: 'text-success',
    tagBg: 'bg-success/8',
    tagBorder: 'border-success/15',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          {...inViewOnce}
          className="text-center mb-16"
        >
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary mb-4">Our promises</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.035em] mb-4">
            Built on honesty,
            <br className="hidden sm:block" /> not hype
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-[480px] mx-auto leading-relaxed">
            No inflated review counts. No made-up quotes. Here&apos;s exactly what you get with PageCortex.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guarantees.map((g, i) => (
            <motion.div
              key={g.title}
              {...inViewOnce}
              transition={{ ...inViewOnce.transition, delay: i * 0.05 }}
              className={`p-6 rounded-3xl border ${g.tagBorder} bg-surface hover:bg-surface-elevated/60 hover:scale-[1.01] transition-all duration-300 flex flex-col`}
            >
              {/* Tag */}
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold border ${g.tagBorder} ${g.tagBg} ${g.tagColor}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  {g.tag}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-[15.5px] font-bold text-fg mb-3 leading-snug tracking-[-0.015em]">{g.title}</h3>

              {/* Body */}
              <p className="text-[13.5px] text-fg-secondary leading-relaxed flex-1">{g.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
