'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
    User, Bell, Key, Shield, Save, Eye, EyeOff,
    Copy, Plus, Loader2, Check, AlertTriangle,
} from 'lucide-react';

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState({ full_name: '', email: '', avatar_url: '' });

    useEffect(() => {
        if (!user) return;
        supabase
            .from('profiles')
            .select('full_name, email, avatar_url')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
                if (data) setProfile(data as any);
                setLoading(false);
            });
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        await supabase
            .from('profiles')
            .update({ full_name: profile.full_name })
            .eq('id', user.id);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-500)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">Manage your account</p>
            </div>

            {/* Profile */}
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <User className="w-5 h-5 text-[var(--primary-400)]" />
                    <h2 className="text-base font-semibold">Profile</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-2xl font-bold text-white">
                            {(profile.full_name || profile.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{profile.full_name || 'User'}</p>
                            <p className="text-xs text-[var(--text-muted)]">{profile.email}</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 pt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Full Name</label>
                            <input
                                className="input"
                                value={profile.full_name || ''}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Email</label>
                            <input className="input" value={profile.email} disabled />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button onClick={handleSave} disabled={saving} className="btn-primary">
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : saved ? (
                                <><Check className="w-4 h-4" />Saved!</>
                            ) : (
                                <><Save className="w-4 h-4" />Save Changes</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-5 h-5 text-[var(--primary-400)]" />
                    <h2 className="text-base font-semibold">Notifications</h2>
                </div>

                <div className="space-y-4">
                    {[
                        { label: 'Weekly usage reports', desc: 'Summary of bot activity', enabled: true },
                        { label: 'Unanswered question alerts', desc: 'When bot can\'t find an answer', enabled: true },
                        { label: 'Usage limit warnings', desc: 'At 80% and 100% usage', enabled: true },
                        { label: 'Product updates', desc: 'New features and improvements', enabled: false },
                    ].map((notif) => (
                        <div key={notif.label} className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm font-medium">{notif.label}</p>
                                <p className="text-xs text-[var(--text-muted)]">{notif.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked={notif.enabled} className="sr-only peer" />
                                <div className="w-10 h-5 rounded-full bg-[var(--bg-elevated)] peer-checked:bg-[var(--primary-500)] transition-colors peer-focus:ring-2 peer-focus:ring-[var(--primary-glow)] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="card !border-rose-500/15">
                <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <h2 className="text-base font-semibold text-rose-400">Danger Zone</h2>
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                    Once you delete your account, there is no going back. All data will be permanently removed.
                </p>
                <button className="btn-secondary !text-rose-400 !border-rose-500/15 hover:!bg-rose-500/5 text-sm">
                    Delete Account
                </button>
            </div>
        </div>
    );
}
