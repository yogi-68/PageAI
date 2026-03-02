'use client';

import { useEffect, useState } from 'react';
import {
    Users, Search, Loader2, Shield, Bot,
    MessageSquare, Calendar, Mail,
} from 'lucide-react';

interface UserRow {
    id: string;
    email: string;
    full_name: string | null;
    plan: string;
    monthly_question_count: number;
    monthly_question_limit: number;
    created_at: string;
    botCount?: number;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/admin/stats?type=users')
            .then(r => r.json())
            .then(d => setUsers(d.users || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = search
        ? users.filter(u =>
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.full_name?.toLowerCase().includes(search.toLowerCase())
        )
        : users;

    const planColors: Record<string, string> = {
        free: '',
        basic: 'badge-amber',
        pro: 'badge-emerald',
        premium: 'bg-gradient-to-r from-violet-500/15 to-purple-500/15 text-violet-400 border border-violet-500/20',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-500)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Users</h1>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">
                        {users.length} registered users
                    </p>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by email or name..."
                    className="input !pl-10"
                />
            </div>

            <div className="card !p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border-subtle)]">
                                <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-5 py-3">User</th>
                                <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-5 py-3">Plan</th>
                                <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-5 py-3">Usage</th>
                                <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-5 py-3">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {filtered.map((u) => (
                                <tr key={u.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                                                {(u.full_name || u.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{u.full_name || 'No name'}</p>
                                                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {u.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`badge text-[10px] ${planColors[u.plan] || ''}`}>
                                            {u.plan}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div>
                                            <p className="text-sm font-medium">
                                                {u.monthly_question_count} / {u.monthly_question_limit}
                                            </p>
                                            <div className="w-24 h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden mt-1">
                                                <div
                                                    className="h-full gradient-bg rounded-full"
                                                    style={{ width: `${Math.min((u.monthly_question_count / u.monthly_question_limit) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-10 h-10 text-[var(--text-dim)] mx-auto mb-3" />
                            <p className="text-sm text-[var(--text-muted)]">
                                {search ? 'No users match your search' : 'No users yet'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
