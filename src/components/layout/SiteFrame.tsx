'use client';
import { usePathname } from 'next/navigation';
import { TradeProvider } from '../../context/TradeContext';
import { AppShell } from './AppShell';
import { isPublicRoute } from '../../lib/seo';
export function SiteFrame({children}: {children: React.ReactNode}) {
 if (isPublicRoute(usePathname())) return <>{children}</>;
 return <TradeProvider><AppShell>{children}</AppShell></TradeProvider>;
}

