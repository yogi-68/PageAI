"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Bot,
    Globe,
    Zap,
    MessageSquare,
    Shield,
} from "lucide-react";

export default function HeroSection() {
    const orbs = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouse = (e: MouseEvent) => {
            if (!orbs.current) return;
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            orbs.current.style.transform = `translate(${x}px, ${y}px)`;
        };
        window.addEventListener("mousemove", handleMouse);
        return () => window.removeEventListener("mousemove", handleMouse);
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-hero-glow" />
            <div className="absolute inset-0 bg-grid opacity-40" />

            {/* Floating Orbs */}
            <div ref={orbs} className="absolute inset-0 transition-transform duration-700 ease-out">
                <div className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full bg-blue-600/8 blur-[100px] animate-float" />
                <div className="absolute top-[40%] right-[10%] w-96 h-96 rounded-full bg-purple-600/8 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
                <div className="absolute bottom-[10%] left-[30%] w-64 h-64 rounded-full bg-pink-600/6 blur-[80px] animate-float" style={{ animationDelay: "4s" }} />
            </div>

            <div className="relative z-10 container-narrow px-6 text-center">
                {/* Announcement Badge */}
                <div className="inline-flex items-center gap-2 mb-8 animate-fade-in-up">
                    <div className="badge">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Now powered by GPT-4 Turbo & Claude 3.5</span>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[1.05] mb-6 animate-fade-in-up stagger-1">
                    Your Website&apos;s
                    <br />
                    <span className="gradient-text">AI Brain</span>
                </h1>

                {/* Subheading */}
                <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up stagger-2">
                    Train a custom AI chatbot on your website content in minutes. Answer
                    visitor questions instantly with accurate, site-specific responses
                    powered by RAG technology.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up stagger-3">
                    <Link
                        href="/signup"
                        className="btn-primary text-base !py-3.5 !px-8 group"
                    >
                        Start Building Free
                        <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <a href="#demo" className="btn-secondary text-base !py-3.5 !px-8">
                        <Bot className="w-4.5 h-4.5" />
                        See Live Demo
                    </a>
                </div>

                {/* Trusted By Row */}
                <div className="animate-fade-in-up stagger-4 mb-16">
                    <p className="text-xs text-text-muted uppercase tracking-widest mb-4 font-medium">
                        Trusted by 2,000+ websites worldwide
                    </p>
                    <div className="flex items-center justify-center gap-8 opacity-40">
                        {["Shopify", "Notion", "Vercel", "Stripe", "Linear"].map((brand) => (
                            <span key={brand} className="text-sm font-semibold tracking-wide">
                                {brand}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Hero Visual: Chat Widget Mockup */}
                <div className="relative max-w-4xl mx-auto animate-fade-in-up stagger-5">
                    <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-60" />
                    <div className="relative glass rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/40">
                        {/* Browser Chrome */}
                        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-1.5 text-xs text-text-muted">
                                    <Globe className="w-3 h-3" />
                                    <span>your-website.com</span>
                                    <Shield className="w-3 h-3 text-emerald-400" />
                                </div>
                            </div>
                        </div>

                        {/* Mock Website Content */}
                        <div className="relative p-8 min-h-[400px]">
                            {/* Fake Site Content */}
                            <div className="space-y-4 max-w-md">
                                <div className="h-8 w-48 bg-white/5 rounded-lg" />
                                <div className="h-4 w-full bg-white/3 rounded" />
                                <div className="h-4 w-3/4 bg-white/3 rounded" />
                                <div className="h-4 w-5/6 bg-white/3 rounded" />
                                <div className="mt-6 h-32 w-full bg-white/3 rounded-xl" />
                                <div className="h-4 w-2/3 bg-white/3 rounded" />
                                <div className="h-4 w-1/2 bg-white/3 rounded" />
                            </div>

                            {/* Chat Widget */}
                            <div className="absolute bottom-6 right-6 w-80 animate-slide-in-right" style={{ animationDelay: "1s" }}>
                                <div className="bg-surface-card rounded-2xl border border-border shadow-2xl shadow-black/50 overflow-hidden">
                                    {/* Widget Header */}
                                    <div className="gradient-bg px-4 py-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                            <Bot className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">PageAI Assistant</p>
                                            <p className="text-xs text-white/70">Powered by your content</p>
                                        </div>
                                        <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="p-4 space-y-3 h-48">
                                        <div className="flex gap-2 items-start">
                                            <div className="w-6 h-6 rounded-full gradient-bg flex-shrink-0 flex items-center justify-center mt-0.5">
                                                <Bot className="w-3 h-3 text-white" />
                                            </div>
                                            <div className="bg-surface-elevated rounded-xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                                                <p className="text-sm text-text-secondary">
                                                    Hi! 👋 I know everything about this website. Ask me anything!
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 items-start justify-end">
                                            <div className="gradient-bg rounded-xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                                                <p className="text-sm text-white">
                                                    What are your return policies?
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 items-start">
                                            <div className="w-6 h-6 rounded-full gradient-bg flex-shrink-0 flex items-center justify-center mt-0.5">
                                                <Bot className="w-3 h-3 text-white" />
                                            </div>
                                            <div className="bg-surface-elevated rounded-xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                                                <p className="text-sm text-text-secondary">
                                                    Based on the Returns page, you can return items within 30 days...
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Input */}
                                    <div className="px-3 pb-3">
                                        <div className="flex items-center gap-2 bg-surface-elevated rounded-xl px-3 py-2.5 border border-border">
                                            <MessageSquare className="w-4 h-4 text-text-muted" />
                                            <span className="text-sm text-text-muted">Ask anything about this site...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 animate-fade-in-up stagger-6">
                    {[
                        { value: "2,000+", label: "Websites" },
                        { value: "15M+", label: "Questions Answered" },
                        { value: "98.5%", label: "Accuracy Rate" },
                        { value: "< 2s", label: "Response Time" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="text-3xl sm:text-4xl font-bold gradient-text mb-1">
                                {stat.value}
                            </p>
                            <p className="text-sm text-text-muted">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
