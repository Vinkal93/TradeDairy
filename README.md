# TradeDairy

**TradeDairy** is a high-performance precision journaling and trading analytics platform designed for disciplined traders, prop desks, and retail market participants.

---

## 🚀 Key Features

- **Dynamic Interactive Dashboard**: Real-time Net P&L metrics, Win Rate gauge, Trade Expectancy, and Risk-to-Reward distribution.
- **Precision Trade Recorder**: Progressive entry flow for Stocks, F&O Options, Futures, and Indices with auto-calculated Net P&L, Breakeven points, and statutory charges.
- **Top 500 Stocks & Indices**: Auto-searchable dropdown with NSE/BSE indices (NIFTY 50, BANKNIFTY, FINNIFTY, MIDCPNIFTY, SENSEX) and India's top 500 listed stocks with custom ticker entry.
- **Super Admin Portal (`/su`)**:
  - Secure Root Terminal Gate with PIN & 2FA protection.
  - Command Center with ARR, MRR, active subscriber metrics, and broker distribution telemetry.
  - User Directory & Subscription governance with interactive Plan Assignment & Quota overrides.
  - Commercial Plans & Multi-Currency Engine (pegged to INR).
  - Feature Locks & Dynamic Permissions matrix with emergency platform kill-switch.
  - Broker Import Engine for Zerodha, Groww, Angel One, and Upstox.
  - Data Exports Hub for SEBI Schedule-IV and ITR-3 compliance reporting.
- **Broker Charge Rules & Regulatory Engine (`/settings/charges`)**: Versioned statutory calculations for Brokerage, STT, Exchange Turnover, GST, and SEBI charges with real-time simulator.
- **Firebase Authentication**: Email/Password, Google OAuth sign-in, and 1-Click Demo fallback with environment variable protection.
- **Custom Terminal 404 Route**: Order Cancelled UI with candlestick gap-down visualization and interactive LED recovery search.
- **Broker API Auto-Sync & AI Engine (`/broker-sync`)**: High-frequency roadmap & alpha waitlist for direct read-only broker API sync (<200ms latency).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Material Symbols Outlined
- **Authentication**: Firebase Auth (v11+)
- **State Management**: React Context (`TradeContext`) with local persistent storage fallback

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vinkal93/TradeDairy.git
   cd TradeDairy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Firebase API keys and Super Admin credentials.

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Super Admin Access

Access the Super Admin Portal at `/su`:
- **Admin Email**: `admin@tradedairy.online`
- **Password**: `admin`
- **Security PIN**: `778899`
*(Or click "1-Click Demo Super Admin Access" on the login screen)*

---

## 📄 License

Proprietary — Developed for TradeDairy. All rights reserved.
