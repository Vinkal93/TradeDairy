'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function BrokerSyncPage() {
  const [email, setEmail] = useState('');
  const [broker, setBroker] = useState('');
  const [style, setStyle] = useState('scalper');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(1840);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !broker) return;

    try {
      const existing = JSON.parse(localStorage.getItem('tradedairy_waitlist') || '[]');
      existing.push({ email, broker, style, timestamp: new Date().toISOString() });
      localStorage.setItem('tradedairy_waitlist', JSON.stringify(existing));
    } catch {
      // ignore
    }

    setWaitlistCount((prev) => prev + 1);
    setIsSubmitted(true);
  };

  return (
    <div className="flex flex-col w-full pb-16 gap-space-xl">
      {/* Top Hero Section */}
      <div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-surface-container-low border border-surface-container flex flex-col gap-space-xl">
        {/* Glow ambient circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-container/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-secondary-container/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-space-xl z-10">
          {/* Left Column: Heading and Value Proposition */}
          <div className="flex flex-col justify-center max-w-2xl gap-space-md">
            <div className="inline-flex items-center gap-space-xs self-start px-3 py-1 rounded-full bg-surface-container-high shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="font-label-md text-xs text-primary font-bold tracking-wide uppercase">
                High-Frequency Roadmap — Q2 2026
              </span>
            </div>

            <h1 className="font-headline-xl text-3xl sm:text-4xl text-on-surface tracking-tight font-extrabold leading-tight">
              Direct Broker API Auto-Sync &amp; AI Strategy Backtesting Engine
            </h1>

            <p className="font-body-lg text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Say goodbye to manual trade entry. Connect your Zerodha, Dhan, Angel One, and Upstox accounts for zero-touch execution sync, automated candle markers, and institutional pattern intelligence.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="flex flex-col p-3 rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container">
                <span className="text-[11px] text-outline uppercase tracking-wider font-semibold">Sync Latency</span>
                <span className="font-bold text-lg text-primary">&lt; 200ms</span>
                <span className="text-[11px] text-on-surface-variant">Real-time webhooks</span>
              </div>
              <div className="flex flex-col p-3 rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container">
                <span className="text-[11px] text-outline uppercase tracking-wider font-semibold">Historical Depth</span>
                <span className="font-bold text-lg text-secondary">5+ Years</span>
                <span className="text-[11px] text-on-surface-variant">Tick &amp; 1-min OHLC</span>
              </div>
              <div className="flex flex-col p-3 rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container">
                <span className="text-[11px] text-outline uppercase tracking-wider font-semibold">Security Layer</span>
                <span className="font-bold text-lg text-primary">OAuth 2.0</span>
                <span className="text-[11px] text-on-surface-variant">Read-only tokens</span>
              </div>
            </div>
          </div>

          {/* Right Column: Waitlist Registration Card */}
          <div className="w-full lg:w-[440px] flex-shrink-0 flex flex-col justify-center">
            <div className="relative p-6 sm:p-7 rounded-2xl bg-surface-container-lowest shadow-lg border border-surface-container flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
                  <span className="font-bold text-base text-on-surface">Get Priority Alpha Access</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary text-[11px] font-bold">
                  2,000 Seats
                </span>
              </div>

              <p className="text-xs text-on-surface-variant">
                Be first in line to connect your demat account when we launch the private alpha testing queue.
              </p>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Trader Email Address</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
                        mail
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@algotrader.in"
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low text-xs text-on-surface placeholder:text-outline border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Primary Demat / Trading Broker
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
                        account_balance
                      </span>
                      <select
                        required
                        value={broker}
                        onChange={(e) => setBroker(e.target.value)}
                        className="w-full h-10 pl-9 pr-8 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select your active broker...</option>
                        <option value="Zerodha Kite Connect">Zerodha Kite Connect</option>
                        <option value="Dhan HQ Direct API">Dhan HQ Direct API</option>
                        <option value="Angel One SmartAPI">Angel One SmartAPI</option>
                        <option value="Upstox Developer API">Upstox Developer API</option>
                        <option value="ICICI Direct Breeze">ICICI Direct Breeze</option>
                        <option value="Fyers API v3">Fyers API v3</option>
                        <option value="Groww">Groww</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-base">
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Execution Style</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'scalper', label: 'Scalp / Day' },
                        { id: 'fno', label: 'F&O Options' },
                        { id: 'swing', label: 'Swing / Prop' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setStyle(item.id)}
                          className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            style === item.id
                              ? 'bg-primary text-on-primary shadow-xs'
                              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-1 h-11 rounded-lg bg-primary text-on-primary hover:bg-primary-hover font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">rocket_launch</span>
                    <span>Join Early Beta Waitlist ({waitlistCount} waiting)</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-start gap-3 animate-in zoom-in-95 duration-200">
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">You are #{waitlistCount} on the priority list!</span>
                    <span className="text-xs text-on-surface-variant mt-0.5">
                      Your invite token will be dispatched to <strong>{email}</strong> when broker keys are opened.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-container-low text-xs border border-surface-container">
                <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">verified</span>
                <p className="text-on-surface leading-tight text-[11px]">
                  <span className="font-semibold text-primary">Zero spam guarantee.</span> Early beta participants receive 3 months free Pro tier upgrade upon verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Pillars of Broker Sync */}
      <div className="flex flex-col gap-space-md">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Next Evolution</span>
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight mt-0.5">
            Institutional Architecture for Everyday Edge
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Pillar 1 */}
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-xs border border-surface-container flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">sync_saved_locally</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  Pillar 01
                </span>
              </div>
              <h3 className="font-bold text-base text-on-surface">Direct Read-Only OAuth Broker Ingestion</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Connect your Indian broker accounts via official regulatory APIs. Zero manual trade entry, zero CSV uploads. Live order-book fills mirror into your diary inside 200 milliseconds.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-[11px] text-primary font-semibold">
              <span>Zerodha, Angel, Dhan, Upstox</span>
              <span className="material-symbols-outlined text-base">verified</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-xs border border-surface-container flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">neurology</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold">
                  Pillar 02
                </span>
              </div>
              <h3 className="font-bold text-base text-on-surface">Tick-by-Tick AI Pattern Backtester</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Run machine learning models over your past setups. Automatically discover which candlestick confirmations, time-of-day slots, and stop-loss sizes produce the highest statistical edge.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-[11px] text-secondary font-semibold">
              <span>Deep Machine Learning Models</span>
              <span className="material-symbols-outlined text-base">psychology</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-xs border border-surface-container flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">query_stats</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  Pillar 03
                </span>
              </div>
              <h3 className="font-bold text-base text-on-surface">Execution Discrepancy &amp; Slippage Audit</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Reconcile your intended limit order prices against the broker's exact execution fill. Track hidden slippage costs, exchange latency, and brokerage bleed automatically.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-[11px] text-primary font-semibold">
              <span>Accurate Net Contract Notes</span>
              <span className="material-symbols-outlined text-base">receipt_long</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
