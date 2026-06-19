'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.65, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  }),
};

const trustItems = [
  { label: 'SOC 2 Ready' },
  { label: 'Sub-2s Responses' },
  { label: '95+ Languages' },
  { label: 'No Credit Card Required' },
];

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 overflow-hidden grid-bg">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/[0.06] rounded-full blur-[140px]" />
        <div className="absolute top-20 right-[-100px] w-[400px] h-[400px] bg-violet/[0.05] rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column — text */}
          <div>
            {/* Badge */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={0}
              className="inline-flex mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-[12.5px] font-medium text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Trusted by growing SaaS teams — Free forever plan
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="text-[clamp(2.4rem,5.5vw,4.2rem)] font-bold leading-[1.06] tracking-[-0.04em] mb-6"
            >
              Convert More Visitors Into{' '}
              <span className="gradient-text">
                Free Trials
              </span>{' '}
              &amp; Demos
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="text-[17px] leading-[1.65] text-fg-secondary max-w-[520px] mb-10"
            >
              Train an AI assistant on your website content. It answers pricing questions, 
              overcomes buyer objections, and qualifies leads — automatically, 24/7.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="flex items-center gap-3 mb-10 flex-wrap"
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-fg text-bg text-[15px] font-semibold transition-all duration-300 hover:opacity-90 hover:scale-[1.02] shadow-lg shadow-black/10"
              >
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-edge hover:border-edge-light bg-surface/60 hover:bg-surface text-fg-secondary hover:text-fg text-[15px] font-medium transition-all duration-300"
              >
                See How It Works
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={4}
              className="flex items-center flex-wrap gap-x-5 gap-y-2"
            >
              {trustItems.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-[12.5px] text-fg-muted">
                  <Check className="w-3.5 h-3.5 text-success shrink-0" />
                  {item.label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column — product visual */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative hidden lg:block"
          >
            {/* Floating card UI mockup */}
            <div className="relative">
              {/* Main card */}
              <div className="rounded-3xl border border-edge bg-surface shadow-2xl shadow-black/8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge bg-surface-elevated/50">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-danger/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-warning/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-success/70" />
                    </div>
                    <span className="text-[12px] font-medium text-fg-muted">PageCortex — Live Chat Preview</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[11px] text-success font-medium">Live</span>
                  </div>
                </div>

                {/* Chat area */}
                <div className="p-5 space-y-4 bg-bg/40">
                  {/* Bot message */}
                  <div className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="currentColor" className="text-primary"/>
                      </svg>
                    </div>
                    <div className="bg-surface rounded-2xl rounded-tl-sm px-4 py-3 max-w-[280px] border border-edge">
                      <p className="text-[13px] text-fg leading-relaxed">Hi! I can help you understand our pricing and find the right plan. What's your primary use case?</p>
                    </div>
                  </div>

                  {/* User message */}
                  <div className="flex gap-3 items-start justify-end">
                    <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[240px]">
                      <p className="text-[13px] text-white leading-relaxed">We need AI chat for our SaaS with 500 pages</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-surface-elevated border border-edge flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-semibold text-fg-secondary">U</div>
                  </div>

                  {/* Bot response */}
                  <div className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="currentColor" className="text-primary"/>
                      </svg>
                    </div>
                    <div className="bg-surface rounded-2xl rounded-tl-sm px-4 py-3 max-w-[280px] border border-edge">
                      <p className="text-[13px] text-fg leading-relaxed">The <span className="font-semibold text-primary">Growth plan</span> is perfect — 10,000 pages indexed, 10K conversations/mo. Want to start a 7-day free trial?</p>
                    </div>
                  </div>

                  {/* Typing indicator */}
                  <div className="flex gap-3 items-center">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="currentColor" className="text-primary"/>
                      </svg>
                    </div>
                    <div className="bg-surface rounded-2xl rounded-tl-sm px-4 py-3 border border-edge">
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2].map(i => (
                          <motion.span
                            key={i}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }}
                            className="block w-1.5 h-1.5 rounded-full bg-fg-muted"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input area */}
                <div className="px-4 py-3 border-t border-edge bg-surface">
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-edge bg-surface-elevated/50">
                    <span className="text-[13px] text-fg-muted flex-1">Ask about pricing, features...</span>
                    <button className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating stat cards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -left-12 top-12 bg-surface rounded-2xl border border-edge shadow-xl shadow-black/8 px-4 py-3"
              >
                <p className="text-[11px] text-fg-muted mb-1">Conversion rate</p>
                <p className="text-[22px] font-bold text-fg tracking-tight">+34%</p>
                <p className="text-[11px] text-success">↑ vs last month</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -right-8 bottom-20 bg-surface rounded-2xl border border-edge shadow-xl shadow-black/8 px-4 py-3"
              >
                <p className="text-[11px] text-fg-muted mb-1">Response time</p>
                <p className="text-[22px] font-bold text-fg tracking-tight">1.1s</p>
                <p className="text-[11px] text-primary">avg latency</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
