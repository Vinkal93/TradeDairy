'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTrades } from '../../context/TradeContext';
import { BrandLogo } from '../common/BrandLogo';
import { QrScannerModal } from '../common/QrScannerModal';

export function Header({ onToggleMobileMenu }: { onToggleMobileMenu?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useTrades();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCompact, setIsCompact] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Load density preference
  useEffect(() => {
    const saved = localStorage.getItem('tradedairy_density');
    if (saved === 'compact') {
      setIsCompact(true);
      document.documentElement.classList.add('comfortable-compact');
    }
  }, []);

  const toggleDensity = () => {
    const next = !isCompact;
    setIsCompact(next);
    if (next) {
      document.documentElement.classList.add('comfortable-compact');
      localStorage.setItem('tradedairy_density', 'compact');
    } else {
      document.documentElement.classList.remove('comfortable-compact');
      localStorage.removeItem('tradedairy_density');
    }
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 md:left-60 right-0 h-[68px] bg-white/95 backdrop-blur-md z-40 border-b border-surface-container px-3 sm:px-6 lg:px-8 flex items-center gap-2.5 sm:gap-4 transition-all">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-lg hover:bg-surface-container text-on-surface"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <Link href="/" aria-label="Dashboard" className="hidden sm:block md:hidden">
          <BrandLogo showText={false} className="h-6 w-6" />
        </Link>

        {/* Global Search Bar */}
        <form
          className="flex-1 min-w-0 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            if (search.trim()) {
              router.push(`/trades?q=${encodeURIComponent(search.trim())}`);
            }
          }}
        >
          <label className="sr-only" htmlFor="global-search">
            Search trades
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              id="global-search"
              className="w-full h-8.5 sm:h-9 pl-9 pr-3 rounded-lg bg-surface-container-low/80 hover:bg-surface-container-low border border-transparent focus:border-surface-container focus:bg-white outline-none focus:ring-1 focus:ring-primary/30 text-xs sm:text-sm text-on-surface transition-all placeholder:text-on-surface-variant/70"
              placeholder="Search trades, symbols, setups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
            />
          </div>
        </form>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
          {/* Scan to Log In PC Button (Phone to Desktop Auth) */}
          <button
            type="button"
            onClick={() => setScanModalOpen(true)}
            title="Scan PC QR Code to Sign In on Desktop"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
            <span className="hidden sm:inline">Scan PC Login</span>
          </button>

          {/* Quick Density Toggle */}
          <button
            type="button"
            onClick={toggleDensity}
            title={isCompact ? 'Use comfortable spacing' : 'Use slightly closer spacing'}
            className={`hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isCompact
                ? 'bg-primary/10 border-primary/30 text-primary font-semibold'
                : 'bg-white border-surface-container text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isCompact ? 'zoom_in' : 'density_medium'}
            </span>
            <span>{isCompact ? 'Compact spacing' : 'Comfortable'}</span>
          </button>


          {/* Profile Menu */}
          <div ref={ref} className="relative">
            <button
              type="button"
              aria-label="Profile menu"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg p-1 hover:bg-surface-container-low cursor-pointer transition-colors"
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs sm:text-sm font-bold">
                {user.fullName?.[0] || 'T'}
              </span>
              <span className="hidden md:block text-xs sm:text-sm max-w-32 truncate font-medium text-on-surface">
                {user.fullName || 'Trader'}
              </span>
              <span className="material-symbols-outlined text-[16px] text-outline hidden sm:inline">
                expand_more
              </span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] bg-white rounded-xl shadow-xl border border-surface-container p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-surface-container mb-1">
                  <p className="text-xs sm:text-sm font-semibold truncate text-on-surface">
                    {user.fullName}
                  </p>
                  <p className="text-[11px] text-on-surface-variant truncate">
                    {user.email || 'Local workspace'}
                  </p>
                </div>

                {/* Scan PC Option in Menu */}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setScanModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg hover:bg-primary/10 text-primary font-semibold transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                  <span>Scan PC to Log In</span>
                </button>

                <Link
                  href="/settings?tab=sessions"
                  className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg hover:bg-surface-container-low text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px] text-outline">devices</span>
                  <span>Active Device Sessions</span>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg hover:bg-surface-container-low text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px] text-outline">settings</span>
                  <span>Profile &amp; Settings</span>
                </Link>

                <Link
                  href="/accounts"
                  className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg hover:bg-surface-container-low text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px] text-outline">account_balance</span>
                  <span>Trading Accounts</span>
                </Link>

                <Link
                  href="/settings/charges"
                  className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-lg hover:bg-surface-container-low text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px] text-outline">calculate</span>
                  <span>Broker Charges Rules</span>
                </Link>

                <div className="border-t border-surface-container my-1"></div>

                <button
                  type="button"
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-xs sm:text-sm text-error rounded-lg hover:bg-error-container/30 cursor-pointer"
                  onClick={async () => {
                    await logout();
                    router.replace('/login');
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* QR Scanner Modal for Phone Users */}
      <QrScannerModal isOpen={scanModalOpen} onClose={() => setScanModalOpen(false)} />
    </>
  );
}
