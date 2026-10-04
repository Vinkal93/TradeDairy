'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTrades, TimeframeFilter } from '../context/TradeContext';
import { formatCurrency, formatPercent } from '../lib/utils';
import { localDate } from '../lib/dates';

export default function DashboardPage() {
  const router = useRouter();
  const {
    user,
    accounts,
    trades,
    journals,
    selectedTimeframe,
    setTimeframe,
    analytics,
    intradayEquityCurve,
    isLoaded,
  } = useTrades();

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
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-on-surface-variant font-medium">Entering TradeDairy Terminal...</p>
      </div>
    );
  }

  const todayJournal = journals[localDate()] || {
    postMarketNotes: 'Add your reflections in the daily journal.',
    mindsetTags: [],
  };

  const timeframeOptions: TimeframeFilter[] = ['Today', 'This Week', 'This Month', 'This Year', 'All Time'];

  // Slice recent 5 trades for the table
  const recentTrades = trades.slice(0, 5);

  // Profit vs Loss counts for the donut chart
  const winCount = analytics.winningTrades;
  const lossCount = analytics.losingTrades;
  const totalCount = winCount + lossCount || 1;
  const winPct = (winCount / totalCount) * 100;
  const lossPct = (lossCount / totalCount) * 100;

  // Donut SVG circumference calculation (r = 15.915, circumference = 100)
  const lossStrokeDasharray = `${lossPct} ${100 - lossPct}`;
  const winStrokeDasharray = `${winPct} ${100 - winPct}`;
  const winStrokeDashoffset = `-${lossPct}`;

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top Greeting & Control Bar */}
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm border border-surface-container/60">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center gap-space-xs flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Good Morning, {user.fullName.split(' ')[0]}
            </h1>
            <span className="text-2xl animate-pulse">👋</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
              Live Session
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Track. Learn. Improve. Grow. Here is your trading performance summary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Timeframe Segmented Switcher */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-surface-container">
            {timeframeOptions.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-space-sm py-1.5 rounded-md font-label-md text-label-md transition-all ${
                  selectedTimeframe === tf
                    ? 'bg-primary text-on-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Quick Action CTA Button */}
          <Link
            href="/add-trade"
            prefetch={true}
            className="inline-flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-hover hover:shadow transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Record Trade</span>
          </Link>
        </div>
      </section>

      {/* Quick Screen Flow & Setup Hub */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
        {/* Onboarding Screen Card */}
        <Link
          href="/onboarding"
          prefetch={true}
          className="group p-space-md rounded-xl bg-surface-container-lowest border border-surface-container/80 hover:border-primary/50 shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">tune</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-xs font-bold text-on-surface">Onboarding Wizard</span>
                <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary-fixed text-[9px] font-bold uppercase">Setup</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">Setup broker, capital &amp; risk rules</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-all text-[20px]">
            arrow_forward
          </span>
        </Link>

        {/* Login Screen Card */}
        <Link
          href="/login"
          prefetch={true}
          className="group p-space-md rounded-xl bg-surface-container-lowest border border-surface-container/80 hover:border-secondary/50 shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">login</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-xs font-bold text-on-surface">Login &amp; Auth Screen</span>
                <span className="px-1.5 py-0.2 rounded bg-secondary-fixed text-on-secondary-fixed text-[9px] font-bold uppercase">Auth</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">1-Click demo authentication &amp; switch user</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline group-hover:text-secondary group-hover:translate-x-0.5 transition-all text-[20px]">
            arrow_forward
          </span>
        </Link>

        {/* Settings & Erase Data Card */}
        <Link
          href="/settings"
          prefetch={true}
          className="group p-space-md rounded-xl bg-surface-container-lowest border border-surface-container/80 hover:border-error/40 shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-error-container/20 text-error flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">delete_sweep</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-xs font-bold text-on-surface">Settings &amp; Erase Data</span>
                <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant text-[9px] font-bold uppercase">{trades.length} Trades</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">Wipe dummy text, clean slate or restore</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline group-hover:text-error group-hover:translate-x-0.5 transition-all text-[20px]">
            arrow_forward
          </span>
        </Link>
      </section>

      {/* KPI Metric Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Card 1: Net P&L */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Net Realized P&amp;L
            </span>
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                analytics.netRealizedPnl >= 0
                  ? 'bg-primary-fixed text-on-primary-fixed'
                  : 'bg-error-container text-on-error-container'
              }`}
            >
              <span className="material-symbols-outlined text-[12px]">
                {analytics.netRealizedPnl >= 0 ? 'trending_up' : 'trending_down'}
              </span>
              {formatPercent(analytics.netRealizedPnl / 1000, true)}
            </span>
          </div>

          <div className="my-space-xs flex items-baseline justify-between">
            <span
              className={`font-data-metric-lg text-data-metric-lg font-bold ${
                analytics.netRealizedPnl >= 0 ? 'text-primary' : 'text-error'
              }`}
            >
              {formatCurrency(analytics.netRealizedPnl, user.baseCurrency, true)}
            </span>

            {/* Mini Sparkline Bars */}
            <div className="flex items-end gap-1 h-7">
              <span className="w-1.5 h-3 rounded-full bg-primary/40"></span>
              <span className="w-1.5 h-5 rounded-full bg-primary/60"></span>
              <span className="w-1.5 h-2 rounded-full bg-error/70"></span>
              <span className="w-1.5 h-7 rounded-full bg-primary"></span>
            </div>
          </div>

          <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
            <span className="text-primary font-semibold">{analytics.winningTrades} Wins</span>
            <span className="text-error font-semibold">{analytics.losingTrades} Losses</span>
            <span>{analytics.breakevenTrades} Breakeven</span>
          </div>
        </div>

        {/* Card 2: Win Rate */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Win Rate
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {analytics.winningTrades} / {analytics.totalTrades} Executed
            </span>
          </div>

          <div className="my-space-xs flex items-center justify-between">
            <span className="font-data-metric-lg text-data-metric-lg text-on-surface">
              {analytics.winRate}%
            </span>
            {/* Progress Circular Visualizer */}
            <div className="relative w-9 h-9">
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                <circle
                  className="text-surface-container-high"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <circle
                  className="text-primary"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="14"
                  stroke="currentColor"
                  strokeDasharray="88"
                  strokeDashoffset={88 - (88 * (analytics.winRate || 0)) / 100}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
            <span>Target: 60.0%</span>
            <span className="text-primary font-medium">
              {analytics.winRate >= 60 ? 'Above Benchmark' : 'Approaching Target'}
            </span>
          </div>
        </div>

        {/* Card 3: Total Trades */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Total Trades
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
              {trades.filter(t => t.date === localDate()).length} Today
            </span>
          </div>

          <div className="my-space-xs flex items-baseline justify-between">
            <span className="font-data-metric-lg text-data-metric-lg text-on-surface">
              {analytics.totalTrades}
            </span>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                {analytics.totalTrades} Closed
              </span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container-low text-secondary font-label-sm text-label-sm">
                0 Open
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
            <span>Max Daily Limit: {user.dailyMaxTrades || 6}</span>
            <span className="text-primary font-medium">Discipline Kept</span>
          </div>
        </div>

        {/* Card 4: Profit Factor */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Profit Factor
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
              {analytics.profitFactor >= 1.5 ? 'Optimal' : 'Acceptable'}
            </span>
          </div>

          <div className="my-space-xs flex items-baseline justify-between">
            <span className="font-data-metric-lg text-data-metric-lg text-on-surface">
              {analytics.profitFactor}
            </span>
            <div className="flex items-center text-primary gap-0.5">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
            <span>
              Avg Win: <span className="text-primary font-semibold">{formatCurrency(analytics.avgWin, user.baseCurrency)}</span>
            </span>
            <span>
              Avg Loss: <span className="text-error font-semibold">{formatCurrency(analytics.avgLoss, user.baseCurrency)}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Workspace Grid (70/30 split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Main Left Column (70%) */}
        <section className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
          {/* Equity Curve & P&L Chart Card */}
          <div className="bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
              <div>
                <div className="flex items-center gap-space-xs">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Cumulative Equity Curve</h2>
                  <span
                    className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                      analytics.netRealizedPnl >= 0
                        ? 'bg-primary-fixed text-on-primary-fixed'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    {formatCurrency(analytics.netRealizedPnl, user.baseCurrency, true)}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Real-time equity progression across session executions
                </p>
              </div>

              <div className="flex items-center gap-space-xs self-start sm:self-auto">
                <span className="flex items-center gap-1 font-label-sm text-label-sm text-primary font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span> Live Market
                </span>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-low text-on-surface font-label-md text-label-md border border-surface-container">
                  <span>{selectedTimeframe}</span>
                </div>
              </div>
            </div>

            {/* SVG Line Curve Visualizer */}
            <div className="w-full h-64 relative flex flex-col justify-end pt-4">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 680 200">
                <defs>
                  <linearGradient id="equityGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#006948" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#00855d" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#006948" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Horizontal Reference Gridlines */}
                <line x1="0" x2="680" y1="30" y2="30" stroke="#bccac0" strokeDasharray="3 3" strokeOpacity="0.25" />
                <line x1="0" x2="680" y1="85" y2="85" stroke="#bccac0" strokeDasharray="3 3" strokeOpacity="0.25" />
                <line x1="0" x2="680" y1="140" y2="140" stroke="#bccac0" strokeDasharray="3 3" strokeOpacity="0.25" />
                <line x1="0" x2="680" y1="190" y2="190" stroke="#bccac0" strokeOpacity="0.4" />

                {/* Dynamic or Smooth Curve */}
                <path
                  d="M 0,175 C 60,170 90,140 140,145 C 190,150 220,120 270,125 C 310,130 350,90 400,95 C 450,100 480,125 530,110 C 580,95 620,40 680,32 L 680,190 L 0,190 Z"
                  fill="url(#equityGrad)"
                />
                <path
                  d="M 0,175 C 60,170 90,140 140,145 C 190,150 220,120 270,125 C 310,130 350,90 400,95 C 450,100 480,125 530,110 C 580,95 620,40 680,32"
                  fill="none"
                  stroke="#006948"
                  strokeLinecap="round"
                  strokeWidth="3"
                />

                {/* Data Marker Points */}
                <circle cx="140" cy="145" r="4" fill="#ffffff" stroke="#006948" strokeWidth="2.5" />
                <circle cx="270" cy="125" r="4" fill="#ffffff" stroke="#006948" strokeWidth="2.5" />
                <circle cx="400" cy="95" r="4" fill="#ffffff" stroke="#006948" strokeWidth="2.5" />
                <circle cx="530" cy="110" r="4" fill="#ffffff" stroke="#ba1a1a" strokeWidth="2.5" />
                <circle cx="680" cy="32" r="5" fill="#006948" stroke="#ffffff" strokeWidth="2.5" />
              </svg>

              {/* Timeline Marks */}
              <div className="flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm pt-2">
                <span>09:30</span>
                <span>10:30</span>
                <span>11:30</span>
                <span>12:30</span>
                <span>13:30</span>
                <span>14:30</span>
                <span>15:30</span>
              </div>
            </div>
          </div>

          {/* Recent Trades Log Card */}
          <div className="bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Recent Trades</h2>
                <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                  {recentTrades.length} Recorded
                </span>
              </div>
              <Link
                href="/trades"
                className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary hover:underline"
              >
                <span>View All Trades</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            {/* Table Container */}
            {recentTrades.length === 0 ? (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-3 bg-surface-container-low/40 rounded-xl border border-dashed border-surface-container">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">receipt_long</span>
                </div>
                <div className="flex flex-col gap-1 max-w-sm">
                  <h3 className="font-headline-sm text-sm text-on-surface font-bold">Your Journal is Clean &amp; Ready!</h3>
                  <p className="text-xs text-on-surface-variant">
                    No trades recorded yet. Start recording your live trades to generate real-time P&amp;L analytics.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Link
                    href="/add-trade"
                    prefetch={true}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-bold text-xs shadow-xs hover:bg-primary-hover transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>Record First Trade</span>
                  </Link>
                  <Link
                    href="/settings"
                    prefetch={true}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">settings</span>
                    <span>Settings</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-data-table text-data-table border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-2.5 px-3 rounded-l-md">Time</th>
                      <th className="py-2.5 px-3">Instrument</th>
                      <th className="py-2.5 px-3">Side</th>
                      <th className="py-2.5 px-3 text-right">Entry</th>
                      <th className="py-2.5 px-3 text-right">Exit</th>
                      <th className="py-2.5 px-3 text-right">Net P&amp;L</th>
                      <th className="py-2.5 px-3">Setup</th>
                      <th className="py-2.5 px-3 text-center rounded-r-md">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {recentTrades.map((trade) => {
                      const isProfit = trade.netPnl > 0;
                      return (
                        <tr key={trade.id} className="hover:bg-surface-container-low transition-colors group">
                          <td className="py-3 px-3 text-on-surface-variant whitespace-nowrap text-xs">
                            {trade.entryTime}
                          </td>
                          <td className="py-3 px-3 font-semibold text-on-surface whitespace-nowrap">
                            <Link href={`/trades/${trade.id}`} prefetch={true} className="hover:text-primary transition-colors">
                              {trade.instrument}
                            </Link>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold uppercase ${
                                trade.side === 'BUY'
                                  ? 'bg-primary-fixed text-on-primary-fixed'
                                  : 'bg-error-container text-on-error-container'
                              }`}
                            >
                              {trade.side}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-on-surface whitespace-nowrap tabular-nums">
                            {formatCurrency(trade.entryPrice, user.baseCurrency)}
                          </td>
                          <td className="py-3 px-3 text-right text-on-surface whitespace-nowrap tabular-nums">
                            {trade.exitPrice ? formatCurrency(trade.exitPrice, user.baseCurrency) : '-'}
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-bold whitespace-nowrap tabular-nums ${
                              isProfit ? 'text-primary' : 'text-error'
                            }`}
                          >
                            {formatCurrency(trade.netPnl, user.baseCurrency, true)}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-xs">
                              {trade.setup}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <Link
                              href={`/trades/${trade.id}`}
                              prefetch={true}
                              className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                              title="View Trade Story"
                            >
                              <span className="material-symbols-outlined text-[18px]">show_chart</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Right Sidebar Column (30%) */}
        <aside className="lg:col-span-4 flex flex-col gap-space-lg min-w-0">
          {/* Trade Distribution Donut Card */}
          <div className="bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Trade Distribution</h2>
              <span className="material-symbols-outlined text-outline text-[18px]">donut_large</span>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-space-md py-space-xs">
              {/* Donut SVG */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 42 42">
                  <circle cx="21" cy="21" fill="transparent" r="15.915" stroke="#e5eeff" strokeWidth="4.5" />
                  {/* Loss arc */}
                  <circle
                    cx="21"
                    cy="21"
                    fill="transparent"
                    r="15.915"
                    stroke="#ba1a1a"
                    strokeDasharray={lossStrokeDasharray}
                    strokeDashoffset="0"
                    strokeWidth="4.5"
                  />
                  {/* Win arc */}
                  <circle
                    cx="21"
                    cy="21"
                    fill="transparent"
                    r="15.915"
                    stroke="#006948"
                    strokeDasharray={winStrokeDasharray}
                    strokeDashoffset={winStrokeDashoffset}
                    strokeWidth="4.8"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-data-metric-md text-data-metric-md text-on-surface leading-none">
                    {analytics.totalTrades}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Trades</span>
                </div>
              </div>

              {/* Legend details */}
              <div className="flex flex-col gap-space-xs w-full max-w-[220px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low border border-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="font-label-md text-label-md text-on-surface">Profitable</span>
                  </div>
                  <span className="font-label-md text-label-md font-bold text-primary">
                    {winCount} ({winPct.toFixed(1)}%)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low border border-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-error"></span>
                    <span className="font-label-md text-label-md text-on-surface">Loss-Making</span>
                  </div>
                  <span className="font-label-md text-label-md font-bold text-error">
                    {lossCount} ({lossPct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Daily Reflection Note Card */}
          <div className="bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm border border-surface-container/60 flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Today&apos;s Note</h2>
              </div>
              <Link
                href="/journal"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-low font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors cursor-pointer border border-surface-container"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                <span>Edit</span>
              </Link>
            </div>

            <div className="p-space-md rounded-lg bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm leading-relaxed border border-surface-container">
              &ldquo;{todayJournal.postMarketNotes}&rdquo;
            </div>

            {/* Mindset & Setup Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {todayJournal.mindsetTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-[11px] font-medium"
                >
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Broker Accounts Quick Status Widget */}
          <div className="bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-2xs">
                <span className="material-symbols-outlined text-secondary text-[20px]">account_balance_wallet</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Broker Accounts</h2>
              </div>
              <Link
                href="/accounts"
                className="inline-flex items-center gap-1 text-primary font-label-md text-label-md hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Account</span>
              </Link>
            </div>

            {/* Account List */}
            <div className="flex flex-col gap-2">
              {accounts.slice(0, 2).map((acc) => {
                const accTrades = trades.filter((t) => t.accountId === acc.id);
                const accPnl = accTrades.reduce((sum, t) => sum + t.netPnl, 0);

                return (
                  <div
                    key={acc.id}
                    className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container"
                  >
                    <div className="flex items-center gap-space-sm">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-xs"
                        style={{ backgroundColor: acc.color }}
                      >
                        {acc.logoInitial}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">
                            {acc.broker}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        </div>
                        <span className="font-label-sm text-xs text-on-surface-variant">
                          Capital: {formatCurrency(acc.capital, acc.currency)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-label-md text-label-md font-bold ${
                          accPnl >= 0 ? 'text-primary' : 'text-error'
                        }`}
                      >
                        {formatCurrency(accPnl, acc.currency, true)}
                      </span>
                      <span className="block font-label-sm text-[10px] text-on-surface-variant">
                        Manual Tracking
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pro Upsell Mini Strip */}
            <div className="p-space-sm rounded-lg bg-gradient-to-r from-surface-container-high to-surface-container flex items-center justify-between border border-primary/10">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[18px]">sync_alt</span>
                <span className="font-label-sm text-xs text-on-surface font-medium">
                  Auto-sync API with Zerodha
                </span>
              </div>
              <button
                onClick={() => alert('API Auto-sync feature coming soon in Pro V3!')}
                className="px-2.5 py-1 rounded bg-primary text-on-primary font-label-sm text-xs hover:bg-primary-hover transition-colors font-semibold"
              >
                Upgrade
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
