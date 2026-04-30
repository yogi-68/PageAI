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
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v2M8 13v2M1 8h2m10 0h2M3.2 3.2l1.4 1.4m6.8 6.8 1.4 1.4M3.2 12.8l1.4-1.4m6.8-6.8 1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 10a6 6 0 01-8-8 6 6 0 100 12 6 6 0 008-4z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

function SidebarContent({
  adminEmail,
  initials,
  pathname,
  isActive,
  handleLogout,
  onClose,
}: {
  adminEmail: string;
  initials: string;
  pathname: string;
  isActive: (href: string) => boolean;
  handleLogout: () => void;
  onClose?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div style={{
        padding: '0 20px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--edge)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: 8,
            background: 'rgba(79,109,245,0.12)',
            border: '1px solid rgba(79,109,245,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H8.5l-4 4V14H5a2 2 0 01-2-2V5z" fill="#4f6df5" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>PageCortex</span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4,
            background: 'rgba(79,109,245,0.12)', color: 'var(--primary)',
          }}>Admin</span>
        </div>

        {/* Close button — only visible on mobile overlay */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, border: '1px solid var(--edge)',
              background: 'transparent', cursor: 'pointer',
              color: 'var(--fg-secondary)',
              flexShrink: 0,
            }}
            title="Close sidebar"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ href, label, icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8,
                fontSize: 14, fontWeight: active ? 500 : 400,
                textDecoration: 'none',
                color: active ? 'var(--primary)' : 'var(--fg-secondary)',
                background: active ? 'rgba(79,109,245,0.1)' : 'transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface-elevated)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--fg)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--fg-secondary)';
                }
              }}
            >
              <span style={{ fontSize: 13, width: 16, textAlign: 'center', lineHeight: 1, flexShrink: 0 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--edge)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(79,109,245,0.15)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
              {adminEmail || 'Admin'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--fg-muted)', margin: 0 }}>Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', textAlign: 'left', padding: '9px 12px',
            borderRadius: 8, border: 'none', background: 'transparent',
            cursor: 'pointer', fontSize: 14, color: 'var(--fg-secondary)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
            (e.currentTarget as HTMLElement).style.color = 'var(--danger)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--fg-secondary)';
          }}
        >
          Sign out
        </button>
      </div>
    </>
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

  // Close sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          border: '2px solid var(--edge)', borderTopColor: 'var(--primary)',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const sidebarProps = { adminEmail, initials, pathname, isActive, handleLogout };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>

      {/* ── Desktop sidebar — STICKY (participates in flex flow, no margin offset needed) ── */}
      <aside
        className="hidden lg:flex flex-col"
        style={{
          width: 240,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          background: 'var(--surface)',
          borderRight: '1px solid var(--edge)',
          zIndex: 30,
        }}
      >
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50 }}
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop — click to close */}
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(11,14,24,0.75)',
              backdropFilter: 'blur(4px)',
              cursor: 'pointer',
            }}
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          />

          {/* Sidebar panel */}
          <aside
            style={{
              position: 'absolute',
              left: 0, top: 0, bottom: 0,
              width: 280,
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--surface)',
              borderRight: '1px solid var(--edge)',
              zIndex: 51,
              animation: 'slideIn 0.2s ease',
            }}
          >
            <SidebarContent {...sidebarProps} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Sticky header */}
        <header style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 16px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          flexShrink: 0,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--edge)',
        }}>
          {/* Mobile hamburger — inside header, no z-index fighting */}
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            style={{
              width: 36, height: 36, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, border: '1px solid var(--edge)',
              background: 'transparent', cursor: 'pointer',
              color: 'var(--fg-secondary)',
            }}
          >
            <MenuIcon />
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <span style={{ color: 'var(--fg-muted)' }}>Admin</span>
            <span style={{ color: 'var(--fg-muted)' }}>/</span>
            <span style={{ fontWeight: 500, color: 'var(--fg)' }}>{currentPage}</span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, border: 'none', background: 'transparent',
              cursor: 'pointer', color: 'var(--fg-secondary)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-elevated)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Admin avatar */}
          <div
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(79,109,245,0.2)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, flexShrink: 0, cursor: 'default',
            }}
            title={adminEmail}
          >
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 32px' }}>
          <div style={{ maxWidth: 1200, width: '100%' }}>
            {children}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(-100%); opacity: 0.7; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}