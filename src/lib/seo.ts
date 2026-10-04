import type { Metadata } from 'next';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradedairy.online').replace(/\/$/, '');
export const PUBLIC_ROUTES = ['/', '/trading-journal', '/intraday-trading-journal', '/options-trading-journal', '/brokerage-calculator', '/guides', '/guides/trading-journal-template', '/guides/how-to-calculate-net-pnl', '/guides/trading-performance-metrics', '/about', '/privacy'];
export const PRIVATE_ROUTES = ['/accounts', '/add-trade', '/analytics', '/broker-sync', '/calendar', '/journal', '/login', '/onboarding', '/settings', '/signup', '/su', '/trades'];
export const isPublicRoute = (path: string) => PUBLIC_ROUTES.includes(path);
export const isPreview = !!process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production';
export function pageMetadata(title: string, description: string, path: string): Metadata {
 return { title, description, alternates: { canonical: SITE_URL + (path === '/' ? '' : path) }, robots: { index: !isPreview, follow: !isPreview }, openGraph: { type: 'website', siteName: 'TradeDairy', title, description, url: SITE_URL + path, images: [{ url: SITE_URL + '/social-card.png', width: 1200, height: 630, alt: 'TradeDairy trading journal and analytics' }] }, twitter: { card: 'summary_large_image', title, description, images: [SITE_URL + '/social-card.png'] } };
}
export const privateMetadata: Metadata = { robots: { index: false, follow: false, googleBot: { index: false, follow: false, noimageindex: true } } };
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

