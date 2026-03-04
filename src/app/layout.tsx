import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'PageAI — Train AI on Your Website in Minutes | AI Chatbot SaaS',
    template: '%s | PageAI',
  },
  description: 'Transform any website into an intelligent AI assistant. PageAI crawls your content, creates embeddings, and powers accurate Q&A chatbots with source citations — no coding required.',
  keywords: ['ai chatbot', 'website chatbot', 'rag chatbot', 'customer support ai', 'gpt chatbot', 'embed chatbot', 'ai customer service', 'website qa', 'chatbot saas'],
  authors: [{ name: 'PageAI', url: 'https://pageai.io' }],
  creator: 'PageAI',
  publisher: 'PageAI',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pageai.io'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'PageAI',
    title: 'PageAI — AI-Powered Website Chatbots',
    description: 'Train a custom AI chatbot on your website in minutes. RAG-powered answers with source citations.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PageAI — AI Chatbot SaaS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PageAI — AI-Powered Website Chatbots',
    description: 'Train a custom AI chatbot on your website with RAG technology.',
    images: ['/og-image.png'],
    creator: '@pageai_io',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
};

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'PageAI',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'AI-powered website chatbot platform using RAG technology for accurate, citation-backed answers.',
      offers: [
        { '@type': 'Offer', name: 'Starter', price: '0', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Growth', price: '19', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Professional', price: '49', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Enterprise', price: '129', priceCurrency: 'USD' },
      ],
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '2847', bestRating: '5' },
    },
    {
      '@type': 'Organization',
      name: 'PageAI',
      url: 'https://pageai.io',
      sameAs: ['https://twitter.com/pageai_io', 'https://github.com/pageai'],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is PageAI?',
          acceptedAnswer: { '@type': 'Answer', text: 'PageAI is an AI chatbot platform that automatically crawls your website and creates an intelligent assistant trained on your content using RAG technology.' },
        },
        {
          '@type': 'Question',
          name: 'How does RAG work?',
          acceptedAnswer: { '@type': 'Answer', text: 'RAG (Retrieval-Augmented Generation) embeds your content into vectors, searches for the most relevant chunks when a question is asked, and uses GPT to generate accurate answers grounded in your actual data.' },
        },
        {
          '@type': 'Question',
          name: 'Is PageAI free?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes! Our Starter plan is free forever with 100 AI responses per month, 10 pages, and GPT-3.5 Turbo. Upgrade anytime for more features.' },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('pageai-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
