'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '../common/BrandLogo';

const NAV = [
  ['Dashboard', '/', 'grid_view'],
  ['Trades', '/trades', 'receipt_long'],
  ['Journal', '/journal', 'edit_note'],
  ['Calendar', '/calendar', 'calendar_today'],
  ['Analytics', '/analytics', 'monitoring'],
  ['Accounts', '/accounts', 'account_balance'],
  ['Broker charges', '/settings/charges', 'calculate'],
  ['Settings', '/settings', 'settings'],
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-56 bg-white border-r border-surface-container z-50 flex-col py-4 overflow-y-auto">
      <Link href="/" className="px-4 mb-4">
        <BrandLogo />
      </Link>
      <div className="px-3 mb-4">
        <Link href="/add-trade" className="btn-primary w-full text-center font-semibold text-xs">
          + Record trade
        </Link>
      </div>
      <nav className="space-y-0.5 px-2.5 flex-1" aria-label="Main navigation">
        {NAV.map(([label, path, icon]) => {
          const active =
            path === '/'
              ? pathname === path
              : path === '/settings'
              ? pathname === path
              : pathname === path || pathname.startsWith(`${path}/`);
          return (
            <Link
              key={path}
              href={path}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs sm:text-[13px] font-medium transition-colors ${
                active
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[19px]">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <p className="px-4 pt-3 text-[11px] text-outline border-t border-surface-container/60">
        TradeDairy • Disciplined Journal
      </p>
    </aside>
  );
}
