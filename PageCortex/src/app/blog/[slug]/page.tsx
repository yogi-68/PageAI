import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { posts } from '../page';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://pagecortex.com/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://pagecortex.com/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

function renderMarkdown(content: string) {
  // Simple markdown-to-JSX renderer for blog content
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let inTable = false;
  let tableRows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="text-[13px] font-mono bg-bg/80 border border-edge rounded-xl p-5 overflow-x-auto my-5">
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Table handling
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      // Skip separator row (|---|---|)
      if (/^\|[\s\-:|]+\|$/.test(line)) continue;
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      tableRows.push(cells);
      // Check if next line is not a table
      if (i + 1 >= lines.length || !lines[i + 1].startsWith('|')) {
        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-5">
            <table className="w-full text-[13px] border border-edge rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-surface/60">
                  {tableRows[0]?.map((cell, ci) => (
                    <th key={ci} className="px-4 py-2.5 text-left font-semibold text-fg border-b border-edge">{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-b border-edge/50 last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-2.5 text-fg-secondary">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableRows = [];
      }
      continue;
    }

    // Blank lines
    if (line.trim() === '') continue;

    // Headings
    if (line.startsWith('## ')) {
      elements.push(<h2 key={`h2-${i}`} className="text-[22px] font-bold text-fg tracking-[-0.02em] mt-10 mb-4">{line.slice(3)}</h2>);
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 key={`h3-${i}`} className="text-[18px] font-semibold text-fg tracking-[-0.01em] mt-8 mb-3">{line.slice(4)}</h3>);
      continue;
    }

    // Lists
    if (line.startsWith('- **')) {
      const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)/);
      if (match) {
        elements.push(
          <div key={`li-${i}`} className="flex items-start gap-2.5 mb-2.5 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <p className="text-[15px] text-fg-secondary leading-relaxed"><strong className="text-fg font-semibold">{match[1]}</strong>{match[2] ? `: ${match[2]}` : ''}</p>
          </div>
        );
        continue;
      }
    }
    if (line.startsWith('- ')) {
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-2.5 mb-2 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
          <p className="text-[15px] text-fg-secondary leading-relaxed">{line.slice(2)}</p>
        </div>
      );
      continue;
    }

    // Numbered lists
    if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\.\s/)?.[1];
      const text = line.replace(/^\d+\.\s/, '');
      const match = text.match(/\*\*(.+?)\*\*\s*(.*)/);
      elements.push(
        <div key={`ol-${i}`} className="flex items-start gap-3 mb-3 ml-1">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{num}</span>
          <p className="text-[15px] text-fg-secondary leading-relaxed">
            {match ? <><strong className="text-fg font-semibold">{match[1]}</strong> {match[2]}</> : text}
          </p>
        </div>
      );
      continue;
    }

    // Inline code
    let rendered = line.replace(/`([^`]+)`/g, '<code class="text-[13px] bg-primary/8 text-primary px-1.5 py-0.5 rounded font-mono">$1</code>');
    // Bold
    rendered = rendered.replace(/\*\*(.+?)\*\*/g, '<strong class="text-fg font-semibold">$1</strong>');

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="text-[15.5px] text-fg-secondary leading-[1.75] mb-4" dangerouslySetInnerHTML={{ __html: rendered }} />
    );
  }

  return <>{elements}</>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg pt-32 pb-24">
        <article className="max-w-[720px] mx-auto px-6">
          {/* Back link */}
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-[13px] text-fg-muted hover:text-fg transition-colors mb-8">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m0 0l7 7m-7-7l7-7"/></svg>
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-10">
            <span className="inline-block px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[12px] font-medium mb-4">{post.category}</span>
            <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-fg tracking-[-0.03em] leading-[1.15] mb-4">{post.title}</h1>
            <p className="text-[16px] text-fg-secondary leading-relaxed mb-5">{post.excerpt}</p>
            <div className="flex items-center gap-3 text-[13px] text-fg-muted">
              <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="w-1 h-1 rounded-full bg-fg-muted/40"></span>
              <span>{post.readTime} read</span>
            </div>
          </header>

          {/* Divider */}
          <div className="border-t border-edge mb-10" />

          {/* Content */}
          <div className="prose-custom">
            {renderMarkdown(post.content)}
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 rounded-2xl border border-primary/20 bg-primary/3 text-center">
            <h3 className="text-[20px] font-bold text-fg mb-2">Ready to convert more visitors?</h3>
            <p className="text-[14px] text-fg-secondary mb-5">Start free — no credit card required. Set up in under 5 minutes.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[14px] font-medium transition-all hover:shadow-[0_0_24px_rgba(79,109,245,0.25)]">
              Get Started Free →
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
