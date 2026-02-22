"use client";

import { Globe, Database, Bot, Code, ArrowRight } from "lucide-react";

const steps = [
    {
        step: "01",
        icon: Globe,
        title: "Connect Your Website",
        description:
            "Enter your website URL. PageAI automatically crawls every page, extracts text, images, and metadata. Or upload PDFs, docs, and FAQs directly.",
        visual: (
            <div className="space-y-3">
                <div className="flex items-center gap-3 bg-surface-elevated rounded-xl px-4 py-3 border border-border">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-text-secondary">https://your-store.com</span>
                    <div className="ml-auto badge-emerald text-xs">Crawling...</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {["Home", "Products", "FAQ", "About", "Blog", "Contact"].map((p) => (
                        <div key={p} className="text-xs text-center py-2 bg-surface-elevated rounded-lg border border-border text-text-muted">
                            /{p.toLowerCase()}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    24 pages indexed successfully
                </div>
            </div>
        ),
    },
    {
        step: "02",
        icon: Database,
        title: "AI Learns Your Content",
        description:
            "Content is chunked, converted to embeddings, and stored in a secure vector database. Each piece is tagged with its source URL for citations.",
        visual: (
            <div className="space-y-3">
                <div className="space-y-2">
                    {[
                        { label: "Embedding pages...", progress: 100, color: "bg-blue-500" },
                        { label: "Building index...", progress: 85, color: "bg-purple-500" },
                        { label: "Optimizing search...", progress: 60, color: "bg-pink-500" },
                    ].map((item) => (
                        <div key={item.label} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-text-muted">{item.label}</span>
                                <span className="text-text-secondary">{item.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                                    style={{ width: `${item.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-6 rounded bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/5"
                            style={{ opacity: 0.3 + Math.random() * 0.7 }}
                        />
                    ))}
                </div>
            </div>
        ),
    },
    {
        step: "03",
        icon: Code,
        title: "Embed on Your Site",
        description:
            "Copy a single script tag. Paste it before </body> and your AI assistant appears instantly. No coding required. Works with any platform.",
        visual: (
            <div className="space-y-3">
                <div className="bg-surface-elevated rounded-xl p-4 border border-border font-mono text-xs leading-relaxed">
                    <span className="text-text-muted">{"<!-- PageAI Widget -->"}</span>
                    <br />
                    <span className="text-blue-400">{"<script"}</span>
                    <br />
                    <span className="text-purple-400 ml-4">{"src"}</span>
                    <span className="text-text-muted">{"="}</span>
                    <span className="text-emerald-400">{'"https://cdn.pageai.io/widget.js"'}</span>
                    <br />
                    <span className="text-purple-400 ml-4">{"data-bot-id"}</span>
                    <span className="text-text-muted">{"="}</span>
                    <span className="text-emerald-400">{'"bot_a1b2c3d4"'}</span>
                    <br />
                    <span className="text-blue-400">{"/>"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-primary text-xs !py-2 !px-4">
                        Copy Code
                    </button>
                    <span className="text-xs text-text-muted">Works with WordPress, Shopify, Wix, Squarespace...</span>
                </div>
            </div>
        ),
    },
    {
        step: "04",
        icon: Bot,
        title: "Visitors Get Instant Answers",
        description:
            "Your AI chatbot intelligently answers questions using your content. It cites sources, suggests related pages, and captures leads.",
        visual: (
            <div className="space-y-2.5">
                <div className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-full bg-surface-elevated border border-border flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs">👤</span>
                    </div>
                    <div className="bg-surface-elevated rounded-xl rounded-tl-sm px-3 py-2">
                        <p className="text-xs text-text-secondary">Do you offer free shipping?</p>
                    </div>
                </div>
                <div className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-full gradient-bg flex-shrink-0 flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-surface-elevated rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                        <p className="text-xs text-text-secondary">
                            Yes! Based on the <span className="text-blue-400 underline">Shipping Policy</span> page,
                            free shipping is available on all orders over $50 within the US.
                            International orders over $100 also qualify. 📦
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 ml-8">
                    <div className="badge text-[10px] !py-0.5">Source: /shipping-policy</div>
                    <div className="badge-emerald text-[10px] !py-0.5">✓ Verified</div>
                </div>
            </div>
        ),
    },
];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="section-padding relative">
            <div className="absolute inset-0 bg-radial-glow" />
            <div className="relative container-narrow px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="badge mb-4 inline-flex">
                        <ArrowRight className="w-3.5 h-3.5" />
                        Simple Setup
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        Live in <span className="gradient-text">4 Simple Steps</span>
                    </h2>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                        From zero to deployed AI assistant in under 5 minutes. No coding, no
                        training data formatting, no complexity.
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-8">
                    {steps.map((step, i) => (
                        <div
                            key={step.step}
                            className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                                } gap-8 lg:gap-12 items-center`}
                        >
                            {/* Text Side */}
                            <div className="flex-1 max-w-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-5xl font-black text-white/5">
                                        {step.step}
                                    </span>
                                    <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <step.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-text-secondary leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* Visual Side */}
                            <div className="flex-1 max-w-lg w-full">
                                <div className="card !p-6">{step.visual}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
