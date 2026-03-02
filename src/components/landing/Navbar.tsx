'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, ChevronRight } from 'lucide-react';

const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                        ? 'py-2'
                        : 'py-4'
                    }`}
            >
                <div className="container-wide mx-auto px-6">
                    <div
                        className={`flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500 ${scrolled
                                ? 'bg-[rgba(10,10,22,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
                                : 'bg-transparent'
                            }`}
                    >
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">
                                Page<span className="gradient-text">AI</span>
                            </span>
                        </Link>

                        {/* Desktop links */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)] transition-all duration-200"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        {/* Right */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                href="/login"
                                className="btn-ghost text-sm"
                            >
                                Log in
                            </Link>
                            <Link href="/signup" className="btn-primary text-sm !py-2.5 !px-5">
                                Start Free
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Mobile toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Mobile menu */}
                    {mobileOpen && (
                        <div className="md:hidden mt-2 rounded-2xl bg-[rgba(10,10,22,0.95)] backdrop-blur-xl border border-[var(--border-default)] p-4 space-y-1 animate-fade-in">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)] transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="pt-3 border-t border-[var(--border-default)] space-y-2">
                                <Link href="/login" className="block px-4 py-3 rounded-xl text-sm text-center text-[var(--text-secondary)] hover:text-white">
                                    Log in
                                </Link>
                                <Link href="/signup" className="btn-primary w-full text-sm">
                                    Start Free <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}
