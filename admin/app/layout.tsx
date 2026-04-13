import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PageAI Admin',
  description: 'PageAI Admin Dashboard — Platform Metrics & Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
