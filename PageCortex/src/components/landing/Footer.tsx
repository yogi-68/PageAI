import Link from 'next/link';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Blog', href: '/blog' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Changelog', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Cookies', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-edge bg-surface/30">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H7l-3 3V11H4a2 2 0 01-2-2V4z" fill="#4f6df5" />
                </svg>
              </div>
              <span className="text-[16px] font-semibold text-fg tracking-tight">PageCortex</span>
            </Link>
            <p className="text-[13.5px] text-fg-secondary leading-relaxed max-w-[260px]">
              Turn any website into an intelligent AI chatbot. Powered by advanced RAG technology.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-fg-muted mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[13.5px] text-fg-secondary hover:text-fg transition-colors duration-200">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-edge flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12.5px] text-fg-muted">
            &copy; {new Date().getFullYear()} PageCortex. All rights reserved.
          </p>
          <p className="text-[12.5px] text-fg-muted">
            Built with Next.js, Supabase &amp; OpenAI
          </p>
        </div>
      </div>
    </footer>
  );
}
