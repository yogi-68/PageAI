import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import AdSense from '@/components/AdSense';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'PageCortex — Convert SaaS Trial Users With Instant AI Answers',
    template: '%s | PageCortex',
  },
  description: 'PageCortex answers trial users\' pricing, integration, and setup questions automatically — 24/7. Convert more free trials into paying customers. Free plan included.',
  keywords: [
    'saas trial conversion',
    'why saas trial users dont convert',
    'reduce saas trial churn',
    'pre-sales questions saas',
    'answer pre-sales questions automatically',
    'ai chatbot for saas',
    'saas trial to paid conversion',
    'chatbase alternative saas',
    'intercom alternative startups',
    'ai pre-sales assistant',
    'trial user support automation',
    'saas chatbot',
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
    title: 'PageCortex — AI Pre-Sales Assistant for SaaS',
    description: 'Answer trial users\' questions instantly. Convert more free trials into paying customers.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PageCortex — AI Pre-Sales Assistant' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@pagecortex_io',
    creator: '@pagecortex_io',
    title: 'PageCortex — AI Pre-Sales Assistant for SaaS',
    description: 'Answer trial users\' pricing, integration, and setup questions automatically. Free plan included.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
      description: 'PageCortex helps SaaS companies convert more trial users by answering pre-sales questions instantly, 24/7.',
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
      description: 'AI pre-sales assistant for SaaS. Answers trial users\' pricing, integration, and setup questions from your website and docs — automatically, 24/7.',
      featureList: [
        'Automatic website crawling & indexing',
        '95–98% accurate RAG-powered answers',
        'Embeddable chat widget for SaaS sites',
        'Trial conversion analytics',
        'Confidence-based human handoff',
        'Unanswered question tracking',
        'One-line script embed',
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
        email: 'yogeshwar0402@gmail.com',
        contactType: 'customer support',
      },
      sameAs: ['https://twitter.com/PageCortex', 'https://github.com/pagecortex'],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is PageCortex?',
          acceptedAnswer: { '@type': 'Answer', text: 'PageCortex is an AI pre-sales assistant built for SaaS companies. It answers trial users\' pricing, integration, and setup questions instantly using your website and docs — so more trials convert to paid.' },
        },
        {
          '@type': 'Question',
          name: 'How does PageCortex work?',
          acceptedAnswer: { '@type': 'Answer', text: 'PageCortex crawls your website, converts your content into vector embeddings, and uses hybrid search to find the most relevant information. It then feeds that context to our AI to generate accurate, source-cited answers.' },
        },
        {
          '@type': 'Question',
          name: 'Is PageCortex free?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes! PageCortex offers a free forever plan with 50 messages/month, 1 chatbot, and 100 indexed pages. Paid plans start at $29/month for more capacity.' },
        },
        {
          '@type': 'Question',
          name: 'How do I embed the chatbot on my website?',
          acceptedAnswer: { '@type': 'Answer', text: "After creating your bot, PageCortex gives you a single JavaScript snippet. Paste it into your website's HTML (or CMS) and the chat widget appears instantly — no developer needed." },
        },
        {
          '@type': 'Question',
          name: 'What websites does PageCortex support?',
          acceptedAnswer: { '@type': 'Answer', text: 'PageCortex embeds on any SaaS marketing site, pricing page, or docs portal with a single script tag. Platform-specific setup guides are available in our documentation.' },
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
        <script
          defer
          data-website-id="dfid_rYbWFAaUUrBUlUiGo435r"
          data-domain="pagecortex.com"
          src="https://datafa.st/js/script.js"
        ></script>
        <AdSense />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        {/* PageCortex support widget */}
        <script
          src="https://www.pagecortex.com/widget.js"
          data-bot-id="e8225726-00c5-412e-b0ec-fa1a9f72cd28"
          data-color="#6366f1"
          data-position="right"
          async
        />
      </body>
    </html>
  );
}
