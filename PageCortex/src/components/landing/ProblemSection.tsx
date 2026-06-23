'use client';

import { motion } from 'framer-motion';
import { TrendingDown, Clock, HelpCircle } from 'lucide-react';
import { inViewOnce } from '@/lib/landing-motion';

const problems = [
  {
    icon: TrendingDown,
    title: 'Pricing confusion kills trials',
    description: 'Trial users compare plans, hit edge cases, and leave without asking. Confusion ends trials faster than price objections.',
    stat: '42%',
    statLabel: 'abandon when pricing is unclear',
    color: 'text-danger',
    bgColor: 'bg-danger/8',
    borderColor: 'border-danger/15',
    accentColor: 'bg-danger/10',
  },
  {
    icon: Clock,
    title: 'Integration questions go unanswered',
    description: '"Does this work with Slack?" "Can we connect to Salesforce?" If they cannot find the answer in 30 seconds, they check your competitor.',
    stat: '67%',
    statLabel: 'of buyers leave without getting answers',
    color: 'text-warning',
    bgColor: 'bg-warning/8',
    borderColor: 'border-warning/15',
    accentColor: 'bg-warning/10',
  },
  {
    icon: HelpCircle,
    title: 'Setup questions cause support overload',
    description: 'Onboarding friction, seat limits, and API access questions pile up in your inbox — while silent trial users churn without ever reaching out.',
    stat: '40%',
    statLabel: 'of trial decisions happen after hours',
    color: 'text-violet',
    bgColor: 'bg-violet/8',
    borderColor: 'border-violet/15',
    accentColor: 'bg-violet/10',
  },
];

export default function ProblemSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          {...inViewOnce}
          className="text-center mb-16"
        >
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-danger mb-4">The Problem</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.035em] mb-4">
            Your trial users are churning
            <br className="hidden sm:block" /> before they ever talk to you
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-[540px] mx-auto leading-relaxed">
            Silent churn is the norm in SaaS — users leave when pre-sales questions go unanswered, not when they file a support ticket.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              {...inViewOnce}
              transition={{ ...inViewOnce.transition, delay: i * 0.08 }}
              className={`group p-6 rounded-3xl border ${p.borderColor} ${p.bgColor} hover:scale-[1.01] transition-all duration-300`}
            >
              <div className={`w-11 h-11 rounded-2xl ${p.accentColor} flex items-center justify-center mb-5`}>
                <p.icon className={`w-5 h-5 ${p.color}`} />
              </div>
              <h3 className="text-[17px] font-bold text-fg mb-2.5 tracking-[-0.02em]">{p.title}</h3>
              <p className="text-[14px] text-fg-secondary leading-relaxed mb-6">{p.description}</p>
              <div className="pt-4 border-t border-current/10">
                <p className={`text-[28px] font-bold ${p.color} tracking-[-0.03em]`}>{p.stat}</p>
                <p className="text-[12.5px] text-fg-muted mt-0.5">{p.statLabel}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
