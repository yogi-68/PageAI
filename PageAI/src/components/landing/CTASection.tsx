'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/[0.05] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="max-w-[680px] mx-auto p-12 rounded-3xl border border-edge bg-surface/60 backdrop-blur-sm">
            <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.15] tracking-[-0.03em] mb-4">
              Ready to build your AI chatbot?
            </h2>
            <p className="text-[16px] text-fg-secondary max-w-[440px] mx-auto leading-relaxed mb-8">
              Join 2,000+ businesses using PageCortex to automate customer support.
              Start free — no credit card required.
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-[15px] font-medium transition-all duration-300 hover:shadow-[0_0_32px_rgba(79,109,245,0.3)] hover:scale-[1.02]"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-edge hover:border-edge-light text-fg-secondary hover:text-fg text-[15px] font-medium transition-all duration-300"
              >
                View Pricing
              </Link>
            </div>
            <p className="text-[12.5px] text-fg-muted">
              Free plan included &middot; No credit card &middot; 2-minute setup
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
