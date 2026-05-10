'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  }),
};

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6">
        {/* Badge */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-edge bg-surface/60 backdrop-blur-sm text-[12.5px] text-fg-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Trusted by growing SaaS teams — Free forever plan
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="text-center text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.08] tracking-[-0.035em] max-w-[800px] mx-auto mb-6"
        >
          Convert More Visitors Into{' '}
          <span className="bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">
            Free Trials
          </span>{' '}
          & Demos
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="text-center text-[17px] leading-[1.6] text-fg-secondary max-w-[560px] mx-auto mb-10"
        >
          Train an AI assistant on your website content. It answers pricing questions, 
          overcomes buyer objections, and qualifies leads — automatically, 24/7.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="flex items-center justify-center gap-4 mb-20"
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-[15px] font-medium transition-all duration-300 hover:shadow-[0_0_32px_rgba(79,109,245,0.3)] hover:scale-[1.02]"
          >
            Start Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-edge hover:border-edge-light text-fg-secondary hover:text-fg text-[15px] font-medium transition-all duration-300"
          >
            See How It Works
          </Link>
        </motion.div>

        {/* Trust indicators — clean, no dates */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={4}
          className="flex items-center justify-center gap-8 md:gap-14 flex-wrap"
        >
          {[
            { icon: '🔒', label: 'SOC 2 Ready' },
            { icon: '⚡', label: 'Sub-2s Responses' },
            { icon: '🌍', label: '95+ Languages' },
            { icon: '💳', label: 'No Credit Card Required' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-[13px] text-fg-muted">
              <span className="text-[16px]">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
