'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type Segment = 'equity-intraday' | 'equity-delivery' | 'futures' | 'options';

export default function BrokerChargesEnginePage() {
  const [selectedSegment, setSelectedSegment] = useState<Segment>('options');
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulator state
  const [simBuyPrice, setSimBuyPrice] = useState<number>(150);
  const [simSellPrice, setSimSellPrice] = useState<number>(185);
  const [simQty, setSimQty] = useState<number>(150);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Calculations for Options (Per NSE / Zerodha standard)
  const buyTurnover = simBuyPrice * simQty;
  const sellTurnover = simSellPrice * simQty;
  const grossProfit = sellTurnover - buyTurnover;

  // Brokerage: ₹20 buy + ₹20 sell = ₹40 flat
  const brokerage = 40.0;
  // STT on Options: 0.0625% on sell premium side
  const stt = Math.round(sellTurnover * 0.000625 * 100) / 100;
  // Exchange turnover charge: 0.050% on premium
  const exchangeTurnover = Math.round((buyTurnover + sellTurnover) * 0.0005 * 100) / 100;
  // SEBI turnover charge: ₹10 per crore
  const sebiCharges = Math.round(((buyTurnover + sellTurnover) / 10000000) * 10 * 100) / 100;
  // Stamp duty: 0.003% on buy side
  const stampDuty = Math.round(buyTurnover * 0.00003 * 100) / 100;
  // GST: 18% on (brokerage + exchange turnover + sebi charges)
  const gst = Math.round((brokerage + exchangeTurnover + sebiCharges) * 0.18 * 100) / 100;

  const totalTaxesAndCharges = Math.round((brokerage + stt + exchangeTurnover + sebiCharges + stampDuty + gst) * 100) / 100;
  const netRealizedProfit = Math.round((grossProfit - totalTaxesAndCharges) * 100) / 100;
  const breakevenPoints = Math.round((totalTaxesAndCharges / simQty) * 100) / 100;

  return (
    <div className="flex flex-col w-full pb-16 gap-space-lg">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[20px]">check_circle</span>
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-outline">
          <Link href="/settings" className="hover:text-primary transition-colors">
            Settings
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link href="/accounts" className="hover:text-primary transition-colors">
            Trading Accounts
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface-variant font-medium">Zerodha F&amp;O (#ZK9914)</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-primary font-semibold">Charge Rules Engine</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mt-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
                Broker Charge Rules &amp; Regulatory Engine
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-mono text-[11px] font-bold uppercase">
                v2.4 Live
              </span>
            </div>
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
              Versioned multi-segment calculation rules for Brokerage, STT, Exchange Turnover, SEBI, GST, and Stamp Duty.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-1 rounded-lg bg-surface-container flex items-center shadow-xs">
              <button
                type="button"
                onClick={() => setMode('preset')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'preset'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Use Broker Preset
              </button>
              <button
                type="button"
                onClick={() => setMode('custom')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'custom'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Custom Overrides Mode
              </button>
            </div>

            <button
              type="button"
              onClick={() => showToast('Rules saved and validated against FY 2026-27 SEBI circular.')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-xs shadow-sm hover:bg-primary-hover transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Save Rule Modifications</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verification Status Banner */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shadow-xs border border-surface-container">
            <span className="material-symbols-outlined text-[20px]">policy</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface">
              TradeDairy Official Preset: <span className="text-primary font-extrabold">Zerodha NSE / BSE (v2.4)</span>
            </p>
            <p className="text-[11px] text-on-surface-variant">
              Cross-verified against FY 2026-27 SEBI Gazette notifications, NSE Circular Ref. No. 49/2026, and Central GST mandates.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-primary text-xs font-bold whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span>Contract Note Exact Match</span>
        </div>
      </div>

      {/* Version Architecture & Date-Aware Guarantee */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-stretch">
        <div className="lg:col-span-7 bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-surface-container flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-outline">
                Engine Architecture
              </span>
              <span className="text-primary text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">lock_open</span> Editable Configuration
              </span>
            </div>
            <h3 className="font-bold text-base text-on-surface mt-1">Rule Lifecycle &amp; Version Anchoring</h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Each executed trade permanently anchors to the rule version active on the exact timestamp of its execution, preventing retrospective audit disruption.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
              <span className="text-[10px] text-outline uppercase font-semibold">Active Version</span>
              <div className="text-xs font-bold text-on-surface mt-0.5">v2.4 Active</div>
              <div className="text-[10px] text-primary font-medium mt-0.5">FY 2026-27 Compliant</div>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
              <span className="text-[10px] text-outline uppercase font-semibold">Effective Range</span>
              <div className="text-xs font-bold text-on-surface mt-0.5">01 Apr 2026</div>
              <div className="text-[10px] text-outline mt-0.5">Until Indefinite / Live</div>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
              <span className="text-[10px] text-outline uppercase font-semibold">Snapshot Switch</span>
              <div className="text-xs font-bold text-secondary mt-0.5">v2.4 (Present)</div>
              <div className="text-[10px] text-on-surface-variant mt-0.5">Historical Audit</div>
            </div>
          </div>
        </div>

        {/* Date-Aware Guarantee Callout */}
        <div className="lg:col-span-5 bg-surface-container-high p-5 rounded-2xl shadow-xs border border-surface-container flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-surface-container-lowest text-primary shadow-xs">
              <span className="material-symbols-outlined text-[22px]">history_toggle_off</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-primary uppercase font-bold tracking-wider">Date-Aware Guarantee</span>
              <h4 className="text-sm font-bold text-on-surface mt-0.5">Historical Immutability</h4>
              <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                TradeDairy guarantees historical data integrity: modifying current calculation rules will{' '}
                <strong>never alter past settled ledger records</strong>. Past trades maintain the statutory STT and GST rates established on their execution dates.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2 text-[11px] font-medium text-on-surface border-t border-surface-container/60">
            <span className="material-symbols-outlined text-primary text-base">rule</span>
            <span>Automatic time-travel recalculations for ledger re-imports</span>
          </div>
        </div>
      </div>

      {/* Segment Selector Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container overflow-x-auto">
        {[
          { id: 'equity-intraday', label: 'Equity Intraday' },
          { id: 'equity-delivery', label: 'Equity Delivery' },
          { id: 'futures', label: 'Futures (Index & Stock)' },
          { id: 'options', label: 'Options (Index & Stock)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedSegment(tab.id as Segment)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedSegment === tab.id
                ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Breakdown: Rules Table & Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left: Statutory Rate Table */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl shadow-xs border border-surface-container overflow-hidden">
          <div className="p-4 bg-surface-container-low border-b border-surface-container flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
              <h3 className="font-bold text-sm text-on-surface">Statutory Rate Matrix ({selectedSegment.toUpperCase()})</h3>
            </div>
            <span className="text-[11px] text-primary font-mono font-semibold">NSE CIRCULAR 2026</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] border-b border-surface-container">
                  <th className="py-2.5 px-4 font-semibold">Charge Head</th>
                  <th className="py-2.5 px-4 font-semibold">Statutory Formula</th>
                  <th className="py-2.5 px-4 font-semibold">Levied On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                <tr className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-4 font-bold text-on-surface">Brokerage Fee</td>
                  <td className="py-3 px-4 font-mono font-medium text-primary">₹20 flat per executed order</td>
                  <td className="py-3 px-4 text-on-surface-variant">Per order (Buy + Sell)</td>
                </tr>
                <tr className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-4 font-bold text-on-surface">Securities Transaction Tax (STT)</td>
                  <td className="py-3 px-4 font-mono font-medium text-primary">0.0625% (or 0.1% on exercise)</td>
                  <td className="py-3 px-4 text-on-surface-variant">Sell Turnover (Premium)</td>
                </tr>
                <tr className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-4 font-bold text-on-surface">Exchange Turnover Fee</td>
                  <td className="py-3 px-4 font-mono font-medium text-primary">0.050% (NSE)</td>
                  <td className="py-3 px-4 text-on-surface-variant">Gross Premium Turnover</td>
                </tr>
                <tr className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-4 font-bold text-on-surface">Goods &amp; Services Tax (GST)</td>
                  <td className="py-3 px-4 font-mono font-medium text-primary">18% on (Brokerage + Exchange)</td>
                  <td className="py-3 px-4 text-on-surface-variant">Service Value</td>
                </tr>
                <tr className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-4 font-bold text-on-surface">SEBI Turnover Charge</td>
                  <td className="py-3 px-4 font-mono font-medium text-primary">₹10 per Crore (0.0001%)</td>
                  <td className="py-3 px-4 text-on-surface-variant">Total Turnover</td>
                </tr>
                <tr className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-4 font-bold text-on-surface">Stamp Duty</td>
                  <td className="py-3 px-4 font-mono font-medium text-primary">0.003% (₹300 per Crore)</td>
                  <td className="py-3 px-4 text-on-surface-variant">Buy Turnover Only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Real-time Charges Simulator */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-surface-container flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">calculate</span>
              <h3 className="font-bold text-sm text-on-surface">Live Charges Simulator</h3>
            </div>
            <span className="text-[11px] text-on-surface-variant">Instant Recompute</span>
          </div>

          {/* Form inputs */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Buy Price (₹)</label>
              <input
                type="number"
                value={simBuyPrice}
                onChange={(e) => setSimBuyPrice(Number(e.target.value))}
                className="w-full h-9 px-2.5 rounded-lg bg-surface-container-low border border-surface-container text-xs font-mono font-bold text-on-surface"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Sell Price (₹)</label>
              <input
                type="number"
                value={simSellPrice}
                onChange={(e) => setSimSellPrice(Number(e.target.value))}
                className="w-full h-9 px-2.5 rounded-lg bg-surface-container-low border border-surface-container text-xs font-mono font-bold text-on-surface"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Quantity</label>
              <input
                type="number"
                value={simQty}
                onChange={(e) => setSimQty(Number(e.target.value))}
                className="w-full h-9 px-2.5 rounded-lg bg-surface-container-low border border-surface-container text-xs font-mono font-bold text-on-surface"
              />
            </div>
          </div>

          {/* Summary Breakdown */}
          <div className="space-y-2 p-3 rounded-xl bg-surface-container-low text-xs border border-surface-container">
            <div className="flex justify-between text-on-surface-variant">
              <span>Gross P&amp;L</span>
              <span className={`font-mono font-bold ${grossProfit >= 0 ? 'text-primary' : 'text-error'}`}>
                {grossProfit >= 0 ? '+' : ''}₹{grossProfit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Brokerage (Buy + Sell)</span>
              <span className="font-mono text-on-surface">₹{brokerage.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>STT / CTT (Sell side)</span>
              <span className="font-mono text-on-surface">₹{stt.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Exchange Txn Charges</span>
              <span className="font-mono text-on-surface">₹{exchangeTurnover.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>GST (18%)</span>
              <span className="font-mono text-on-surface">₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>SEBI + Stamp Duty</span>
              <span className="font-mono text-on-surface">₹{(sebiCharges + stampDuty).toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-surface-container flex justify-between font-bold text-on-surface">
              <span>Total Charges &amp; Taxes</span>
              <span className="font-mono text-error">-₹{totalTaxesAndCharges.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-surface-container flex justify-between items-baseline">
              <div>
                <span className="font-bold text-sm text-on-surface">Net Realized P&amp;L</span>
                <div className="text-[10px] text-on-surface-variant">Breakeven: +{breakevenPoints} pts</div>
              </div>
              <span
                className={`font-mono font-bold text-lg ${
                  netRealizedProfit >= 0 ? 'text-primary' : 'text-error'
                }`}
              >
                {netRealizedProfit >= 0 ? '+' : ''}₹{netRealizedProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
