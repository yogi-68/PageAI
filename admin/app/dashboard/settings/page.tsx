'use client';

import { useState } from 'react';

export default function SettingsPage() {
    const [mainAppUrl] = useState(process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://pageai-tau.vercel.app');

    const envVars = [
        { key: 'NEXT_PUBLIC_SUPABASE_URL', desc: 'Supabase project URL', required: true },
        { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', desc: 'Supabase anonymous key', required: true },
        { key: 'SUPABASE_SERVICE_ROLE_KEY', desc: 'Supabase service role key (server only)', required: true },
        { key: 'ADMIN_EMAILS', desc: 'Comma-separated admin emails', required: true },
        { key: 'NEXT_PUBLIC_MAIN_APP_URL', desc: 'Main PageAI app URL', required: false },
    ];

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Settings</h1>

            {/* Quick Links */}
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--edge)',
                borderRadius: 12, padding: 24, marginBottom: 24,
            }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Quick Links</h2>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {[
                        { label: 'Main App', url: mainAppUrl },
                        { label: 'Supabase Dashboard', url: 'https://supabase.com/dashboard' },
                        { label: 'Dodo Payments', url: 'https://dashboard.dodopayments.com' },
                        { label: 'Vercel Dashboard', url: 'https://vercel.com/dashboard' },
                    ].map(link => (
                        <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '10px 18px', borderRadius: 8,
                                border: '1px solid var(--edge)', background: 'rgba(255,255,255,0.02)',
                                color: 'var(--primary)', textDecoration: 'none', fontSize: 13,
                            }}
                        >
                            {link.label} ↗
                        </a>
                    ))}
                </div>
            </div>

            {/* Environment Variables */}
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--edge)',
                borderRadius: 12, padding: 24, marginBottom: 24,
            }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Required Environment Variables</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {envVars.map(v => (
                        <div key={v.key} style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                            borderRadius: 8, background: 'rgba(255,255,255,0.02)',
                        }}>
                            <code style={{
                                padding: '2px 8px', borderRadius: 4, fontSize: 12,
                                background: 'rgba(99,102,241,0.1)', color: 'var(--primary)',
                                fontFamily: 'monospace',
                            }}>
                                {v.key}
                            </code>
                            <span style={{ fontSize: 13, color: 'var(--muted)', flex: 1 }}>{v.desc}</span>
                            {v.required && (
                                <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600 }}>REQUIRED</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Deployment Notes */}
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--edge)',
                borderRadius: 12, padding: 24,
            }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Deployment Notes</h2>
                <ul style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 2, paddingLeft: 20 }}>
                    <li>This admin app should be deployed separately from the main PageAI app</li>
                    <li>Use a custom domain or Vercel subdomain (e.g., admin-pageai.vercel.app)</li>
                    <li>Keep the <code style={{ color: 'var(--primary)' }}>SUPABASE_SERVICE_ROLE_KEY</code> secure — never expose to client</li>
                    <li>Update <code style={{ color: 'var(--primary)' }}>ADMIN_EMAILS</code> env var to add/remove admin access</li>
                    <li>All API routes use the service role key for full database access</li>
                    <li>The admin app shares the same Supabase database as the main app</li>
                </ul>
            </div>
        </div>
    );
}
