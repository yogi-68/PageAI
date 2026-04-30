import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers — PageCortex',
  description: 'Join the PageCortex team and help build the future of AI-powered customer support.',
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar />
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-[760px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[13px] font-medium mb-6">Careers</div>
          <h1 className="text-[42px] md:text-[52px] font-bold tracking-[-0.03em] leading-[1.1] mb-6">Build the future<br /><span className="text-primary">of AI with us</span></h1>
          <p className="text-[18px] text-fg-secondary leading-relaxed mb-12">We&apos;re a small, ambitious team working on hard AI problems. We move fast, ship often, and care deeply about the product.</p>

          <div className="p-8 rounded-2xl border border-edge bg-surface/40 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>
            </div>
            <h2 className="text-[20px] font-bold text-fg mb-2">No open roles right now</h2>
            <p className="text-[14px] text-fg-secondary mb-5 max-w-[360px] mx-auto">We don&apos;t have open positions listed yet, but we&apos;re always interested in exceptional people. Send us your background.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-[13.5px] font-medium hover:bg-primary/90 transition-colors">Get in touch</Link>
          </div>

          <div className="mt-12 grid sm:grid-cols-3 gap-4">
            {[
              { title: 'Remote-first', desc: 'Work from anywhere. We care about output, not location.' },
              { title: 'Equity from day 1', desc: 'Every team member gets meaningful ownership in what we build.' },
              { title: 'High ownership', desc: 'Small team means large scope. You ship things that matter.' },
            ].map(p => (
              <div key={p.title} className="p-5 rounded-xl border border-edge bg-surface/30">
                <p className="text-[14px] font-semibold text-fg mb-1">{p.title}</p>
                <p className="text-[13px] text-fg-secondary leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
