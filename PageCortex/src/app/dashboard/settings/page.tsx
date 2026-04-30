'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [notifications, setNotifications] = useState({
    newConversation: true,
    weeklyReport: true,
    productUpdates: false,
    marketingEmails: false,
  });

  useEffect(() => {
    if (!user) return;
    setFullName(user.user_metadata?.full_name || '');
    setEmail(user.email || '');
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
      if (error) throw error;
      toast.success('Profile updated');
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const deleteAccount = async () => {
    try {
      await supabase.from('profiles').delete().eq('id', user?.id);
      await signOut();
      toast.success('Account deleted');
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[22px] font-bold text-fg tracking-[-0.02em]">Settings</h1>
        <p className="text-[14px] text-fg-secondary mt-0.5">Manage your account, profile, and notification preferences</p>
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-edge bg-surface/40 p-5 space-y-5">
        <h2 className="text-[16px] font-semibold text-fg">Profile</h2>

        <div className="space-y-4 max-w-[480px]">
          <div>
            <label className="block text-[13px] font-medium text-fg mb-2">Full name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-edge bg-bg/60 text-[14px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary/50 transition-all" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-fg mb-2">Email</label>
            <input value={email} disabled className="w-full px-4 py-2.5 rounded-lg border border-edge bg-edge/30 text-[14px] text-fg-muted cursor-not-allowed" />
            <p className="text-[11px] text-fg-muted mt-1">Email cannot be changed</p>
          </div>
          <button onClick={saveProfile} disabled={saving} className="px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-edge bg-surface/40 p-5 space-y-4">
        <h2 className="text-[16px] font-semibold text-fg">Notifications</h2>

        <div className="divide-y divide-edge">
          {([
            { key: 'newConversation', label: 'New conversations', desc: 'Get notified when a visitor starts a chat' },
            { key: 'weeklyReport', label: 'Weekly reports', desc: 'Receive a weekly analytics summary' },
            { key: 'productUpdates', label: 'Product updates', desc: 'Learn about new features and improvements' },
            { key: 'marketingEmails', label: 'Marketing emails', desc: 'Tips and resources for growing your business' },
          ] as const).map(n => (
            <div key={n.key} className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-[14px] font-medium text-fg">{n.label}</p>
                <p className="text-[12px] text-fg-muted mt-0.5">{n.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${notifications[n.key] ? 'bg-primary' : 'bg-edge'}`}
              >
                <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform duration-200 ${notifications[n.key] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-danger/20 bg-danger/[0.03] p-5 space-y-4">
        <h2 className="text-[16px] font-semibold text-danger">Danger Zone</h2>

        {!deleteConfirm ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-fg">Delete account</p>
              <p className="text-[12px] text-fg-muted">Permanently delete your account and all data</p>
            </div>
            <button onClick={() => setDeleteConfirm(true)} className="px-4 py-2 rounded-lg border border-danger/30 text-[13px] text-danger hover:bg-danger/10 transition-colors">Delete</button>
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-danger/20 bg-danger/[0.04] space-y-3">
            <p className="text-[14px] font-semibold text-fg">Are you sure?</p>
            <p className="text-[13px] text-fg-secondary">This action cannot be undone. All your bots, conversations, and data will be permanently deleted.</p>
            <div className="flex items-center gap-2">
              <button onClick={deleteAccount} className="px-4 py-2 rounded-lg bg-danger text-white text-[13px] font-medium hover:bg-danger/80 transition-colors">Yes, delete my account</button>
              <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 rounded-lg border border-edge text-[13px] text-fg-secondary hover:text-fg transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
