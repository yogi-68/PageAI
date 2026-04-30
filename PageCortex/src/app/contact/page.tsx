import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — PageCortex',
  description: 'Get in touch with the PageCortex team. We\'re here to help.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar />
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-[600px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[13px] font-medium mb-6">Contact</div>
          <h1 className="text-[42px] md:text-[48px] font-bold tracking-[-0.03em] leading-[1.1] mb-4">Get in touch</h1>
          <p className="text-[17px] text-fg-secondary leading-relaxed mb-12">Have a question, need help with your account, or want to talk to sales? We typically respond within a few hours.</p>

          <div className="space-y-4">
            {[
              {
                icon: '✉',
                title: 'General & Sales',
                detail: 'hello@pagecortex.io',
                href: 'mailto:hello@pagecortex.io',
                desc: 'Questions about plans, pricing, or partnerships',
              },
              {
                icon: '🛠',
                title: 'Support',
                detail: 'support@pagecortex.io',
                href: 'mailto:support@pagecortex.io',
                desc: 'Technical issues, billing help, or account questions',
              },
            ].map(c => (
              <a
                key={c.title}
                href={c.href}
                className="flex items-start gap-4 p-5 rounded-xl border border-edge bg-surface/40 hover:border-edge-light hover:bg-surface/60 transition-all group"
              >
                <span className="text-[24px] mt-0.5">{c.icon}</span>
                <div>
                  <p className="text-[15px] font-semibold text-fg group-hover:text-primary transition-colors">{c.title}</p>
                  <p className="text-[13px] text-primary mt-0.5">{c.detail}</p>
                  <p className="text-[12px] text-fg-muted mt-1">{c.desc}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-10 p-5 rounded-xl border border-edge bg-surface/30">
            <p className="text-[14px] font-semibold text-fg mb-1">Response time</p>
            <p className="text-[13px] text-fg-secondary">We aim to respond to all inquiries within <span className="text-fg font-medium">4 business hours</span>. For urgent technical issues, mention &quot;URGENT&quot; in the subject line.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
