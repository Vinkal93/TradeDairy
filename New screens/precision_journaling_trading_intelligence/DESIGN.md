---
name: Precision Journaling & Trading Intelligence
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#006b2c'
  on-tertiary: '#ffffff'
  tertiary-container: '#00873a'
  on-tertiary-container: '#f7fff2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  data-metric-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  data-metric-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  data-table:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 2.5rem
---

## Brand & Style

This design system establishes a high-performance, calm, and analytical workspace for active retail traders, swing traders, and institutional market participants. Trading evokes intense emotional swings; the UI directly counterbalances market volatility through grounded composure, structural clarity, and zero-distraction data presentation.

The personality balances **rigorous analytical authority** with **encouraging progressive growth** ("Track. Learn. Improve. Grow."). Rather than mimicking dark, gamified crypto terminals or chaotic legacy broker suites, the visual mood is distinctly luminous, crisp, and European-fintech inspired. 

Key attributes:
- **Clinical Accuracy:** Metric numbers, currency prefixes, and timestamps take absolute visual hierarchy over decorative elements.
- **Cognitive Calm:** Low-contrast background canvas paired with isolated, clean card elevations allows charts and P&L color indicators to signal instantly without visual fatigue.
- **Architectural Discipline:** Built on an intentional 8px base rhythm with modular widgets, clean segmented controls, and pill-based contextual tags.

## Colors

The palette enforces a critical distinction between **Brand Actions** and **Semantic Financial P&L indicators**:
- **Brand Primary (`#059669` / `#10B981`):** A deep, balanced emerald forest green reserved for UI controls, navigation active states, high-priority CTAs (`+ Add Trade`), active segmented toggles, and brand marks.
- **Financial Semantic Profit (`#16A34A` / `#22C55E`):** Vibrant, unambiguous profit indicators for positive returns, gain curves, win rates, and successful trade pill badges.
- **Financial Semantic Loss (`#DC2626` / `#EF4444`):** Direct crimson for negative trades, drawdowns, losses, and behavioral error tags (e.g., "FOMO Entry").
- **Secondary / Action Blue (`#2563EB` / `#3B82F6`):** Applied to secondary utility CTAs ("Connect Broker", info banners, strategy tags, and active tabs).
- **Amber Warning (`#D97706` / `#F59E0B`):** Applied to risk tags, early exits, and account alerts.
- **Surfaces & Neutrals:** Background canvas sits on `#F8FAFC` (Slate 50) transitioning to `#F1F5F9` (Slate 100) for structural sidebars and wells. Surface cards are pristine `#FFFFFF` framed by `#E2E8F0` hairline borders. Primary typography uses deep graphite `#0F172A` (Slate 900) to ensure razor-sharp readability without the harshness of pure `#000000`.

## Typography

The type scale combines **Plus Jakarta Sans** for headlines, summary balance cards, and top-level KPIs with **Inter** for dense transactional tables, data-entry forms, and analytical metadata. 

Execution principles:
- **Tabular Numerics:** All currency figures, quantities, win-rates, and percentages must enable OpenType tabular figures (`font-variant-numeric: tabular-nums; tnum`) to ensure aligned vertical scanning in trading logs.
- **Visual Weighting:** Metric titles are set in `label-md` or `label-sm` using Slate 500 (`#64748B`), creating strong structural contrast against bold, dark metric values (`data-metric-lg`).
- **Hierarchy Reduction for Mobile:** Viewport headings clamp from 32px down to 24px (`headline-xl-mobile`) to prevent trade metric line wraps on small screens.

## Layout & Spacing

The layout is anchored on an **8px base grid** with a multi-pane responsive model:
- **Desktop (1280px+):** Fixed left navigation rail (240px) or collapsible icon-sidebar, accompanied by a flexible 12-column widget canvas. Standard layout utilizes `margin: 2rem` and `gutter: 1.5rem`. Secondary side drawers (such as Broker Accounts and Pro upsells) snap to 320–360px widths.
- **Tablet (768px - 1024px):** 8-column layout. Navigation shifts to a collapsed compact rail (64px) or tab bar. High-density KPI cards reflow into 2x2 grids.
- **Mobile (< 768px):** Single-column stacked stream. Main shell switches to an app-like frame with a fixed top branding/profile bar, `margin-mobile: 1rem`, and a bottom tab navigation bar containing an elevated, central circular action button (`+ Add`).

Density rules:
- **Compact Metric Tiles:** Use `space-md` (16px) internal padding.
- **Analytical Tables & Cards:** Use `space-lg` (24px) internal padding with `space-sm` (12px) cell padding for table rows to maintain maximum data density without clutter.

## Elevation & Depth

Visual hierarchy uses **low-contrast micro-shadows combined with hairline borders** to maintain an ultra-clean, clinical fintech finish:

- **Surface Layer 0 (App Canvas):** `#F8FAFC`. Zero elevation, pure matte.
- **Surface Layer 1 (Card & Widget Surfaces):** `#FFFFFF` with a crisp `1px solid #E2E8F0` border and a subtle ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
- **Surface Layer 2 (Interactive Floating Controls / Dropdowns / Datepickers):** `#FFFFFF` with border `#CBD5E1` and ambient elevation: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`.
- **Surface Layer 3 (Modals / Trade Detail Overlays / Mobile Bottom Sheets):** `#FFFFFF` framed by `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`. Backdropped with `rgba(15, 23, 42, 0.4)` and a 4px blur (`backdrop-filter: blur(4px)`).
- **Pro Banners & Highlight Widgets:** Subtle linear gradient fills (`linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)`) with an accent border in `#A7F3D0` to signify elevated membership status.

## Shapes

The interface balances precision with modern friendliness:
- **Cards & Data Containers:** Standardized at `12px` to `16px` (`rounded-lg` to `rounded-xl`) corner radii to soften analytics widgets.
- **Inputs, Buttons, and Selects:** Set to `8px` (`0.5rem`) for a tactile, responsive feel.
- **Pills & Badges:** Fully circular (`rounded-full` / `9999px`) for trade direction indicators (`BUY` / `SELL`), setup tags, market condition badges, and status lights.
- **Segmented Range Selectors:** Outer track uses `8px` (`0.5rem`) with internal selected pill switches set to `6px`.

## Components

### Buttons & Action Controls
- **Primary CTA (`+ Add Trade`):** High-contrast filled emerald (`#059669`), hover `#047857`, active `#065F46`. White text, medium weight, 8px corner radius. Includes a subtle prefix icon (`+` or target).
- **Secondary CTA (`Connect Broker`):** Outlined with subtle border (`1px solid #2563EB`), text `#2563EB`, transparent background. On hover, transitions to `rgba(37, 99, 235, 0.05)`.
- **Ghost / Utility Buttons:** Slate 600 text (`#475569`) with no default border; hovers reveal `#F1F5F9` background.
- **Mobile Floating Action Button:** 52px diameter circle in `#059669` centered in the bottom navigation bar with a subtle lift shadow `0 4px 12px rgba(5, 150, 105, 0.3)`.

### Segmented Buttons (Timeframe / Filter Toggles)
- Built with a neutral `#F1F5F9` tray containing horizontal options ("Today", "This Week", "This Month", "Year", "All Time").
- Inactive tabs: Transparent fill, Slate 600 text (`#475569`), 12px font weight 500.
- Active tab: `#2563EB` or `#059669` solid background with white text, or white card surface with deep Slate 900 text and 1px ambient shadow.

### Financial Chips & Trade Badges
- **BUY Tag:** Solid or soft-tinted pill: `#DCFCE7` background with `#15803D` bold text, 11px uppercase.
- **SELL Tag:** Soft crimson pill: `#FEE2E2` background with `#B91C1C` bold text, 11px uppercase.
- **Mistake & Strategy Tags:** Soft amber (`#FEF3C7` / `#B45309`) or soft slate (`#F1F5F9` / `#475569`) tags with rounded counts indicating behavioral habits (e.g., `FOMO Entry: 1`).

### Form Fields & Inputs
- Height: 42px (desktop) / 48px (mobile touch targets).
- Hairline border `1px solid #CBD5E1`, background `#FFFFFF`.
- Focus state: `1.5px solid #059669` border accompanied by an emerald focus ring (`0 0 0 3px rgba(5, 150, 105, 0.15)`).
- Input groups provide integrated currency/unit affix boxes (e.g., `₹`, `$`, `pts`, `qty`) in `#F8FAFC` slate backgrounds with right-divider borders.

### Analytics & Metric Cards
- White `#FFFFFF` base, 16px internal padding.
- Metric cards display title and mini trend sparkline / donut indicator on the top row, primary balance or ratio in `data-metric-lg` in the center row, and sub-metrics (e.g., "3 Wins 2 Losses") in Slate 500 (`#64748B`) on the footer row.

### Data Tables (Recent Trades Log)
- Table headers: `#F8FAFC` background, `label-sm` (11px) uppercase tracking (`letter-spacing: 0.05em`), Slate 500 color.
- Row heights: 48px standard. Alternate row zebra striping is omitted in favor of clean bottom borders (`1px solid #F1F5F9`).
- Hover state: Row background transitions to `#F8FAFC`.
- P&L values are strictly color-coded: Positive trades prefixed with `+` in `#16A34A`; negative trades prefixed with `-` in `#DC2626`.