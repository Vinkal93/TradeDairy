'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTrades, getCookie } from '../../context/TradeContext';
import DashboardPage from '../../app/dashboard-view';

export function HomeExperience({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoaded } = useTrades();

  useEffect(() => {
    if (!isLoaded) return;
    if (user.isLoggedIn && !user.isOnboarded) {
      router.replace('/onboarding');
    }
  }, [isLoaded, user.isLoggedIn, user.isOnboarded, router]);

  // If user is authenticated and onboarded, display Dashboard directly
  if (user.isLoggedIn && user.isOnboarded) {
    return <DashboardPage />;
  }

  // If still loading but user has logged-in auth cookies, don't flash landing page
  if (!isLoaded && typeof window !== 'undefined') {
    const cookieEmail = getCookie('td_auth_email');
    if (cookieEmail) {
      return (
        <div className="py-24 text-center text-outline">
          <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium">Loading your trading dashboard…</p>
        </div>
      );
    }
  }

  // Not logged in -> show LandingPage (children)
  return <>{children}</>;
}
