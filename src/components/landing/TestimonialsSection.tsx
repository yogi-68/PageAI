"use client";

import { Star } from "lucide-react";

const testimonials = [
    {
        name: "Sarah Chen",
        role: "CTO, TechVault",
        avatar: "SC",
        rating: 5,
        text: "PageAI reduced our support tickets by 73% in the first month. The RAG-based answers are incredibly accurate — customers get instant help without waiting for our team.",
        color: "from-blue-500 to-cyan-400",
    },
    {
        name: "Marcus Johnson",
        role: "Founder, ShopFlow",
        avatar: "MJ",
        rating: 5,
        text: "We tried Chatbase and Botsonic before switching to PageAI. The difference in answer quality is night and day. Our customers actually trust the bot now because it cites exact pages.",
        color: "from-purple-500 to-indigo-400",
    },
    {
        name: "Emily Rodriguez",
        role: "Head of Support, Docuwise",
        avatar: "ER",
        rating: 5,
        text: "Setup took literally 3 minutes. Pasted our docs URL, waited for it to crawl, embedded the widget, and boom — instant AI support for our 500-page documentation site.",
        color: "from-pink-500 to-rose-400",
    },
    {
        name: "David Kim",
        role: "VP Marketing, CloudBase",
        avatar: "DK",
        rating: 5,
        text: "The analytics dashboard alone is worth the subscription. We can see exactly what questions customers are asking and optimize our content accordingly. Game-changer for our SEO.",
        color: "from-emerald-500 to-teal-400",
    },
    {
        name: "Lisa Thompson",
        role: "CEO, EduLearn",
        avatar: "LT",
        rating: 5,
        text: "Our students use the PageAI chatbot on our learning platform to ask questions about course material. Engagement went up 40% and our instructors can focus on teaching.",
        color: "from-amber-500 to-orange-400",
    },
    {
        name: "Alex Petrov",
        role: "DevOps Lead, InfraStack",
        avatar: "AP",
        rating: 5,
        text: "The multi-language support is phenomenal. Our global users ask questions in their native language and get accurate answers. We went from English-only support to 50+ languages overnight.",
        color: "from-violet-500 to-purple-400",
    },
];

export default function TestimonialsSection() {
    return (
        <section className="section-padding relative overflow-hidden">
            <div className="absolute inset-0 bg-dots opacity-20" />
            <div className="relative container-wide px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="badge-emerald mb-4 inline-flex">
                        <Star className="w-3.5 h-3.5" />
                        Customer Love
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        Loved by <span className="gradient-text-emerald">2,000+ Teams</span>
                    </h2>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                        See why businesses worldwide choose PageAI to power their
                        website&apos;s intelligence.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
                    {testimonials.map((t, i) => (
                        <div key={i} className="card group">
                            {/* Stars */}
                            <div className="flex gap-0.5 mb-3">
                                {Array.from({ length: t.rating }).map((_, si) => (
                                    <Star key={si} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-sm text-text-secondary leading-relaxed mb-5">
                                &ldquo;{t.text}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 mt-auto">
                                <div
                                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-semibold`}
                                >
                                    {t.avatar}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{t.name}</p>
                                    <p className="text-xs text-text-muted">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
