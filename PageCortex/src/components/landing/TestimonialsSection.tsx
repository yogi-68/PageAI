'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Sarah Chen', role: 'VP of Support, TechFlow', quote: 'PageCortex cut our support ticket volume by 65% in the first month. The RAG technology means it actually gives accurate answers.', initials: 'SC' },
  { name: 'Marcus Johnson', role: 'Founder, ShopNova', quote: 'Setup took literally 3 minutes. I pasted my URL, waited for the crawl, and had a working chatbot on my store. Incredible.', initials: 'MJ' },
  { name: 'Emily Rodriguez', role: 'Head of Product, DataSync', quote: 'We evaluated 8 platforms. PageCortex won on accuracy, speed, and pricing. The analytics are incredibly useful for our team.', initials: 'ER' },
  { name: 'Alex Kim', role: 'CTO, CloudBase', quote: 'The API is clean, the embed is lightweight, and the bot understands context. This is what AI support should look like.', initials: 'AK' },
  { name: 'Priya Patel', role: 'Marketing Lead, GrowthHub', quote: 'Our bounce rate dropped 23% after adding PageCortex. Visitors find answers instantly instead of leaving to search elsewhere.', initials: 'PP' },
  { name: 'James Wilson', role: 'CEO, StartUp Labs', quote: 'Replaced our $2,000/month live chat team with PageCortex for $39/month. Handles 90% of queries with better accuracy.', initials: 'JW' },
];

const avatarColors = [
  'bg-primary/20 text-primary',
  'bg-violet/20 text-violet',
  'bg-success/20 text-success',
  'bg-warning/20 text-warning',
  'bg-danger/20 text-danger',
  'bg-primary/20 text-primary',
];

export default function TestimonialsSection() {
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
          <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-primary mb-4">Testimonials</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.03em] mb-4">
            Loved by thousands
            <br className="hidden sm:block" /> of businesses
          </h2>
          <p className="text-[16px] text-fg-secondary max-w-[480px] mx-auto leading-relaxed">
            See what companies are saying about PageCortex.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="p-6 rounded-2xl border border-edge bg-surface/40 hover:bg-surface/70 transition-all duration-300 hover:border-edge-light flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-warning text-warning" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[14px] text-fg-secondary leading-relaxed flex-1 mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-edge">
                <div className={`w-9 h-9 rounded-full ${avatarColors[i]} flex items-center justify-center`}>
                  <span className="text-[11px] font-semibold">{t.initials}</span>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-fg">{t.name}</p>
                  <p className="text-[12px] text-fg-muted">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
