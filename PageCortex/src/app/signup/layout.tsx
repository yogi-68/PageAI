import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up Free — Answer SaaS Trial Questions Automatically',
  description: 'Create your free PageCortex account and answer trial users\' pre-sales questions from your website and docs. No credit card required.',
  alternates: { canonical: 'https://pagecortex.com/signup' },
  openGraph: {
    title: 'Sign Up Free — PageCortex for SaaS Trial Conversion',
    description: 'Answer pricing, integration, and setup questions automatically. Free plan — no credit card required.',
    url: 'https://pagecortex.com/signup',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Sign Up — PageCortex' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign Up Free — PageCortex for SaaS',
    description: 'Answer trial users\' pre-sales questions automatically. Free plan — no credit card.',
    images: ['/og-image.png'],
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
