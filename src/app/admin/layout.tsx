'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import {
    LayoutDashboard, Users, Bot, DollarSign,
    Shield, LogOut, ArrowLeft, Loader2,
} from 'lucide-react';

const adminNav = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/bots', label: 'Bots', icon: Bot },
    { href: '/admin/revenue', label: 'Revenue', icon: DollarSign },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        // Check if user email is in ADMIN_EMAILS
        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
        if (adminEmails.includes(user.email?.toLowerCase() || '')) {
            setAuthorized(true);
        } else {
            // Also check via API for server-side admin list
            fetch(`/api/admin/stats?userId=${user.id}&checkAdmin=true`)
                .then(r => r.json())
                .then(d => {
                    if (d.isAdmin) setAuthorized(true);
                    else router.push('/dashboard');
                })
                .catch(() => router.push('/dashboard'));
        }
        setChecking(false);
    }, [user, router]);

    if (checking || !authorized) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[var(--primary-500)] mx-auto mb-4" />
                    <p className="text-sm text-[var(--text-muted)]">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-base)] flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col">
                <div className="p-5 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">PageAI Admin</p>
                            <p className="text-[10px] text-[var(--text-muted)]">Management Console</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-3 space-y-1">
                    {adminNav.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-gradient-to-r from-rose-500/10 to-orange-500/10 text-rose-400 border border-rose-500/20'
                                        : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)]'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-[var(--border-subtle)] space-y-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)] transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/5 w-full transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
