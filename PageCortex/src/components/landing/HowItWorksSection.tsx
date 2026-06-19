'use client';

import { motion } from 'framer-motion';
import { Globe, Cpu, Rocket } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: Globe,
    title: 'Connect your website',
    desc: 'Paste your URL and our crawler indexes every product page, pricing info, and FAQ — extracting the content buyers need.',
    tags: ['Auto-discovers pages', 'Handles dynamic sites', 'Smart extraction'],
    color: 'text-primary',
    bg: 'bg-primary/8',
    border: 'border-primary/15',
    iconBg: 'bg-primary/10',
  },
  {
    num: '02',
    icon: Cpu,
    title: 'AI learns your product',
    desc: 'Advanced AI analyzes your content, builds a semantic understanding of pricing, features, integrations, and buyer objections.',
    tags: ['Vector embeddings', 'Semantic chunking', 'High accuracy'],
    color: 'text-violet',
    bg: 'bg-violet/8',
    border: 'border-violet/15',
    iconBg: 'bg-violet/10',
  },
  {
    num: '03',
    icon: Rocket,
    title: 'Start converting visitors',
    desc: 'Customize appearance, copy one line of code, and your AI pre-sales assistant is live — converting visitors into trials.',
    tags: ['One-line embed', 'Brand matching', 'Instant deploy'],
    color: 'text-success',
    bg: 'bg-success/8',
    border: 'border-success/15',
    iconBg: 'bg-success/10',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary mb-4">How It Works</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.035em] mb-4">
            Three steps to your
            <br className="hidden sm:block" /> AI sales assistant
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-[480px] mx-auto leading-relaxed">
            Go from zero to a conversion-boosting AI assistant in under 5 minutes.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-[44px] left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px bg-gradient-to-r from-primary/20 via-violet/30 to-success/20" />

          <div className="grid lg:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative"
              >
                {/* Step icon circle */}
                <div className="flex justify-center mb-6">
                  <div className={`w-[56px] h-[56px] rounded-full ${step.iconBg} border-2 ${step.border} flex items-center justify-center relative z-10`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                </div>

                <div className={`text-center p-6 rounded-3xl border ${step.border} ${step.bg} hover:scale-[1.01] transition-all duration-300`}>
                  <span className={`inline-block text-[11.5px] font-bold uppercase tracking-[0.1em] ${step.color} mb-3`}>
                    Step {step.num}
                  </span>
                  <h3 className="text-[18px] font-bold text-fg mb-3 tracking-[-0.02em]">{step.title}</h3>
                  <p className="text-[14px] text-fg-secondary leading-relaxed mb-5">{step.desc}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {step.tags.map((t) => (
                      <span
                        key={t}
                        className={`px-2.5 py-1 rounded-lg bg-surface/80 border ${step.border} text-[11.5px] ${step.color} font-medium`}
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
