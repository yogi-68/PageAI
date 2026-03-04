'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ThemeToggle } from '@/lib/theme';

const nav = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Bots', href: '/admin/bots' },
  { label: 'Revenue', href: '/admin/revenue' },
];

const ADMIN_EMAILS = ['yogeshwar2005@gmail.com', 'admin@pageai.com'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (!ADMIN_EMAILS.includes(user.email || '')) router.push('/dashboard');
  }, [user, router]);

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) return null;

  const isActive = (href: string) => href === '/admin' ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="w-[220px] fixed inset-y-0 left-0 bg-surface/50 border-r border-edge flex flex-col z-30">
        <div className="px-5 h-14 flex items-center border-b border-edge">
          <span className="text-[15px] font-bold text-fg">Admin Panel</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-[13.5px] transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-fg-secondary hover:text-fg hover:bg-surface-elevated/50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-edge">
          <button onClick={signOut} className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-fg-muted hover:text-fg hover:bg-surface-elevated/50 transition-all duration-200">Sign out</button>
        </div>
      </aside>
      <main className="flex-1 ml-[220px]">
        <header className="h-14 flex items-center justify-end px-6 border-b border-edge bg-bg/80 backdrop-blur-xl sticky top-0 z-20">
          <ThemeToggle />
        </header>
        <div className="p-6 max-w-[1100px]">{children}</div>
      </main>
    </div>
  );
}
