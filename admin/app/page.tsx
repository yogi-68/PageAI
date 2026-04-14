'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(var(--edge) 1px, transparent 1px), linear-gradient(90deg, var(--edge) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div className="relative w-full max-w-[380px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5" style={{ background: 'rgba(79,109,245,0.12)', border: '1px solid rgba(79,109,245,0.25)' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H8.5l-4 4V14H5a2 2 0 01-2-2V5z" fill="#4f6df5"/>
            </svg>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[18px] font-bold" style={{ color: 'var(--fg)' }}>PageAI</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'rgba(79,109,245,0.12)', color: 'var(--primary)' }}>Admin</span>
          </div>
          <p className="text-[13px]" style={{ color: 'var(--fg-secondary)' }}>Restricted access — authorized administrators only</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
          {error && (
            <div className="px-3.5 py-2.5 rounded-lg text-[13px] flex items-start gap-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="shrink-0 mt-0.5"><path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zM8 11a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd"/></svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--fg-secondary)' }}>Email address</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="admin@pageai.com" autoComplete="email"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-all"
              style={{ background: 'var(--bg)', border: '1px solid var(--edge)', color: 'var(--fg)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--edge)')}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--fg-secondary)' }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••" autoComplete="current-password"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-all"
              style={{ background: 'var(--bg)', border: '1px solid var(--edge)', color: 'var(--fg)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--edge)')}
            />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleLogin as unknown as React.MouseEventHandler}
            className="w-full py-2.5 rounded-lg text-white text-[13.5px] font-medium transition-opacity disabled:opacity-60"
            style={{ background: 'var(--primary)' }}
            onMouseEnter={e => !loading && ((e.currentTarget as HTMLElement).style.background = 'var(--primary-hover)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--primary)')}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in…
              </span>
            ) : 'Sign in to Admin'}
          </button>
        </div>

        <p className="text-center text-[11px] mt-5" style={{ color: 'var(--fg-muted)' }}>
          PageAI Admin Panel · Access logs are recorded
        </p>
      </div>
    </div>
  );
}