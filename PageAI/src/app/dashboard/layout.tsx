'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ThemeToggle } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

const nav = [
  { label: 'Overview', href: '/dashboard', icon: '◈' },
  { label: 'Websites', href: '/dashboard/websites', icon: '◎' },
  { label: 'Bots', href: '/dashboard/bots', icon: '✦' },
  { label: 'Knowledge', href: '/dashboard/knowledge', icon: '◇' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: '▣' },
  { label: 'Billing', href: '/dashboard/billing', icon: '◆' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙' },
];

interface UsageInfo {
  plan: string;
  monthly_message_count: number;
  monthly_message_limit: number;
  total_pages_indexed: number;
  max_pages_indexed: number;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  // Only redirect once auth has fully resolved — prevents race with OAuth callback
  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Fetch usage for status bar
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('plan, monthly_message_count, monthly_message_limit, total_pages_indexed, max_pages_indexed').eq('id', user.id).single()
      .then(({ data }) => { if (data) setUsage(data as UsageInfo); });
  }, [user, pathname]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  const initials = (user.user_metadata?.full_name || user.email || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname.startsWith(href);
  const msgPct = usage ? Math.min(100, Math.round((usage.monthly_message_count / Math.max(usage.monthly_message_limit, 1)) * 100)) : 0;

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
              <span className="text-[12px] w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Usage Status Bar */}
        {usage && (
          <div className="mx-3 mb-3 p-3 rounded-lg border border-edge bg-bg/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-fg-muted uppercase tracking-wide">Messages</span>
              <span className="text-[11px] text-fg-muted">{usage.monthly_message_count.toLocaleString()} / {usage.monthly_message_limit.toLocaleString()}</span>
            </div>
            <div className="h-1.5 rounded-full bg-edge overflow-hidden mb-2">
              <div className={`h-full rounded-full transition-all duration-500 ${msgPct > 90 ? 'bg-danger' : msgPct > 70 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${msgPct}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${
                usage.plan === 'free' ? 'bg-fg-muted/10 text-fg-muted'
                : usage.plan === 'starter' ? 'bg-success/10 text-success'
                : usage.plan === 'growth' ? 'bg-primary/10 text-primary'
                : 'bg-warning/10 text-warning'
              }`}>{usage.plan}</span>
              {msgPct > 80 && <Link href="/dashboard/billing" className="text-[10px] text-warning hover:text-fg transition-colors">Upgrade →</Link>}
            </div>
          </div>
        )}

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
                <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] transition-colors ${
                  isActive(item.href) ? 'bg-primary/10 text-primary font-medium' : 'text-fg-secondary hover:text-fg'
                }`}>
                  <span className="text-[13px]">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
            {/* Mobile usage bar */}
            {usage && (
              <div className="mt-4 p-3 rounded-lg border border-edge bg-bg/40">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-semibold capitalize px-1.5 py-0.5 rounded ${usage.plan === 'free' ? 'bg-fg-muted/10 text-fg-muted' : 'bg-primary/10 text-primary'}`}>{usage.plan}</span>
                  <span className="text-[10px] text-fg-muted">{msgPct}% used</span>
                </div>
                <div className="h-1.5 rounded-full bg-edge overflow-hidden">
                  <div className={`h-full rounded-full ${msgPct > 90 ? 'bg-danger' : msgPct > 70 ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${msgPct}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
        <header className="h-14 flex items-center gap-4 px-6 border-b border-edge bg-bg/80 backdrop-blur-xl sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-edge/50 transition-colors">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
          </button>
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6">
          <div className="max-w-[1100px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
