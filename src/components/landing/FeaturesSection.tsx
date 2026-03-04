'use client';

import { motion } from 'framer-motion';
import { Brain, Globe, MessageSquare, Zap, Code2, Palette, BarChart3, Shield, Clock } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Trained on Your Site', desc: 'Answers grounded in your real website content. Zero hallucinations, zero guesswork.' },
  { icon: Globe, title: 'Auto Crawling', desc: 'We index every page, extract text, and build a vector knowledge base for your chatbot.' },
  { icon: MessageSquare, title: 'Conversation History', desc: 'Full logs of every visitor interaction for insights and continuous improvement.' },
  { icon: Zap, title: 'Instant Answers', desc: 'Sub-2 second responses powered by optimized vector search with real-time streaming.' },
  { icon: Code2, title: 'One-Line Embed', desc: 'Copy one script tag. Works with React, WordPress, Shopify, and any website.' },
  { icon: Palette, title: 'Brand Matching', desc: 'Custom colors, welcome messages, personality, and positioning to match your brand.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Understand visitor behavior with conversation insights and trending questions.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Data isolation per namespace. Full encryption at rest and in transit.' },
  { icon: Clock, title: '24/7 Availability', desc: 'Your AI never sleeps. Handle queries around the clock, no staffing needed.' },
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
