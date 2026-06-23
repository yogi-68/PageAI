'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { inViewOnce } from '@/lib/landing-motion';
import { ArrowRight, Check } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/[0.06] rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-6">
        <motion.div {...inViewOnce} className="text-center">
          <div className="max-w-[700px] mx-auto p-12 rounded-[2rem] border border-primary/15 bg-surface/80 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-violet to-primary/50 rounded-t-[2rem]" />

            <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary mb-4">Get Started</p>

            <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.12] tracking-[-0.035em] mb-4">
              Stop losing trial users to unanswered questions
            </h2>
            <p className="text-[16px] text-fg-secondary max-w-[440px] mx-auto leading-relaxed mb-8">
              Used by early-stage SaaS teams to answer pricing, integration, and setup questions 24/7. Start free — no credit card required.
            </p>
            <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-fg text-bg text-[15px] font-semibold transition-all duration-300 hover:opacity-90 hover:scale-[1.02] shadow-lg shadow-black/10"
              >
                Answer trial questions automatically (free) <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-edge hover:border-edge-light bg-transparent hover:bg-surface-elevated text-fg-secondary hover:text-fg text-[15px] font-medium transition-all duration-300"
              >
                View Pricing
              </Link>
            </div>
            <div className="flex items-center justify-center gap-5 flex-wrap">
              {['Free plan included', 'No credit card', '2-minute setup'].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-[12.5px] text-fg-muted">
                  <Check className="w-3.5 h-3.5 text-success" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
