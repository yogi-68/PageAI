'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/lib/theme';

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Guide', href: '/guide' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/15 group-hover:border-primary/30">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" className="fill-primary" />
              <circle cx="6" cy="6.5" r="0.75" className="fill-white dark:fill-[#edf0f7]" />
              <circle cx="8.5" cy="6.5" r="0.75" className="fill-white dark:fill-[#edf0f7]" />
              <circle cx="11" cy="6.5" r="0.75" className="fill-white dark:fill-[#edf0f7]" />
            </svg>
          </div>
          <span className="text-[17px] font-semibold text-fg tracking-tight">PageAI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-[13.5px] text-fg-secondary hover:text-fg transition-colors duration-200"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
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
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block text-[14px] text-fg-secondary hover:text-fg py-2.5 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-3 mt-2 border-t border-edge space-y-2">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[14px] text-fg-secondary">Theme</span>
                  <ThemeToggle />
                </div>
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
