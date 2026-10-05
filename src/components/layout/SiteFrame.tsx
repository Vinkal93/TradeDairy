'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TradeProvider, useTrades, getCookie } from '../../context/TradeContext';
import { AppShell } from './AppShell';
import { isPublicRoute } from '../../lib/seo';

function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoaded } = useTrades();
  const [hasAuthCookie, setHasAuthCookie] = useState<boolean | null>(null);

  useEffect(() => {
    const authCookie = getCookie('td_auth_email');
    setHasAuthCookie(Boolean(authCookie));
  }, []);

  // Standalone routes without trader AppShell (Sidebar/Header)
  const isStandalone =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/onboarding' ||
    pathname === '/auth/qr' ||
    pathname === '/su' ||
    pathname?.startsWith('/su/');

  if (isStandalone) {
    return <>{children}</>;
  }

  // Public marketing/guides/about/privacy routes (excluding root '/')
  if (pathname !== '/' && isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  // On root path '/':
  // If logged in -> render inside persistent AppShell with Sidebar & Header
  // If not logged in -> render marketing LandingPage directly without AppShell
  if (pathname === '/') {
    const isLoggedIn = user.isLoggedIn || (hasAuthCookie && !isLoaded);
    if (!isLoggedIn && isLoaded) {
      return <>{children}</>;
    }
    if (isLoggedIn) {
      return <AppShell>{children}</AppShell>;
    }
    if (hasAuthCookie) {
      return <AppShell>{children}</AppShell>;
    }
    return <>{children}</>;
  }

  // All other routes are protected trader pages (/trades, /journal, /calendar, /analytics, /accounts, /settings, /changelog)
  return <AppShell>{children}</AppShell>;
}

export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <TradeProvider>
      <WorkspaceLayout>{children}</WorkspaceLayout>
    </TradeProvider>
  );
}
