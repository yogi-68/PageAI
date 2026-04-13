'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const stats = [
  { value: '2,000+', label: 'Websites Powered' },
  { value: '10M+', label: 'Questions Answered' },
  { value: '<2s', label: 'Avg Response Time' },
  { value: '4.9/5', label: 'User Rating' },
];

const logos = ['Stripe', 'Vercel', 'Notion', 'Linear', 'Figma'];

// Demo conversation pairs
const demoResponses: Record<string, string> = {
  'what plans do you offer': 'We offer 4 plans: **Free** ($0), **Starter** ($29/mo), **Growth** ($69/mo), and **Scale** ($199/mo). All paid plans include a 7-day free trial!',
  'how does it work': 'It\'s simple! 1) Add your website URL or connect a data source 2) We crawl & index your content with semantic chunking 3) Deploy your AI chatbot with one line of code. Takes under 2 minutes!',
  'what is pageai': 'PageAI is an AI-powered chatbot platform that trains on your website content using advanced RAG with hybrid search. It answers customer questions with 95%+ accuracy and source citations — 24/7. Supports 95+ languages!',
  'pricing': 'Start free forever! Starter: $29/mo (4K msgs), Growth: $69/mo (10K msgs), Scale: $199/mo (40K msgs). All paid plans have a 7-day free trial. Cancel anytime.',
  'features': 'Key features include: hybrid vector + BM25 search, GPT-4.1 powered answers, streaming responses, data source connectors (Notion, Google Drive, etc.), 95+ languages, real-time analytics, and easy embed widget.',
};

function findBestResponse(query: string): string {
  const q = query.toLowerCase().trim();
  for (const [key, response] of Object.entries(demoResponses)) {
    if (q.includes(key) || key.split(' ').some(word => q.includes(word))) {
      return response;
    }
  }
  return 'Great question! PageAI helps businesses deploy AI chatbots trained on their website content. Try asking about plans, features, or how it works!';
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  }),
};

export default function HeroSection() {
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([
    { role: 'bot', text: 'Hi! Ask me anything about our products or services.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = () => {
    const q = input.trim();
    if (!q || typing) return;
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    setTyping(true);
    const response = findBestResponse(q);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    }, 800 + Math.random() * 600);
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6">
        {/* Badge */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-edge bg-surface/60 backdrop-blur-sm text-[12.5px] text-fg-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Trusted by 2,000+ businesses worldwide
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="text-center text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.08] tracking-[-0.035em] max-w-[800px] mx-auto mb-6"
        >
          AI Chatbots That Turn{' '}
          <span className="bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">
            Website Visitors
          </span>{' '}
          Into Customers
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="text-center text-[17px] leading-[1.6] text-fg-secondary max-w-[560px] mx-auto mb-10"
        >
          Build a custom AI assistant trained on your website content.
          Deploy in 2 minutes. Resolve customer questions 24/7 — accurately.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="flex items-center justify-center gap-4 mb-20"
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-[15px] font-medium transition-all duration-300 hover:shadow-[0_0_32px_rgba(79,109,245,0.3)] hover:scale-[1.02]"
          >
            Start Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-edge hover:border-edge-light text-fg-secondary hover:text-fg text-[15px] font-medium transition-all duration-300"
          >
            See How It Works
          </Link>
        </motion.div>

        {/* Product Mockup */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={4}
          className="relative max-w-[900px] mx-auto mb-20"
        >
          {/* Browser frame */}
          <div className="rounded-2xl border border-edge bg-surface overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-edge bg-surface-elevated/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-surface-elevated text-[12px] text-fg-muted">
                  your-website.com
                </div>
              </div>
            </div>

            {/* Page content area */}
            <div className="relative p-8 min-h-[340px] bg-surface-elevated/20">
              {/* Simulated page content */}
              <div className="space-y-3 max-w-[55%]">
                <div className="h-7 bg-edge/40 rounded w-3/4" />
                <div className="h-4 bg-edge/25 rounded w-full" />
                <div className="h-4 bg-edge/25 rounded w-5/6" />
                <div className="h-4 bg-edge/25 rounded w-2/3" />
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="h-24 bg-edge/15 rounded-lg" />
                  <div className="h-24 bg-edge/15 rounded-lg" />
                </div>
              </div>

              {/* Chat widget - Interactive Demo */}
              <div className="absolute bottom-6 right-6 w-[300px] sm:w-[320px]">
                <div className="rounded-2xl border border-edge bg-surface shadow-lg dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden">
                  {/* Chat header */}
                  <div className="px-4 py-3 bg-primary/8 border-b border-edge flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="#4f6df5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-fg">PageAI Assistant</p>
                      <p className="text-[11px] text-success flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                        Online
                      </p>
                    </div>
                  </div>

                  {/* Chat messages - scrollable */}
                  <div className="p-4 space-y-3 max-h-[200px] overflow-y-auto">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'gap-2'}`}>
                        <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed max-w-[85%] ${
                          msg.role === 'user'
                            ? 'rounded-tr-sm bg-primary/15 text-fg'
                            : 'rounded-tl-sm bg-surface-elevated text-fg-secondary'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {typing && (
                      <div className="flex gap-2">
                        <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-surface-elevated">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-fg-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-fg-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-fg-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat input - functional */}
                  <div className="px-4 py-3 border-t border-edge">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type your question..."
                        className="flex-1 px-3 py-2 rounded-lg bg-bg/60 border border-edge text-[12.5px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || typing}
                        className="p-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={5}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-[800px] mx-auto mb-16"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[28px] font-bold tracking-[-0.02em] text-fg">{s.value}</p>
              <p className="text-[13px] text-fg-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Trust Logos */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={6}
          className="text-center"
        >
          <p className="text-[12.5px] uppercase tracking-[0.1em] text-fg-muted mb-6">Trusted by teams at</p>
          <div className="flex items-center justify-center gap-10 flex-wrap">
            {logos.map((l) => (
              <span key={l} className="text-[15px] font-medium text-fg-muted/60 tracking-wide">{l}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
