'use client';

import { motion } from 'framer-motion';
import { Brain, Globe, MessageSquare, Zap, Code2, Palette, BarChart3, Shield, Database } from 'lucide-react';

const features = [
  { icon: Brain, title: 'Advanced RAG Pipeline', desc: 'Query rewriting, hybrid search, re-ranking, and confidence scoring for 95-98% answer accuracy — so your bot never guesses.' },
  { icon: Globe, title: 'Multi-Source Knowledge', desc: 'Ingest from websites, Notion, Google Drive, file uploads, and custom APIs. Train on your entire product knowledge.' },
  { icon: MessageSquare, title: 'Human Handoff', desc: 'When AI confidence is low, automatically redirect to your team via email, contact form, or demo booking link. Never lose a lead.' },
  { icon: Zap, title: 'Smart Model Routing', desc: 'Routes simple questions to fast AI and complex buyer objections to our most advanced model — instant responses without overspending.' },
  { icon: Code2, title: 'Works Everywhere', desc: 'One script tag. WordPress, Wix, Shopify, Webflow, Squarespace, React, Vue — any website platform.' },
  { icon: Palette, title: 'Brand Matching', desc: 'Custom colors, welcome messages, personality, and positioning. Looks native to your brand, not like a generic widget.' },
  { icon: BarChart3, title: 'Conversion Analytics', desc: 'Track visitor → conversation → signup funnels. See what questions buyers ask most and which go unanswered.' },
  { icon: Shield, title: 'Confidence-Based Fallback', desc: 'Low-confidence answers trigger contact forms, demo booking, or human escalation — building trust instead of frustrating visitors.' },
  { icon: Database, title: 'Unanswered Question Alerts', desc: "Dashboard notifications when your bot can't answer. Know exactly what content to add to your knowledge base." },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-primary mb-4">Features</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.03em] mb-4">
            Everything you need to convert
            <br className="hidden sm:block" /> visitors into customers
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
              className="group p-6 rounded-2xl border border-edge bg-surface/40 hover:bg-surface/80 transition-all duration-300 hover:border-edge-light"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary/15 group-hover:border-primary/20">
                <f.icon className="w-5 h-5 text-primary/80 group-hover:text-primary transition-colors duration-300" />
              </div>
              <h3 className="text-[16px] font-semibold text-fg mb-1.5 tracking-[-0.01em]">{f.title}</h3>
              <p className="text-[13.5px] text-fg-secondary leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
