'use client';

/**
 * OAuth Callback Handler
 *
 * Supabase PKCE flow redirects here with ?code=xxx  after the user authorises
 * with Google / GitHub. We exchange the code for a session client-side (the
 * PKCE code verifier is in localStorage — it must be done in the same browser).
 *
 * Implicit flow (hash fragment) is also handled as fallback.
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;

    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const errorParam = url.searchParams.get('error');
    const errorDesc = url.searchParams.get('error_description');

    if (errorParam) {
      console.error('OAuth error:', errorParam, errorDesc);
      router.replace(`/login?error=${encodeURIComponent(errorDesc || errorParam)}`);
      return;
    }

    if (code) {
      // PKCE flow — exchange the code using the same browser client that started the flow
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error('Code exchange failed:', error.message);
          router.replace('/login?error=oauth_failed');
        } else {
          router.replace('/dashboard');
        }
      });
      return;
    }

    // Implicit flow fallback — tokens arrive as hash fragment; Supabase
    // processes them automatically via onAuthStateChange
    if (url.hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) router.replace('/dashboard');
        else router.replace('/login?error=oauth_failed');
      });
      return;
    }

    // Nothing to process
    router.replace('/login');
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-bg"
      aria-label="Completing sign in…"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-fg-secondary">Completing sign in…</p>
      </div>
    </div>
  );
}
