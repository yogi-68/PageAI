"use client";

import {
    User,
    Bell,
    Shield,
    Globe,
    Key,
    Trash2,
    Save,
    Eye,
    EyeOff,
    Copy,
    Plus,
    RefreshCw,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const [name, setName] = useState("Yogesh Kumar");
    const [email] = useState("yogesh@example.com");
    const [notifications, setNotifications] = useState({
        usage: true,
        weekly: true,
        marketing: false,
        security: true,
    });

    const apiKeys = [
        {
            id: "key_1",
            name: "Production",
            prefix: "pk_live_a8f2",
            created: "Jan 15, 2026",
            lastUsed: "2 hours ago",
        },
        {
            id: "key_2",
            name: "Development",
            prefix: "pk_test_b3c9",
            created: "Feb 1, 2026",
            lastUsed: "Never",
        },
    ];

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-text-secondary text-sm mt-1">
                    Manage your account preferences
                </p>
            </div>

            {/* Profile */}
            <div className="card !p-0">
                <div className="flex items-center gap-2 p-5 border-b border-border">
                    <User className="w-5 h-5 text-text-muted" />
                    <h2 className="text-lg font-semibold">Profile</h2>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            YK
                        </div>
                        <div>
                            <button className="btn-secondary text-sm !py-2">
                                Change Avatar
                            </button>
                            <p className="text-xs text-text-muted mt-1">
                                JPG, PNG • Max 2MB
                            </p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="input opacity-50 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button className="btn-primary text-sm">
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="card !p-0">
                <div className="flex items-center gap-2 p-5 border-b border-border">
                    <Bell className="w-5 h-5 text-text-muted" />
                    <h2 className="text-lg font-semibold">Notifications</h2>
                </div>
                <div className="p-5 space-y-4">
                    {[
                        {
                            key: "usage",
                            label: "Usage Alerts",
                            desc: "Get notified when you approach plan limits",
                        },
                        {
                            key: "weekly",
                            label: "Weekly Reports",
                            desc: "Receive weekly analytics summary by email",
                        },
                        {
                            key: "marketing",
                            label: "Product Updates",
                            desc: "New features, tips, and offers",
                        },
                        {
                            key: "security",
                            label: "Security Alerts",
                            desc: "Login attempts and account changes",
                        },
                    ].map((item) => (
                        <div
                            key={item.key}
                            className="flex items-center justify-between py-2"
                        >
                            <div>
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-xs text-text-muted">{item.desc}</p>
                            </div>
                            <button
                                onClick={() =>
                                    setNotifications((prev) => ({
                                        ...prev,
                                        [item.key]:
                                            !prev[item.key as keyof typeof notifications],
                                    }))
                                }
                                className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications]
                                        ? "bg-primary-600"
                                        : "bg-surface-elevated border border-border"
                                    }`}
                            >
                                <div
                                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications[item.key as keyof typeof notifications]
                                            ? "left-[22px]"
                                            : "left-0.5"
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* API Keys */}
            <div className="card !p-0">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-text-muted" />
                        <h2 className="text-lg font-semibold">API Keys</h2>
                    </div>
                    <button className="btn-primary text-sm !py-2">
                        <Plus className="w-3.5 h-3.5" />
                        New Key
                    </button>
                </div>
                <div className="divide-y divide-border">
                    {apiKeys.map((key) => (
                        <div
                            key={key.id}
                            className="flex items-center justify-between px-5 py-4"
                        >
                            <div>
                                <p className="text-sm font-medium">{key.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <code className="text-xs text-text-muted bg-surface-elevated px-2 py-0.5 rounded">
                                        {key.prefix}••••••••••••
                                    </code>
                                    <span className="text-xs text-text-muted">
                                        Created {key.created}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-text-muted">
                                    Last used: {key.lastUsed}
                                </span>
                                <button className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-white">
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-rose-500/10 text-text-muted hover:text-rose-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="card !p-0 !border-rose-500/20">
                <div className="flex items-center gap-2 p-5 border-b border-rose-500/20">
                    <Shield className="w-5 h-5 text-rose-400" />
                    <h2 className="text-lg font-semibold text-rose-400">Danger Zone</h2>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Delete Account</p>
                            <p className="text-xs text-text-muted">
                                Permanently delete your account and all data
                            </p>
                        </div>
                        <button className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors">
                            <Trash2 className="w-4 h-4 inline mr-1" />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
