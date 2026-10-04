'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTrades } from '../../context/TradeContext';

export default function SettingsPage() {
  const { user, updateUser, resetDemoData, eraseAllData, exportTradesCSV, trades } = useTrades();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'risk' | 'data'>('profile');

  // Form states
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [alias, setAlias] = useState(user.tradingAlias);
  const [experience, setExperience] = useState(user.experience);
  const [market, setMarket] = useState(user.primaryMarket);
  const [currency, setCurrency] = useState(user.baseCurrency);
  const [dailyMaxLoss, setDailyMaxLoss] = useState(user.dailyMaxLoss || 3000);
  const [dailyMaxTrades, setDailyMaxTrades] = useState(user.dailyMaxTrades || 6);
  const [riskPercent, setRiskPercent] = useState(user.defaultRiskPerTrade || 1);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [actionNotification, setActionNotification] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      fullName,
      email,
      tradingAlias: alias,
      experience,
      primaryMarket: market,
      baseCurrency: currency,
      dailyMaxLoss,
      dailyMaxTrades,
      defaultRiskPerTrade: riskPercent,
    });

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleExportJSON = () => {
    const data = {
      user,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TradeDairy_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    const csv = exportTradesCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TradeDairy_Trades_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="flex flex-col w-full pb-16 gap-space-lg">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-xs uppercase tracking-wider font-semibold">
              Workspace Configuration
            </span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary"></span>
            <span className="font-label-sm text-xs text-on-surface-variant">v2.4.0 Engine</span>
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface tracking-tight font-bold">
            Account Settings &amp; Preferences
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-2xl">
            Customize your trading journal defaults, profile parameters, risk rules, and automated data exports.
          </p>
        </div>

        {/* Quick Stat Pill Strip */}
        <div className="flex items-center gap-space-xs p-1 rounded-xl bg-surface-container-low border border-surface-container">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest shadow-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-on-surface-variant leading-none">Status</span>
              <span className="text-xs font-bold text-on-surface leading-tight">Pro Verified</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest shadow-xs">
            <span className="material-symbols-outlined text-secondary text-[18px]">cloud_sync</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-on-surface-variant leading-none">Sync</span>
              <span className="text-xs font-bold text-on-surface leading-tight">NSE / Zerodha</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error-container/30 text-error hover:bg-error-container/60 transition-colors shadow-xs cursor-pointer border border-error/20"
            title="Erase all panel data"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            <span className="text-xs font-bold leading-tight">Wipe Panel Data</span>
          </button>
        </div>
      </div>

      {/* Settings Horizontal Tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl overflow-x-auto border border-surface-container">
        {[
          { id: 'profile', label: 'Profile', icon: 'person' },
          { id: 'preferences', label: 'Trading Preferences', icon: 'tune' },
          { id: 'risk', label: 'Risk & Rules', icon: 'shield' },
          { id: 'data', label: 'Data & Privacy', icon: 'download_for_offline' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-label-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}

        <Link
          href="/settings/charges"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-label-lg text-xs font-semibold whitespace-nowrap text-primary hover:bg-surface-container transition-all ml-auto"
        >
          <span className="material-symbols-outlined text-[18px]">calculate</span>
          <span>Broker Charge Rules</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-bold">
            NEW
          </span>
        </Link>
      </div>

      {/* Main Settings Canvas */}
      <form onSubmit={handleSaveProfile} className="flex flex-col gap-space-lg">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container/60">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
                <div>
                  <h2 className="font-headline-md text-base text-on-surface font-bold">Profile Information</h2>
                  <p className="font-body-sm text-xs text-on-surface-variant">Your verified trader identity and subscription tier.</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-xs font-bold">
                {user.plan} Active
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md p-space-md rounded-xl bg-surface-container-low border border-surface-container">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={user.fullName}
                  className="w-16 h-16 rounded-full object-cover shadow-xs ring-2 ring-primary/20"
                  src={user.avatar}
                />
              </div>

              <div className="flex flex-col flex-1 gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-base text-on-surface font-bold">{user.fullName}</span>
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                </div>
                <p className="text-xs text-on-surface-variant">{user.email}</p>
                <span className="text-[11px] text-primary font-semibold mt-1">
                  Active Trader • {user.experience} Level
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container focus:bg-surface-container-lowest"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container focus:bg-surface-container-lowest"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Trading Experience</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value as any)}
                  className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container"
                >
                  <option value="beginner">Beginner (&lt; 1 Year)</option>
                  <option value="intermediate">Intermediate (1-3 Years)</option>
                  <option value="advanced">Advanced (3+ Years)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Trading Alias / Handle</label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container focus:bg-surface-container-lowest"
                />
              </div>
            </div>
          </section>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <h2 className="font-headline-md text-base text-on-surface font-bold">Trading Workspace Preferences</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Base Account Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Primary Market Focus</label>
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container"
                >
                  <option value="Indian Markets (NSE / BSE)">Indian Markets (NSE / BSE)</option>
                  <option value="US Equities & Options">US Equities &amp; Options</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Forex">Forex</option>
                  <option value="Commodities / MCX">Commodities / MCX</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {/* Risk Tab */}
        {activeTab === 'risk' && (
          <section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">shield</span>
              <h2 className="font-headline-md text-base text-on-surface font-bold">
                Automated Risk Limits &amp; Guardrails
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant">Set hard boundaries to prevent overtrading and revenge drawdown.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Max Daily Loss Limit (₹)</label>
                <input
                  type="number"
                  value={dailyMaxLoss}
                  onChange={(e) => setDailyMaxLoss(parseFloat(e.target.value) || 0)}
                  className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Max Trades per Session</label>
                <input
                  type="number"
                  value={dailyMaxTrades}
                  onChange={(e) => setDailyMaxTrades(parseInt(e.target.value) || 0)}
                  className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Default Risk % per Trade</label>
                <input
                  type="number"
                  step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
                  className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container font-bold"
                />
              </div>
            </div>
          </section>
        )}

        {/* Data & Privacy Tab */}
        {activeTab === 'data' && (
          <section className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col gap-space-lg">
            <div>
              <h2 className="font-headline-md text-base text-on-surface font-bold">Data Management &amp; Backups</h2>
              <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                Export your trade history or manage your panel storage.
              </p>
            </div>

            {/* Notification Banner */}
            {actionNotification && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  actionNotification.type === 'danger'
                    ? 'bg-error-container/30 border-error/40 text-on-error-container'
                    : 'bg-primary-fixed/50 border-primary/30 text-on-primary-fixed'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    {actionNotification.type === 'danger' ? 'delete_sweep' : 'check_circle'}
                  </span>
                  <span>{actionNotification.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActionNotification(null)}
                  className="p-1 hover:opacity-70"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            )}

            {/* Export Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <button
                type="button"
                onClick={handleExportCSV}
                className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-left flex flex-col gap-1 transition-colors cursor-pointer group"
              >
                <span className="material-symbols-outlined text-primary text-[24px] group-hover:scale-110 transition-transform">
                  description
                </span>
                <span className="font-bold text-xs text-on-surface">Export Trades to CSV</span>
                <span className="text-[11px] text-on-surface-variant">
                  Download all {trades.length} trades for Excel, Google Sheets, or tax audit.
                </span>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-left flex flex-col gap-1 transition-colors cursor-pointer group"
              >
                <span className="material-symbols-outlined text-secondary text-[24px] group-hover:scale-110 transition-transform">
                  data_object
                </span>
                <span className="font-bold text-xs text-on-surface">Export Full Backup (JSON)</span>
                <span className="text-[11px] text-on-surface-variant">
                  Complete snapshot including profile, broker accounts, and daily journals.
                </span>
              </button>
            </div>

            {/* Danger Zone: Panel Wipe & Reset */}
            <div className="p-space-md rounded-xl bg-surface-container-low border border-error/30 flex flex-col gap-space-md">
              <div className="flex items-center gap-2 pb-2 border-b border-surface-container">
                <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                <div>
                  <h3 className="font-headline-sm text-xs font-bold text-error uppercase tracking-wider">
                    Panel Data Reset &amp; Clean Slate
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    Manage sample data or wipe all dummy trades to record your actual trades.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {/* 1. Erase All Panel Data (Clean Slate) */}
                <div className="p-space-md rounded-xl bg-surface-container-lowest border border-error/20 flex flex-col justify-between gap-3 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-error text-[18px]">delete_forever</span>
                        Erase All Panel Data
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold">
                        {trades.length} Trades Active
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                      Wipes all dummy trades, sample journal notes, and calculations. Gives you a 100% clean dashboard ready for live trading.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('⚠️ Are you sure you want to erase all panel data? All sample trades and notes will be wiped.')) {
                        eraseAllData();
                        setActionNotification({
                          message: 'Panel successfully wiped! All dummy data erased. Dashboard is clean and ready for your real trades.',
                          type: 'danger',
                        });
                      }
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-error hover:bg-error/90 text-on-error font-label-md text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                    <span>Wipe All Panel Data</span>
                  </button>
                </div>

                {/* 2. Restore Demo Data */}
                <div className="p-space-md rounded-xl bg-surface-container-lowest border border-primary/20 flex flex-col justify-between gap-3 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-[18px]">history</span>
                        Restore Demo Data
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                        24 Trades
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                      Re-populates the workspace with 24 realistic Nifty &amp; Banknifty trades and sample journals to preview analytics.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      resetDemoData();
                      setActionNotification({
                        message: 'Demo dataset restored with 24 trades and sample journal entries!',
                        type: 'success',
                      });
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-label-md text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Restore 24 Sample Trades</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedFeedback ? (
            <span className="text-xs text-primary font-bold">✓ Preferences successfully saved!</span>
          ) : (
            <span></span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-label-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
