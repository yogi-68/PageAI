'use client';

import {
    Globe, MessageSquare, Code2, BarChart3, Palette, Shield,
    Languages, BookOpen, Webhook, Zap, Users, ArrowUpRight,
} from 'lucide-react';

const features = [
    {
        icon: Globe,
        title: 'Auto-Crawl Websites',
        description: 'Enter a URL and we crawl, extract, chunk, and index all content automatically. Supports sitemaps, SPAs, and deep links.',
        gradient: 'from-cyan-500 to-blue-500',
    },
    {
        icon: MessageSquare,
        title: 'RAG-Powered Answers',
        description: 'Uses Retrieval-Augmented Generation to ground every answer in your actual content. No hallucinations — only verified responses.',
        gradient: 'from-violet-500 to-purple-500',
    },
    {
        icon: Code2,
        title: 'One-Line Embed',
        description: 'Drop a single <script> tag on your site and the widget appears. Fully customizable colors, position, and persona.',
        gradient: 'from-pink-500 to-rose-500',
    },
    {
        icon: BarChart3,
        title: 'Live Analytics',
        description: 'Track conversations, satisfaction scores, popular questions, unanswered queries, and engagement in real-time.',
        gradient: 'from-emerald-500 to-teal-500',
    },
    {
        icon: Palette,
        title: 'Full Customization',
        description: 'Match your brand — custom colors, logos, fonts, system prompts, and behavior rules. Create a unique AI persona.',
        gradient: 'from-orange-500 to-amber-500',
    },
    {
        icon: Shield,
        title: 'Enterprise Security',
        description: 'SOC2 compliant. Per-client data isolation, encrypted at rest and in transit. Your data never mixes with others.',
        gradient: 'from-blue-500 to-indigo-500',
    },
    {
        icon: Languages,
        title: 'Multi-Language',
        description: 'Auto-detect and respond in 50+ languages. Your chatbot speaks the language of every visitor globally.',
        gradient: 'from-fuchsia-500 to-pink-500',
    },
    {
        icon: BookOpen,
        title: 'Source Citations',
        description: 'Every answer links to the exact source page. Visitors can verify information and explore further.',
        gradient: 'from-lime-500 to-green-500',
    },
    {
        icon: Webhook,
        title: 'API & Webhooks',
        description: 'Full REST API for programmatic access. Webhooks for Slack, Zendesk, HubSpot, and custom integrations.',
        gradient: 'from-sky-500 to-cyan-500',
    },
    {
        icon: Zap,
        title: 'AI Actions',
        description: 'Beyond Q&A — capture leads, schedule meetings, update CRM, create tickets, and trigger custom workflows.',
        gradient: 'from-yellow-500 to-orange-500',
    },
    {
        icon: Users,
        title: 'Team Collaboration',
        description: 'Multi-seat access with role-based permissions. Admin, Editor, and Viewer roles for your team.',
        gradient: 'from-indigo-500 to-violet-500',
    },
    {
        icon: ArrowUpRight,
        title: 'Continuous Learning',
        description: 'Auto-recrawl on schedule. Your bot stays current as your website changes — daily, weekly, or on-demand.',
        gradient: 'from-rose-500 to-red-500',
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="section">
            <div className="container-wide mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <div className="badge mb-4 inline-flex">
                        <Zap className="w-3.5 h-3.5" />
                        Powerful Features
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">
                        Everything You Need to
                        <br />
                        <span className="gradient-text">Dominate Customer Support</span>
                    </h2>
                    <p className="text-[var(--text-secondary)] text-lg">
                        From auto-crawling to advanced analytics, PageAI gives you the complete
                        toolkit to build intelligent, site-specific AI assistants.
                    </p>
                </div>

                {/* Features grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="card card-interactive group !p-5"
                        >
                            {/* Icon */}
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className="w-5 h-5 text-white" />
                            </div>

                            <h3 className="text-base font-semibold mb-2 group-hover:text-white transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
