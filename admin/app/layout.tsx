import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'PageCortex Admin',
  description: 'PageCortex Admin Dashboard — Platform Metrics & Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Initialize theme before React hydrates to prevent flash */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('admin_theme');if(t)document.documentElement.setAttribute('data-theme',t);})()`,
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
