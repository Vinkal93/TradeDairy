'use client';

import React, { useState } from 'react';
import { useTrades, TimeframeFilter } from '../../context/TradeContext';
import { formatCurrency, formatPercent } from '../../lib/utils';

export default function AnalyticsPage() {
  const { user, analytics, setupStats, emotionStats, selectedTimeframe, setTimeframe } = useTrades();

  const timeRangePills: TimeframeFilter[] = ['Today', 'This Week', 'This Month', 'This Year', 'All Time'];

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Header Banner & Filter Utility Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm border border-surface-container/60">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container text-primary">
              <span className="material-symbols-outlined text-[20px]">insights</span>
            </span>
            <h1 className="font-headline-lg text-xl sm:text-2xl text-on-surface tracking-tight font-bold">
              Performance Analytics &amp; Intelligence
            </h1>
          </div>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
            Data-driven statistical breakdown of your trading edge, consistency, and execution setups.
          </p>
        </div>

        {/* Controls Strip */}
        <div className="flex flex-wrap items-center gap-space-xs">
          {/* Time Range Pills */}
          <div className="inline-flex p-1 bg-surface-container-high rounded-lg text-on-surface-variant font-label-md text-xs border border-surface-container">
            {timeRangePills.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => setTimeframe(pill)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  selectedTimeframe === pill
                    ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                    : 'hover:text-on-surface'
                }`}
              >
                {pill}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-space-2xs px-4 py-2 rounded-lg bg-surface-container-low text-secondary font-label-lg text-xs shadow-xs hover:bg-surface-container transition-all border border-surface-container cursor-pointer font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Metric 1: Total Net P&L */}
        <div className="flex flex-col justify-between p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-3 -top-3 w-20 h-20 bg-primary/5 rounded-full pointer-events-none"></div>
          <div className="flex items-center justify-between pb-space-xs">
            <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              Total Net P&amp;L
            </span>
            <span className="inline-flex items-center gap-0.5 text-primary bg-surface-container-high px-2 py-0.5 rounded-full font-label-sm text-xs font-bold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +14.2% ROI
            </span>
          </div>

          <div className="py-space-2xs">
            <div
              className={`font-data-metric-lg text-2xl sm:text-3xl font-bold tracking-tight ${
                analytics.netRealizedPnl >= 0 ? 'text-primary' : 'text-error'
              }`}
            >
              {formatCurrency(analytics.netRealizedPnl, user.baseCurrency, true)}
            </div>
          </div>

          <div className="pt-space-xs flex items-center justify-between text-xs text-on-surface-variant border-t border-surface-container/60 mt-1">
            <span>Benchmark vs NIFTY</span>
            <span className="font-label-md text-primary font-semibold">+9.4% alpha</span>
          </div>
        </div>

        {/* Metric 2: Win Rate Ratio */}
        <div className="flex flex-col justify-between p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-space-xs">
            <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              Win Rate Ratio
            </span>
            <span className="inline-flex items-center text-secondary bg-surface-container px-2 py-0.5 rounded-full font-label-sm text-xs font-semibold">
              {analytics.totalTrades} Trades
            </span>
          </div>

          <div className="py-space-2xs flex items-baseline gap-space-xs">
            <div className="font-data-metric-lg text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              {analytics.winRate}%
            </div>
            <span className="font-label-sm text-xs text-on-surface-variant">accuracy</span>
          </div>

          <div className="pt-space-xs flex items-center justify-between text-xs text-on-surface-variant border-t border-surface-container/60 mt-1">
            <span className="flex items-center gap-1 font-medium text-primary">
              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span> {analytics.winningTrades} Wins
            </span>
            <span className="flex items-center gap-1 font-medium text-error">
              <span className="w-2 h-2 rounded-full bg-error inline-block"></span> {analytics.losingTrades} Losses
            </span>
          </div>
        </div>

        {/* Metric 3: Profit Factor */}
        <div className="flex flex-col justify-between p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-space-xs">
            <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              Profit Factor
            </span>
            <span className="inline-flex items-center text-primary bg-surface-container-high px-2 py-0.5 rounded-full font-label-sm text-xs font-bold">
              Ratio: {analytics.profitFactor}
            </span>
          </div>

          <div className="py-space-2xs">
            <div className="font-data-metric-lg text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              {analytics.profitFactor}
            </div>
          </div>

          <div className="pt-space-xs flex items-center justify-between text-xs text-on-surface-variant border-t border-surface-container/60 mt-1">
            <span className="text-primary font-medium">Avg Win: {formatCurrency(analytics.avgWin, user.baseCurrency)}</span>
            <span className="text-error font-medium">Avg Loss: {formatCurrency(analytics.avgLoss, user.baseCurrency)}</span>
          </div>
        </div>

        {/* Metric 4: Expectancy */}
        <div className="flex flex-col justify-between p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-space-xs">
            <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              Per-Trade Expectancy
            </span>
            <span className="inline-flex items-center text-primary bg-surface-container px-2 py-0.5 rounded-full font-label-sm text-xs font-semibold">
              Positive Edge
            </span>
          </div>

          <div className="py-space-2xs">
            <div className="font-data-metric-lg text-2xl sm:text-3xl text-primary font-bold tracking-tight">
              +{formatCurrency(analytics.expectancy, user.baseCurrency)}
            </div>
          </div>

          <div className="pt-space-xs flex items-center justify-between text-xs text-on-surface-variant border-t border-surface-container/60 mt-1">
            <span>Max Drawdown:</span>
            <span className="font-semibold text-error">-{formatCurrency(analytics.maxDrawdown, user.baseCurrency)}</span>
          </div>
        </div>
      </div>

      {/* Main Analysis Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Strategy Setup Performance (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-sm text-base text-on-surface font-bold">Strategy Playbook Efficiency</h2>
                <p className="text-xs text-on-surface-variant">Win rates and cumulative P&amp;L by tactical setup</p>
              </div>
              <span className="material-symbols-outlined text-outline text-[20px]">equalizer</span>
            </div>

            <div className="flex flex-col gap-3">
              {setupStats.map((item) => {
                const isProfitable = item.netPnl > 0;
                return (
                  <div key={item.setup} className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-on-surface">{item.setup}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                          {item.count} Trades
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-on-surface-variant">
                          Win: <strong>{item.winRate}%</strong>
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isProfitable ? 'text-primary' : 'text-error'
                          }`}
                        >
                          {formatCurrency(item.netPnl, user.baseCurrency, true)}
                        </span>
                      </div>
                    </div>

                    {/* Progress representation */}
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isProfitable ? 'bg-primary' : 'bg-error'}`}
                        style={{ width: `${item.winRate}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time of Day Analysis */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-base text-on-surface font-bold">Session Timing Performance</h2>
              <span className="material-symbols-outlined text-outline text-[20px]">schedule</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-1 text-center">
                <span className="text-xs font-bold text-on-surface">Morning Open</span>
                <span className="text-[11px] text-on-surface-variant">09:15 - 11:30</span>
                <span className="font-bold text-emerald-700 text-sm mt-1">+₹18,250</span>
                <span className="text-[10px] text-emerald-800 font-semibold">72% Win Rate</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-1 text-center">
                <span className="text-xs font-bold text-on-surface">Midday Chop</span>
                <span className="text-[11px] text-on-surface-variant">11:30 - 13:30</span>
                <span className="font-bold text-error text-sm mt-1">-₹2,100</span>
                <span className="text-[10px] text-on-surface-variant">42% Win Rate</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-1 text-center">
                <span className="text-xs font-bold text-on-surface">Afternoon Close</span>
                <span className="text-[11px] text-on-surface-variant">13:30 - 15:30</span>
                <span className="font-bold text-emerald-700 text-sm mt-1">+₹12,300</span>
                <span className="text-[10px] text-emerald-800 font-semibold">68% Win Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Psychological & Behavioral Impact (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Emotion vs PnL */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-sm text-base text-on-surface font-bold">Psychological Edge Audit</h2>
                <p className="text-xs text-on-surface-variant">P&amp;L impact by emotional state</p>
              </div>
              <span className="material-symbols-outlined text-outline text-[20px]">psychology</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {emotionStats.map((item) => {
                const isProfitable = item.netPnl > 0;
                return (
                  <div
                    key={item.emotion}
                    className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">
                        {item.emotion === 'Calm'
                          ? '😌'
                          : item.emotion === 'Confident'
                          ? '😎'
                          : item.emotion === 'Fear'
                          ? '😨'
                          : item.emotion === 'FOMO'
                          ? '😬'
                          : item.emotion === 'Greedy'
                          ? '🤑'
                          : '😡'}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-on-surface">{item.emotion}</span>
                        <span className="text-[10px] text-on-surface-variant">
                          {item.count} executions • {item.winRate}% Win
                        </span>
                      </div>
                    </div>

                    <span
                      className={`font-bold text-xs tabular-nums ${
                        isProfitable ? 'text-primary' : 'text-error'
                      }`}
                    >
                      {formatCurrency(item.netPnl, user.baseCurrency, true)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Rule Violations Impact */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-3">
            <h2 className="font-headline-sm text-base text-on-surface font-bold">Mental Leakage Cost</h2>
            <div className="flex flex-col gap-2">
              <div className="p-2.5 rounded-lg bg-error-container/20 border border-error/30 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-error">FOMO Early Entries</span>
                  <span className="text-[10px] text-on-surface-variant">3 Occurrences</span>
                </div>
                <span className="text-xs font-bold text-error">-₹2,680</span>
              </div>

              <div className="p-2.5 rounded-lg bg-error-container/20 border border-error/30 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-error">Exited Winners Prematurely</span>
                  <span className="text-[10px] text-on-surface-variant">Left on table</span>
                </div>
                <span className="text-xs font-bold text-amber-700">~₹3,400 Missed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
