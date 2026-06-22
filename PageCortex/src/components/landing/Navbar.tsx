'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import { ChevronDown } from 'lucide-react';

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
        className="flex items-center gap-1 text-[13.5px] text-fg-secondary hover:text-fg transition-colors duration-200 font-medium"
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.25, 0.4, 0.25, 1] }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 py-1.5 w-48 rounded-2xl border border-edge bg-surface/98 backdrop-blur-2xl shadow-xl shadow-black/5 z-50"
          >
            {items.map(item => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-[13px] text-fg-secondary hover:text-fg hover:bg-surface-elevated/80 transition-all rounded-xl mx-1 font-medium"
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
        ? 'bg-bg/90 backdrop-blur-2xl border-b border-edge/60 shadow-sm shadow-black/[0.04]'
        : 'bg-transparent'
    }`}>
      <div className="max-w-[1280px] mx-auto px-6 h-[64px] flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-edge group-hover:ring-primary/30 transition-all">
            <Image src="/logo.png" alt="PageCortex" width={32} height={32} className="rounded-xl" />
          </div>
          <span className="text-[17px] font-bold text-fg tracking-tight">PageCortex</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {mainLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-[13.5px] font-medium text-fg-secondary hover:text-fg transition-colors duration-200"
            >
              {l.label}
            </Link>
          ))}
          <DropdownMenu label="Resources" items={resourceLinks} />
          <DropdownMenu label="Company" items={companyLinks} />
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <ThemeToggle />
          {user ? (
            <Link
              href="/dashboard"
              className="text-[13.5px] font-semibold px-5 py-2.5 rounded-full bg-fg text-bg hover:opacity-90 transition-all duration-200 flex items-center gap-1.5"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[13.5px] font-medium text-fg-secondary hover:text-fg transition-colors duration-200 px-3 py-2"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-[13.5px] font-semibold px-5 py-2.5 rounded-full bg-fg text-bg hover:opacity-90 transition-all duration-200 flex items-center gap-1.5 shadow-sm"
              >
                Get Started Free →
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-fg-secondary hover:text-fg hover:bg-surface-elevated/80 transition-all"
          aria-label="Toggle menu"
        >
          <motion.div
            animate={open ? 'open' : 'closed'}
            className="w-5 h-4 flex flex-col justify-between"
          >
            <motion.span
              variants={{
                open: { rotate: 45, y: 7 },
                closed: { rotate: 0, y: 0 },
              }}
              transition={{ duration: 0.2 }}
              className="block h-0.5 w-full bg-current rounded-full"
            />
            <motion.span
              variants={{
                open: { opacity: 0, scaleX: 0 },
                closed: { opacity: 1, scaleX: 1 },
              }}
              transition={{ duration: 0.2 }}
              className="block h-0.5 w-full bg-current rounded-full"
            />
            <motion.span
              variants={{
                open: { rotate: -45, y: -7 },
                closed: { rotate: 0, y: 0 },
              }}
              transition={{ duration: 0.2 }}
              className="block h-0.5 w-full bg-current rounded-full"
            />
          </motion.div>
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
            className="md:hidden bg-bg/98 backdrop-blur-2xl border-b border-edge overflow-hidden"
          >
            <div className="px-6 py-5 space-y-1">
              {mainLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block text-[15px] font-medium text-fg-secondary hover:text-fg py-2.5 border-b border-edge/40 last:border-0 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-fg-muted uppercase tracking-widest py-2">Resources</p>
                {resourceLinks.map(l => (
                  <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block text-[14px] font-medium text-fg-secondary hover:text-fg py-2 pl-1 transition-colors">{l.label}</Link>
                ))}
              </div>
              <div className="pt-1">
                <p className="text-[11px] font-semibold text-fg-muted uppercase tracking-widest py-2">Company</p>
                {companyLinks.map(l => (
                  <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block text-[14px] font-medium text-fg-secondary hover:text-fg py-2 pl-1 transition-colors">{l.label}</Link>
                ))}
              </div>
              <div className="pt-4 mt-2 border-t border-edge space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-[14px] font-medium text-fg-secondary">Theme</span>
                  <ThemeToggle />
                </div>
                {user ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block text-[14px] font-semibold text-center px-4 py-3 rounded-full bg-fg text-bg hover:opacity-90 transition-all"
                  >
                    Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="block text-[14px] font-medium text-fg-secondary hover:text-fg py-2.5 text-center transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setOpen(false)}
                      className="block text-[14px] font-semibold text-center px-4 py-3 rounded-full bg-fg text-bg hover:opacity-90 transition-all"
                    >
                      Get Started Free →
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
