'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

const trustItems = [
  { label: 'Built for SaaS trial conversion' },
  { label: 'Sub-2s Responses' },
  { label: '95–98% Answer Accuracy' },
  { label: 'Free plan included' },
];

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 grid-bg">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/[0.06] rounded-full blur-[140px]" />
        <div className="absolute top-20 right-[-100px] w-[400px] h-[400px] bg-violet/[0.05] rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-[12.5px] font-medium text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                AI pre-sales for SaaS — free plan included
              </div>
            </div>

            <h1 className="text-[clamp(2.2rem,5vw,3.75rem)] font-bold leading-[1.08] tracking-[-0.04em] mb-6">
              Stop losing SaaS trial users who never got their{' '}
              <span className="gradient-text">questions answered</span>
            </h1>

            <p className="text-[17px] leading-[1.65] text-fg-secondary max-w-[520px] mb-10">
              PageCortex answers pre-sales questions instantly from your docs, website, and FAQs — so trial users become paying customers instead of churning silently.
            </p>

            <div className="flex items-center gap-3 mb-10 flex-wrap">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-fg text-bg text-[15px] font-semibold transition-all duration-300 hover:opacity-90 hover:scale-[1.02] shadow-lg shadow-black/10"
              >
                Answer trial questions automatically (free) <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-edge hover:border-edge-light bg-surface/60 hover:bg-surface text-fg-secondary hover:text-fg text-[15px] font-medium transition-all duration-300"
              >
                Watch a 2-min demo
              </Link>
            </div>

            <div className="flex items-center flex-wrap gap-x-5 gap-y-2">
              {trustItems.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-[12.5px] text-fg-muted">
                  <Check className="w-3.5 h-3.5 text-success shrink-0" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block px-8">
            <div className="rounded-3xl border border-edge bg-surface shadow-2xl shadow-black/8 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge bg-surface-elevated/50">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-danger/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-warning/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-success/70" />
                  </div>
                  <span className="text-[12px] font-medium text-fg-muted">PageCortex — Trial user chat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[11px] text-success font-medium">Live</span>
                </div>
              </div>

              <div className="p-5 space-y-4 bg-bg/40">
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" /></svg>
                  </div>
                  <div className="bg-surface rounded-2xl rounded-tl-sm px-4 py-3 max-w-[280px] border border-edge">
                    <p className="text-[13px] text-fg leading-relaxed">Hi! I can answer pricing, integration, and setup questions before you start your trial. What do you need to know?</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start justify-end">
                  <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[240px]">
                    <p className="text-[13px] text-white leading-relaxed">Does the Growth plan include Slack integration?</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-surface-elevated border border-edge flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-semibold text-fg-secondary">U</div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" /></svg>
                  </div>
                  <div className="bg-surface rounded-2xl rounded-tl-sm px-4 py-3 max-w-[280px] border border-edge">
                    <p className="text-[13px] text-fg leading-relaxed">Yes — <span className="font-semibold text-primary">Growth</span> includes Slack, plus 3 integrations. Setup takes about 10 minutes. Ready to start your trial?</p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 border-t border-edge bg-surface">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-edge bg-surface-elevated/50">
                  <span className="text-[13px] text-fg-muted flex-1">Ask about pricing, integrations, setup...</span>
                  <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -left-2 top-10 bg-surface rounded-2xl border border-edge shadow-xl shadow-black/8 px-4 py-3">
              <p className="text-[11px] text-fg-muted mb-1">Avg response</p>
              <p className="text-[22px] font-bold text-fg tracking-tight">&lt;2s</p>
              <p className="text-[11px] text-primary">pre-sales answers</p>
            </div>

            <div className="absolute -right-2 bottom-16 bg-surface rounded-2xl border border-edge shadow-xl shadow-black/8 px-4 py-3">
              <p className="text-[11px] text-fg-muted mb-1">Answer accuracy</p>
              <p className="text-[22px] font-bold text-fg tracking-tight">95–98%</p>
              <p className="text-[11px] text-success">from your content</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
