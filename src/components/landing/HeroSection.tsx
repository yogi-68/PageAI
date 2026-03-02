'use client';

import Link from 'next/link';
import { ArrowRight, Bot, MessageSquare, Sparkles, Globe, Zap, Star } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative pt-40 pb-24 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Main radial glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),transparent_70%)]" />
                {/* Secondary glow */}
                <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent_70%)]" />
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                        backgroundSize: '64px 64px',
                    }}
                />
            </div>

            <div className="container-narrow mx-auto px-6 relative z-10">
                {/* Announcement badge */}
                <div className="flex justify-center mb-8 animate-fade-in">
                    <a href="#features" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.15)] text-sm text-[var(--primary-400)] hover:bg-[rgba(99,102,241,0.12)] transition-colors group">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Now with GPT-4 Turbo & Claude 3.5</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                </div>

                {/* Main heading */}
                <h1 className="text-center text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 animate-fade-in" style={{ animationDelay: '80ms' }}>
                    Your Website&apos;s
                    <br />
                    <span className="gradient-text">AI Brain</span>
                </h1>

                {/* Tagline */}
                <p className="text-center text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed" style={{ animationDelay: '160ms' }}>
                    Train a custom AI chatbot on your website content in minutes.
                    Answer visitor questions instantly with accurate, citation-backed responses
                    powered by <span className="text-white font-medium">RAG technology</span>.
                </p>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '240ms' }}>
                    <Link href="/signup" className="btn-primary !py-3.5 !px-8 !text-base !rounded-2xl shadow-[0_4px_24px_rgba(99,102,241,0.35)]">
                        Start Building Free
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <a href="#how-it-works" className="btn-secondary !py-3.5 !px-8 !text-base !rounded-2xl group">
                        <Bot className="w-5 h-5 text-[var(--primary-400)]" />
                        See Live Demo
                    </a>
                </div>

                {/* Social proof */}
                <div className="text-center mb-16 animate-fade-in" style={{ animationDelay: '320ms' }}>
                    <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-4">
                        Trusted by 2,000+ websites worldwide
                    </p>
                    <div className="flex items-center justify-center gap-8 flex-wrap opacity-40">
                        {['Shopify', 'Notion', 'Vercel', 'Stripe', 'Linear'].map((brand) => (
                            <span key={brand} className="text-base font-bold tracking-wide">{brand}</span>
                        ))}
                    </div>
                </div>

                {/* Widget mockup */}
                <div className="max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '400ms' }}>
                    <div className="relative rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-2xl shadow-black/40">
                        {/* Browser chrome */}
                        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-rose-500/70" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[var(--bg-base)] text-xs text-[var(--text-muted)] w-72 justify-center">
                                    <Globe className="w-3 h-3" />
                                    your-website.com
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                </div>
                            </div>
                        </div>

                        {/* Page content mock */}
                        <div className="relative min-h-[380px] p-8">
                            {/* Page skeleton */}
                            <div className="space-y-3 opacity-15">
                                <div className="h-8 w-48 bg-white/10 rounded-lg" />
                                <div className="h-3 w-full bg-white/5 rounded" />
                                <div className="h-3 w-4/5 bg-white/5 rounded" />
                                <div className="h-3 w-3/5 bg-white/5 rounded" />
                                <div className="mt-6 grid grid-cols-3 gap-4">
                                    <div className="h-24 bg-white/5 rounded-xl" />
                                    <div className="h-24 bg-white/5 rounded-xl" />
                                    <div className="h-24 bg-white/5 rounded-xl" />
                                </div>
                            </div>

                            {/* Chat widget */}
                            <div className="absolute bottom-6 right-6 w-[320px] animate-fade-in" style={{ animationDelay: '600ms' }}>
                                <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-2xl overflow-hidden">
                                    {/* Header */}
                                    <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                                            <Bot className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-white">PageAI Assistant</p>
                                            <p className="text-[10px] text-white/60">Powered by your content</p>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    </div>

                                    {/* Messages */}
                                    <div className="p-4 space-y-3 bg-[var(--bg-base)]">
                                        {/* Bot message */}
                                        <div className="flex gap-2 items-start">
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Bot className="w-3 h-3 text-white" />
                                            </div>
                                            <div className="bg-[var(--bg-card)] rounded-2xl rounded-tl-md px-3.5 py-2.5 max-w-[85%] border border-[var(--border-subtle)]">
                                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                    Hi! 👋 I know everything about this website. Ask me anything!
                                                </p>
                                            </div>
                                        </div>

                                        {/* User message */}
                                        <div className="flex justify-end">
                                            <div className="bg-indigo-600 rounded-2xl rounded-tr-md px-3.5 py-2.5 max-w-[80%]">
                                                <p className="text-xs text-white leading-relaxed">What are your return policies?</p>
                                            </div>
                                        </div>

                                        {/* Bot response with source */}
                                        <div className="flex gap-2 items-start">
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Bot className="w-3 h-3 text-white" />
                                            </div>
                                            <div className="space-y-1.5 max-w-[85%]">
                                                <div className="bg-[var(--bg-card)] rounded-2xl rounded-tl-md px-3.5 py-2.5 border border-[var(--border-subtle)]">
                                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                        Based on the Returns page, you can return items within <span className="text-white font-medium">30 days</span> for a full refund. Items must be unused and in original packaging.
                                                    </p>
                                                </div>
                                                <div className="flex gap-1.5 pl-1">
                                                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                                                        📄 /returns
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                                                        📄 /faq
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Input */}
                                    <div className="px-3 pb-3 bg-[var(--bg-base)]">
                                        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)]">
                                            <MessageSquare className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                            <span className="text-xs text-[var(--text-muted)]">Ask anything...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '500ms' }}>
                    {[
                        { value: '2,000+', label: 'Active Websites', icon: Globe },
                        { value: '10M+', label: 'Questions Answered', icon: MessageSquare },
                        { value: '1.2s', label: 'Avg. Response', icon: Zap },
                        { value: '4.9/5', label: 'User Rating', icon: Star },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                <stat.icon className="w-4 h-4 text-[var(--primary-400)]" />
                                <span className="text-2xl font-bold">{stat.value}</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
