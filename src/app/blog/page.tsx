import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Calendar, Clock, ArrowRight, Tag, User } from "lucide-react";

export const metadata: Metadata = {
    title: "Blog — AI Chatbot Insights & Best Practices",
    description:
        "Learn how to build, deploy, and optimize AI chatbots for your website. Expert guides on RAG, GPT-4, customer support automation, and more.",
    openGraph: {
        title: "PageAI Blog — AI Chatbot Insights",
        description: "Expert guides on AI chatbots, RAG technology, and customer support automation.",
    },
};

const posts = [
    {
        slug: "what-is-rag-chatbot",
        title: "What is RAG? How Retrieval-Augmented Generation Powers Accurate AI Chatbots",
        excerpt:
            "Learn how RAG technology ensures AI chatbots give accurate, hallucination-free answers by grounding responses in your actual website content.",
        category: "Technology",
        author: "PageAI Team",
        date: "Feb 18, 2026",
        readTime: "8 min",
        gradient: "from-blue-500 to-cyan-400",
    },
    {
        slug: "ai-chatbot-vs-traditional-chatbot",
        title: "AI Chatbots vs Traditional Rule-Based Chatbots: Why RAG Wins in 2026",
        excerpt:
            "Compare the old way of building chatbots with decision trees versus modern AI-powered assistants that understand natural language and context.",
        category: "Comparison",
        author: "PageAI Team",
        date: "Feb 12, 2026",
        readTime: "6 min",
        gradient: "from-purple-500 to-indigo-400",
    },
    {
        slug: "how-to-reduce-support-tickets-with-ai",
        title: "How to Reduce Customer Support Tickets by 70% with an AI Chatbot",
        excerpt:
            "Real case studies showing how businesses slashed support costs by deploying site-specific AI assistants trained on their own knowledge base.",
        category: "Case Study",
        author: "PageAI Team",
        date: "Feb 5, 2026",
        readTime: "10 min",
        gradient: "from-emerald-500 to-teal-400",
    },
    {
        slug: "best-ai-chatbot-platforms-2026",
        title: "Top 10 AI Chatbot Platforms for Websites in 2026 — Compared",
        excerpt:
            "An honest comparison of Chatbase, Botsonic, Intercom Fin, Drift, and PageAI. Features, pricing, and real-world performance tested.",
        category: "Review",
        author: "PageAI Team",
        date: "Jan 28, 2026",
        readTime: "12 min",
        gradient: "from-pink-500 to-rose-400",
    },
    {
        slug: "gpt-4-vs-gpt-3-5-for-chatbots",
        title: "GPT-4 vs GPT-3.5 for Website Chatbots: Is the Upgrade Worth It?",
        excerpt:
            "We tested both models with 10,000 real customer queries. Here's when GPT-4 shines and when GPT-3.5 is surprisingly good enough.",
        category: "Technology",
        author: "PageAI Team",
        date: "Jan 20, 2026",
        readTime: "7 min",
        gradient: "from-amber-500 to-orange-400",
    },
    {
        slug: "chatbot-seo-benefits",
        title: "5 Hidden SEO Benefits of Adding an AI Chatbot to Your Website",
        excerpt:
            "Beyond customer support: discover how AI chatbots reduce bounce rates, increase time-on-site, and create internal linking opportunities.",
        category: "SEO",
        author: "PageAI Team",
        date: "Jan 14, 2026",
        readTime: "5 min",
        gradient: "from-violet-500 to-purple-400",
    },
];

export default function BlogPage() {
    return (
        <main>
            <Navbar />
            <div className="pt-32 pb-20">
                <div className="container-narrow px-6">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="badge mb-4 inline-flex">
                            <Tag className="w-3.5 h-3.5" />
                            Blog
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                            AI Chatbot <span className="gradient-text">Insights</span>
                        </h1>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            Expert guides, case studies, and best practices for building
                            intelligent AI chatbots that actually work.
                        </p>
                    </div>

                    {/* Featured Post */}
                    <Link
                        href={`/blog/${posts[0].slug}`}
                        className="block mb-12 group"
                    >
                        <div className="card !p-0 overflow-hidden">
                            <div className="grid lg:grid-cols-2">
                                <div
                                    className={`bg-gradient-to-br ${posts[0].gradient} p-12 flex items-center justify-center min-h-[280px]`}
                                >
                                    <p className="text-5xl font-bold text-white/20 text-center leading-tight">
                                        RAG<br />Technology
                                    </p>
                                </div>
                                <div className="p-8 flex flex-col justify-center">
                                    <div className="badge mb-4 w-fit">{posts[0].category}</div>
                                    <h2 className="text-2xl font-bold mb-3 group-hover:text-primary-400 transition-colors">
                                        {posts[0].title}
                                    </h2>
                                    <p className="text-text-secondary mb-6">
                                        {posts[0].excerpt}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-text-muted">
                                        <span className="flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            {posts[0].author}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {posts[0].date}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {posts[0].readTime}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Posts Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.slice(1).map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="card !p-0 overflow-hidden group"
                            >
                                <div
                                    className={`bg-gradient-to-br ${post.gradient} h-40 flex items-center justify-center`}
                                >
                                    <p className="text-3xl font-bold text-white/15 text-center px-4">
                                        {post.title.split(":")[0]}
                                    </p>
                                </div>
                                <div className="p-5">
                                    <div className="badge text-xs mb-3">{post.category}</div>
                                    <h3 className="text-base font-semibold mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-text-muted">
                                        <span>{post.date}</span>
                                        <span className="flex items-center gap-1">
                                            {post.readTime}
                                            <Clock className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
