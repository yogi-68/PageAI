'use client';

import { motion } from 'framer-motion';

export default function ProductDemoSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-primary/[0.04] rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary mb-4">Product Preview</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.035em] mb-4">
            A complete AI chatbot
            <br className="hidden sm:block" /> management platform
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-[520px] mx-auto leading-relaxed">
            Build your knowledge base, deploy bots, and track performance from one intuitive dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
        >
          {/* Dashboard mockup */}
          <div className="rounded-3xl border border-edge bg-surface overflow-hidden shadow-2xl shadow-black/6 dark:shadow-black/30">
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-edge bg-surface-elevated/40">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                </div>
                <div className="w-px h-4 bg-edge mx-1" />
                <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="#5b3df5" />
                  </svg>
                </div>
                <span className="text-[12.5px] font-semibold text-fg">Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-lg bg-surface border border-edge text-[11px] text-fg-muted font-medium">Last 7 days</div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-success/10 border border-success/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[11px] text-success font-semibold">Live</span>
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-5 bg-bg/30">
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Questions Answered', value: '8,241', change: '+18%', color: 'text-success' },
                  { label: 'Avg Response Time', value: '1.1s', change: '-0.4s', color: 'text-primary' },
                  { label: 'Knowledge Pages', value: '3,450', change: '+120', color: 'text-violet' },
                  { label: 'Active Bots', value: '3', change: '+1 this week', color: 'text-warning' },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-2xl border border-edge bg-surface">
                    <p className="text-[11.5px] text-fg-muted mb-1.5">{stat.label}</p>
                    <p className="text-[22px] font-bold text-fg tracking-[-0.025em]">{stat.value}</p>
                    <p className={`text-[11.5px] mt-0.5 font-medium ${stat.color}`}>{stat.change}</p>
                  </div>
                ))}
              </div>

              {/* Main content area */}
              <div className="grid lg:grid-cols-3 gap-3">
                {/* Chart area */}
                <div className="lg:col-span-2 p-5 rounded-2xl border border-edge bg-surface">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-[13px] font-semibold text-fg">Questions Over Time</p>
                    <div className="flex gap-1 bg-surface-elevated rounded-lg p-1">
                      {['1D', '7D', '30D'].map((period) => (
                        <button
                          key={period}
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                            period === '7D'
                              ? 'bg-surface border border-edge text-fg shadow-sm'
                              : 'text-fg-muted hover:text-fg-secondary'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Bar chart */}
                  <div className="flex items-end gap-1.5 h-32">
                    {[45, 62, 38, 75, 55, 82, 67, 90, 72, 58, 85, 95, 78, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md bg-primary/15 hover:bg-primary/30 transition-colors cursor-default group relative"
                        style={{ height: `${h}%` }}
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-fg text-bg text-[9px] font-medium px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {Math.round(h * 12)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Knowledge sources */}
                <div className="p-5 rounded-2xl border border-edge bg-surface">
                  <p className="text-[13px] font-semibold text-fg mb-4">Knowledge Sources</p>
                  <div className="space-y-2.5">
                    {[
                      { name: 'docs.acme.com', pages: '1,240 pages', status: 'synced' },
                      { name: 'acme.com/blog', pages: '86 pages', status: 'synced' },
                      { name: 'product-guide.pdf', pages: '48 pages', status: 'synced' },
                      { name: 'faq.md', pages: '12 pages', status: 'processing' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-elevated/60 transition-colors">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${s.status === 'synced' ? 'bg-success' : 'bg-warning animate-pulse'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[12.5px] font-medium text-fg truncate">{s.name}</p>
                          <p className="text-[11px] text-fg-muted mt-0.5">{s.pages}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}