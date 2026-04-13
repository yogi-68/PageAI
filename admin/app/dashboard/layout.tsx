'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

function IconGrid() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="shrink-0">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="6" cy="5" r="2.5" />
      <path d="M1 14a5 5 0 0110 0" />
      <circle cx="12" cy="5" r="2" />
      <path d="M14 14a3 3 0 00-3.5-2.9" />
    </svg>
  );
}
function IconBot() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="2" y="5" width="12" height="9" rx="2" />
      <circle cx="6" cy="9.5" r="1" />
      <circle cx="10" cy="9.5" r="1" />
      <path d="M8 5V3m-2.5 0h5" />
    </svg>
  );
}
function IconTrending() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M2 13V9h2v4H2zm3.5-5V5h2v8H5.5V8zm4 2v-2h2v5h-2v-3zm3-6v9h2V4h-2z" />
      <path d="M1 14.5h14" />
    </svg>
  );
}
function IconLineChart() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M1 12l4-5 3 3 3-4 4-2" />
      <path d="M1 14.5h14" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M2 3a1 1 0 00-1 1v7l3-3h9a1 1 0 001-1V4a1 1 0 00-1-1H2z" />
    </svg>
  );
}
function IconZap() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M9 1L4 9h6l-3 6 9-9H10L13 1H9z" />
    </svg>
  );
}
function IconGear() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v2M8 13v2M1 8h2m10 0h2M3.2 3.2l1.4 1.4m6.8 6.8 1.4 1.4M3.2 12.8l1.4-1.4m6.8-6.8 1.4-1.4" />
    </svg>
  );
}
function IconSun() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v2M8 13v2M1 8h2m10 0h2M3.2 3.2l1.4 1.4m6.8 6.8 1.4 1.4M3.2 12.8l1.4-1.4m6.8-6.8 1.4-1.4" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0">
      <path d="M14 10a6 6 0 01-8-8 6 6 0 100 12 6 6 0 008-4z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: '/dashboard',               label: 'Overview',       Icon: IconGrid },
  { href: '/dashboard/users',         label: 'Users',          Icon: IconUsers },
  { href: '/dashboard/bots',          label: 'Bots',           Icon: IconBot },
  { href: '/dashboard/revenue',       label: 'Revenue',        Icon: IconTrending },
  { href: '/dashboard/analytics',     label: 'Analytics',      Icon: IconLineChart },
  { href: '/dashboard/conversations', label: 'Conversations',  Icon: IconChat },
  { href: '/dashboard/webhooks',      label: 'Webhooks',       Icon: IconZap },
  { href: '/dashboard/settings',      label: 'Settings',       Icon: IconGear },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

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

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[220px] flex-col fixed inset-y-0 left-0 bg-[var(--surface)] border-r border-[var(--edge)] z-30">
        {/* Logo + theme toggle */}
        <div className="px-4 h-14 flex items-center justify-between border-b border-[var(--edge)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 1l2.5 5H14l-4 3.5 1.5 5.5L8 12l-3.5 3 1.5-5.5L2 6h3.5L8 1z" fill="#ef4444" />
              </svg>
            </div>
            <span className="text-[13.5px] font-semibold text-[var(--fg)]">PageAI Admin</span>
          </div>
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--surface-elevated)] transition-colors"
          >
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${
                isActive(href)
                  ? 'bg-[rgba(79,109,245,0.12)] text-[var(--primary)] font-medium'
                  : 'text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--surface-elevated)]'
              }`}
            >
              <Icon />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--edge)] space-y-1 shrink-0">
          {adminEmail && (
            <p className="px-3 py-1 text-[11px] text-[var(--fg-muted)] truncate">{adminEmail}</p>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-lg text-[13px] text-[var(--danger)] bg-[rgba(239,68,68,0.06)] hover:bg-[rgba(239,68,68,0.12)] transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-[220px] min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-[var(--edge)] bg-[var(--surface)] sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center shrink-0">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M8 1l2.5 5H14l-4 3.5 1.5 5.5L8 12l-3.5 3 1.5-5.5L2 6h3.5L8 1z" fill="#ef4444" />
              </svg>
            </div>
            <span className="text-[14px] font-semibold text-[var(--fg)]">PageAI Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--fg-secondary)] hover:bg-[var(--surface-elevated)] transition-colors">
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>
            <button onClick={handleLogout} className="text-[13px] text-[var(--danger)] px-2 py-1">Sign out</button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-5 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}