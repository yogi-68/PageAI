'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Sparkles, Loader2, AlertCircle, Check, Bot, MessageSquare, BarChart3, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const benefits = [
    { icon: Bot, text: 'Unlimited AI chatbots on Starter plan' },
    { icon: MessageSquare, text: '1,000 free Q&A per month' },
    { icon: BarChart3, text: 'Real-time analytics dashboard' },
    { icon: Shield, text: 'Enterprise-grade security' },
];

export default function SignupPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const { signUp, signInWithGoogle, signInWithGithub } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const { error: authError } = await signUp(email, password, fullName);

        if (authError) {
            setError(authError.message || 'Sign up failed');
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            // Redirect after short delay
            setTimeout(() => router.push('/dashboard'), 2000);
        }
    };

    return (
        <div className="min-h-screen flex relative">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent_70%)]" />
            </div>

            {/* Left panel — Benefits */}
            <div className="hidden lg:flex lg:w-[45%] relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-transparent" />
                <div className="relative z-10 flex flex-col justify-center px-16">
                    <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
                        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            Page<span className="gradient-text">AI</span>
                        </span>
                    </Link>

                    <h2 className="text-3xl font-bold mb-4 leading-tight">
                        Start building your
                        <br />
                        <span className="gradient-text">AI chatbot for free</span>
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-10 text-base leading-relaxed">
                        Join 2,000+ businesses using PageAI to automate customer support
                        and increase conversions.
                    </p>

                    <div className="space-y-5">
                        {benefits.map((b) => (
                            <div key={b.text} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[var(--primary-glow)] border border-[var(--border-accent)] flex items-center justify-center flex-shrink-0">
                                    <b.icon className="w-5 h-5 text-[var(--primary-400)]" />
                                </div>
                                <span className="text-[var(--text-secondary)] text-sm">{b.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Testimonial */}
                    <div className="mt-12 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)]">
                        <p className="text-sm text-[var(--text-secondary)] italic mb-3 leading-relaxed">
                            &quot;PageAI reduced our support tickets by 65% in the first month.
                            Setup took less than 5 minutes.&quot;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white">
                                SK
                            </div>
                            <div>
                                <p className="text-sm font-medium">Sarah K.</p>
                                <p className="text-xs text-[var(--text-muted)]">Head of Support, TechFlow</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
                <div className="w-full max-w-md animate-fade-in">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
                            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">Page<span className="gradient-text">AI</span></span>
                        </Link>
                    </div>

                    <h1 className="text-2xl font-bold mb-2">Create your account</h1>
                    <p className="text-[var(--text-muted)] text-sm mb-8">Free forever. No credit card required.</p>

                    {success && (
                        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-sm mb-6 animate-fade-in">
                            <Check className="w-5 h-5" />
                            <div>
                                <p className="font-medium">Account created!</p>
                                <p className="text-xs opacity-70">Check your email to verify, then redirecting to dashboard...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/15 text-rose-400 text-sm mb-6 animate-fade-in">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Social */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button onClick={signInWithGoogle} className="btn-secondary !py-3 text-sm" type="button">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button onClick={signInWithGithub} className="btn-secondary !py-3 text-sm" type="button">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            GitHub
                        </button>
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-default)]" /></div>
                        <div className="relative flex justify-center"><span className="px-3 text-xs text-[var(--text-muted)] bg-[var(--bg-base)]">or</span></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Full Name</label>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="input" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="input" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" className="input !pr-10" required minLength={6} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading || success} className="btn-primary w-full !py-3 disabled:opacity-50">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Create Free Account</span><ArrowRight className="w-4 h-4" /></>}
                        </button>

                        <p className="text-xs text-[var(--text-muted)] text-center leading-relaxed">
                            By signing up, you agree to our{' '}
                            <a href="#" className="text-[var(--primary-400)] hover:underline">Terms</a> and{' '}
                            <a href="#" className="text-[var(--primary-400)] hover:underline">Privacy Policy</a>.
                        </p>
                    </form>

                    <p className="text-center text-sm text-[var(--text-muted)] mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[var(--primary-400)] hover:underline font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
