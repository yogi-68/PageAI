'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

export default function AdSense() {
  const pathname = usePathname();

  // Define paths where AdSense should not be shown
  const isExcluded = pathname?.startsWith('/dashboard') || 
                     pathname?.startsWith('/login') || 
                     pathname?.startsWith('/signup');

  if (isExcluded) {
    return null;
  }

  return (
    <>
      <meta name="google-adsense-account" content="ca-pub-8203348120243463" />
      <Script 
        async 
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8203348120243463" 
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  );
}
