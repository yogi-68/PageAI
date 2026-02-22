"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
    {
        q: "What is PageAI and how does it work?",
        a: "PageAI is an AI-powered chatbot platform that creates custom Q&A assistants trained on your website content. Using RAG (Retrieval-Augmented Generation) technology, it crawls your site, indexes content into a vector database, and then uses AI models like GPT-4 to generate accurate, source-cited answers when visitors ask questions.",
    },
    {
        q: "How do I install PageAI on my website?",
        a: 'Simply paste a single line of JavaScript code before your closing </body> tag. It works with any website platform — WordPress, Shopify, Wix, Squarespace, custom sites, and more. The entire setup takes under 5 minutes.',
    },
    {
        q: "Will the AI hallucinate or make up answers?",
        a: "No. PageAI uses Retrieval-Augmented Generation (RAG), which means the AI ONLY answers based on your indexed website content. If it can't find relevant information, it will politely say so and suggest the visitor explore more or contact support.",
    },
    {
        q: "What happens if I exceed my monthly Q&A limit?",
        a: "You'll be notified as you approach your limit. You can either upgrade your plan or purchase additional Q&A credits at pay-as-you-go rates. Your chatbot won't suddenly stop working — we offer a graceful overflow period.",
    },
    {
        q: "Can I customize the chatbot's appearance and behavior?",
        a: "Absolutely. You can customize colors, position, bot name, avatar, welcome message, suggested questions, and the system prompt that controls the AI's personality and tone. Paid plans allow full white-labeling.",
    },
    {
        q: "How often is my content updated?",
        a: "PageAI can automatically re-crawl your site on a schedule (daily, weekly, or on-demand). When your content changes, the index updates automatically so your chatbot always has the latest information.",
    },
    {
        q: "Is my data secure?",
        a: "Yes. Each customer gets a completely isolated knowledge base — your data never mixes with other customers. All data is encrypted at rest and in transit. We're working toward SOC2 compliance and offer data residency options for enterprise plans.",
    },
    {
        q: "Which AI models are available?",
        a: "We support GPT-3.5 Turbo, GPT-4, GPT-4 Turbo (128K context), Claude 3.5 Sonnet, and more. The available models depend on your plan. Enterprise customers can also bring their own model via API.",
    },
    {
        q: "Can I use PageAI for multiple websites?",
        a: "Yes! Growth plan supports 3 websites, Professional supports 10, and Enterprise offers unlimited websites. Each website gets its own independent knowledge base and chatbot configuration.",
    },
    {
        q: "Do you offer a free trial?",
        a: "Yes. Our Starter plan is free forever with 1,000 Q&A per month. Additionally, all paid plans include a 14-day free trial of Pro features. No credit card required to get started.",
    },
];

export default function FAQSection() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <section id="faq" className="section-padding relative">
            <div className="absolute inset-0 bg-radial-glow" />
            <div className="relative container-narrow px-6 max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="badge mb-4 inline-flex">
                        <HelpCircle className="w-3.5 h-3.5" />
                        FAQ
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        Frequently Asked <span className="gradient-text">Questions</span>
                    </h2>
                    <p className="text-text-secondary text-lg">
                        Got questions? We&apos;ve got answers.
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="card !p-0 overflow-hidden cursor-pointer"
                            onClick={() => setOpen(open === i ? null : i)}
                        >
                            <div className="flex items-center justify-between px-6 py-4">
                                <h3 className="text-base font-medium pr-4">{faq.q}</h3>
                                <ChevronDown
                                    className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""
                                        }`}
                                />
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-96" : "max-h-0"
                                    }`}
                            >
                                <p className="px-6 pb-4 text-sm text-text-secondary leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
