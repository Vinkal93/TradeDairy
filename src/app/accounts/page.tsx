'use client';

import React, { useState } from 'react';
import { useTrades } from '../../context/TradeContext';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { TradingAccount } from '../../types';

export default function AccountsPage() {
  const { user, accounts, trades, addAccount, deleteAccount } = useTrades();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [broker, setBroker] = useState<TradingAccount['broker']>('Zerodha');
  const [accountName, setAccountName] = useState('');
  const [capital, setCapital] = useState<number>(100000);
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR');

  const totalCapital = accounts.reduce((sum, a) => sum + a.capital, 0);
  const totalPnl = trades.reduce((sum, t) => sum + t.netPnl, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const colorMap: Record<string, string> = {
      Zerodha: '#0051d5',
      Groww: '#006948',
      'Angel One': '#00873a',
      Upstox: '#316bf3',
      Dhan: '#00855d',
      'Custom Broker': '#213145',
    };

    addAccount({
      broker,
      accountName: accountName || `${broker} Account`,
      capital,
      currency,
      accountNumber: `${broker.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
      isManual: true,
      isActive: true,
      color: colorMap[broker] || '#006948',
      logoInitial: broker.charAt(0),
    });

    setAddModalOpen(false);
    setAccountName('');
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top Header with Visual Depth Scrim */}
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-space-md bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm border border-surface-container/60 overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-space-2xs max-w-2xl">
          <div className="flex items-center gap-space-xs text-primary">
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
            <span className="font-label-sm text-xs uppercase tracking-wider font-bold">
              Capital Allocation &amp; Portfolios
            </span>
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface tracking-tight font-bold">
            Trading Accounts &amp; Broker Portfolio
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
            Manage manual tracking books, capital baselines, and multi-broker journal records with zero credential exposure.
          </p>
        </div>

        {/* Header CTAs */}
        <div className="relative z-10 flex flex-wrap items-center gap-space-xs">
          <button
            onClick={() => alert('Direct Broker API Integrations launching in Q1!')}
            className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-low text-secondary font-label-lg text-xs shadow-xs hover:bg-surface-container transition-all border border-surface-container cursor-pointer font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">link</span>
            <span>Connect Broker (API Soon)</span>
          </button>

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-xs shadow-xs hover:bg-primary-hover transition-all cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Add Trading Account</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Total Tracked Capital */}
        <div className="relative bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs text-on-surface-variant font-medium">Total Tracked Capital</span>
            <div className="p-1.5 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-space-sm flex flex-col">
            <span className="font-data-metric-lg text-2xl text-on-surface font-bold">
              {formatCurrency(totalCapital, user.baseCurrency)}
            </span>
            <div className="flex items-center gap-space-2xs mt-1 text-on-surface-variant text-xs">
              <span>Across {accounts.length} Active Books</span>
              <span className="inline-block w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="text-primary font-semibold">100% Manual</span>
            </div>
          </div>
        </div>

        {/* Total Realized P&L */}
        <div className="relative bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs text-on-surface-variant font-medium">Total Realized Journal P&amp;L</span>
            <div className="p-1.5 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
            </div>
          </div>
          <div className="mt-space-sm flex flex-col">
            <div className="flex items-baseline gap-space-2xs">
              <span
                className={`font-data-metric-lg text-2xl font-bold ${
                  totalPnl >= 0 ? 'text-primary' : 'text-error'
                }`}
              >
                {formatCurrency(totalPnl, user.baseCurrency, true)}
              </span>
            </div>
            <div className="flex items-center gap-space-2xs mt-1 text-on-surface-variant text-xs">
              <span>Cumulative All Accounts</span>
            </div>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="relative bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs text-on-surface-variant font-medium">Configured Brokers</span>
            <div className="p-1.5 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_tree</span>
            </div>
          </div>
          <div className="mt-space-sm flex flex-col">
            <span className="font-data-metric-lg text-2xl text-on-surface font-bold">
              {accounts.length} Portfolios
            </span>
            <span className="text-xs text-on-surface-variant mt-1">Multi-broker journal routing</span>
          </div>
        </div>

        {/* Privacy Status */}
        <div className="relative bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs text-on-surface-variant font-medium">Security &amp; Privacy</span>
            <div className="p-1.5 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">shield</span>
            </div>
          </div>
          <div className="mt-space-sm flex flex-col">
            <span className="font-data-metric-lg text-xl text-primary font-bold">
              100% Client-Side
            </span>
            <span className="text-xs text-on-surface-variant mt-1">Zero password/credential storage</span>
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {accounts.map((acc) => {
          const accTrades = trades.filter((t) => t.accountId === acc.id);
          const accPnl = accTrades.reduce((sum, t) => sum + t.netPnl, 0);
          const accWins = accTrades.filter((t) => t.netPnl > 0).length;
          const accWinRate = accTrades.length > 0 ? ((accWins / accTrades.length) * 100).toFixed(1) : '0.0';

          return (
            <div
              key={acc.id}
              className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container/70 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs"
                      style={{ backgroundColor: acc.color }}
                    >
                      {acc.logoInitial}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-on-surface">{acc.accountName}</h3>
                      <span className="text-[11px] text-on-surface-variant font-mono">{acc.accountNumber}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-bold text-[10px]">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-lg bg-surface-container-low border border-surface-container">
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">Capital</span>
                    <span className="text-sm font-bold text-on-surface">
                      {formatCurrency(acc.capital, acc.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">Realized P&amp;L</span>
                    <span
                      className={`text-sm font-bold ${
                        accPnl >= 0 ? 'text-primary' : 'text-error'
                      }`}
                    >
                      {formatCurrency(accPnl, acc.currency, true)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Trades: <strong>{accTrades.length}</strong></span>
                  <span>Win Rate: <strong>{accWinRate}%</strong></span>
                </div>
              </div>

              {accounts.length > 1 && (
                <div className="pt-3 mt-4 border-t border-surface-container flex justify-end">
                  <button
                    onClick={() => {
                      if (confirm(`Remove account ${acc.accountName}?`)) {
                        deleteAccount(acc.id);
                      }
                    }}
                    className="text-xs text-error hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Account Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-xs">
          <form
            onSubmit={handleAddSubmit}
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <h3 className="font-headline-sm text-base text-on-surface font-bold">Add Trading Account</h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-outline hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Broker Platform</label>
              <select
                value={broker}
                onChange={(e) => setBroker(e.target.value as any)}
                className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container"
              >
                <option value="Zerodha">Zerodha</option>
                <option value="Groww">Groww</option>
                <option value="Angel One">Angel One</option>
                <option value="Upstox">Upstox</option>
                <option value="Dhan">Dhan</option>
                <option value="Custom Broker">Other Broker</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Account Label / Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Scalp Desk, Swing Portfolio"
                className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Starting Capital</label>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
                className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container-low text-xs text-on-surface hover:bg-surface-container cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover shadow-sm cursor-pointer"
              >
                Add Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
