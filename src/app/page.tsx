'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTrades } from '../context/TradeContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { localDate } from '../lib/dates';
import { TradeFilters } from '../components/common/TradeFilters';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded, accounts, filteredTrades, journals, analytics } = useTrades();

  // Auth guard: sequence Onboarding -> Login -> Home
  useEffect(() => {
    if (!isLoaded) return;
    if (!user.isLoggedIn) {
      if (!user.isOnboarded) {
        router.push('/onboarding');
      } else {
        router.push('/login');
      }
    }
  }, [user.isLoggedIn, user.isOnboarded, isLoaded, router]);

  if (!isLoaded || !user.isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-on-surface-variant font-medium">Entering TradeDairy Terminal...</p>
      </div>
    );
  }

  const account = accounts.find((a) => a.id === filteredTrades[0]?.accountId);
  const currencies = new Set(
    filteredTrades.map(
      (t) => accounts.find((a) => a.id === t.accountId)?.currency || user.baseCurrency
    )
  );
  const mixed = currencies.size > 1;
  const currency =
    currencies.size === 1
      ? account?.currency || user.baseCurrency
      : user.baseCurrency;

  const recent = [...filteredTrades]
    .sort((a, b) => `${b.date} ${b.entryTime || ''}`.localeCompare(`${a.date} ${a.entryTime || ''}`))
    .slice(0, 5);

  const journal = journals[localDate()];
  const totalCharges = filteredTrades.reduce((sum, t) => sum + (t.charges || 0), 0);

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="page-title text-on-surface">
            {user.fullName === 'Trader'
              ? 'Trading Dashboard'
              : `Hello, ${user.fullName.split(' ')[0]}`}
          </h1>
          <p className="text-xs sm:text-[13px] text-on-surface-variant mt-0.5">
            Your live trading ledger, discipline metrics, and performance analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            className="btn-primary text-xs sm:text-sm font-semibold py-1.5 px-3 rounded-lg"
            href="/add-trade"
          >
            <span className="material-symbols-outlined text-[17px]">add_circle</span>
            <span>+ Record Trade</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <TradeFilters />

      {mixed && (
        <div className="p-2.5 rounded-lg bg-surface-container-low text-xs text-on-surface-variant border border-surface-container flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">info</span>
          <span>
            Select a specific account for single-currency monetary totals. Multi-currency accounts are shown separately.
          </span>
        </div>
      )}

      {/* 4 Metric Cards - Clean single row on tablets and laptops */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          {
            label: 'Net Realized P&L',
            value: mixed ? '—' : formatCurrency(analytics.netRealizedPnl, currency, true),
            color: analytics.netRealizedPnl < 0 ? 'text-error' : 'text-primary',
            icon: 'account_balance_wallet',
          },
          {
            label: 'Win Rate',
            value: analytics.totalTrades ? `${analytics.winRate}%` : '—',
            color: 'text-on-surface',
            icon: 'query_stats',
          },
          {
            label: 'Recorded Trades',
            value: `${filteredTrades.length}`,
            color: 'text-on-surface',
            icon: 'receipt_long',
          },
          {
            label: 'Total Charges',
            value: mixed ? '—' : formatCurrency(totalCharges, currency),
            color: 'text-outline',
            icon: 'calculate',
          },
        ].map((card) => (
          <div key={card.label} className="card flex flex-col justify-between py-3 px-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium">{card.label}</span>
              <span className="material-symbols-outlined text-[17px] text-outline/70">
                {card.icon}
              </span>
            </div>
            <p className={`text-lg sm:text-xl tabular-nums font-bold tracking-tight mt-1.5 ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main Grid: Left 2 Cols (Recent Trades) + Right 1 Col (Journal & Accounts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Recent Trades Section */}
        <section className="card lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-surface-container/60">
            <h2 className="section-title flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">history</span>
              <span>Recent Executions</span>
            </h2>
            <Link
              href="/trades"
              className="text-primary hover:underline text-xs font-semibold flex items-center gap-0.5"
            >
              <span>View all ({filteredTrades.length})</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {!recent.length ? (
            <div className="py-8 text-center space-y-2.5">
              <span className="material-symbols-outlined text-[36px] text-outline/50">receipt</span>
              <p className="text-xs sm:text-sm text-on-surface-variant">No trades recorded in this timeframe.</p>
              <Link
                className="btn-primary text-xs py-1.5 px-3 inline-flex"
                href={accounts.length ? '/add-trade' : '/accounts'}
              >
                {accounts.length ? '+ Record your first trade' : 'Add Demat account'}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-surface-container/60">
              {recent.map((t) => {
                const acc = accounts.find((a) => a.id === t.accountId);
                const tradeCurrency = acc?.currency || user.baseCurrency;
                return (
                  <Link
                    key={t.id}
                    href={`/trades/${t.id}`}
                    className="flex justify-between items-center gap-3 py-2.5 px-1.5 hover:bg-surface-container-low/70 rounded-lg transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                          {t.instrument}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            t.side === 'BUY'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-error-container/40 text-error'
                          }`}
                        >
                          {t.side}
                        </span>
                      </div>
                      <p className="text-[11px] text-outline mt-0.5">
                        {formatDate(t.date)} • {t.quantity} qty • {acc?.accountName || t.accountName}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-xs sm:text-sm font-bold tabular-nums ${
                          t.netPnl < 0 ? 'text-error' : 'text-primary'
                        }`}
                      >
                        {t.status === 'OPEN' ? 'Open' : formatCurrency(t.netPnl, tradeCurrency, true)}
                      </p>
                      <p className="text-[10px] text-outline">
                        {t.status === 'CLOSED' ? 'Net P&L' : 'In position'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Sidebar: Today's Journal & Active Accounts */}
        <div className="space-y-3.5 sm:space-y-4">
          {/* Today's Daily Journal reflection card */}
          <section className="card space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-surface-container/60">
              <h2 className="section-title flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">edit_note</span>
                <span>Today’s Reflection</span>
              </h2>
              <Link href="/journal" className="text-primary hover:underline text-xs font-semibold">
                Open
              </Link>
            </div>
            <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed whitespace-pre-wrap">
              {journal?.postMarketNotes ||
                'Add pre-market checklist, mindset reflections, and trade reviews for today.'}
            </p>
            <Link
              href="/journal"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-0.5 pt-1"
            >
              <span>{journal ? 'View full journal' : '+ Write entry'}</span>
              <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
            </Link>
          </section>

          {/* Demat Accounts Card */}
          <section className="card space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-surface-container/60">
              <h2 className="section-title flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">account_balance</span>
                <span>Your Demat Accounts</span>
              </h2>
              <Link href="/accounts" className="text-primary hover:underline text-xs font-semibold">
                Manage
              </Link>
            </div>

            {accounts.length ? (
              <div className="space-y-1.5">
                {accounts.slice(0, 3).map((a) => (
                  <Link
                    href={`/trades?account=${encodeURIComponent(a.id)}`}
                    key={a.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-surface-container-low transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-on-surface block truncate">
                        {a.accountName}
                      </span>
                      <span className="text-[10px] text-outline block">
                        {a.broker} • {a.isActive ? 'Active' : 'Archived'}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-outline">
                      chevron_right
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-outline py-2">No accounts added yet.</p>
            )}

            <Link
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-0.5 pt-1"
              href="/accounts"
            >
              <span>Configure broker rules</span>
              <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
            </Link>
          </section>
        </div>
      </div>

      <p className="text-[11px] text-outline pt-1 text-center sm:text-left">
        TradeDairy tracks your discipline locally in this browser. Backup and export anytime from Settings.
      </p>
    </div>
  );
}
