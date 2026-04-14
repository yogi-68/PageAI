'use client';

import { useState } from 'react';

const ENV_VARS = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL',       desc: 'Supabase project URL',                    required: true  },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',  desc: 'Supabase anonymous key',                  required: true  },
  { key: 'SUPABASE_SERVICE_ROLE_KEY',      desc: 'Service role key (server-only, secret)',   required: true  },
  { key: 'ADMIN_EMAILS',                   desc: 'Comma-separated admin email addresses',    required: true  },
  { key: 'NEXT_PUBLIC_MAIN_APP_URL',       desc: 'Main PageAI app URL for cross-links',      required: false },
];

const QUICK_LINKS = [
  { label: 'Main App',           url: process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://pageai-tau.vercel.app', icon: '◈' },
  { label: 'Supabase Dashboard', url: 'https://supabase.com/dashboard',                                        icon: '◉' },
  { label: 'Dodo Payments',      url: 'https://dashboard.dodopayments.com',                                    icon: '◆' },
  { label: 'Vercel Dashboard',   url: 'https://vercel.com/dashboard',                                         icon: '▣' },
];

const NOTES = [
  { text: 'This admin app should be deployed separately from the main PageAI app.', icon: '◎' },
  { text: 'Use a custom domain or Vercel subdomain (e.g., admin-pageai.vercel.app).', icon: '◎' },
  { text: `Keep SUPABASE_SERVICE_ROLE_KEY secure — never expose it to the browser.`, key: 'SUPABASE_SERVICE_ROLE_KEY', icon: '⚠' },
  { text: `Update ADMIN_EMAILS to add or remove administrator access.`, key: 'ADMIN_EMAILS', icon: '◎' },
  { text: 'All API routes use the service role for unrestricted database access.', icon: '◎' },
  { text: 'The admin app shares the same Supabase database as the main app.', icon: '◎' },
];

function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 10L10 2M5 2h5v5" />
    </svg>
  );
}

export default function SettingsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold tracking-tight" style={{ color: 'var(--fg)' }}>Settings</h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--fg-secondary)' }}>
          Configuration, environment variables, and deployment details
        </p>
      </div>

      {/* Quick links */}
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
        <h2 className="text-[13px] font-semibold mb-4" style={{ color: 'var(--fg)' }}>Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-3 rounded-lg transition-all group"
              style={{ border: '1px solid var(--edge)', background: 'var(--bg)', color: 'var(--fg-secondary)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(79,109,245,0.3)';
                (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--edge)';
                (e.currentTarget as HTMLElement).style.color = 'var(--fg-secondary)';
              }}
            >
              <span className="text-[14px]">{link.icon}</span>
              <span className="text-[13px] font-medium flex-1">{link.label}</span>
              <ExternalLinkIcon />
            </a>
          ))}
        </div>
      </div>

      {/* Env vars */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--edge)' }}>
          <h2 className="text-[13px] font-semibold" style={{ color: 'var(--fg)' }}>Environment Variables</h2>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--edge)' }}>
          {ENV_VARS.map(v => (
            <div key={v.key} className="flex items-center gap-3 px-5 py-3.5">
              <button
                onClick={() => copyKey(v.key)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-mono font-medium shrink-0 transition-all"
                style={{ background: 'rgba(79,109,245,0.08)', color: 'var(--primary)', border: '1px solid rgba(79,109,245,0.15)' }}
                title="Click to copy"
              >
                {copied === v.key ? 'Copied!' : v.key}
              </button>
              <span className="flex-1 text-[13px]" style={{ color: 'var(--fg-secondary)' }}>{v.desc}</span>
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0"
                style={v.required
                  ? { background: 'rgba(251,191,36,0.1)', color: 'var(--warning)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'var(--fg-muted)' }
                }
              >
                {v.required ? 'Required' : 'Optional'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--edge)' }}>
        <h2 className="text-[13px] font-semibold mb-4" style={{ color: 'var(--fg)' }}>Deployment Notes</h2>
        <div className="space-y-2.5">
          {NOTES.map((note, i) => (
            <div key={i} className="flex items-start gap-3 text-[13px]" style={{ color: 'var(--fg-secondary)' }}>
              <span className="text-[11px] mt-0.5 shrink-0" style={{ color: note.icon === '⚠' ? 'var(--warning)' : 'var(--fg-muted)' }}>
                {note.icon}
              </span>
              <span>
                {note.key
                  ? <>
                      {note.text.split(note.key).map((part, j) => j === 0
                        ? part
                        : <><code key={j} className="text-[11.5px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(79,109,245,0.08)', color: 'var(--primary)' }}>{note.key}</code>{part}</>
                      )}
                    </>
                  : note.text
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}