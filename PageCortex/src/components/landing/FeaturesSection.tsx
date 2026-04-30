'use client';

import { motion } from 'framer-motion';
import { Brain, Globe, MessageSquare, Zap, Code2, Palette, BarChart3, Shield, Database } from 'lucide-react';

const features = [
  { icon: Brain, title: 'Advanced RAG Pipeline', desc: 'Query rewriting, hybrid search, re-ranking, and confidence scoring for 95-98% answer accuracy.' },
  { icon: Globe, title: 'Multi-Source Connectors', desc: 'Ingest from websites, Notion, Google Drive, Zendesk, Confluence, file uploads, and custom APIs.' },
  { icon: MessageSquare, title: 'Streaming Responses', desc: 'Real-time token streaming via SSE for instant, natural-feeling conversations.' },
  { icon: Zap, title: 'Smart Model Routing', desc: 'Automatically routes to GPT-4.1 for complex queries and GPT-4.1 Mini for simple ones — fast & cost-effective.' },
  { icon: Code2, title: 'One-Line Embed', desc: 'Copy one script tag. Works with React, WordPress, Shopify, and any website.' },
  { icon: Palette, title: 'Brand Matching', desc: 'Custom colors, welcome messages, personality, and positioning to match your brand.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Understand visitor behavior with conversation insights, confidence metrics, and trending questions.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Domain verification, rate limiting, data isolation, and full encryption at rest and in transit.' },
  { icon: Database, title: 'Hybrid Search', desc: 'Combines vector similarity (pgvector) with BM25 full-text search for superior retrieval quality.' },
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
            Everything you need to build
            <br className="hidden sm:block" /> intelligent AI chatbots
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-[520px] mx-auto leading-relaxed">
            From crawling to deployment — a complete platform for context-aware AI assistants.
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
