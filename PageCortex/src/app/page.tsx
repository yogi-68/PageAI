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
  title: 'PageCortex — AI Chatbot Builder | Train on Your Website in Minutes',
  description: 'Build and embed a custom AI chatbot trained on your website in under 5 minutes. PageCortex uses RAG + GPT-4.1 for accurate, source-cited answers — no coding required. Free forever plan available.',
  alternates: { canonical: 'https://pagecortex.com' },
  openGraph: {
    title: 'PageCortex — AI Chatbot Builder | Train on Your Website in Minutes',
    description: 'Build and embed a custom AI chatbot trained on your website in under 5 minutes. RAG-powered, source-cited answers. Free plan available.',
    url: 'https://pagecortex.com',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PageCortex — AI Chatbot Builder' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PageCortex — AI Chatbot Builder | Train on Your Website in Minutes',
    description: 'Build a custom AI chatbot trained on your website in under 5 minutes. No coding required.',
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
