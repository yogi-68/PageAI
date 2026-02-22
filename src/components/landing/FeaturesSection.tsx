"use client";

import {
    Globe,
    Cpu,
    MessageCircle,
    BarChart3,
    Palette,
    Shield,
    PlugZap,
    Languages,
    Bot,
    Zap,
    FileSearch,
    Users,
} from "lucide-react";

const features = [
    {
        icon: Globe,
        title: "Auto-Crawl Any Website",
        description:
            "Enter your URL and we'll automatically crawl, extract, and index all your website content. Supports sitemaps, deep links, and dynamic pages.",
        color: "from-blue-500 to-cyan-400",
        glow: "shadow-blue-500/20",
    },
    {
        icon: Cpu,
        title: "RAG-Powered Answers",
        description:
            "Uses Retrieval-Augmented Generation to ground every answer in your actual content. No hallucinations — only verified, citations-backed responses.",
        color: "from-purple-500 to-indigo-400",
        glow: "shadow-purple-500/20",
    },
    {
        icon: MessageCircle,
        title: "Embeddable Widget",
        description:
            "Drop a single line of code on your site and the widget appears. Fully customizable — colors, position, persona, welcome message, and more.",
        color: "from-pink-500 to-rose-400",
        glow: "shadow-pink-500/20",
    },
    {
        icon: BarChart3,
        title: "Advanced Analytics",
        description:
            "Track every conversation, popular questions, unanswered queries, satisfaction scores, and engagement metrics in real-time.",
        color: "from-emerald-500 to-teal-400",
        glow: "shadow-emerald-500/20",
    },
    {
        icon: Palette,
        title: "Full Customization",
        description:
            "Match your brand with custom colors, logos, fonts, and tone. Create a unique persona with custom system prompts and behavior rules.",
        color: "from-amber-500 to-orange-400",
        glow: "shadow-amber-500/20",
    },
    {
        icon: Shield,
        title: "Enterprise Security",
        description:
            "SOC2 compliant. Per-client data isolation, encrypted at rest and in transit. Your content never mixes with other customers' data.",
        color: "from-sky-500 to-blue-400",
        glow: "shadow-sky-500/20",
    },
    {
        icon: PlugZap,
        title: "Integrations & Webhooks",
        description:
            "Connect to Slack, Zendesk, Intercom, HubSpot, and more. Trigger webhooks on conversations, escalations, and lead captures.",
        color: "from-violet-500 to-purple-400",
        glow: "shadow-violet-500/20",
    },
    {
        icon: Languages,
        title: "Multi-Language Support",
        description:
            "Automatically detect and respond in 50+ languages. Your chatbot speaks your visitors' language — globally ready out of the box.",
        color: "from-teal-500 to-emerald-400",
        glow: "shadow-teal-500/20",
    },
    {
        icon: Bot,
        title: "Multiple AI Models",
        description:
            "Choose from GPT-4 Turbo, GPT-3.5, Claude 3.5 Sonnet, Gemini, and more. Switch models per bot or let the system auto-optimize.",
        color: "from-fuchsia-500 to-pink-400",
        glow: "shadow-fuchsia-500/20",
    },
    {
        icon: Zap,
        title: "AI Actions & Automations",
        description:
            "Go beyond Q&A. Let your bot book meetings, capture leads, trigger CRM updates, submit tickets, and execute custom workflows.",
        color: "from-yellow-500 to-amber-400",
        glow: "shadow-yellow-500/20",
    },
    {
        icon: FileSearch,
        title: "Smart Source Citations",
        description:
            "Every answer includes clickable links back to the exact page it sourced information from. Full transparency and trust.",
        color: "from-indigo-500 to-blue-400",
        glow: "shadow-indigo-500/20",
    },
    {
        icon: Users,
        title: "Team Collaboration",
        description:
            "Invite team members, assign roles, review conversation logs, and collaboratively fine-tune your bot's knowledge and responses.",
        color: "from-rose-500 to-red-400",
        glow: "shadow-rose-500/20",
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="section-padding relative">
            <div className="absolute inset-0 bg-dots opacity-30" />
            <div className="relative container-narrow px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="badge mb-4 inline-flex">
                        <Zap className="w-3.5 h-3.5" />
                        Powerful Features
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        Everything You Need to
                        <br />
                        <span className="gradient-text">Dominate Customer Support</span>
                    </h2>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                        From auto-crawling to advanced analytics, PageAI gives you the
                        complete toolkit to build intelligent, site-specific AI assistants.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((feature, i) => (
                        <div
                            key={feature.title}
                            className="card card-interactive group"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg ${feature.glow} group-hover:scale-110 transition-transform duration-300`}
                            >
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-text-secondary text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
