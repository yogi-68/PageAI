'use client';

import { motion } from 'framer-motion';

export default function ProductDemoSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-primary/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-primary mb-4">Product Preview</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.03em] mb-4">
            A complete AI chatbot
            <br className="hidden sm:block" /> management platform
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-[520px] mx-auto leading-relaxed">
            Monitor conversations, track performance, and optimize your AI assistant from one intuitive dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
        >
          {/* Dashboard mockup */}
          <div className="rounded-2xl border border-edge bg-surface overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-edge bg-surface-elevated/30">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="#4f6df5" />
                  </svg>
                </div>
                <span className="text-[13px] font-medium text-fg">Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-md bg-surface-elevated text-[11px] text-fg-muted">Last 7 days</div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-5 bg-surface-elevated/20">
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Total Conversations', value: '12,847', change: '+23%' },
                  { label: 'Resolution Rate', value: '94.7%', change: '+5.2%' },
                  { label: 'Avg Response Time', value: '1.2s', change: '-0.3s' },
                  { label: 'Customer Satisfaction', value: '4.8/5', change: '+0.2' },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-xl border border-edge bg-surface/60">
                    <p className="text-[11.5px] text-fg-muted mb-1">{stat.label}</p>
                    <p className="text-[22px] font-bold text-fg tracking-[-0.02em]">{stat.value}</p>
                    <p className="text-[11.5px] text-success mt-0.5">{stat.change}</p>
                  </div>
                ))}
              </div>

              {/* Main content area */}
              <div className="grid lg:grid-cols-3 gap-3">
                {/* Chart area */}
                <div className="lg:col-span-2 p-5 rounded-xl border border-edge bg-surface/60">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[13px] font-medium text-fg">Conversations Over Time</p>
                    <div className="flex gap-1">
                      {['1D', '7D', '30D'].map((period) => (
                        <button
                          key={period}
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            period === '7D' ? 'bg-primary/15 text-primary' : 'text-fg-muted hover:text-fg-secondary'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Simulated bar chart */}
                  <div className="flex items-end gap-1.5 h-[140px]">
                    {[45, 62, 38, 75, 55, 82, 67, 90, 72, 58, 85, 95, 78, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-primary/20 hover:bg-primary/30 transition-colors"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Recent conversations */}
                <div className="p-5 rounded-xl border border-edge bg-surface/60">
                  <p className="text-[13px] font-medium text-fg mb-4">Recent Conversations</p>
                  <div className="space-y-3">
                    {[
                      { q: 'What are your pricing plans?', time: '2m ago' },
                      { q: 'Do you offer a free trial?', time: '5m ago' },
                      { q: 'How do I integrate the widget?', time: '12m ago' },
                      { q: 'Is there an API available?', time: '18m ago' },
                    ].map((c, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-surface-elevated/60 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[12.5px] text-fg truncate">{c.q}</p>
                          <p className="text-[11px] text-fg-muted mt-0.5">{c.time}</p>
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
