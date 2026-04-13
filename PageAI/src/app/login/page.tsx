'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { signIn, signInWithGoogle, signInWithGithub } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await signIn(email, password);
      if (authError) {
        setError(authError.message || 'Invalid credentials');
        return;
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="#4f6df5"/></svg>
            </div>
            <span className="text-[17px] font-semibold text-fg">PageAI</span>
          </Link>
          <h1 className="text-[28px] font-bold text-fg tracking-[-0.03em] mb-2">Welcome back</h1>
          <p className="text-[14px] text-fg-secondary">Sign in to your account to continue</p>
        </div>

        <div className="p-6 rounded-2xl border border-edge bg-surface/50">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={signInWithGoogle} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-edge bg-bg/40 hover:bg-bg/70 text-[13.5px] font-medium text-fg transition-all duration-200">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button onClick={signInWithGithub} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-edge bg-bg/40 hover:bg-bg/70 text-[13.5px] font-medium text-fg transition-all duration-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-edge"></div></div>
            <div className="relative flex justify-center"><span className="px-3 bg-surface/50 text-[12px] text-fg-muted">or continue with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="px-3 py-2.5 rounded-lg bg-danger/10 border border-danger/20 text-[13px] text-danger">{error}</div>}

            <div>
              <label className="block text-[13px] font-medium text-fg-secondary mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required className="w-full px-3.5 py-2.5 rounded-lg border border-edge bg-bg/60 text-[14px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-medium text-fg-secondary">Password</label>
                <Link href="#" className="text-[12px] text-primary hover:text-primary-hover transition-colors">Forgot password?</Link>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full px-3.5 py-2.5 rounded-lg border border-edge bg-bg/60 text-[14px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-[14px] font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_24px_rgba(79,109,245,0.25)]">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-fg-muted mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary hover:text-primary-hover transition-colors font-medium">Sign up for free</Link>
        </p>
      </div>
    </div>
  );
}
