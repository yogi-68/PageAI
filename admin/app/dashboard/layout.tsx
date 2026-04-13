'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Overview', icon: '📊' },
    { href: '/dashboard/users', label: 'Users', icon: '👥' },
    { href: '/dashboard/bots', label: 'Bots', icon: '🤖' },
    { href: '/dashboard/revenue', label: 'Revenue', icon: '💰' },
    { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
    { href: '/dashboard/conversations', label: 'Conversations', icon: '💬' },
    { href: '/dashboard/webhooks', label: 'Webhooks', icon: '🔗' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [ready, setReady] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.replace('/');
            return;
        }
        setReady(true);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.replace('/');
    };

    if (!ready) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>
            {/* Sidebar */}
            <aside style={{
                width: collapsed ? 64 : 240,
                background: 'var(--surface)',
                borderRight: '1px solid var(--edge)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.2s',
                flexShrink: 0,
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 16px',
                    borderBottom: '1px solid var(--edge)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                }}>
                    {!collapsed && <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>PageAI Admin</span>}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer',
                            fontSize: 18, padding: 4, flexShrink: 0,
                        }}
                    >
                        {collapsed ? '→' : '←'}
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: collapsed ? '12px 20px' : '10px 16px',
                                    margin: '2px 8px',
                                    borderRadius: 8,
                                    textDecoration: 'none',
                                    color: isActive ? 'var(--primary)' : 'var(--muted)',
                                    background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: 14,
                                    transition: 'all 0.15s',
                                }}
                            >
                                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div style={{ padding: 16, borderTop: '1px solid var(--edge)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 8,
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            fontSize: 13,
                        }}
                    >
                        {collapsed ? '🚪' : 'Logout'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflow: 'auto', padding: 32 }}>
                {children}
            </main>
        </div>
    );
}
