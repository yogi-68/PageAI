'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: '?' },
  { href: '/dashboard/users', label: 'Users', icon: '?' },
  { href: '/dashboard/bots', label: 'Bots', icon: '?' },
  { href: '/dashboard/revenue', label: 'Revenue', icon: '?' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '?' },
  { href: '/dashboard/conversations', label: 'Conversations', icon: '?' },
  { href: '/dashboard/webhooks', label: 'Webhooks', icon: '?' },
  { href: '/dashboard/settings', label: 'Settings', icon: '?' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.replace('/'); return; }
    try {
      const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
      setAdminEmail(user.email || '');
    } catch { /* */ }
    setReady(true);
  }, [router]);

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
      <aside className="hidden lg:flex w-[220px] flex-col fixed inset-y-0 left-0 bg-[var(--surface)] border-r border-[var(--edge)] z-30 shrink-0">
        {/* Logo */}
        <div className="px-5 h-14 flex items-center border-b border-[var(--edge)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 1l2.5 5H14l-4 3.5 1.5 5.5L8 12l-3.5 3 1.5-5.5L2 6h3.5L8 1z" fill="#ef4444" />
              </svg>
            </div>
            <span className="text-[14px] font-semibold text-[var(--fg)]">PageAI Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${
                isActive(item.href)
                  ? 'bg-[rgba(79,109,245,0.12)] text-[var(--primary)] font-medium'
                  : 'text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--surface-elevated)]'
              }`}
            >
              <span className="text-[11px] w-4 text-center opacity-80">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--edge)] space-y-1">
          {adminEmail && (
            <p className="px-3 py-1 text-[11px] text-[var(--fg-muted)] truncate">{adminEmail}</p>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-lg text-[13px] text-[var(--danger)] bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)] transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-[220px] overflow-auto">
        {/* Top bar on mobile */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-[var(--edge)] bg-[var(--surface)]">
          <span className="text-[14px] font-semibold text-[var(--fg)]">PageAI Admin</span>
          <button onClick={handleLogout} className="text-[13px] text-[var(--danger)]">Sign out</button>
        </div>
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
