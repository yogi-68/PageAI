"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Sparkles,
    Home,
    Bot,
    BarChart3,
    Settings,
    CreditCard,
    FileText,
    MessageSquare,
    Globe,
    HelpCircle,
    LogOut,
    ChevronLeft,
    Plus,
    Bell,
    User,
    Search,
} from "lucide-react";

const navItems = [
    { icon: Home, label: "Overview", href: "/dashboard" },
    { icon: Bot, label: "My Bots", href: "/dashboard/bots" },
    { icon: MessageSquare, label: "Conversations", href: "/dashboard/conversations" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Globe, label: "Websites", href: "/dashboard/websites" },
    { icon: FileText, label: "Knowledge Base", href: "/dashboard/knowledge" },
    { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [currentPath] = useState("/dashboard");

    return (
        <div className="flex h-screen bg-surface overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`${collapsed ? "w-[72px]" : "w-64"
                    } flex flex-col bg-surface-elevated border-r border-border transition-all duration-300 flex-shrink-0`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        {!collapsed && (
                            <span className="text-lg font-bold tracking-tight">
                                Page<span className="gradient-text">AI</span>
                            </span>
                        )}
                    </Link>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-white transition-colors"
                    >
                        <ChevronLeft
                            className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""
                                }`}
                        />
                    </button>
                </div>

                {/* New Bot Button */}
                <div className="px-3 py-4">
                    <Link
                        href="/dashboard/bots/new"
                        className={`btn-primary w-full ${collapsed ? "!px-0 justify-center" : ""
                            }`}
                    >
                        <Plus className="w-4 h-4" />
                        {!collapsed && <span>New Bot</span>}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = currentPath === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive
                                        ? "bg-primary-600/10 text-primary-400 font-medium"
                                        : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
                                    } ${collapsed ? "justify-center !px-0" : ""}`}
                                title={collapsed ? item.label : undefined}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="px-3 py-4 border-t border-border space-y-1">
                    <Link
                        href="/help"
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-text-primary hover:bg-surface-hover ${collapsed ? "justify-center !px-0" : ""
                            }`}
                    >
                        <HelpCircle className="w-5 h-5" />
                        {!collapsed && <span>Help & Support</span>}
                    </Link>
                    <button
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-rose-400 hover:bg-rose-500/5 w-full ${collapsed ? "justify-center !px-0" : ""
                            }`}
                    >
                        <LogOut className="w-5 h-5" />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface-elevated/50">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search bots, conversations..."
                                className="input !py-2 !pl-10 !pr-4 !w-72 !bg-surface-card"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Plan badge */}
                        <div className="badge text-xs">
                            <Sparkles className="w-3 h-3" />
                            Starter Plan
                        </div>
                        {/* Notifications */}
                        <button className="relative p-2 rounded-xl hover:bg-surface-hover text-text-muted hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                        </button>
                        {/* Avatar */}
                        <button className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                            <User className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
