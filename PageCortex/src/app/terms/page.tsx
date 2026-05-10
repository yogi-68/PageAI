import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'PageCortex terms of service — the rules and guidelines for using our platform.',
  alternates: { canonical: 'https://pagecortex.com/terms' },
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg pt-32 pb-24">
        <article className="max-w-[720px] mx-auto px-6">
          <h1 className="text-[36px] font-bold text-fg tracking-[-0.03em] mb-4">Terms of Service</h1>
          <p className="text-[14px] text-fg-muted mb-10">Last updated: May 2025</p>

          <div className="space-y-8 text-[15px] text-fg-secondary leading-[1.75]">
            <section>
              <h2 className="text-[20px] font-semibold text-fg mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using PageCortex, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold text-fg mb-3">2. Description of Service</h2>
              <p>PageCortex provides an AI-powered chatbot platform that allows users to create chatbots trained on their website content. We offer free and paid subscription plans with varying levels of functionality.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold text-fg mb-3">3. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate information when creating an account.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold text-fg mb-3">4. Acceptable Use</h2>
              <p>You agree not to use PageCortex for any unlawful purpose, to distribute malicious content, to impersonate others, or to interfere with the operation of our service. Chatbots must not be used to generate misleading or harmful content.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold text-fg mb-3">5. Intellectual Property</h2>
              <p>You retain ownership of your website content. By using our service, you grant us a limited license to process your content for the purpose of training your chatbot. We do not claim ownership of your data.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold text-fg mb-3">6. Payment & Billing</h2>
              <p>Paid plans are billed monthly or annually. You may cancel at any time. Refunds are handled on a case-by-case basis. Free plans have usage limits as described on our pricing page.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold text-fg mb-3">7. Limitation of Liability</h2>
              <p>PageCortex is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-semibold text-fg mb-3">8. Contact</h2>
              <p>For questions about these terms, contact us at <a href="mailto:yogeshwar0402@gmail.com" className="text-primary hover:text-primary-hover transition-colors">yogeshwar0402@gmail.com</a>.</p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
