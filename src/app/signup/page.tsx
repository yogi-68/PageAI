"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, Github, Chrome, Check } from "lucide-react";

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            window.location.href = "/dashboard";
        }, 1000);
    };

    const benefits = [
        "1,000 free Q&A per month",
        "No credit card required",
        "Setup in under 5 minutes",
        "14-day Pro trial included",
    ];

    return (
        <div className="min-h-screen flex bg-surface">
            {/* Left side - Benefits */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 gradient-bg opacity-80" />
                <div className="absolute inset-0 bg-grid opacity-10" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col justify-center px-16">
                    <Link href="/" className="flex items-center gap-2.5 mb-12">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">
                            PageAI
                        </span>
                    </Link>

                    <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                        Give your website
                        <br />
                        an AI superpower
                    </h2>
                    <p className="text-white/70 text-lg mb-10 max-w-md">
                        Join 2,000+ businesses using PageAI to transform their websites
                        into intelligent, self-serving platforms.
                    </p>

                    <ul className="space-y-4">
                        {benefits.map((b) => (
                            <li key={b} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="text-white/80">{b}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center bg-hero-glow relative">
                <div className="absolute inset-0 bg-grid opacity-30" />

                <div className="relative w-full max-w-md px-6">
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
                            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">
                                Page<span className="gradient-text">AI</span>
                            </span>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2">Create your account</h1>
                        <p className="text-text-secondary text-sm">
                            Start building your AI chatbot in minutes
                        </p>
                    </div>

                    <div className="card !p-8">
                        <div className="flex gap-3 mb-6">
                            <button className="flex-1 btn-secondary !py-2.5 text-sm">
                                <Chrome className="w-4 h-4" />
                                Google
                            </button>
                            <button className="flex-1 btn-secondary !py-2.5 text-sm">
                                <Github className="w-4 h-4" />
                                GitHub
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-3 text-xs text-text-muted bg-surface-card">
                                    Or continue with email
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-text-secondary">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="input !pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-text-secondary">
                                    Work Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        className="input !pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-text-secondary">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min 8 characters"
                                        className="input !pl-10 !pr-10"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full !py-3 disabled:opacity-60"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-text-muted text-center mt-4">
                                By signing up, you agree to our{" "}
                                <Link href="/terms" className="text-primary-400 hover:underline">Terms</Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link>.
                            </p>
                        </form>
                    </div>

                    <p className="text-center text-sm text-text-muted mt-6">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                            Sign in →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
