import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'PageCortex privacy policy — how we collect, use, and protect your data.',
  alternates: { canonical: 'https://pagecortex.com/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg pt-32 pb-24">
        <article className="max-w-[720px] mx-auto px-6">
          <h1 className="text-[36px] font-bold text-fg tracking-[-0.03em] mb-4">Privacy Policy</h1>
          <p className="text-[14px] text-fg-muted mb-10">Last updated: May 2025</p>

          <div className="space-y-8 text-[15px] text-fg-secondary leading-[1.75]">
            <section>
              <h2 className="text-[20px] font-semibold text-fg mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, set up a chatbot, or contact us for support. This includes your name, email address, and website URLs you connect to our service.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold text-fg mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your requests.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold text-fg mb-3">3. Data Storage & Security</h2>
              <p>Your data is stored securely using industry-standard encryption. Website content crawled for chatbot training is stored in encrypted databases. We do not sell your data to third parties.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold text-fg mb-3">4. Third-Party Services</h2>
              <p>We use trusted third-party services including OpenAI for AI processing, Supabase for data storage, and Vercel for hosting. These services have their own privacy policies and data handling practices.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold text-fg mb-3">5. Cookies</h2>
              <p>We use essential cookies to maintain your session and preferences. We do not use tracking or advertising cookies.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold text-fg mb-3">6. Your Rights</h2>
              <p>You can request access to, correction of, or deletion of your personal data at any time by contacting us at yogeshwar0402@gmail.com.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold text-fg mb-3">7. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:yogeshwar0402@gmail.com" className="text-primary hover:text-primary-hover transition-colors">yogeshwar0402@gmail.com</a>.</p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
