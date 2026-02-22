"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { label: "Features", href: "#features" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Pricing", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                    ? "glass-strong py-3 shadow-2xl shadow-black/20"
                    : "py-5 bg-transparent"
                }`}
        >
            <div className="container-wide px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="relative w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                        <Sparkles className="w-5 h-5 text-white" />
                        <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        Page<span className="gradient-text">AI</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-sm font-medium text-text-secondary hover:text-white transition-colors relative group"
                        >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 gradient-bg rounded-full group-hover:w-full transition-all duration-300" />
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-text-secondary hover:text-white transition-colors px-4 py-2"
                    >
                        Log in
                    </Link>
                    <Link href="/signup" className="btn-primary text-sm !py-2.5 !px-5">
                        Start Free →
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="md:hidden p-2 text-text-secondary hover:text-white"
                    aria-label="Toggle menu"
                >
                    {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileOpen && (
                <div className="md:hidden glass-strong mt-2 mx-4 rounded-2xl p-6 animate-scale-in">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={() => setIsMobileOpen(false)}
                                className="text-base font-medium text-text-secondary hover:text-white transition-colors py-2"
                            >
                                {link.label}
                            </a>
                        ))}
                        <hr className="border-border my-2" />
                        <Link
                            href="/login"
                            className="text-base font-medium text-text-secondary hover:text-white transition-colors py-2"
                        >
                            Log in
                        </Link>
                        <Link href="/signup" className="btn-primary text-center">
                            Start Free →
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
