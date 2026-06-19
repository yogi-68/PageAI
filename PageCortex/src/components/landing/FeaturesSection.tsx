'use client';

import { motion } from 'framer-motion';
import { Brain, Globe, MessageSquare, Zap, Code2, Palette, BarChart3, Shield, Database } from 'lucide-react';

const features = [
  { icon: Brain, title: 'Advanced RAG Pipeline', desc: 'Query rewriting, hybrid search, re-ranking, and confidence scoring for 95-98% answer accuracy — so your bot never guesses.', color: 'text-primary', bg: 'bg-primary/8', border: 'border-primary/12' },
  { icon: Globe, title: 'Multi-Source Knowledge', desc: 'Ingest from websites, Notion, Google Drive, file uploads, and custom APIs. Train on your entire product knowledge.', color: 'text-violet', bg: 'bg-violet/8', border: 'border-violet/12' },
  { icon: MessageSquare, title: 'Human Handoff', desc: 'When AI confidence is low, automatically redirect to your team via email, contact form, or demo booking link. Never lose a lead.', color: 'text-success', bg: 'bg-success/8', border: 'border-success/12' },
  { icon: Zap, title: 'Smart Model Routing', desc: 'Routes simple questions to fast AI and complex buyer objections to our most advanced model — instant responses without overspending.', color: 'text-warning', bg: 'bg-warning/8', border: 'border-warning/12' },
  { icon: Code2, title: 'Works Everywhere', desc: 'One script tag. WordPress, Wix, Shopify, Webflow, Squarespace, React, Vue — any website platform.', color: 'text-primary', bg: 'bg-primary/8', border: 'border-primary/12' },
  { icon: Palette, title: 'Brand Matching', desc: 'Custom colors, welcome messages, personality, and positioning. Looks native to your brand, not like a generic widget.', color: 'text-violet', bg: 'bg-violet/8', border: 'border-violet/12' },
  { icon: BarChart3, title: 'Conversion Analytics', desc: 'Track visitor → conversation → signup funnels. See what questions buyers ask most and which go unanswered.', color: 'text-success', bg: 'bg-success/8', border: 'border-success/12' },
  { icon: Shield, title: 'Confidence-Based Fallback', desc: 'Low-confidence answers trigger contact forms, demo booking, or human escalation — building trust instead of frustrating visitors.', color: 'text-warning', bg: 'bg-warning/8', border: 'border-warning/12' },
  { icon: Database, title: 'Unanswered Question Alerts', desc: "Dashboard notifications when your bot can't answer. Know exactly what content to add to your knowledge base.", color: 'text-primary', bg: 'bg-primary/8', border: 'border-primary/12' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary mb-4">Features</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.035em] mb-4">
            Built on intelligent
            <br className="hidden sm:block" /> foundations
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-[520px] mx-auto leading-relaxed">
            From knowledge ingestion to conversion tracking — a complete AI pre-sales platform.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
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
