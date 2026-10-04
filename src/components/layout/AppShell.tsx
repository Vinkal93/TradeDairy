'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BrandLogo } from '../common/BrandLogo';
import { useTrades } from '../../context/TradeContext';

interface AppShellProps {
  children: React.ReactNode;
}

const MOBILE_NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: 'grid_view' },
  { name: 'Trades', path: '/trades', icon: 'receipt_long' },
  { name: 'Journal', path: '/journal', icon: 'edit_note' },
  { name: 'Analytics', path: '/analytics', icon: 'monitoring' },
  { name: 'Calendar', path: '/calendar', icon: 'calendar_today' },
  { name: 'Accounts', path: '/accounts', icon: 'account_balance' },
  { name: 'Settings', path: '/settings', icon: 'settings' },
  { name: 'Broker Charges', path: '/settings/charges', icon: 'calculate' },
];

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const { storageError } = useTrades();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
      if (event.key !== 'Tab') return;
      const items = drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button');
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keydown);
      previousFocus?.focus();
    };
  }, [mobileMenuOpen]);

  // If on login, onboarding, or super admin portal, don't show trader shell
  const isAuthOrOnboarding =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/onboarding' ||
    (pathname === '/su' || pathname?.startsWith('/su/'));

  if (isAuthOrOnboarding) {
    return <>{children}</>;
  }

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    if (path === '/settings') return pathname === path;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div ref={drawerRef} role="dialog" aria-modal="true" aria-label="Navigation" className="relative w-72 max-w-[80vw] bg-surface-container-lowest h-full overflow-y-auto shadow-2xl p-space-md flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <BrandLogo />
                <button
                  aria-label="Close navigation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <Link
                href="/add-trade"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-space-xs w-full py-2.5 px-space-md rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Add Trade</span>
              </Link>

              <nav className="flex flex-col gap-1">
                {MOBILE_NAV_ITEMS.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-space-sm px-space-md py-2.5 rounded-lg font-label-lg text-label-lg transition-colors ${
                        active
                          ? 'bg-surface-container-high text-primary font-normal'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <p className="text-xs text-outline pt-4">Your personal trading journal</p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />

      {/* Main Content Area */}
      <div className="md:pl-56 flex-1 flex flex-col pb-16 md:pb-6">
        <main className="w-full pt-20 bg-background min-h-screen px-3 sm:px-4 lg:px-6 pb-6 max-w-[1536px] mx-auto">
          {storageError && <p role="alert" className="rounded-xl bg-error-container text-error p-3 mb-4 text-sm">{storageError}</p>}
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-md border-t border-surface-container flex items-center justify-around px-2 z-40">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 text-xs ${
            pathname === '/' ? 'text-primary font-bold' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">grid_view</span>
          <span>Home</span>
        </Link>

        <Link
          href="/trades"
          className={`flex flex-col items-center gap-0.5 text-xs ${
            pathname.startsWith('/trades') ? 'text-primary font-bold' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          <span>Trades</span>
        </Link>

        {/* Center Floating + Button */}
        <Link
          href="/add-trade"
          className="flex items-center justify-center w-12 h-12 -mt-5 rounded-full bg-primary text-on-primary shadow-lg shadow-primary/30 active:scale-95 transition-transform"
          title="Add New Trade"
        >
          <span className="material-symbols-outlined text-[24px]">add</span>
        </Link>

        <Link
          href="/journal"
          className={`flex flex-col items-center gap-0.5 text-xs ${
            pathname.startsWith('/journal') ? 'text-primary font-bold' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">edit_note</span>
          <span>Journal</span>
        </Link>

        <Link
          href="/analytics"
          className={`flex flex-col items-center gap-0.5 text-xs ${
            pathname.startsWith('/analytics') ? 'text-primary font-bold' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">monitoring</span>
          <span>Analytics</span>
        </Link>
      </nav>
    </div>
  );
};
