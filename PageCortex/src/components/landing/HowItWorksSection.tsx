'use client';

import { motion } from 'framer-motion';
import { Globe, Cpu, Rocket } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: Globe,
    title: 'Connect your website',
    desc: 'Paste your URL and our crawler indexes every page automatically — extracting meaningful content in seconds.',
    tags: ['Auto-discovers pages', 'Handles dynamic sites', 'Smart extraction'],
  },
  {
    num: '02',
    icon: Cpu,
    title: 'AI builds your knowledge base',
    desc: 'Advanced AI analyzes your content, generates vector embeddings, and creates a deep semantic understanding of your site.',
    tags: ['Vector embeddings', 'Semantic chunking', 'High accuracy'],
  },
  {
    num: '03',
    icon: Rocket,
    title: 'Start answering customers',
    desc: 'Customize appearance, copy one line of code, and your AI chatbot is live — answering questions instantly.',
    tags: ['One-line embed', 'Brand matching', 'Instant deploy'],
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-primary mb-4">How It Works</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.03em] mb-4">
            Three steps to your
            <br className="hidden sm:block" /> AI assistant
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-[480px] mx-auto leading-relaxed">
            Go from zero to a fully operational AI chatbot in under 5 minutes.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-[60px] left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px bg-gradient-to-r from-edge via-primary/30 to-edge" />

          <div className="grid lg:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative"
              >
                {/* Step icon circle */}
                <div className="flex justify-center mb-6">
                  <div className="w-[52px] h-[52px] rounded-full bg-surface border-2 border-edge flex items-center justify-center relative z-10">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <div className="text-center p-6 rounded-2xl border border-edge bg-surface/40 hover:bg-surface/70 transition-all duration-300 hover:border-edge-light">
                  <span className="inline-block text-[12px] font-medium uppercase tracking-[0.08em] text-primary/60 mb-3">
                    Step {step.num}
                  </span>
                  <h3 className="text-[18px] font-semibold text-fg mb-3 tracking-[-0.01em]">{step.title}</h3>
                  <p className="text-[14px] text-fg-secondary leading-relaxed mb-5">{step.desc}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {step.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-md bg-primary/[0.06] border border-primary/10 text-[11.5px] text-fg-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
