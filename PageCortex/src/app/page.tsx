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
  title: 'PageCortex — AI Pre-Sales Assistant | Convert Visitors into Trials',
  description: 'AI assistant that converts website visitors into free trials and qualified demos. Answer pricing questions instantly, overcome buyer objections, and qualify leads — all automatically. Free forever plan available.',
  alternates: { canonical: 'https://pagecortex.com' },
  openGraph: {
    title: 'PageCortex — AI Pre-Sales Assistant | Convert Visitors into Trials',
    description: 'AI assistant that converts website visitors into trials and demos. Answer buyer objections instantly, qualify leads automatically.',
    url: 'https://pagecortex.com',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PageCortex — AI Pre-Sales Assistant' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PageCortex — AI Pre-Sales Assistant | Convert Visitors into Trials',
    description: 'Convert more website visitors into trials and demos. AI that answers buyer objections instantly.',
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
