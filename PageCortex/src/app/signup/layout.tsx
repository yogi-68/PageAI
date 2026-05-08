import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up Free — Build Your AI Chatbot with PageCortex',
  description: 'Create your free PageCortex account and deploy an AI chatbot trained on your website in under 5 minutes. No credit card required.',
  alternates: { canonical: 'https://pagecortex.com/signup' },
  openGraph: {
    title: 'Sign Up Free — Build Your AI Chatbot with PageCortex',
    description: 'Deploy an AI chatbot on your website in under 5 minutes. Free forever plan available — no credit card required.',
    url: 'https://pagecortex.com/signup',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Sign Up — PageCortex' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign Up Free — PageCortex AI Chatbot Builder',
    description: 'Deploy an AI chatbot in 5 minutes. Free forever plan — no credit card.',
    images: ['/og-image.png'],
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
