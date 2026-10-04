# TradeDairy SEO implementation

Canonical origin: https://www.tradedairy.online

## Implemented

- Server-rendered public homepage. Browser users with a saved signed-in session continue to see their dashboard.
- Dedicated trading journal, intraday journal, options journal and brokerage calculator pages.
- Three original educational guides, an About page and a product data/privacy disclosure.
- Unique page titles and descriptions, canonical URLs, Open Graph/Twitter images, icon and HTML language.
- Organization, WebSite, software application, article, breadcrumb and visible FAQ structured data. No fabricated ratings, user counts or claims of guaranteed returns.
- Sitemap with public pages only. No fabricated last-modified timestamps.
- Robots allow public search discovery, including OAI-SearchBot; API endpoints are excluded.
- Private workspace/auth/admin routes have noindex metadata and X-Robots-Tag headers. Robots directives are not authorization.
- Preview deployments are noindex; non-www production requests redirect permanently to www.
- Optional llms.txt links to public documentation. This is not an indexing requirement or recommendation guarantee.
- Public pages load workspace code only when needed.

## Deployment and verification

Use NEXT_PUBLIC_SITE_URL=https://www.tradedairy.online if overriding the default. Keep the same origin for canonical URLs and sitemap.

Build: npm run build
Serve your production build, then run:
node scripts/verify-seo.cjs http://localhost:3105

The checker reads raw HTTP HTML without JavaScript to verify public content, canonical URLs, robots, schema and private noindex responses.

Production publication requires access to the Vercel project trade-dairy. The default Vercel project scope can read the project and its verified www/non-www domains. An explicit team-scoped request returned 403; use the default project scope. The connected tools do not publish this local build automatically.

After publication:
1. Confirm www.tradedairy.online serves the new build and has no hosting-password/WAF block for legitimate crawlers.
2. Verify the domain in Google Search Console and Bing Webmaster Tools using DNS or official tokens.
3. For meta verification, set GOOGLE_SITE_VERIFICATION and BING_SITE_VERIFICATION to the issued tokens, then rebuild.
4. Submit https://www.tradedairy.online/sitemap.xml in both webmaster tools.
5. Inspect homepage, calculator and one guide; validate structured data using Google's Rich Results Test. Valid schema does not guarantee a rich result.
6. Measure indexed pages, search queries, clicks and real Core Web Vitals over time. Improve content using actual search queries; avoid keyword stuffing, paid spam links and invented testimonials.

## Intent-to-page mapping

| Search intent | Public page |
| --- | --- |
| Trading journal, stock trading journal, online trade journal | /trading-journal |
| Intraday journal, daily trading review | /intraday-trading-journal |
| Options journal, option buy/sell trade records | /options-trading-journal |
| Brokerage calculator, STT/GST charges, net P&L calculator | /brokerage-calculator |
| Trading journal template, what to record | /guides/trading-journal-template |
| Profit after brokerage, gross vs net P&L | /guides/how-to-calculate-net-pnl |
| Win rate, profit factor, drawdown | /guides/trading-performance-metrics |

Ranking, indexing and inclusion in AI answers are external outcomes and are not guaranteed by implementation. Search Console submission, ownership verification and production field performance have not been completed by these source changes.

References:
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/docs/crawling-indexing/block-indexing
- https://developers.openai.com/api/docs/bots
- https://zerodha.com/charges

