'use client';

import { motion } from 'framer-motion';
import { TrendingDown, Clock, HelpCircle } from 'lucide-react';

const problems = [
  {
    icon: TrendingDown,
    title: 'Lost Leads',
    description: 'Visitors leave your site without answers. Every unanswered question is a lost conversion opportunity.',
    stat: '67%',
    statLabel: 'of visitors leave without engaging',
    color: 'text-danger',
    bgColor: 'bg-danger/10',
  },
  {
    icon: Clock,
    title: 'Slow Support',
    description: 'Customers wait hours for simple answers. Response delays directly reduce satisfaction and revenue.',
    stat: '12h',
    statLabel: 'average first response time',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    icon: HelpCircle,
    title: 'Missed Questions',
    description: "Important customer questions go unanswered outside business hours. Your team can't be online 24/7.",
    stat: '40%',
    statLabel: 'of queries happen after hours',
    color: 'text-violet',
    bgColor: 'bg-violet/10',
  },
];

export default function ProblemSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-danger mb-4">The Problem</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.03em] mb-4">
            Your website is losing customers
            <br className="hidden sm:block" /> every single day
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-[500px] mx-auto leading-relaxed">
            Without instant, intelligent support, businesses face these critical challenges.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
              className="group p-6 rounded-2xl border border-edge bg-surface/50 hover:bg-surface transition-all duration-300 hover:border-edge-light"
            >
              <div className={`w-10 h-10 rounded-xl ${p.bgColor} flex items-center justify-center mb-5`}>
                <p.icon className={`w-5 h-5 ${p.color}`} />
              </div>
              <h3 className="text-[18px] font-semibold text-fg mb-2 tracking-[-0.01em]">{p.title}</h3>
              <p className="text-[14px] text-fg-secondary leading-relaxed mb-5">{p.description}</p>
              <div className="pt-4 border-t border-edge">
                <p className={`text-[24px] font-bold ${p.color} tracking-[-0.02em]`}>{p.stat}</p>
                <p className="text-[12.5px] text-fg-muted mt-0.5">{p.statLabel}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
