import type { Metadata } from 'next';
import './globals.css';
import { TradeProvider } from '../context/TradeContext';
import { AppShell } from '../components/layout/AppShell';

export const metadata: Metadata = {
  title: 'TradeDairy — Precision Journaling & Trading Intelligence',
  description: 'Track. Learn. Improve. Grow. Professional trading journal and analytics workspace for active traders.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <TradeProvider>
          <AppShell>{children}</AppShell>
        </TradeProvider>
      </body>
    </html>
  );
}
