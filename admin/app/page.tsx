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
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--bg)]">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1l2.5 5H14l-4 3.5 1.5 5.5L8 12l-3.5 3 1.5-5.5L2 6h3.5L8 1z" fill="#ef4444" />
              </svg>
            </div>
            <span className="text-[17px] font-bold text-[var(--fg)]">PageAI Admin</span>
          </div>
          <h1 className="text-[24px] font-bold text-[var(--fg)] mb-1 tracking-tight">Admin Login</h1>
          <p className="text-[13px] text-[var(--fg-secondary)]">Only authorized administrators can access this panel</p>
        </div>

        <form onSubmit={handleLogin} className="p-6 rounded-2xl space-y-4 bg-[var(--surface)] border border-[var(--edge)]">
          {error && (
            <div className="px-3 py-2 rounded-lg text-[13px] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#ef4444]">
              {error}
            </div>
          )}
          <div>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)] mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="admin@pageai.com"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-[var(--bg)] border border-[var(--edge)] text-[var(--fg)] outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--fg-secondary)] mb-1.5">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-[var(--bg)] border border-[var(--edge)] text-[var(--fg)] outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg text-white text-[13.5px] font-medium transition-opacity disabled:opacity-50 bg-[var(--danger)] hover:opacity-90"
          >
            {loading ? 'Signing in…' : 'Sign in to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}


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
      // Store token in localStorage
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1l2.5 5H14l-4 3.5 1.5 5.5L8 12l-3.5 3 1.5-5.5L2 6h3.5L8 1z" fill="#ef4444"/></svg>
            </div>
            <span className="text-lg font-bold" style={{ color: 'var(--fg)' }}>PageAI Admin</span>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--fg)' }}>Admin Login</h1>
          <p className="text-sm" style={{ color: 'var(--fg-secondary)' }}>Only authorized administrators can access this panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 p-6 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
          {error && <div className="px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>{error}</div>}

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--fg-secondary)' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@pageai.com"
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{ background: 'var(--bg)', border: '1px solid var(--edge)', color: 'var(--fg)' }} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--fg-secondary)' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{ background: 'var(--bg)', border: '1px solid var(--edge)', color: 'var(--fg)' }} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50"
            style={{ background: 'var(--danger)' }}>
            {loading ? 'Signing in...' : 'Sign in to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
