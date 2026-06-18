'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/lib/theme';
import { useAuth } from '@/lib/auth';

const mainLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Use Cases', href: '/use-cases' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Blog', href: '/blog' },
];

const resourceLinks = [
  { label: 'Documentation', href: '/docs' },
  { label: 'Blog', href: '/blog' },
  { label: 'Use Cases', href: '/use-cases' },
  { label: 'API Reference', href: '/api-reference' },
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

function DropdownMenu({ label, items }: { label: string; items: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-[13.5px] text-fg-secondary hover:text-fg transition-colors duration-200"
      >
        {label}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 py-1.5 w-44 rounded-xl border border-edge bg-surface/95 backdrop-blur-xl shadow-lg z-50"
          >
            {items.map(item => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-[13px] text-fg-secondary hover:text-fg hover:bg-surface-elevated/50 transition-colors rounded-lg mx-1"
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-bg/80 backdrop-blur-2xl border-b border-edge/50'
        : 'bg-transparent'
    }`}>
      <div className="max-w-300 mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image src="/logo.png" alt="PageCortex" width={32} height={32} className="rounded-lg" />
          <span className="text-[17px] font-semibold text-fg tracking-tight">PageCortex</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-7">
          {mainLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-[13.5px] text-fg-secondary hover:text-fg transition-colors duration-200"
            >
              {l.label}
            </Link>
          ))}
          <DropdownMenu label="Resources" items={resourceLinks} />
          <DropdownMenu label="Company" items={companyLinks} />
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Link
              href="/dashboard"
              className="text-[13.5px] font-medium px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all duration-300 hover:shadow-[0_0_24px_rgba(79,109,245,0.25)]"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[13.5px] text-fg-secondary hover:text-fg transition-colors duration-200 px-3 py-1.5"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-[13.5px] font-medium px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all duration-300 hover:shadow-[0_0_24px_rgba(79,109,245,0.25)]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-fg-secondary hover:text-fg transition-colors"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {open ? (
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden bg-surface/95 backdrop-blur-2xl border-b border-edge overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {mainLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block text-[14px] text-fg-secondary hover:text-fg py-2.5 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-fg-muted uppercase tracking-wide py-1.5">Resources</p>
                {resourceLinks.map(l => (
                  <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block text-[14px] text-fg-secondary hover:text-fg py-2 pl-2 transition-colors">{l.label}</Link>
                ))}
              </div>
              <div className="pt-1">
                <p className="text-[11px] font-semibold text-fg-muted uppercase tracking-wide py-1.5">Company</p>
                {companyLinks.map(l => (
                  <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block text-[14px] text-fg-secondary hover:text-fg py-2 pl-2 transition-colors">{l.label}</Link>
                ))}
              </div>
              <div className="pt-3 mt-2 border-t border-edge space-y-2">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[14px] text-fg-secondary">Theme</span>
                  <ThemeToggle />
                </div>
                {user ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block text-[14px] font-medium text-center px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all"
                  >
                    Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="block text-[14px] text-fg-secondary hover:text-fg py-2.5"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setOpen(false)}
                      className="block text-[14px] font-medium text-center px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

