'use client';

import { useState } from 'react';

export default function SettingsPage() {
    const [mainAppUrl] = useState(process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://pageai-tau.vercel.app');

    const envVars = [
        { key: 'NEXT_PUBLIC_SUPABASE_URL',      desc: 'Supabase project URL',                    required: true },
        { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', desc: 'Supabase anonymous key',                  required: true },
        { key: 'SUPABASE_SERVICE_ROLE_KEY',      desc: 'Supabase service role key (server only)', required: true },
        { key: 'ADMIN_EMAILS',                   desc: 'Comma-separated admin email addresses',   required: true },
        { key: 'NEXT_PUBLIC_MAIN_APP_URL',       desc: 'Main PageAI app URL',                     required: false },
    ];

    const quickLinks = [
        { label: 'Main App',            url: mainAppUrl },
        { label: 'Supabase Dashboard',  url: 'https://supabase.com/dashboard' },
        { label: 'Dodo Payments',       url: 'https://dashboard.dodopayments.com' },
        { label: 'Vercel Dashboard',    url: 'https://vercel.com/dashboard' },
    ];

    const notes = [
        'This admin app should be deployed separately from the main PageAI app.',
        'Use a custom domain or Vercel subdomain (e.g., admin-pageai.vercel.app).',
        'Keep SUPABASE_SERVICE_ROLE_KEY secure - never expose it to the client.',
        'Update ADMIN_EMAILS env var to add or remove admin access.',
        'All API routes use the service role key for full database access.',
        'The admin app shares the same Supabase database as the main app.',
    ];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--fg)]">Settings</h1>
                <p className="text-sm text-[var(--fg-secondary)] mt-0.5">Configuration, environment variables, and deployment info</p>
            </div>

            {/* Quick Links */}
            <div className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] p-5 mb-5">
                <h2 className="text-sm font-semibold text-[var(--fg)] mb-4">Quick Links</h2>
                <div className="flex flex-wrap gap-2">
                    {quickLinks.map(link => (
                        <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--edge)] bg-[var(--surface-elevated)] text-[var(--primary)] text-sm font-medium hover:bg-[var(--edge)] transition-colors"
                        >
                            {link.label}
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M2 10L10 2M5 2h5v5" />
                            </svg>
                        </a>
                    ))}
                </div>
            </div>

            {/* Env vars */}
            <div className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] p-5 mb-5">
                <h2 className="text-sm font-semibold text-[var(--fg)] mb-4">Required Environment Variables</h2>
                <div className="flex flex-col gap-2">
                    {envVars.map(v => (
                        <div key={v.key} className="flex items-center gap-3 px-3.5 py-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--edge)]">
                            <code className="px-2 py-0.5 rounded-md text-xs font-mono bg-[rgba(79,109,245,0.1)] text-[var(--primary)] shrink-0">
                                {v.key}
                            </code>
                            <span className="text-sm text-[var(--fg-secondary)] flex-1">{v.desc}</span>
                            {v.required
                                ? <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">REQUIRED</span>
                                : <span className="text-[10px] font-semibold text-[var(--fg-muted)] bg-[var(--edge)] px-2 py-0.5 rounded-full shrink-0">OPTIONAL</span>
                            }
                        </div>
                    ))}
                </div>
            </div>

            {/* Deployment Notes */}
            <div className="rounded-xl bg-[var(--surface)] border border-[var(--edge)] p-5">
                <h2 className="text-sm font-semibold text-[var(--fg)] mb-4">Deployment Notes</h2>
                <ul className="space-y-2.5">
                    {notes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--fg-secondary)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0 mt-1.5" />
                            {note.split(/(`[^`]+`)/).map((part, j) =>
                                part.startsWith('`') && part.endsWith('`')
                                    ? <code key={j} className="text-[var(--primary)] font-mono text-xs">{part.slice(1, -1)}</code>
                                    : part
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}