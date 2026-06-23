'use client';

import { motion } from 'framer-motion';
import { Brain, Globe, MessageSquare, Zap, Code2, Palette, BarChart3, Shield, Database } from 'lucide-react';
import { inViewOnce } from '@/lib/landing-motion';

const features = [
  { icon: Brain, title: '95–98% accurate answers, never guesses', desc: 'Every response is grounded in your docs, pricing pages, and FAQs — with source citations so trial users trust what they read.', color: 'text-primary', bg: 'bg-primary/8', border: 'border-primary/12' },
  { icon: Globe, title: 'Trained on your SaaS knowledge base', desc: 'Ingest from your marketing site, docs, Notion, Google Drive, and file uploads. One assistant that knows your product inside out.', color: 'text-violet', bg: 'bg-violet/8', border: 'border-violet/12' },
  { icon: MessageSquare, title: 'Escalates to your team before a lead is lost', desc: 'When confidence is low, visitors get routed to email, a contact form, or demo booking — not stuck in a dead-end chat loop.', color: 'text-success', bg: 'bg-success/8', border: 'border-success/12' },
  { icon: Zap, title: 'Routes complex questions to the best model automatically', desc: 'Simple pricing FAQs get fast answers. Hard integration or comparison questions get deeper reasoning — without you managing models.', color: 'text-warning', bg: 'bg-warning/8', border: 'border-warning/12' },
  { icon: Code2, title: 'One script tag on your SaaS site', desc: 'Embed on your marketing site, pricing page, or docs portal in minutes. No engineering sprint required.', color: 'text-primary', bg: 'bg-primary/8', border: 'border-primary/12' },
  { icon: Palette, title: 'Brand matching out of the box', desc: 'Custom colors, welcome messages, and tone that match your product — so it feels like part of your trial experience, not a generic widget.', color: 'text-violet', bg: 'bg-violet/8', border: 'border-violet/12' },
  { icon: BarChart3, title: 'Trial conversion analytics', desc: 'See which pre-sales questions trial users ask, what goes unanswered, and where conversations lead to signup.', color: 'text-success', bg: 'bg-success/8', border: 'border-success/12' },
  { icon: Shield, title: 'Confidence-based fallback', desc: 'Low-confidence answers trigger human handoff instead of hallucinations — protecting trust during the trial decision window.', color: 'text-warning', bg: 'bg-warning/8', border: 'border-warning/12' },
  { icon: Database, title: 'Unanswered question alerts', desc: "Know exactly which pricing, integration, or setup questions your bot couldn't answer — so you fix content gaps before more trials churn.", color: 'text-primary', bg: 'bg-primary/8', border: 'border-primary/12' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div {...inViewOnce} className="text-center mb-16">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary mb-4">Features</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.035em] mb-4">
            Built to convert
            <br className="hidden sm:block" /> trial users — not just chat
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-[520px] mx-auto leading-relaxed">
            Outcome-focused AI pre-sales for SaaS — from accurate answers to conversion tracking.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              {...inViewOnce}
              transition={{ ...inViewOnce.transition, delay: i * 0.04 }}
              className={`group p-6 rounded-3xl border ${f.border} bg-surface hover:bg-surface-elevated/60 transition-all duration-300 hover:scale-[1.01]`}
            >
              <div className={`w-11 h-11 rounded-2xl ${f.bg} flex items-center justify-center mb-4 transition-all duration-300`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="text-[16px] font-bold text-fg mb-2 tracking-[-0.02em]">{f.title}</h3>
              <p className="text-[13.5px] text-fg-secondary leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
