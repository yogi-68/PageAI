'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const solutions = [
  {
    icon: TrendingUp,
    title: 'Turn Pricing Questions into Conversions',
    description: 'AI answers pricing, feature, and comparison questions instantly — converting confused visitors into confident trial signups.',
    color: 'text-primary',
    bg: 'bg-primary/8',
    border: 'border-primary/15',
  },
  {
    icon: Zap,
    title: 'Answer Buyer Objections in Real-Time',
    description: '"Does it integrate with X?" "Is this right for my team?" — instant, accurate answers from your actual product content.',
    color: 'text-violet',
    bg: 'bg-violet/8',
    border: 'border-violet/15',
  },
  {
    icon: CheckCircle2,
    title: 'Qualify Leads Automatically',
    description: 'Your AI works 24/7, engaging every visitor with buying intent and guiding them toward signup or demo booking.',
    color: 'text-success',
    bg: 'bg-success/8',
    border: 'border-success/15',
  },
];

export default function SolutionSection() {
  return (
    <section className="py-24 relative">
      {/* Subtle gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary mb-4">The Solution</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.035em] mb-4">
            Your AI pre-sales assistant.
            <br className="hidden sm:block" /> Always closing.
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-[520px] mx-auto leading-relaxed">
            PageCortex trains on your website and product content, then answers every buyer question accurately — converting visitors into trials and demos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {solutions.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`group relative p-6 rounded-3xl border ${s.border} ${s.bg} hover:scale-[1.01] transition-all duration-300`}
            >
              <div className={`w-11 h-11 rounded-2xl bg-surface/80 border ${s.border} flex items-center justify-center mb-5`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <h3 className="text-[17px] font-bold text-fg mb-2.5 tracking-[-0.02em]">{s.title}</h3>
              <p className="text-[14px] text-fg-secondary leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:text-primary-hover transition-colors duration-200"
          >
            Start converting visitors today <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
