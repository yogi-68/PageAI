'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ThemeToggle } from '@/lib/theme';

const nav = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Websites', href: '/dashboard/websites' },
  { label: 'Bots', href: '/dashboard/bots' },
  { label: 'Conversations', href: '/dashboard/conversations' },
  { label: 'Knowledge', href: '/dashboard/knowledge' },
  { label: 'Analytics', href: '/dashboard/analytics' },
  { label: 'Billing', href: '/dashboard/billing' },
  { label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { if (!user) router.push('/login'); }, [user, router]);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (!user) return null;

  const initials = (user.user_metadata?.full_name || user.email || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-[240px] flex-col fixed inset-y-0 left-0 bg-surface/50 border-r border-edge z-30">
        <div className="px-5 h-16 flex items-center border-b border-edge">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="#4f6df5"/></svg>
            </div>
            <span className="text-[15px] font-semibold text-fg">PageAI</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(item => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-all duration-200 ${
              isActive(item.href)
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-fg-secondary hover:text-fg hover:bg-surface-elevated/50'
            }`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-edge">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <span className="text-[11px] font-semibold text-primary">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-fg truncate">{user.user_metadata?.full_name || 'User'}</p>
              <p className="text-[11px] text-fg-muted truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={signOut} className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-fg-muted hover:text-fg hover:bg-surface-elevated/50 transition-all duration-200">Sign out</button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[260px] bg-surface border-r border-edge p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[15px] font-semibold text-fg">PageAI</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-edge/50 transition-colors">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              </button>
            </div>
            <nav className="space-y-0.5">
              {nav.map(item => (
                <Link key={item.href} href={item.href} className={`block px-3 py-2.5 rounded-lg text-[14px] transition-colors ${
                  isActive(item.href) ? 'bg-primary/10 text-primary font-medium' : 'text-fg-secondary hover:text-fg'
                }`}>{item.label}</Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
        <header className="h-14 flex items-center gap-4 px-6 border-b border-edge bg-bg/80 backdrop-blur-xl sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-edge/50 transition-colors">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
          </button>
          <div className="flex-1">
            <input type="text" placeholder="Search..." className="w-full max-w-[300px] px-3 py-1.5 rounded-lg border border-edge bg-bg/60 text-[13px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all" />
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6">
          <div className="max-w-[1100px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
