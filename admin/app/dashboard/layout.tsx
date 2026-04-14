'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  { href: '/dashboard',               label: 'Overview',       icon: '◈' },
  { href: '/dashboard/users',         label: 'Users',          icon: '◉' },
  { href: '/dashboard/bots',          label: 'Bots',           icon: '✦' },
  { href: '/dashboard/revenue',       label: 'Revenue',        icon: '◆' },
  { href: '/dashboard/analytics',     label: 'Analytics',      icon: '▣' },
  { href: '/dashboard/conversations', label: 'Conversations',  icon: '◎' },
  { href: '/dashboard/webhooks',      label: 'Webhooks',       icon: '◇' },
  { href: '/dashboard/settings',      label: 'Settings',       icon: '⚙' },
];

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v2M8 13v2M1 8h2m10 0h2M3.2 3.2l1.4 1.4m6.8 6.8 1.4 1.4M3.2 12.8l1.4-1.4m6.8-6.8 1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 10a6 6 0 01-8-8 6 6 0 100 12 6 6 0 008-4z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.replace('/'); return; }
    try {
      const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
      setAdminEmail(user.email || '');
    } catch { /**/ }
    const saved = (localStorage.getItem('admin_theme') || 'dark') as 'dark' | 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
    setReady(true);
  }, [router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('admin_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.replace('/');
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const initials = adminEmail
    ? adminEmail.split('@')[0].slice(0, 2).toUpperCase()
    : 'AD';

  const currentPage = NAV.find(n => isActive(n.href))?.label ?? 'Dashboard';

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid var(--edge)', borderTopColor: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-[240px] flex-col fixed inset-y-0 left-0 z-30"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--edge)' }}>

        {/* Logo */}
        <div className="px-5 h-14 flex items-center shrink-0" style={{ borderBottom: '1px solid var(--edge)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(79,109,245,0.12)', border: '1px solid rgba(79,109,245,0.25)' }}>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H8.5l-4 4V14H5a2 2 0 01-2-2V5z" fill="#4f6df5"/>
              </svg>
            </div>
            <span className="text-[14px] font-semibold" style={{ color: 'var(--fg)' }}>PageAI</span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(79,109,245,0.12)', color: 'var(--primary)' }}>Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-all duration-150 ${
                isActive(href)
                  ? 'font-medium'
                  : 'hover:text-[var(--fg)] hover:bg-[var(--surface-elevated)]'
              }`}
              style={isActive(href) ? {
                background: 'rgba(79,109,245,0.1)',
                color: 'var(--primary)',
              } : { color: 'var(--fg-secondary)' }}
            >
              <span className="text-[12px] w-4 text-center leading-none">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid var(--edge)' }}>
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1 rounded-lg">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
              style={{ background: 'rgba(79,109,245,0.15)', color: 'var(--primary)' }}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium truncate" style={{ color: 'var(--fg)' }}>
                {adminEmail || 'Admin'}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--fg-muted)' }}>Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors hover:bg-[rgba(239,68,68,0.08)] hover:text-[var(--danger)]"
            style={{ color: 'var(--fg-secondary)' }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(11,14,24,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] flex flex-col z-50"
            style={{ background: 'var(--surface)', borderRight: '1px solid var(--edge)' }}>

            <div className="flex items-center justify-between px-5 h-14 shrink-0"
              style={{ borderBottom: '1px solid var(--edge)' }}>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold" style={{ color: 'var(--fg)' }}>PageAI</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(79,109,245,0.12)', color: 'var(--primary)' }}>Admin</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md transition-colors hover:bg-[var(--surface-elevated)]"
                style={{ color: 'var(--fg-secondary)' }}
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
              {NAV.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] transition-colors ${
                    isActive(href) ? 'font-medium' : 'hover:text-[var(--fg)]'
                  }`}
                  style={isActive(href) ? {
                    background: 'rgba(79,109,245,0.1)',
                    color: 'var(--primary)',
                  } : { color: 'var(--fg-secondary)' }}
                >
                  <span className="text-[13px]">{icon}</span>
                  {label}
                </Link>
              ))}
            </nav>

            <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid var(--edge)' }}>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors hover:bg-[rgba(239,68,68,0.08)]"
                style={{ color: 'var(--danger)' }}
              >
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">

        {/* Sticky header */}
        <header
          className="h-14 flex items-center gap-4 px-5 lg:px-6 sticky top-0 z-20 shrink-0"
          style={{
            background: 'rgba(11,14,24,0.85)',
            borderBottom: '1px solid var(--edge)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-md transition-colors hover:bg-[var(--surface-elevated)]"
            style={{ color: 'var(--fg-secondary)' }}
          >
            <MenuIcon />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[13px]">
            <span style={{ color: 'var(--fg-muted)' }}>Admin</span>
            <span style={{ color: 'var(--fg-muted)' }}>/</span>
            <span className="font-medium" style={{ color: 'var(--fg)' }}>{currentPage}</span>
          </div>

          <div className="flex-1" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface-elevated)]"
            style={{ color: 'var(--fg-secondary)' }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Admin avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{ background: 'rgba(79,109,245,0.2)', color: 'var(--primary)' }}
            title={adminEmail}
          >
            {initials}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 lg:p-8">
          <div className="max-w-[1200px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}