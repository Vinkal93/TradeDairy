/** @type {import('next').NextConfig} */
const privatePaths = [
  'accounts',
  'add-trade',
  'analytics',
  'broker-sync',
  'calendar',
  'journal',
  'login',
  'onboarding',
  'settings',
  'signup',
  'su',
  'trades',
  'api',
];
const preview = !!process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production';

const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_BUILD_DIR || '.next',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || '',
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF || '',
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || '',
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'tradedairy.online' }],
        destination: 'https://www.tradedairy.online/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return preview
      ? [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
      : privatePaths.map((path) => ({
          source: '/' + path + '/:path*',
          headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
        }));
  },
};

export default nextConfig;
