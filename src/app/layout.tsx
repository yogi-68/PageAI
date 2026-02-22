import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pageai.io"),
  title: {
    default: "PageAI — AI-Powered Website Q&A Chatbot | Train AI on Your Site Content",
    template: "%s | PageAI",
  },
  description:
    "Transform your website into an intelligent assistant. PageAI crawls your site, indexes your content, and creates a custom AI chatbot that answers visitor questions using your own data. Powered by GPT-4 & RAG technology.",
  keywords: [
    "AI chatbot",
    "website chatbot",
    "AI customer support",
    "RAG chatbot",
    "custom GPT",
    "website Q&A bot",
    "AI assistant",
    "chatbot for website",
    "knowledge base chatbot",
    "GPT-4 chatbot",
    "site-specific AI",
    "customer engagement AI",
    "no-code chatbot",
    "chatbot builder",
    "AI support agent",
    "PageAI",
  ],
  authors: [{ name: "PageAI Team" }],
  creator: "PageAI",
  publisher: "PageAI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pageai.io",
    siteName: "PageAI",
    title: "PageAI — AI-Powered Website Q&A Chatbot",
    description:
      "Turn your website content into an intelligent AI chatbot. Train on your pages, FAQs, and docs. Deploy in minutes.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PageAI - AI Chatbot for Your Website",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PageAI — AI-Powered Website Q&A Chatbot",
    description:
      "Turn your website content into an intelligent AI chatbot. Train on your pages, FAQs, and docs. Deploy in minutes.",
    images: ["/og-image.png"],
    creator: "@pageai",
  },
  alternates: {
    canonical: "https://pageai.io",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PageAI",
  applicationCategory: "BusinessApplication",
  description:
    "AI-powered chatbot builder that creates custom Q&A assistants trained on your website content using RAG technology.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "0",
    highPrice: "399",
    priceCurrency: "USD",
    offerCount: 4,
    offers: [
      {
        "@type": "Offer",
        name: "Starter",
        price: "0",
        priceCurrency: "USD",
        description: "Free tier with 1,000 Q&A per month",
      },
      {
        "@type": "Offer",
        name: "Growth",
        price: "39",
        priceCurrency: "USD",
        description: "10,000 Q&A per month, 50 pages, GPT-4",
      },
      {
        "@type": "Offer",
        name: "Professional",
        price: "129",
        priceCurrency: "USD",
        description: "50,000 Q&A per month, 200 pages, priority support",
      },
      {
        "@type": "Offer",
        name: "Enterprise",
        price: "399",
        priceCurrency: "USD",
        description: "200,000+ Q&A, unlimited websites, custom integrations",
      },
    ],
  },
  operatingSystem: "Web",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "1247",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PageAI",
  url: "https://pageai.io",
  logo: "https://pageai.io/logo.png",
  sameAs: [
    "https://twitter.com/pageai",
    "https://linkedin.com/company/pageai",
    "https://github.com/pageai",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "support@pageai.io",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is PageAI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PageAI is an AI-powered chatbot platform that crawls your website content and creates a custom Q&A assistant. Using RAG (Retrieval-Augmented Generation) technology, it provides accurate answers based on your site's own data.",
      },
    },
    {
      "@type": "Question",
      name: "How does PageAI work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Simply provide your website URL, and PageAI will crawl and index your content. It creates embeddings stored in a vector database. When visitors ask questions, the system retrieves relevant content and uses GPT-4 to generate accurate, contextual answers.",
      },
    },
    {
      "@type": "Question",
      name: "Is PageAI free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! PageAI offers a free Starter plan with 1,000 Q&A per month and 10 pages indexed. Paid plans start at $39/month for more capacity, advanced AI models, and premium features.",
      },
    },
    {
      "@type": "Question",
      name: "Can I customize the chatbot appearance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. You can customize the bot's name, persona, colors, position, welcome message, and more. Paid plans allow you to remove PageAI branding entirely.",
      },
    },
    {
      "@type": "Question",
      name: "What AI models does PageAI support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PageAI supports GPT-3.5 Turbo, GPT-4, GPT-4 Turbo, Claude 3.5, and more. The model available depends on your subscription plan.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
