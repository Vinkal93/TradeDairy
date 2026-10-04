'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTrades } from '../../../context/TradeContext';
import { formatCurrency, formatPercent, formatDate } from '../../../lib/utils';

export default function TradeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tradeId = params.id as string;
  const { trades, getTradeById, deleteTrade, user } = useTrades();

  const [activeTab, setActiveTab] = useState<'overview' | 'psychology' | 'chart' | 'audit'>('overview');

  const trade = getTradeById(tradeId);

  // Find index and prev/next trades
  const currentIndex = trades.findIndex((t) => t.id === tradeId);
  const prevTrade = currentIndex > 0 ? trades[currentIndex - 1] : null;
  const nextTrade = currentIndex < trades.length - 1 ? trades[currentIndex + 1] : null;

  if (!trade) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="material-symbols-outlined text-[48px] text-outline">help_outline</span>
        <h2 className="font-headline-lg text-xl text-on-surface">Trade Not Found</h2>
        <p className="text-sm text-on-surface-variant">The trade #{tradeId} does not exist or was removed.</p>
        <Link
          href="/trades"
          className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-hover transition-colors"
        >
          Return to Trade Log
        </Link>
      </div>
    );
  }

  const isProfit = trade.netPnl > 0;
  const capitalDeployed = trade.entryPrice * trade.quantity;
  const ptsGain = trade.exitPrice ? (trade.side === 'BUY' ? trade.exitPrice - trade.entryPrice : trade.entryPrice - trade.exitPrice) : 0;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${trade.instrument}?`)) {
      deleteTrade(trade.id);
      router.push('/trades');
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top Navigation & Return Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-xs">
          <Link
            href="/trades"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-label-md text-xs border border-surface-container"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to All Trades</span>
          </Link>
          <span className="text-outline-variant text-label-sm">/</span>
          <span className="font-label-md text-xs text-on-surface-variant font-medium">Trade #{trade.id}</span>
        </div>

        {/* Quick Prev / Next Pager */}
        <div className="flex items-center gap-space-xs">
          {prevTrade && (
            <Link
              href={`/trades/${prevTrade.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface shadow-xs font-label-md text-xs border border-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              <span className="truncate max-w-[120px]">{prevTrade.instrument}</span>
            </Link>
          )}

          {nextTrade && (
            <Link
              href={`/trades/${nextTrade.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface shadow-xs font-label-md text-xs border border-surface-container transition-all"
            >
              <span className="truncate max-w-[120px]">{nextTrade.instrument}</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          )}
        </div>
      </div>

      {/* Hero Header Card with High Impact Visual P&L Callout */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] p-space-md sm:p-space-lg border border-surface-container/60">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span
                className={`px-2.5 py-0.5 rounded-full font-label-md text-xs uppercase font-bold tracking-wide ${
                  trade.side === 'BUY'
                    ? 'bg-primary-fixed text-primary'
                    : 'bg-error-container text-error'
                }`}
              >
                {trade.side}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-xs uppercase font-bold tracking-wide">
                {trade.status}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-surface-container-low text-on-surface-variant font-label-sm text-xs">
                {trade.assetClass} {trade.expiryDate ? `• ${trade.expiryDate}` : ''}
              </span>
              <span className="flex items-center gap-1 text-primary font-label-sm text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                {trade.accountName || 'Zerodha Synced'}
              </span>
            </div>

            <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface tracking-tight mt-1 font-bold">
              {trade.instrument}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-on-surface-variant font-body-sm text-xs">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                <span>
                  {formatDate(trade.date)}, {trade.entryTime} {trade.exitTime ? `- ${trade.exitTime}` : ''}
                </span>
              </span>
              <span className="text-outline-variant">•</span>
              <span className="inline-flex items-center gap-1 font-label-md text-on-surface font-medium">
                <span className="material-symbols-outlined text-[16px] text-primary">timer</span>
                <span>Holding: {trade.holdingTime || '1h 20m'}</span>
              </span>
            </div>
          </div>

          {/* Action Panel & P&L Hero Pill */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md">
            {/* Net P&L Highlight Box */}
            <div className="flex flex-col justify-center px-space-lg py-space-sm rounded-xl bg-surface-container-low border border-surface-container">
              <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Net Realized P&amp;L
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  className={`font-data-metric-lg text-2xl sm:text-3xl font-bold ${
                    isProfit ? 'text-primary' : 'text-error'
                  }`}
                >
                  {formatCurrency(trade.netPnl, user.baseCurrency, true)}
                </span>
                <span
                  className={`inline-flex items-center font-label-md text-sm font-bold ${
                    isProfit ? 'text-primary' : 'text-error'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isProfit ? 'arrow_upward' : 'arrow_downward'}
                  </span>
                  {formatPercent(trade.roi, true)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-outline font-label-sm text-[11px]">
                <span>Gross: {formatCurrency(trade.grossPnl, user.baseCurrency, true)}</span>
                <span>•</span>
                <span>Taxes &amp; Fees: {formatCurrency(trade.charges, user.baseCurrency)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-space-xs self-stretch sm:self-center">
              <button
                onClick={handleDelete}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-error-container/60 text-error font-label-md text-xs hover:bg-error-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-2 mt-space-lg pt-space-md border-t border-surface-container overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-label-md text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'bg-surface-container-high text-primary shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            Overview &amp; Metrics
          </button>
          <button
            onClick={() => setActiveTab('psychology')}
            className={`px-4 py-2 rounded-lg font-label-md text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'psychology'
                ? 'bg-surface-container-high text-primary shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            Psychology &amp; Notes
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-4 py-2 rounded-lg font-label-md text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'chart'
                ? 'bg-surface-container-high text-primary shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            Chart Screenshot
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Left Column: Metrics & Execution Details (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Execution KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col gap-1">
                <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">Entry Price</span>
                <span className="font-data-metric-md text-lg text-on-surface font-bold">
                  {formatCurrency(trade.entryPrice, user.baseCurrency)}
                </span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">At {trade.entryTime}</span>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col gap-1">
                <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">Exit Price</span>
                <span
                  className={`font-data-metric-md text-lg font-bold ${
                    isProfit ? 'text-primary' : 'text-error'
                  }`}
                >
                  {trade.exitPrice ? formatCurrency(trade.exitPrice, user.baseCurrency) : '-'}
                </span>
                <span
                  className={`font-label-sm text-[11px] font-semibold ${
                    isProfit ? 'text-primary' : 'text-error'
                  }`}
                >
                  {ptsGain > 0 ? `+${ptsGain.toFixed(2)} pts` : `${ptsGain.toFixed(2)} pts`}
                </span>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col gap-1">
                <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">Position Size</span>
                <span className="font-data-metric-md text-lg text-on-surface font-bold">{trade.quantity} Qty</span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">Units Traded</span>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col gap-1">
                <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">Capital Deployed</span>
                <span className="font-data-metric-md text-lg text-on-surface font-bold">
                  {formatCurrency(capitalDeployed, user.baseCurrency)}
                </span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">Margin Committed</span>
              </div>
            </div>

            {/* Risk & Return Visual Comparison Card */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                  <h2 className="font-headline-sm text-base text-on-surface font-bold">
                    Risk Management &amp; Reward Math
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-label-md text-xs font-bold">
                  Realized R:R 1 : {trade.rrRatio || 2.5}
                </span>
              </div>

              {/* Custom Visual Ratio Meter */}
              <div className="flex flex-col gap-2 p-space-md rounded-lg bg-surface-container-low border border-surface-container">
                <div className="flex justify-between items-center font-label-sm text-xs font-medium">
                  <span className="text-error flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-error inline-block"></span>
                    Stop Loss: {trade.stopLoss ? formatCurrency(trade.stopLoss, user.baseCurrency) : 'Pre-defined'}
                  </span>
                  <span className="text-primary flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    Target: {trade.target ? formatCurrency(trade.target, user.baseCurrency) : 'Multi-tier'}
                  </span>
                </div>

                <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden flex">
                  <div className="h-full bg-error rounded-l-full" style={{ width: '28%' }}></div>
                  <div className="h-full bg-primary rounded-r-full" style={{ width: '72%' }}></div>
                </div>
              </div>

              {/* Execution Story Timeline */}
              <div className="flex flex-col gap-3 pt-2">
                <h3 className="font-label-md text-xs uppercase tracking-wider text-outline font-semibold">
                  Trade Timeline &amp; Events
                </h3>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container">
                  <div className="relative">
                    <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <p className="text-xs font-semibold text-on-surface">Entry Executed ({trade.entryTime})</p>
                    <p className="text-xs text-on-surface-variant">
                      Filled {trade.quantity} qty at {formatCurrency(trade.entryPrice, user.baseCurrency)}.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <p className="text-xs font-semibold text-on-surface">Setup Confirmation &amp; Momentum</p>
                    <p className="text-xs text-on-surface-variant">
                      Strategy {trade.setup} validated with strong volume delta.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <p className="text-xs font-semibold text-on-surface">Exit Order Filled ({trade.exitTime || 'Closed'})</p>
                    <p className="text-xs text-on-surface-variant">
                      Square-off executed. Realized P&amp;L:{' '}
                      <strong className={isProfit ? 'text-primary' : 'text-error'}>
                        {formatCurrency(trade.netPnl, user.baseCurrency, true)}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Setup, Psychology & Checklist (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* Setup Context Card */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col gap-space-sm">
              <h2 className="font-headline-sm text-base text-on-surface font-bold">Strategy Setup &amp; Context</h2>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
                  <span className="text-[11px] text-on-surface-variant block">Strategy</span>
                  <span className="text-xs font-bold text-on-surface">{trade.setup}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
                  <span className="text-[11px] text-on-surface-variant block">Market Condition</span>
                  <span className="text-xs font-bold text-on-surface">{trade.marketCondition || 'Trending'}</span>
                </div>
              </div>

              <div className="mt-2">
                <span className="text-xs text-on-surface-variant block mb-1 font-semibold">Trader Rationale:</span>
                <p className="p-3 rounded-lg bg-surface-container-low text-xs text-on-surface leading-relaxed border border-surface-container">
                  {trade.notes || 'No trade description logged for this position.'}
                </p>
              </div>
            </div>

            {/* Psychology State */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col gap-space-sm">
              <h2 className="font-headline-sm text-base text-on-surface font-bold">Execution Psychology</h2>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-surface-container">
                <span className="text-3xl">
                  {trade.emotion === 'Calm' ? '😌' : trade.emotion === 'Confident' ? '😎' : trade.emotion === 'FOMO' ? '😬' : '😨'}
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-on-surface">{trade.emotion || 'Calm'} Mindset</span>
                  <span className="text-xs text-on-surface-variant">Emotion tracked at initial execution point</span>
                </div>
              </div>

              {/* Rules Checklist */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="font-label-md text-xs uppercase tracking-wider text-outline font-semibold">
                  Discipline Audit
                </span>
                <div className="flex items-center gap-2 text-xs text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span>Stop Loss entered immediately upon order fill</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span>Risk within acceptable account limits</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span>Setup met all pre-defined playbook rules</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'psychology' && (
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col gap-4">
          <h2 className="font-headline-sm text-lg text-on-surface font-bold">In-Depth Psychology &amp; Trade Review</h2>
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container">
            <h3 className="font-bold text-sm text-on-surface mb-2">Trade Rationale &amp; Mental Notes</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {trade.notes || 'No extensive notes recorded for this trade.'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'chart' && (
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col gap-4">
          <h2 className="font-headline-sm text-lg text-on-surface font-bold">Chart Screenshot Analysis</h2>
          {trade.chartImage ? (
            <div className="rounded-xl overflow-hidden border border-surface-container shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={trade.chartImage} alt="Chart Screenshot" className="w-full h-auto max-h-[600px] object-contain bg-surface-container-low" />
            </div>
          ) : (
            <div className="py-16 text-center text-on-surface-variant bg-surface-container-low rounded-xl">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">image_not_supported</span>
              <p className="font-semibold text-sm">No chart screenshot uploaded for this trade.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
