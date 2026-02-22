"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff, Github, Chrome } from "lucide-react";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // In production, use Supabase auth
        setTimeout(() => {
            window.location.href = "/dashboard";
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface bg-hero-glow relative">
            <div className="absolute inset-0 bg-grid opacity-30" />

            <div className="relative w-full max-w-md px-6">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
                        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">
                            Page<span className="gradient-text">AI</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
                    <p className="text-text-secondary text-sm">
                        Sign in to your PageAI dashboard
                    </p>
                </div>

                {/* Login Card */}
                <div className="card !p-8">
                    {/* Social Login */}
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

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-text-secondary">
                                Email
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
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-sm font-medium text-text-secondary">
                                    Password
                                </label>
                                <Link href="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input !pl-10 !pr-10"
                                    required
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
                                    Sign In
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-text-muted mt-6">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-primary-400 hover:text-primary-300 font-medium">
                        Sign up free →
                    </Link>
                </p>
            </div>
        </div>
    );
}
