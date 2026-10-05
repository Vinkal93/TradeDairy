export interface ReleaseNote {
  version: string;
  releaseDate: string;
  status: 'production' | 'preview' | 'archived';
  title: string;
  tagline?: string;
  added: string[];
  improved: string[];
  fixed: string[];
  knownIssues?: string[];
  internalNotes?: string[];
}

export const PRODUCTION_VERSION = 'v1.2.0';
export const PREVIEW_VERSION = 'v1.3.0';
export const DEFAULT_BUILD_COMMIT = '3b0e496';
export const BUILD_DATE = '2026-10-05';

export const CHANGELOG_RELEASES: ReleaseNote[] = [
  {
    version: 'v1.3.0',
    releaseDate: 'October 2026',
    status: 'preview',
    title: 'v1.3.0 — Live Ticker, Real-time Camera QR & Instant Cloud Sync',
    tagline: 'High-frequency market ticker, in-browser optical QR scanning, and resilient multi-device sync.',
    added: [
      'Live Indian Market Ticker Patti: Continuous marquee bar tracking NIFTY 50, BANK NIFTY, FIN NIFTY, SENSEX, and top bluechip stocks with micro-tick flash animations',
      'Real-Time In-Browser Camera QR Code Scanner with optical jsQR decoding for zero-latency desktop login',
      'Direct Photo / File Upload QR scanner fallback for mobile browsers where WebRTC live video is restricted',
      'Direct Pairing PIN authentication (TD-XXXX) with whitespace/hyphen tolerance',
      'Mobile web scan receiver page at /auth/qr for instant 1-tap phone camera approvals',
      'Active Devices management popup on desktop with live QR pairing generation',
      'Unified Version, Environment detection, and What\'s New comparison system'
    ],
    improved: [
      'Record Trade dialog keyboard ergonomics: Tab key navigates cleanly across all inputs without getting trapped in search cards',
      'Lots & Units section simplified: Replaced text emojis with crisp SVG icons (layers, tag, tune)',
      'Sub-3s Cloud Synchronization: Polling reduced to 2.5s with window focus & visibility auto-revalidation',
      'Zero-reload cookie cache for auth session and custom index lot preferences',
      'Sidebar navigation styling with bold indicators and direct tab deep-linking (/settings?tab=sessions)'
    ],
    fixed: [
      'Trade Record modal accidental dismiss: Clicking modal backdrop no longer closes popup or wipes unsaved trade inputs',
      'Removed fake dummy iPhone 15 Pro session from Settings > Device Sessions',
      'Resolved 400 error and missing UID/full name mapping during QR session handshakes',
      'Fixed search dropdown Escape bubbling to parent modal dialog'
    ],
    knownIssues: [
      'iOS Safari low-power mode may throttle ticker marquee animation to 30fps'
    ],
    internalNotes: [
      'Tested across Chrome 128 (Windows), Safari 17.5 (iOS), and Chrome Mobile 128 (Android)',
      'jsQR engine runs client-side on canvas with zero external server dependencies',
      'Build commit: 3b0e496 on develop branch'
    ]
  },
  {
    version: 'v1.2.0',
    releaseDate: 'October 2026',
    status: 'production',
    title: 'v1.2.0 — Stable Cloud Identity, Multi-Device Sync & Onboarding',
    tagline: 'Permanent Auth UID mapping, multi-device cloud persistence, and streamlined 1-click Google authentication.',
    added: [
      'Permanent Auth UID architecture preventing duplicate user profiles across devices',
      'Premium 5-step first-time onboarding questionnaire for brand new signups',
      'Cross-device cloud sync API (/api/user/sync) with local disk persistence',
      'Google Site Verification meta tag integration for search console indexing',
      'Comprehensive 20-test automated test suite for Auth, Multi-Device sync, and P&L taxes'
    ],
    improved: [
      'Simplified Login page: 1-click Continue with Google placed as primary action',
      'Returning users with completed onboarding directly enter Dashboard with 0 extra steps',
      'Session persistence across browser restarts and device handovers',
      'Complete local storage and cookie session wipe on explicit logout'
    ],
    fixed: [
      'Resolved session overwrite bug when logging in from secondary devices',
      'Fixed state flickering on page refresh by scoping storage keys per user email'
    ]
  },
  {
    version: 'v1.1.0',
    releaseDate: 'September 2026',
    status: 'archived',
    title: 'v1.1.0 — Lots vs Quantity Switcher & Official Branding',
    tagline: 'F&O Options contract lot support, custom index lot configuration, and official SVG brand assets.',
    added: [
      'Lots vs Quantity unit switcher in trade entry form',
      'Custom lot size manager for Indian indices (NIFTY: 25, BANKNIFTY: 15, FINNIFTY: 25, etc.)',
      'Official TradeDairy green candlestick SVG logo and favicon assets',
      'Instrument auto-detection for Indian derivatives and equities'
    ],
    improved: [
      'Interactive trade search dropdown with CE/PE strike filtering',
      'Trade entry fee calculations for options and futures'
    ],
    fixed: [
      'Corrected contract multiplier calculation on options buy/sell turnover'
    ]
  },
  {
    version: 'v1.0.0',
    releaseDate: 'August 2026',
    status: 'archived',
    title: 'v1.0.0 — TradeDairy Initial Release',
    tagline: 'Disciplined trading journal, ledger, and automated Indian tax & brokerage calculator.',
    added: [
      'Core trading journal with entry/exit price, quantities, setups, and psychology tracking',
      'Automated Indian regulatory tax engine (STT, GST, SEBI charges, Stamp Duty, Exchange turnover fees)',
      'P&L Analytics dashboard with Win Rate, Profit Factor, Expectancy, and Cumulative Curve',
      'Trading Accounts ledger with multi-broker support (Zerodha, Groww, AngelOne, Upstox)',
      'CSV Trade import and export'
    ],
    improved: [
      'High-performance client-side calculation engine',
      'Clean modern dashboard with comfortable/compact view modes'
    ],
    fixed: [
      'Initial release bug fixes'
    ]
  }
];
