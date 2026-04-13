import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PageAI Admin',
  description: 'PageAI Admin Dashboard — Platform Metrics & Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
