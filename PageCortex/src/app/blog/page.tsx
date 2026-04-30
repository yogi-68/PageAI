import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

const posts = [
  {
    title: 'How AI Chatbots Are Transforming Customer Support in 2025',
    excerpt: 'Discover how businesses are using AI-powered chatbots to reduce response times by 80% and improve customer satisfaction scores.',
    date: '2025-01-15',
    readTime: '8 min',
    category: 'AI & Automation',
    featured: true,
    slug: '#',
  },
  {
    title: 'The Complete Guide to RAG-Powered Chatbots',
    excerpt: 'Learn how Retrieval-Augmented Generation technology makes chatbots more accurate and contextually aware than ever before.',
    date: '2025-01-10',
    readTime: '12 min',
    category: 'Technology',
    slug: '#',
  },
  {
    title: '5 Metrics Every Business Should Track for Their Chatbot',
    excerpt: 'From response accuracy to customer satisfaction, these are the KPIs that matter most for measuring chatbot performance.',
    date: '2025-01-05',
    readTime: '6 min',
    category: 'Analytics',
    slug: '#',
  },
  {
    title: 'Why Your Website Needs an AI Chatbot (Not Just a Live Chat)',
    excerpt: 'Live chat requires human agents. AI chatbots work 24/7, learn from your content, and scale infinitely. Here\'s why you should switch.',
    date: '2024-12-28',
    readTime: '7 min',
    category: 'Strategy',
    slug: '#',
  },
  {
    title: 'Building Trust: How to Make Your AI Chatbot Sound Human',
    excerpt: 'Tips and best practices for training your AI chatbot to communicate naturally while maintaining accuracy and professionalism.',
    date: '2024-12-20',
    readTime: '9 min',
    category: 'Best Practices',
    slug: '#',
  },
  {
    title: 'PageCortex vs Traditional Chatbot Builders: A Comparison',
    excerpt: 'We compare PageCortex\'s RAG-powered approach with traditional rule-based and flow-based chatbot builders across key dimensions.',
    date: '2024-12-15',
    readTime: '10 min',
    category: 'Comparison',
    slug: '#',
  },
];

export default function BlogPage() {
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg pt-32 pb-24">
        <section className="max-w-[1200px] mx-auto px-6 mb-16">
          <div className="text-center">
            <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-primary mb-4">Blog</p>
            <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold text-fg tracking-[-0.03em] mb-4">Insights &amp; Resources</h1>
            <p className="text-[16px] text-fg-secondary max-w-[520px] mx-auto leading-relaxed">Practical guides on AI chatbots, customer support automation, and growing your business.</p>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-6">
          <div>
            {/* Featured */}
            <Link href={featured.slug} className="block p-8 rounded-2xl border border-edge bg-surface/50 hover:bg-surface/80 transition-all duration-300 hover:border-edge-light mb-8 group">
              <span className="inline-block px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[12px] font-medium mb-4">{featured.category}</span>
              <h2 className="text-[24px] font-bold text-fg tracking-[-0.02em] mb-3 group-hover:text-primary transition-colors">{featured.title}</h2>
              <p className="text-[15px] text-fg-secondary leading-relaxed mb-4 max-w-[600px]">{featured.excerpt}</p>
              <div className="flex items-center gap-2 text-[13px] text-fg-muted">
                <span>{new Date(featured.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="w-1 h-1 rounded-full bg-fg-muted/40"></span>
                <span>{featured.readTime}</span>
              </div>
            </Link>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((post, i) => (
                <Link key={i} href={post.slug} className="block p-6 rounded-2xl border border-edge bg-surface/40 hover:bg-surface/70 transition-all duration-300 hover:border-edge-light group">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-primary/[0.06] text-primary/80 text-[11.5px] font-medium mb-3">{post.category}</span>
                  <h3 className="text-[17px] font-semibold text-fg tracking-[-0.01em] mb-2 group-hover:text-primary transition-colors leading-snug">{post.title}</h3>
                  <p className="text-[13.5px] text-fg-secondary leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-[12px] text-fg-muted">
                    <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span className="w-1 h-1 rounded-full bg-fg-muted/40"></span>
                    <span>{post.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
