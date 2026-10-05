'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '../common/BrandLogo';
import { useTrades } from '../../context/TradeContext';

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
  const { openRecordTradeModal } = useTrades();
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 bg-white border-r border-surface-container z-50 flex-col py-6 overflow-y-auto">
      <Link href="/" className="px-4 mb-4">
        <BrandLogo />
      </Link>
      <div className="px-3 mb-4">
        <button
          type="button"
          onClick={() => openRecordTradeModal()}
          className="btn-primary w-full text-center font-semibold text-sm !py-3 cursor-pointer shadow-sm active:scale-[0.98] transition-transform"
        >
          + Record trade
        </button>
      </div>
      <nav className="space-y-1.5 px-3 flex-1" aria-label="Main navigation">
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
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all ${
                active
                  ? 'bg-primary/10 text-primary font-bold border-l-4 border-primary pl-2.5 shadow-2xs'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{icon}</span>
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
