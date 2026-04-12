'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ThemeToggle } from '@/lib/theme';

const nav = [
  { label: 'Dashboard', href: '/admin', icon: '◈' },
  { label: 'Users', href: '/admin/users', icon: '◉' },
  { label: 'Bots', href: '/admin/bots', icon: '◎' },
  { label: 'Revenue', href: '/admin/revenue', icon: '◇' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    // Check admin status via API (uses ADMIN_EMAILS env var server-side)
    fetch(`/api/admin/stats?checkAdmin=true&userId=${user.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.isAdmin) setAuthorized(true);
        else router.push('/dashboard');
      })
      .catch(() => router.push('/dashboard'));
  }, [user, router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (!user || !authorized) return null;

  const isActive = (href: string) => href === '/admin' ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[220px] fixed inset-y-0 left-0 bg-surface/50 border-r border-edge flex-col z-30">
        <div className="px-5 h-14 flex items-center border-b border-edge">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-danger/10 border border-danger/20 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 1l2.5 5H14l-4 3.5 1.5 5.5L8 12l-3.5 3 1.5-5.5L2 6h3.5L8 1z" fill="#ef4444"/></svg>
            </div>
            <span className="text-[15px] font-bold text-fg">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-fg-secondary hover:text-fg hover:bg-surface-elevated/50'
              }`}
            >
              <span className="text-[12px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-edge space-y-1">
          <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-[13px] text-fg-muted hover:text-fg hover:bg-surface-elevated/50 transition-all duration-200">← Back to Dashboard</Link>
          <button onClick={signOut} className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-fg-muted hover:text-fg hover:bg-surface-elevated/50 transition-all duration-200">Sign out</button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[260px] bg-surface border-r border-edge p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[15px] font-bold text-fg">Admin Panel</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-edge/50 transition-colors">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              </button>
            </div>
            <nav className="space-y-0.5">
              {nav.map(item => (
                <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] transition-colors ${
                  isActive(item.href) ? 'bg-primary/10 text-primary font-medium' : 'text-fg-secondary hover:text-fg'
                }`}>
                  <span>{item.icon}</span> {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 pt-4 border-t border-edge space-y-1">
              <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-[13px] text-fg-muted hover:text-fg transition-colors">← Dashboard</Link>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 lg:ml-[220px]">
        <header className="h-14 flex items-center justify-between px-6 border-b border-edge bg-bg/80 backdrop-blur-xl sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-edge/50 transition-colors">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
          </button>
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <div className="p-6 max-w-[1100px]">{children}</div>
      </main>
    </div>
  );
}
