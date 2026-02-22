"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Bot } from "lucide-react";

export default function CTASection() {
    return (
        <section className="section-padding relative">
            <div className="container-narrow px-6">
                <div className="relative rounded-3xl overflow-hidden">
                    {/* Background */}
                    <div className="absolute inset-0 gradient-bg opacity-90" />
                    <div className="absolute inset-0 bg-grid opacity-10" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    {/* Content */}
                    <div className="relative text-center py-20 px-8">
                        <div className="inline-flex items-center gap-2 mb-6 bg-white/10 rounded-full px-4 py-2 text-sm text-white/80 backdrop-blur-sm border border-white/10">
                            <Bot className="w-4 h-4" />
                            Join 2,000+ websites already using PageAI
                        </div>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            Ready to Give Your Website
                            <br />
                            an AI Brain?
                        </h2>
                        <p className="text-lg text-white/70 max-w-xl mx-auto mb-10">
                            Start for free. No credit card required. Deploy your AI chatbot in
                            under 5 minutes and watch your customer satisfaction soar.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/signup"
                                className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold py-3.5 px-8 rounded-xl hover:bg-white/90 transition-all hover:scale-[1.02] shadow-xl shadow-black/20 text-base"
                            >
                                <Sparkles className="w-5 h-5" />
                                Start Building Free
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="#demo"
                                className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 font-semibold py-3.5 px-8 rounded-xl hover:bg-white/20 transition-all text-base backdrop-blur-sm"
                            >
                                Watch Live Demo
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
