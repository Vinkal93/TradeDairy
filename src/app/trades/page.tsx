'use client';

import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTrades, TimeframeFilter } from '../../context/TradeContext';
import { formatCurrency, formatPercent, formatDate } from '../../lib/utils';
import { AssetClass, TradeSide } from '../../types';

export default function TradesPage() {
  return <Suspense fallback={<div role="status">Loading trades…</div>}><TradeLog /></Suspense>;
}

function TradeLog() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const {
    user,
    trades,
    filteredTrades,
    deleteTrade,
    selectedTimeframe,
    setTimeframe,
    analytics,
    exportTradesCSV,
    importTradesCSV,
  } = useTrades();

  const [searchQuery, setSearchQuery] = useState(urlQuery);
  useEffect(() => { setSearchQuery(urlQuery); }, [urlQuery]);
  const [selectedAsset, setSelectedAsset] = useState<string>('ALL');
  const [selectedSide, setSelectedSide] = useState<string>('ALL');
  const [selectedSetup, setSelectedSetup] = useState<string>('ALL');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Filter trades based on controls
  const displayTrades = useMemo(() => {
    return filteredTrades.filter((t) => {
      // Search query matching
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesInstrument = t.instrument.toLowerCase().includes(q);
        const matchesSetup = (t.setup || '').toLowerCase().includes(q);
        const matchesNotes = (t.notes || '').toLowerCase().includes(q);
        const matchesEmotion = (t.emotion || '').toLowerCase().includes(q);
        if (!matchesInstrument && !matchesSetup && !matchesNotes && !matchesEmotion) {
          return false;
        }
      }

      // Asset Class
      if (selectedAsset !== 'ALL' && t.assetClass !== selectedAsset) {
        return false;
      }

      // Side
      if (selectedSide !== 'ALL' && t.side !== selectedSide) {
        return false;
      }

      // Setup
      if (selectedSetup !== 'ALL' && t.setup !== selectedSetup) {
        return false;
      }

      // Outcome
      if (selectedOutcome === 'WINS' && t.netPnl <= 0) return false;
      if (selectedOutcome === 'LOSSES' && t.netPnl >= 0) return false;

      return true;
    });
  }, [filteredTrades, searchQuery, selectedAsset, selectedSide, selectedSetup, selectedOutcome]);

  const handleExport = () => {
    const csvData = exportTradesCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TradeDairy_Trades_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!csvInput.trim()) return;
    const count = importTradesCSV(csvInput);
    if (count === 0) {
      setImportStatus('No valid trades found. Check the CSV headers and values.');
      return;
    }
    setImportStatus(`Successfully imported ${count} trades!`);
    setTimeout(() => {
      setImportModalOpen(false);
      setImportStatus(null);
      setCsvInput('');
    }, 1500);
  };

  const timeframeTabs: TimeframeFilter[] = ['Today', 'This Week', 'This Month', 'This Year', 'All Time'];

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top Hero Header & Key Stats Banner */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm border border-surface-container/60">
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          {/* Title & Subtitle */}
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-xs uppercase tracking-wider font-bold">
                Trading Ledger
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Live Synchronized</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Trade Log &amp; History
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Comprehensive archive of all executed trades, execution metrics, and playbooks with automated discipline audits.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-space-xs">
            <button
              onClick={() => setImportModalOpen(true)}
              className="flex items-center gap-space-2xs px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-all font-label-lg text-sm border border-surface-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-outline">file_upload</span>
              <span>Import CSV</span>
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-space-2xs px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-all font-label-lg text-sm border border-surface-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-outline">file_download</span>
              <span>Export CSV</span>
            </button>

            <Link
              href="/add-trade"
              className="flex items-center gap-space-2xs px-space-md py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-hover transition-all font-label-lg text-sm shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Record Trade</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm mt-space-lg pt-space-md border-t border-surface-container">
          <div className="flex flex-col p-space-sm rounded-lg bg-surface-container-low border border-surface-container">
            <span className="font-label-sm text-xs text-on-surface-variant">Total Trades</span>
            <div className="flex items-baseline gap-space-2xs mt-1">
              <span className="font-data-metric-lg text-xl sm:text-2xl text-on-surface font-bold">
                {analytics.totalTrades}
              </span>
              <span className="font-label-sm text-xs text-outline">orders</span>
            </div>
          </div>

          <div className="flex flex-col p-space-sm rounded-lg bg-surface-container-low border border-surface-container">
            <span className="font-label-sm text-xs text-on-surface-variant">Win Rate</span>
            <div className="flex items-baseline gap-space-2xs mt-1">
              <span className="font-data-metric-lg text-xl sm:text-2xl text-tertiary font-bold">
                {analytics.winRate}%
              </span>
              <span className="font-label-sm text-xs text-tertiary">
                {analytics.winningTrades}W {analytics.losingTrades}L
              </span>
            </div>
          </div>

          <div className="flex flex-col p-space-sm rounded-lg bg-surface-container-low border border-surface-container">
            <span className="font-label-sm text-xs text-on-surface-variant">Net Realized P&amp;L</span>
            <div className="flex items-baseline gap-space-2xs mt-1">
              <span
                className={`font-data-metric-lg text-xl sm:text-2xl font-bold ${
                  analytics.netRealizedPnl >= 0 ? 'text-primary' : 'text-error'
                }`}
              >
                {formatCurrency(analytics.netRealizedPnl, user.baseCurrency, true)}
              </span>
            </div>
          </div>

          <div className="flex flex-col p-space-sm rounded-lg bg-surface-container-low border border-surface-container">
            <span className="font-label-sm text-xs text-on-surface-variant">Profit Factor</span>
            <div className="flex items-baseline gap-space-2xs mt-1">
              <span className="font-data-metric-lg text-xl sm:text-2xl text-secondary font-bold">
                {analytics.profitFactor}
              </span>
              <span className="font-label-sm text-xs text-outline">gross W/L</span>
            </div>
          </div>

          <div className="flex flex-col p-space-sm rounded-lg bg-surface-container-low border border-surface-container">
            <span className="font-label-sm text-xs text-on-surface-variant">Avg Win Trade</span>
            <div className="flex items-baseline gap-space-2xs mt-1">
              <span className="font-data-metric-lg text-xl sm:text-2xl text-on-surface font-bold">
                {formatCurrency(analytics.avgWin, user.baseCurrency)}
              </span>
            </div>
          </div>

          <div className="flex flex-col p-space-sm rounded-lg bg-surface-container-low border border-surface-container">
            <span className="font-label-sm text-xs text-on-surface-variant">Avg Loss Trade</span>
            <div className="flex items-baseline gap-space-2xs mt-1">
              <span className="font-data-metric-lg text-xl sm:text-2xl text-error font-bold">
                -{formatCurrency(analytics.avgLoss, user.baseCurrency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar Card */}
      <div className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60">
        {/* Top Row: Search and Quick Segment Buttons */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-sm">
          <div className="relative flex-1 max-w-lg">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-space-md rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-sm text-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary border border-surface-container transition-all"
              placeholder="Search ticker, setup, notes, emotions..."
              type="text"
            />
          </div>

          {/* Segmented View / Timeline Presets */}
          <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-lg overflow-x-auto border border-surface-container">
            {timeframeTabs.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-md font-label-md text-xs whitespace-nowrap transition-all ${
                  selectedTimeframe === tf
                    ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Row: Filter Selectors */}
        <div className="flex flex-wrap items-center gap-space-xs pt-space-xs">
          {/* Asset Class Filter */}
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="h-9 px-3 rounded-lg bg-surface-container-low text-on-surface text-xs font-label-md border border-surface-container focus:outline-none cursor-pointer"
          >
            <option value="ALL">Asset: All</option>
            <option value="Equity">Equity</option>
            <option value="Futures">Futures</option>
            <option value="Options">Options</option>
            <option value="Forex">Forex</option>
            <option value="Crypto">Crypto</option>
          </select>

          {/* Direction Filter */}
          <select
            value={selectedSide}
            onChange={(e) => setSelectedSide(e.target.value)}
            className="h-9 px-3 rounded-lg bg-surface-container-low text-on-surface text-xs font-label-md border border-surface-container focus:outline-none cursor-pointer"
          >
            <option value="ALL">Direction: All</option>
            <option value="BUY">BUY / Long</option>
            <option value="SELL">SELL / Short</option>
          </select>

          {/* Setup Filter */}
          <select
            value={selectedSetup}
            onChange={(e) => setSelectedSetup(e.target.value)}
            className="h-9 px-3 rounded-lg bg-surface-container-low text-on-surface text-xs font-label-md border border-surface-container focus:outline-none cursor-pointer"
          >
            <option value="ALL">Setup: All Setups</option>
            <option value="Breakout">Breakout</option>
            <option value="Pullback">Pullback</option>
            <option value="Support Demand">Support Demand</option>
            <option value="Reversal">Reversal</option>
            <option value="Momentum">Momentum</option>
            <option value="ORB">ORB</option>
          </select>

          {/* Outcome Filter */}
          <select
            value={selectedOutcome}
            onChange={(e) => setSelectedOutcome(e.target.value)}
            className="h-9 px-3 rounded-lg bg-surface-container-low text-on-surface text-xs font-label-md border border-surface-container focus:outline-none cursor-pointer"
          >
            <option value="ALL">Outcome: Wins &amp; Losses</option>
            <option value="WINS">Only Profitable (+)</option>
            <option value="LOSSES">Only Losses (-)</option>
          </select>

          {(searchQuery || selectedAsset !== 'ALL' || selectedSide !== 'ALL' || selectedSetup !== 'ALL' || selectedOutcome !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedAsset('ALL');
                setSelectedSide('ALL');
                setSelectedSetup('ALL');
                setSelectedOutcome('ALL');
              }}
              className="text-xs text-primary font-semibold hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Trades Table Card */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-data-table text-data-table border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-xs uppercase tracking-wider border-b border-surface-container">
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Instrument</th>
                <th className="py-3 px-4">Side</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4 text-right">Entry</th>
                <th className="py-3 px-4 text-right">Exit</th>
                <th className="py-3 px-4 text-right">Net P&amp;L</th>
                <th className="py-3 px-4 text-right">ROI</th>
                <th className="py-3 px-4">Setup</th>
                <th className="py-3 px-4">Emotion</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-on-surface-variant">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[32px]">receipt_long</span>
                    </div>
                    <p className="font-headline-sm text-base text-on-surface font-bold">Your Trade Log is Clean &amp; Ready!</p>
                    <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
                      All panel dummy data has been erased. Record your real trades or restore demo data anytime from Settings.
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Link
                        href="/add-trade"
                        prefetch={true}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-bold text-xs shadow-xs hover:bg-primary-hover transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        <span>+ Record First Trade</span>
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
                  </td>
                </tr>
              ) : displayTrades.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] text-outline mb-2 block">
                      search_off
                    </span>
                    <p className="font-headline-sm text-base text-on-surface">No trades found matching criteria</p>
                    <p className="text-xs text-on-surface-variant mt-1">Try clearing some filters or add a new trade.</p>
                  </td>
                </tr>
              ) : (
                displayTrades.map((t) => {
                  const isProfit = t.netPnl > 0;
                  return (
                    <tr key={t.id} className="hover:bg-surface-container-low/60 transition-colors group">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface text-xs">{formatDate(t.date)}</span>
                          <span className="text-[11px] text-on-surface-variant">{t.entryTime}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <Link
                            href={`/trades/${t.id}`}
                            className="font-bold text-on-surface text-sm hover:text-primary transition-colors"
                          >
                            {t.instrument}
                          </Link>
                          <span className="text-[11px] text-on-surface-variant">
                            {t.assetClass} • {t.accountName || 'Zerodha'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold uppercase ${
                            t.side === 'BUY'
                              ? 'bg-primary-fixed text-on-primary-fixed'
                              : 'bg-error-container text-on-error-container'
                          }`}
                        >
                          {t.side}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-on-surface whitespace-nowrap tabular-nums font-medium">
                        {t.quantity}
                      </td>

                      <td className="py-3.5 px-4 text-right text-on-surface whitespace-nowrap tabular-nums">
                        {formatCurrency(t.entryPrice, user.baseCurrency)}
                      </td>

                      <td className="py-3.5 px-4 text-right text-on-surface whitespace-nowrap tabular-nums">
                        {t.exitPrice ? formatCurrency(t.exitPrice, user.baseCurrency) : '-'}
                      </td>

                      <td
                        className={`py-3.5 px-4 text-right whitespace-nowrap tabular-nums font-bold text-sm ${
                          isProfit ? 'text-primary' : 'text-error'
                        }`}
                      >
                        {formatCurrency(t.netPnl, user.baseCurrency, true)}
                      </td>

                      <td
                        className={`py-3.5 px-4 text-right whitespace-nowrap tabular-nums text-xs font-semibold ${
                          isProfit ? 'text-primary' : 'text-error'
                        }`}
                      >
                        {formatPercent(t.roi, true)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded bg-surface-container text-on-surface-variant text-xs font-medium">
                          {t.setup}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant">
                          <span>{t.emotion === 'Calm' ? '😌' : t.emotion === 'Confident' ? '😎' : t.emotion === 'FOMO' ? '😬' : '😨'}</span>
                          <span>{t.emotion}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/trades/${t.id}`}
                            className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                            title="View Story"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm(`Delete trade ${t.instrument}?`)) {
                                deleteTrade(t.id);
                              }
                            }}
                            className="p-1 rounded text-outline hover:text-error hover:bg-error-container/20 transition-colors"
                            title="Delete Trade"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Trade Count */}
        <div className="p-space-md bg-surface-container-low flex items-center justify-between border-t border-surface-container text-xs text-on-surface-variant">
          <span>Showing {displayTrades.length} of {trades.length} recorded trades</span>
          <span>Tabular figures enabled • Auto-audit active</span>
        </div>
      </div>

      {/* Import CSV Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">upload_file</span>
                <h3 className="font-headline-sm text-base text-on-surface font-bold">Import Trades from CSV</h3>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1 rounded-lg text-outline hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Paste standard CSV lines exported from Zerodha, Groww, Angel One or TradeDairy CSV template.
            </p>

            <textarea
              rows={6}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="ID,Date,Entry Time,Exit Time,Instrument,Asset Class,Side,Quantity,Entry Price,Exit Price..."
              className="w-full p-3 rounded-lg bg-surface-container-low text-xs font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
            />

            {importStatus && (
              <p className="text-xs text-primary font-bold">{importStatus}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface text-xs font-semibold hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-hover shadow-sm"
              >
                Import Trades
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
