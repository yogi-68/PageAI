import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In — Access Your AI Chatbot Dashboard',
  description: 'Log in to your PageCortex account to manage your AI chatbots, view conversation analytics, and configure your widgets.',
  alternates: { canonical: 'https://pagecortex.com/login' },
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
