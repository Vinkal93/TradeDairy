'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTrades } from '../../context/TradeContext';
import { BrandLogo } from '../common/BrandLogo';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const router = useRouter();
  const pathname = usePathname();
  const controlsRef = useRef<HTMLDivElement>(null);
  const { user, logout, resetDemoData } = useTrades();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    setProfileOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!controlsRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <header className="fixed top-0 left-0 md:left-60 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-4 md:px-space-lg flex items-center justify-between gap-space-md border-b border-surface-container">
      {/* Left side: Mobile menu toggle or Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {/* Mobile Logo / Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onToggleMobileMenu}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container"
            aria-label="Toggle Navigation"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <Link href="/">
            <BrandLogo showText={false} className="h-7 w-7" />
          </Link>
        </div>

        {/* Global Search Input */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            className="w-full h-10 pl-9 pr-space-md rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all"
            placeholder="Search trades, instruments, setups..."
            aria-label="Search trades, instruments, setups"
            type="text"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const query = (e.target as HTMLInputElement).value.trim();
                router.push(`/trades?q=${encodeURIComponent(query)}`);
              }
            }}
          />
        </div>
      </div>

      {/* Right side controls */}
      <div ref={controlsRef} className="flex items-center gap-1 sm:gap-space-md shrink-0">
        {/* Date Display Pill */}
        <div className="hidden xl:flex items-center gap-space-2xs px-space-sm py-1.5 rounded-lg bg-surface-container-low text-on-surface border border-surface-container">
          <span className="material-symbols-outlined text-[16px] text-outline">event</span>
          <span suppressHydrationWarning className="font-label-md text-label-md font-medium">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>

        {/* Quick Nav: Onboarding Wizard */}
        <Link
          href="/onboarding"
          prefetch={true}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-semibold transition-colors border border-surface-container"
          title="Open Onboarding Setup Wizard"
        >
          <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
          <span>Setup Wizard</span>
        </Link>

        {/* Quick Nav: Login Screen */}
        <Link
          href="/login"
          prefetch={true}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-semibold transition-colors border border-surface-container"
          title="Open Login Screen / Switch Account"
        >
          <span className="material-symbols-outlined text-secondary text-[18px]">login</span>
          <span>Login Screen</span>
        </Link>

        {/* Add Trade quick mobile button */}
        <Link
          href="/add-trade"
          prefetch={true}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-on-primary shadow-sm"
          title="Add Trade"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </Link>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
            aria-expanded={notificationsOpen}
            aria-label="Notifications"
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest"></span>
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-80 max-w-[calc(100vw-24px)] bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container p-space-md z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <span className="font-headline-sm text-sm text-on-surface font-bold">Notifications</span>
                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <div className="flex flex-col gap-2.5 mt-2.5">
                <div className="p-2 rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                  <p className="font-label-md text-xs text-on-surface font-semibold">
                    Target Hit on NIFTY 25000 CE 🎉
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Trade exited at ₹135.00 (+₹1,350 profit recorded).
                  </p>
                  <span className="text-[10px] text-outline mt-1 block">15 mins ago</span>
                </div>
                <div className="p-2 rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                  <p className="font-label-md text-xs text-on-surface font-semibold">
                    Risk Rule Compliance Audit: Passed
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Your stop-loss discipline is at 100% for today&apos;s session.
                  </p>
                  <span className="text-[10px] text-outline mt-1 block">2 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Area */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            className="flex items-center gap-space-xs pl-space-xs p-1 rounded-lg hover:bg-surface-container transition-colors"
          >
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/20"
                src={user.avatar}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                {user.fullName.charAt(0)}
              </div>
            )}
            <div className="hidden md:flex flex-col text-left">
              <span className="font-label-md text-label-md text-on-surface leading-tight font-medium">
                {user.fullName}
              </span>
              <span className="font-label-sm text-[11px] text-primary leading-none font-semibold">
                {user.plan} Trader
              </span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-outline hidden md:inline-block">
              expand_more
            </span>
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-surface-container mb-1">
                <p className="font-label-md text-on-surface font-bold">{user.fullName}</p>
                <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">
                  {user.experience} Level
                </span>
              </div>

              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                <span>Profile &amp; Settings</span>
              </Link>

              <Link
                href="/onboarding"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>Setup Wizard</span>
              </Link>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  if (confirm('Replace your trades, journals and accounts with demo data?')) resetDemoData();
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                <span>Reset Demo Data</span>
              </button>

              <Link
                href="/su"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-secondary hover:bg-secondary-fixed/30 font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">security</span>
                <span>Super Admin Portal (/su)</span>
              </Link>

              <div className="border-t border-surface-container mt-1 pt-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm text-error hover:bg-error-container/40 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
