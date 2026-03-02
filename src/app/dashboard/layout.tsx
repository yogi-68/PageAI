'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
    LayoutDashboard, Bot, MessageSquare, BarChart3, Globe, BookOpen,
    CreditCard, Settings, Plus, Search, Bell, ChevronLeft, LogOut,
    Sparkles, HelpCircle, Loader2, Menu,
} from 'lucide-react';

const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Bots', href: '/dashboard/bots', icon: Bot },
    { label: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Websites', href: '/dashboard/websites', icon: Globe },
    { label: 'Knowledge Base', href: '/dashboard/knowledge', icon: BookOpen },
    { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, signOut } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-500)] mx-auto mb-4" />
                    <p className="text-sm text-[var(--text-muted)]">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <div className="min-h-screen flex">
            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static top-0 left-0 h-screen z-50 flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'
                    } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Logo */}
                <div className={`flex items-center gap-3 px-5 py-5 border-b border-[var(--border-subtle)] ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    {!collapsed && <span className="text-base font-bold tracking-tight">Page<span className="gradient-text">AI</span></span>}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex ml-auto p-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
                    >
                        <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* New Bot */}
                <div className="p-3">
                    <Link
                        href="/dashboard/bots/new"
                        className={`btn-primary w-full ${collapsed ? '!px-0 !py-2.5 justify-center' : ''}`}
                    >
                        <Plus className="w-4 h-4" />
                        {!collapsed && 'New Bot'}
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-[var(--primary-glow)] text-[var(--primary-400)] border border-[var(--border-accent)]'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                    } ${collapsed ? 'justify-center !px-0' : ''}`}
                                title={collapsed ? item.label : undefined}
                            >
                                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                                {!collapsed && item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="p-3 border-t border-[var(--border-subtle)] space-y-1">
                    {!collapsed && (
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
                            <HelpCircle className="w-[18px] h-[18px]" />
                            Help & Support
                        </a>
                    )}
                    <button
                        onClick={handleSignOut}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/5 w-full ${collapsed ? 'justify-center !px-0' : ''}`}
                    >
                        <LogOut className="w-[18px] h-[18px]" />
                        {!collapsed && 'Sign Out'}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3 bg-[rgba(7,8,15,0.8)] backdrop-blur-xl border-b border-[var(--border-subtle)]">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search bots, conversations..."
                            className="input !py-2 !pl-10 !text-sm !bg-[var(--bg-surface)]"
                        />
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <div className="badge text-xs">
                            <Sparkles className="w-3 h-3" />
                            Starter Plan
                        </div>
                        <button className="relative p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)]">
                            <Bell className="w-5 h-5" />
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
                        </button>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white cursor-pointer">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
