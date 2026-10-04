import type { Metadata } from 'next';
import './globals.css';
import { SiteFrame } from '../components/layout/SiteFrame';
import { SITE_URL } from '../lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TradeDairy — Trading Journal & Brokerage Calculator',
    template: '%s | TradeDairy',
  },
  description:
    'Record trades, calculate net profit after brokerage and taxes, and review trading performance with TradeDairy.',
  applicationName: 'TradeDairy',
  category: 'Finance',
  referrer: 'strict-origin-when-cross-origin',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-background text-on-surface antialiased font-body-md">
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
