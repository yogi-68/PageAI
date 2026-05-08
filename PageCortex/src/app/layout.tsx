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
    default: 'PageCortex — AI Chatbot Builder | Train on Your Website in Minutes',
    template: '%s | PageCortex',
  },
  description: 'Build and embed a custom AI chatbot trained on your website in under 5 minutes. PageCortex uses RAG + GPT-4.1 to deliver accurate, source-cited answers — no coding required.',
  keywords: [
    'ai chatbot builder',
    'website chatbot',
    'chatbot for website',
    'ai chatbot saas',
    'train ai on website',
    'custom ai chatbot',
    'rag chatbot',
    'embed chatbot on website',
    'ai chatbot no code',
    'ai customer support chatbot',
    'gpt chatbot for website',
    'chatgpt for my website',
    'ai q&a bot',
    'website ai assistant',
    'knowledge base chatbot',
    'chatbase alternative',
    'ai live chat',
    'automated customer support ai',
    'retrieval augmented generation chatbot',
    'how to add ai chatbot to website',
    'best ai chatbot for small business',
    'ecommerce chatbot ai',
    'saas chatbot builder',
    'no code chatbot builder',
    'pagecortex',
  ],
  authors: [{ name: 'PageCortex', url: 'https://pagecortex.com' }],
  creator: 'PageCortex',
  publisher: 'PageCortex',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pagecortex.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pagecortex.com',
    siteName: 'PageCortex',
    title: 'PageCortex — AI Chatbot Builder for Your Website',
    description: 'Build a custom AI chatbot trained on your website in under 5 minutes. RAG-powered, source-cited answers. No coding required.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PageCortex — AI Chatbot Builder' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@pagecortex_io',
    creator: '@pagecortex_io',
    title: 'PageCortex — AI Chatbot Builder for Your Website',
    description: 'Build a custom AI chatbot trained on your website in under 5 minutes. No coding required.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  verification: {
    google: 'ZMpMVrAX3p4Wjm4vhZzl_4dBQlXb56-sEvHLO9fyzd0',
  },
};

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://pagecortex.com/#website',
      name: 'PageCortex',
      url: 'https://pagecortex.com',
      description: 'Build and deploy AI chatbots trained on your website in minutes.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://pagecortex.com/docs?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://pagecortex.com/#software',
      name: 'PageCortex',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://pagecortex.com',
      description: 'AI-powered website chatbot platform. Train a custom chatbot on your website content using RAG technology for accurate, citation-backed answers. No coding required.',
      featureList: [
        'Automatic website crawling & indexing',
        'RAG-powered AI with GPT-4.1',
        'Embeddable chat widget',
        'Real-time conversation analytics',
        'Multi-website support',
        'Source-cited answers',
      ],
      offers: [
        { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD', description: '50 messages/month, 1 bot, 100 pages' },
        { '@type': 'Offer', name: 'Starter', price: '29', priceCurrency: 'USD', description: '1,000 messages/month, 3 bots, 500 pages' },
        { '@type': 'Offer', name: 'Growth', price: '69', priceCurrency: 'USD', description: '5,000 messages/month, 10 bots, 2,000 pages' },
        { '@type': 'Offer', name: 'Scale', price: '199', priceCurrency: 'USD', description: 'Unlimited messages, unlimited bots' },
      ],
    },
    {
      '@type': 'Organization',
      '@id': 'https://pagecortex.com/#organization',
      name: 'PageCortex',
      url: 'https://pagecortex.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://pagecortex.com/og-image.png',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@pagecortex.io',
        contactType: 'customer support',
      },
      sameAs: ['https://twitter.com/PageCortex_io', 'https://github.com/pagecortex'],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is PageCortex?',
          acceptedAnswer: { '@type': 'Answer', text: 'PageCortex is an AI chatbot builder that automatically crawls your website and creates an intelligent assistant trained on your content using RAG (Retrieval-Augmented Generation) technology. No coding required.' },
        },
        {
          '@type': 'Question',
          name: 'How does PageCortex work?',
          acceptedAnswer: { '@type': 'Answer', text: 'PageCortex crawls your website, converts your content into vector embeddings, and uses hybrid search (vector + BM25 keyword) to find the most relevant information. It then feeds that context to GPT-4.1 to generate accurate, source-cited answers.' },
        },
        {
          '@type': 'Question',
          name: 'Is PageCortex free?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes! PageCortex offers a free forever plan with 50 messages/month, 1 chatbot, 100 indexed pages, and GPT-4.1 Mini. Paid plans start at $29/month for more capacity.' },
        },
        {
          '@type': 'Question',
          name: 'How do I embed the chatbot on my website?',
          acceptedAnswer: { '@type': 'Answer', text: "After creating your bot, PageCortex gives you a single JavaScript snippet. Paste it into your website's HTML (or CMS) and the chat widget appears instantly — no developer needed." },
        },
        {
          '@type': 'Question',
          name: 'What websites does PageCortex support?',
          acceptedAnswer: { '@type': 'Answer', text: 'PageCortex works with any publicly accessible website — WordPress, Shopify, Webflow, custom HTML, or any other platform. Just enter your URL and we crawl it automatically.' },
        },
        {
          '@type': 'Question',
          name: 'How accurate is the AI chatbot?',
          acceptedAnswer: { '@type': 'Answer', text: "PageCortex's RAG architecture grounds every answer in your actual website content, so it only answers questions it can support with your data. Each answer includes source citations so users can verify the information." },
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
