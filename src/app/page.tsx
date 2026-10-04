import { HomeExperience } from '../components/public/HomeExperience';
import { LandingPage } from '../components/public/LandingPage';
import { pageMetadata, SITE_URL, serializeJsonLd } from '../lib/seo';

export const metadata = pageMetadata(
  'TradeDairy | Turn Trading Chaos Into Disciplined Profit',
  'Precision trading journal & performance analytics platform engineered for Indian intraday, F&O options, and swing traders. Track STT, broker charges, and emotional leaks.',
  '/'
);

export default function HomePage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': SITE_URL + '/#organization',
        name: 'TradeDairy',
        url: SITE_URL,
        logo: SITE_URL + '/icon.svg',
      },
      {
        '@type': 'WebSite',
        '@id': SITE_URL + '/#website',
        name: 'TradeDairy',
        url: SITE_URL,
        publisher: { '@id': SITE_URL + '/#organization' },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'TradeDairy',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        url: SITE_URL,
        description:
          'Precision trading journal & performance analytics platform engineered for Indian intraday, F&O options, and swing traders. Automate brokerage & STT deduction, identify behavioral leaks, and stop giving hard-earned gains back to the market.',
        featureList: [
          'Automated statutory fee & STT engine',
          'Behavioral leak & FOMO detection',
          'TradingView execution screenshot storage',
          'Multi-broker CSV and API sync (Zerodha, Groww, Angel One, Upstox, Dhan)',
          'P&L calendar heatmap & cumulative curves',
          'True Net P&L Brokerage calculator',
        ],
      },
    ],
  };

  return (
    <HomeExperience>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
      />
      <LandingPage />
    </HomeExperience>
  );
}
