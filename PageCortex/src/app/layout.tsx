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
    default: 'PageCortex — Train AI on Your Website in Minutes | AI Chatbot SaaS',
    template: '%s | PageCortex',
  },
  description: 'Transform any website into an intelligent AI assistant. PageCortex crawls your content, creates embeddings, and powers accurate Q&A chatbots with source citations — no coding required.',
  keywords: ['ai chatbot', 'website chatbot', 'rag chatbot', 'customer support ai', 'gpt chatbot', 'embed chatbot', 'ai customer service', 'website qa', 'chatbot saas'],
  authors: [{ name: 'PageCortex', url: 'https://pagecortex.io' }],
  creator: 'PageCortex',
  publisher: 'PageCortex',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pagecortex.io'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'PageCortex',
    title: 'PageCortex — AI-Powered Website Chatbots',
    description: 'Train a custom AI chatbot on your website in minutes. RAG-powered answers with source citations.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PageCortex — AI Chatbot SaaS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PageCortex — AI-Powered Website Chatbots',
    description: 'Train a custom AI chatbot on your website with RAG technology.',
    images: ['/og-image.png'],
    creator: '@pagecortex_io',
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
      name: 'PageCortex',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'AI-powered website chatbot platform using RAG technology for accurate, citation-backed answers.',
      offers: [
        { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Starter', price: '29', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Growth', price: '69', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Scale', price: '199', priceCurrency: 'USD' },
      ],
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '2847', bestRating: '5' },
    },
    {
      '@type': 'Organization',
      name: 'PageCortex',
      url: 'https://pagecortex.io',
      sameAs: ['https://twitter.com/PageCortex_io', 'https://github.com/pagecortex'],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is PageCortex?',
          acceptedAnswer: { '@type': 'Answer', text: 'PageCortex is an AI chatbot platform that automatically crawls your website and creates an intelligent assistant trained on your content using RAG technology.' },
        },
        {
          '@type': 'Question',
          name: 'How does RAG work?',
          acceptedAnswer: { '@type': 'Answer', text: 'RAG (Retrieval-Augmented Generation) embeds your content into vectors, uses hybrid search (vector + BM25) to find the most relevant chunks, then uses GPT-4.1 to generate accurate answers grounded in your actual data.' },
        },
        {
          '@type': 'Question',
          name: 'Is PageCortex free?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes! Our Free plan is free forever with 50 messages per month, 100 pages, and GPT-4.1 Mini. Upgrade anytime for more features.' },
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
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('pagecortex-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()` }} />
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
        {/* PageCortex support widget */}
        <script
          src="https://pagecortex.vercel.app/widget.js"
          data-bot-id="54ab9e2c-bb23-4e9c-9c92-4d80da4b4570"
          data-color="#f59e0b"
          data-position="left"
          async
        />
      </body>
    </html>
  );
}
