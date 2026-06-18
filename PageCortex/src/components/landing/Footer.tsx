import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Use Cases', href: '/use-cases' },
    { label: 'Blog', href: '/blog' },
  ],
  'Use Cases': [
    { label: 'AI Assistant for Website', href: '/use-cases/ai-assistant-for-website' },
    { label: 'AI Chatbot for Website', href: '/use-cases/ai-chatbot-for-website' },
    { label: 'Chatbot for SaaS', href: '/use-cases/chatbot-for-saas' },
    { label: 'No-Code Chatbot Builder', href: '/use-cases/no-code-chatbot-builder' },
    { label: 'Chatbase Alternative', href: '/use-cases/chatbase-alternative' },
    { label: 'Embed Chatbot', href: '/use-cases/embed-chatbot-on-website' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api-reference' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Blog', href: '/blog' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-edge bg-surface/30">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.png" alt="PageCortex" width={28} height={28} className="rounded-lg" />
              <span className="text-[16px] font-semibold text-fg tracking-tight">PageCortex</span>
            </Link>
            <p className="text-[13.5px] text-fg-secondary leading-relaxed max-w-[260px]">
              AI pre-sales assistant that converts website visitors into trials and demos. Powered by advanced RAG technology.
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
