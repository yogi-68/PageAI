import type { Metadata } from 'next';
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ProductDemoSection from "@/components/landing/ProductDemoSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: 'PageCortex — Convert SaaS Trial Users With Instant AI Answers',
  description: 'PageCortex answers trial users\' pricing, integration, and setup questions automatically — 24/7. Convert more free trials into paying customers. Free plan included.',
  alternates: { canonical: 'https://pagecortex.com' },
  openGraph: {
    title: 'PageCortex — AI Pre-Sales Assistant for SaaS',
    description: 'Answer trial users\' questions instantly. Convert more free trials into paying customers.',
    url: 'https://pagecortex.com',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PageCortex — AI Pre-Sales Assistant for SaaS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PageCortex — AI Pre-Sales Assistant for SaaS',
    description: 'Answer trial users\' pricing, integration, and setup questions automatically. Free plan included.',
    images: ['/og-image.png'],
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <ProductDemoSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
