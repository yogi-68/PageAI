"use client";

import Link from "next/link";
import {
    Sparkles,
    Twitter,
    Github,
    Linkedin,
    Mail,
    Globe,
} from "lucide-react";

const footerLinks = {
    Product: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "API Documentation", href: "/docs" },
        { label: "Integrations", href: "/integrations" },
        { label: "Changelog", href: "/changelog" },
    ],
    Company: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Press Kit", href: "/press" },
        { label: "Contact", href: "/contact" },
    ],
    Resources: [
        { label: "Help Center", href: "/help" },
        { label: "Community", href: "/community" },
        { label: "Guides & Tutorials", href: "/guides" },
        { label: "Status Page", href: "/status" },
        { label: "System Requirements", href: "/requirements" },
    ],
    Legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "GDPR", href: "/gdpr" },
        { label: "Security", href: "/security" },
    ],
};

const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/pageai", label: "Twitter" },
    { icon: Github, href: "https://github.com/pageai", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/company/pageai", label: "LinkedIn" },
    { icon: Mail, href: "mailto:hello@pageai.io", label: "Email" },
];

export default function Footer() {
    return (
        <footer className="border-t border-border bg-surface-elevated/50">
            <div className="container-wide px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    {/* Brand Column */}
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                Page<span className="gradient-text">AI</span>
                            </span>
                        </Link>
                        <p className="text-sm text-text-secondary max-w-xs mb-6 leading-relaxed">
                            Transform your website into an intelligent AI assistant. Train on
                            your content, deploy in minutes, delight your visitors.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="w-9 h-9 rounded-xl bg-surface-card border border-border flex items-center justify-center text-text-muted hover:text-white hover:border-border-light transition-all"
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-sm font-semibold mb-4 text-text-primary">
                                {category}
                            </h4>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-text-muted">
                        © {new Date().getFullYear()} PageAI. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                        <div className="flex items-center gap-1.5">
                            <Globe className="w-3 h-3" />
                            English (US)
                        </div>
                        <span>•</span>
                        <span>Made with ♥ for website owners</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
