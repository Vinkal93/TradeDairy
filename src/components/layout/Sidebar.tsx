'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '../common/BrandLogo';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: 'grid_view' },
  { name: 'Trades', path: '/trades', icon: 'receipt_long' },
  { name: 'Journal', path: '/journal', icon: 'edit_note' },
  { name: 'Calendar', path: '/calendar', icon: 'calendar_today' },
  { name: 'Analytics', path: '/analytics', icon: 'monitoring' },
  { name: 'Broker Sync', path: '/broker-sync', icon: 'sync_alt', badge: 'AI' },
  { name: 'Accounts', path: '/accounts', icon: 'account_balance' },
  { name: 'Settings', path: '/settings', icon: 'settings' },
];

const SETUP_ITEMS = [
  { name: 'Setup Wizard', path: '/onboarding', icon: 'tune' },
  { name: 'Trader Login', path: '/login', icon: 'login' },
  { name: 'Super Admin (/su)', path: '/su', icon: 'security', admin: true },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between py-space-md hidden md:flex border-r border-surface-container overflow-y-auto">
      <div className="flex flex-col gap-space-md">
        {/* Brand Logo */}
        <div className="px-space-md">
          <Link href="/" prefetch={true}>
            <BrandLogo />
          </Link>
        </div>

        {/* Primary CTA button: Add Trade */}
        <div className="px-space-md">
          <Link
            href="/add-trade"
            prefetch={true}
            className="flex items-center justify-center gap-space-xs w-full py-2.5 px-space-md rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-hover hover:shadow transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Trade</span>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1 px-space-xs">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={active ? 'page' : undefined}
                prefetch={true}
                className={`flex items-center justify-between px-space-md py-2.5 rounded-lg font-label-lg text-label-lg transition-colors ${
                  active
                    ? 'bg-surface-container-high text-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-bold leading-none">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="my-2 border-t border-surface-container px-space-md pt-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-outline px-2">
              Setup &amp; Administration
            </span>
          </div>

          {SETUP_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                prefetch={true}
                className={`flex items-center justify-between px-space-md py-2 rounded-lg font-label-md text-xs transition-colors ${
                  active
                    ? 'bg-surface-container-high text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-sm">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      item.admin ? 'text-secondary' : 'text-primary'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>
                {item.admin && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-inverse-surface text-inverse-on-surface font-mono font-bold leading-none">
                    ROOT
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Pro Plan Banner */}
      <div className="px-space-md">
        <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-space-2xs border border-primary/10">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
              Pro Plan
            </span>
            <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
          </div>
          <p className="font-body-sm text-[12px] text-on-surface-variant leading-snug">
            Unlimited trades &amp; deep insights active
          </p>
        </div>
      </div>
    </aside>
  );
};
