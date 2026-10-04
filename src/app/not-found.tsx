'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        const searchInput = document.getElementById('recoverySearch');
        if (searchInput) {
          searchInput.focus();
          showToast('Terminal search focused. Enter symbols or routes.');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/trades?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased flex flex-col items-center justify-center min-h-screen px-4 py-8 relative selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Background glow effects */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-48 right-10 w-72 h-72 bg-secondary-fixed/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Brand Header */}
      <header className="flex items-center gap-2.5 mb-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-on-primary text-[22px]">candlestick_chart</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-lg text-on-surface tracking-tight font-bold">TradeDairy</span>
            <span className="text-[11px] text-on-surface-variant uppercase tracking-widest font-semibold">
              Precision Terminal
            </span>
          </div>
        </Link>
        <span className="ml-2 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface text-[11px] font-semibold font-mono">
          v2.4.9
        </span>
      </header>

      {/* 404 Candlestick Visual Card */}
      <div className="relative w-full max-w-2xl flex flex-col items-center justify-center my-2">
        <div className="absolute -top-6 font-headline-xl text-[120px] md:text-[180px] leading-none font-extrabold select-none opacity-10 bg-gradient-to-b from-on-surface to-transparent bg-clip-text text-transparent pointer-events-none tracking-tighter">
          404
        </div>

        <div className="relative z-10 w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl p-5 md:p-6 backdrop-blur-md border border-surface-container">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex w-2.5 h-2.5 rounded-full bg-error animate-pulse"></span>
              <span className="text-xs text-on-surface font-semibold tracking-wide uppercase font-mono">
                REJECTED / EXPIRED_ROUTE
              </span>
            </div>
            <span className="text-[11px] text-on-surface-variant font-mono">LATENCY: 12ms</span>
          </div>

          {/* Candlestick SVG Graphic */}
          <div className="w-full h-32 md:h-36 relative">
            <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 420 120" xmlns="http://www.w3.org/2000/svg">
              <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="3 3" x1="20" x2="400" y1="20" y2="20" />
              <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="3 3" x1="20" x2="400" y1="60" y2="60" />
              <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="3 3" x1="20" x2="400" y1="100" y2="100" />

              {/* Green candles */}
              <line className="text-primary" stroke="currentColor" strokeWidth="1.5" x1="45" x2="45" y1="40" y2="85" />
              <rect className="fill-primary" height="25" rx="1.5" width="14" x="38" y="50" />
              <line className="text-primary" stroke="currentColor" strokeWidth="1.5" x1="95" x2="95" y1="30" y2="78" />
              <rect className="fill-primary" height="30" rx="1.5" width="14" x="88" y="38" />
              <line className="text-primary" stroke="currentColor" strokeWidth="1.5" x1="145" x2="145" y1="22" y2="62" />
              <rect className="fill-primary" height="22" rx="1.5" width="14" x="138" y="28" />

              {/* GAP DOWN annotation */}
              <path className="text-error" d="M 162 40 L 210 40 L 210 88 L 248 88" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1.5" />
              <circle className="fill-error" cx="210" cy="40" r="3" />
              <text className="fill-error text-[10px] font-bold font-mono" x="175" y="32">GAP DOWN</text>

              {/* Red gap down candles */}
              <line className="text-error" stroke="currentColor" strokeWidth="1.5" x1="255" x2="255" y1="68" y2="114" />
              <rect className="fill-error" height="30" rx="1.5" width="14" x="248" y="76" />
              <line className="text-error" stroke="currentColor" strokeWidth="1.5" x1="305" x2="305" y1="80" y2="118" />
              <rect className="fill-error" height="24" rx="1.5" width="14" x="298" y="86" />

              <line className="text-secondary" stroke="currentColor" strokeWidth="1.5" x1="355" x2="355" y1="72" y2="108" />
              <rect className="fill-secondary" height="18" rx="1.5" width="14" x="348" y="78" />

              <circle className="fill-error-container/40" cx="255" cy="91" r="16" />
              <circle className="fill-error" cx="255" cy="91" r="5" />
            </svg>
          </div>

          <div className="mt-3 pt-3 flex items-center justify-between text-on-surface-variant text-xs border-t border-surface-container">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[15px]">verified_user</span>
              <span>Journal Database Intact</span>
            </div>
            <span className="font-mono text-error font-semibold">STATUS: 404_URL_VOID</span>
          </div>
        </div>
      </div>

      {/* Copy description */}
      <div className="text-center max-w-2xl mt-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container/70 text-on-error-container mb-3 text-xs font-semibold">
          <span className="material-symbols-outlined text-[15px]">cancel</span>
          <span className="uppercase tracking-wider">Execution Route Terminated</span>
        </div>
        <h1 className="text-2xl md:text-3xl text-on-surface tracking-tight font-bold mb-2">
          Order Cancelled — Page Not Found
        </h1>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6 max-w-xl mx-auto">
          Looks like the market moved against this URL or the requested execution route has expired. Your trade journal, risk rules, and active positions remain completely safe.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="w-full max-w-lg mb-6">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            id="recoverySearch"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trades, setups, instruments, or help docs..."
            className="w-full pl-11 pr-14 py-3 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant rounded-xl shadow-xs border border-surface-container text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
          <kbd className="absolute right-3.5 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-xs font-mono shadow-xs">
            /
          </kbd>
        </div>
      </form>

      {/* Primary CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-hover font-semibold text-xs shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">space_dashboard</span>
          <span>Return to Dashboard</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
        <Link
          href="/trades"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs font-semibold shadow-xs border border-surface-container transition-all"
        >
          <span className="material-symbols-outlined text-primary text-[18px]">receipt_long</span>
          <span>View Trades History</span>
        </Link>
        <button
          onClick={() => showToast('Incident reported to routing operations (Ticket #404-RT).')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-secondary hover:bg-secondary-fixed/30 text-xs font-semibold transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">support_agent</span>
          <span>Report Route Disruption</span>
        </button>
      </div>

      {/* Popular Active Terminal Routes */}
      <div className="w-full max-w-4xl bg-surface-container-low rounded-2xl p-6 shadow-xs border border-surface-container mb-8">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
            <h2 className="text-sm text-on-surface font-bold">Popular Active Terminal Routes</h2>
          </div>
          <span className="text-xs text-on-surface-variant">Recommended recovery paths</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/"
            className="group p-3.5 bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container hover:shadow-sm transition-all flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">monitoring</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-on-surface group-hover:text-primary transition-colors">
                  Home Dashboard
                </span>
                <span className="text-[10px] text-primary font-bold">LIVE</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Real-time daily net P&amp;L, current open win-rate, and session summary.
              </p>
            </div>
          </Link>

          <Link
            href="/journal"
            className="group p-3.5 bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container hover:shadow-sm transition-all flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-on-surface group-hover:text-secondary transition-colors">
                  Psychology Journal
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">14 LOGS</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Behavioral reviews, emotional state ratings, FOMO and impulse audits.
              </p>
            </div>
          </Link>

          <Link
            href="/analytics"
            className="group p-3.5 bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container hover:shadow-sm transition-all flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">finance_mode</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-on-surface group-hover:text-emerald-700 transition-colors">
                  Analytics &amp; Statistics
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                  SYNCED
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Win/Loss ratios, expectancy curves, and R:R distribution metrics.
              </p>
            </div>
          </Link>

          <Link
            href="/su"
            className="group p-3.5 bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container hover:shadow-sm transition-all flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">security</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-on-surface group-hover:text-primary transition-colors">
                  Super Admin Console
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">/su</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Root command center, user subscription overrides, and broker import engines.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer status line */}
      <footer className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="inline-flex w-2 h-2 rounded-full bg-primary"></span>
          <span className="font-semibold text-on-surface">TradeDairy.online</span>
          <span>• Precision Journaling for Disciplined Traders</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-[11px]">
            All systems operational (99.98% uptime)
          </span>
          <span className="font-mono text-[11px]">Build 802.404</span>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[20px]">check_circle</span>
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
