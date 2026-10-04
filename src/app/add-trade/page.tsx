'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTrades } from '../../context/TradeContext';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { AssetClass, TradeSide, MarketCondition, EmotionalState, SetupType } from '../../types';
import { localDate } from '../../lib/dates';
import {
  searchInstruments,
  saveCustomInstrument,
  InstrumentItem,
  MAJOR_INDICES,
} from '../../lib/instruments';

export default function AddTradePage() {
  const router = useRouter();
  const { user, accounts, addTrade } = useTrades();

  // Mode: Manual Entry, Quick Log
  const [entryMode, setEntryMode] = useState<'manual' | 'quick'>('manual');

  // Form State
  const [accountId, setAccountId] = useState(accounts.find(a => a.isActive)?.id || '');
  const [date, setDate] = useState(() => localDate());
  const [entryTime, setEntryTime] = useState('10:15 AM');
  const [exitTime, setExitTime] = useState('11:35 AM');
  const [assetClass, setAssetClass] = useState<AssetClass>('Options');
  const [symbol, setSymbol] = useState('NIFTY 50');
  const [strikePrice, setStrikePrice] = useState('25000');
  const [optionType, setOptionType] = useState<'CE' | 'PE'>('CE');
  const [expiryDate, setExpiryDate] = useState('09 Oct 2026');

  // Interactive Instrument Autocomplete & Custom Add
  const [instrumentQuery, setInstrumentQuery] = useState('NIFTY 50');
  const [isInstrumentDropdownOpen, setIsInstrumentDropdownOpen] = useState(false);
  const [instrumentCategoryFilter, setInstrumentCategoryFilter] = useState<'ALL' | 'Index' | 'Stock' | 'Custom'>('ALL');
  const [customAddSuccess, setCustomAddSuccess] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsInstrumentDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search results
  const instrumentSearchResults = useMemo(() => {
    const list = searchInstruments(instrumentQuery);
    if (instrumentCategoryFilter === 'ALL') return list;
    return list.filter((i) => i.category === instrumentCategoryFilter);
  }, [instrumentQuery, instrumentCategoryFilter]);

  const handleSelectInstrument = (item: InstrumentItem) => {
    setSymbol(item.symbol);
    setInstrumentQuery(item.symbol);
    setIsInstrumentDropdownOpen(false);

    if (item.category === 'Index') {
      setAssetClass('Options');
      if (item.lotSize) {
        setQuantity(item.lotSize);
      }
      if (item.symbol === 'NIFTY 50') setStrikePrice('25000');
      else if (item.symbol === 'BANKNIFTY') setStrikePrice('52000');
      else if (item.symbol === 'FINNIFTY') setStrikePrice('23500');
      else if (item.symbol === 'MIDCPNIFTY') setStrikePrice('13000');
      else if (item.symbol === 'SENSEX') setStrikePrice('81500');
      else if (item.symbol === 'BANKEX') setStrikePrice('59000');
    } else {
      if (item.lotSize && assetClass === 'Options') {
        setQuantity(item.lotSize);
      }
    }
  };

  const handleAddCustomInstrument = (symToAdd: string) => {
    const cleanSym = symToAdd.trim().toUpperCase();
    if (!cleanSym) return;
    const newItem: InstrumentItem = {
      symbol: cleanSym,
      name: `${cleanSym} (Custom Instrument)`,
      category: 'Custom',
      exchange: 'NSE',
    };
    saveCustomInstrument(newItem);
    handleSelectInstrument(newItem);
    setCustomAddSuccess(`Added & selected ${cleanSym}!`);
    setTimeout(() => setCustomAddSuccess(null), 2500);
  };

  const [side, setSide] = useState<TradeSide>('BUY');
  const [quantity, setQuantity] = useState<number>(50);
  const [entryPrice, setEntryPrice] = useState<number>(120.50);
  const [exitPrice, setExitPrice] = useState<number>(135.00);

  const [stopLoss, setStopLoss] = useState<number>(110.00);
  const [target, setTarget] = useState<number>(150.00);
  const [charges, setCharges] = useState<number>(20);

  const [setup, setSetup] = useState<SetupType | string>('Breakout');
  const [marketCondition, setMarketCondition] = useState<MarketCondition>('Trending');
  const [emotion, setEmotion] = useState<EmotionalState>('Calm');
  const [notes, setNotes] = useState('Clean 15-minute resistance breakout with surge in index volume. RSI above 62 and PCR bullish.');

  const [chartImage, setChartImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Dynamic Live Calculation Engine
  const calculations = useMemo(() => {
    const q = Number(quantity) || 0;
    const ent = Number(entryPrice) || 0;
    const ext = Number(exitPrice) || 0;
    const sl = Number(stopLoss) || 0;
    const tp = Number(target) || 0;
    const fee = Number(charges) || 0;

    const capital = ent * q;

    // Gross P&L
    let grossPnl = 0;
    let ptsGain = 0;
    if (side === 'BUY') {
      ptsGain = ext - ent;
      grossPnl = ptsGain * q;
    } else {
      ptsGain = ent - ext;
      grossPnl = ptsGain * q;
    }

    if (ext <= 0) { grossPnl = 0; ptsGain = 0; }
    const netPnl = ext > 0 ? grossPnl - fee : 0;
    const roi = capital > 0 ? (netPnl / capital) * 100 : 0;

    // Planned Risk & Reward
    let riskPts = 0;
    let rewardPts = 0;
    if (side === 'BUY') {
      riskPts = sl > 0 ? ent - sl : 0;
      rewardPts = tp > 0 ? tp - ent : 0;
    } else {
      riskPts = sl > 0 ? sl - ent : 0;
      rewardPts = tp > 0 ? ent - tp : 0;
    }

    const plannedRisk = riskPts * q;
    const plannedReward = rewardPts * q;
    const rrRatio = riskPts > 0 ? Number((rewardPts / riskPts).toFixed(2)) : 2.5;

    // Risk bar proportion
    const totalGauge = (riskPts > 0 ? riskPts : 1) + (rewardPts > 0 ? rewardPts : 1);
    const riskPct = Math.min(Math.max((riskPts / totalGauge) * 100, 15), 85);
    const rewardPct = 100 - riskPct;

    return {
      capital,
      ptsGain,
      grossPnl,
      netPnl,
      roi,
      plannedRisk,
      plannedReward,
      rrRatio,
      riskPct,
      rewardPct,
    };
  }, [quantity, entryPrice, exitPrice, stopLoss, target, charges, side]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!accounts.some(a => a.id === accountId && a.isActive)) {
      setFormError('Add or select an active trading account before recording a trade.');
      return;
    }
    if (!symbol.trim() || !date || !entryTime.trim() || quantity <= 0 || entryPrice <= 0 || exitPrice < 0 || charges < 0 || stopLoss < 0 || target < 0 ||
        ![quantity, entryPrice, exitPrice, charges, stopLoss, target].every(Number.isFinite)) {
      setFormError('Enter a valid instrument, date, entry time, positive quantity and entry price. Prices and charges cannot be negative.');
      return;
    }
    if (assetClass === 'Options' && (!Number.isFinite(Number(strikePrice)) || Number(strikePrice) <= 0)) {
      setFormError('Enter a positive option strike price.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);

    const fullInstrumentName =
      assetClass === 'Options'
        ? `${symbol} ${strikePrice} ${optionType}`
        : assetClass === 'Futures'
        ? `${symbol} Fut`
        : `${symbol} EQ`;

    const selectedAccObj = accounts.find((a) => a.id === accountId);

    const createdTrade = addTrade({
      instrument: fullInstrumentName,
      assetClass,
      side,
      status: exitPrice > 0 ? 'CLOSED' : 'OPEN',
      date,
      entryTime,
      exitTime: exitPrice > 0 ? exitTime : undefined,
      quantity,
      entryPrice,
      exitPrice: exitPrice > 0 ? exitPrice : undefined,
      stopLoss,
      target,
      grossPnl: calculations.grossPnl,
      charges,
      netPnl: calculations.netPnl,
      roi: Number(calculations.roi.toFixed(2)),
      rrRatio: calculations.rrRatio,
      setup,
      marketCondition,
      emotion,
      notes,
      rulesFollowed: true,
      chartImage: chartImage || undefined,
      accountId,
      accountName: selectedAccObj?.accountName,
      strikePrice: assetClass === 'Options' ? Number(strikePrice) : undefined,
      expiryDate: assetClass === 'Options' ? expiryDate : undefined,
      optionType: assetClass === 'Options' ? optionType : undefined,
    });

    setTimeout(() => {
      router.push(`/trades/${createdTrade.id}`);
    }, 400);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setChartImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const setupChips = ['Breakout', 'Pullback', 'Support / Resistance', 'Reversal', 'Momentum', 'ORB'];
  const marketConditions: MarketCondition[] = ['Trending', 'Ranging', 'Volatile', 'Unclear'];
  const emotions: { type: EmotionalState; emoji: string }[] = [
    { type: 'Calm', emoji: '😌' },
    { type: 'Confident', emoji: '😎' },
    { type: 'Fear', emoji: '😨' },
    { type: 'FOMO', emoji: '😬' },
    { type: 'Greedy', emoji: '🤑' },
    { type: 'Revenge', emoji: '😡' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Sub-header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-space-xs text-primary mb-1">
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span className="font-label-sm text-xs uppercase tracking-wider font-semibold">New Entry</span>
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface tracking-tight font-bold">
            Record New Trade
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            Log your entry, setup rules, emotions, and risk metrics with progressive precision.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="inline-flex p-1 bg-surface-container rounded-lg self-start md:self-auto border border-surface-container">
          <button
            type="button"
            onClick={() => setEntryMode('manual')}
            className={`flex items-center gap-space-xs px-space-md py-1.5 rounded-lg font-label-md text-xs transition-all ${
              entryMode === 'manual'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-primary">edit_square</span>
            <span>Manual Entry</span>
          </button>

          <button
            type="button"
            onClick={() => setEntryMode('quick')}
            className={`flex items-center gap-space-xs px-space-md py-1.5 rounded-lg font-label-md text-xs transition-all ${
              entryMode === 'quick'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Quick Log</span>
          </button>
        </div>
      </div>

      {/* Primary 2-Column Responsive Workspace Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: Form Execution Panels (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Section 1: Trade Basics */}
          <section className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container/60">
              <div className="flex items-center gap-space-xs">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-label-sm text-xs font-bold">
                  1
                </span>
                <h2 className="font-headline-sm text-base text-on-surface font-bold">Trade Basics</h2>
              </div>
              <span className="font-label-sm text-xs text-on-surface-variant">Step 1 of 5</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {/* Account Selector */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="font-label-md text-xs text-on-surface font-medium">Trading Account</label>
                <div className="relative">
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 rounded-lg bg-surface-container-low font-body-md text-sm text-on-surface border border-surface-container focus:outline-none focus:bg-surface-container-lowest appearance-none cursor-pointer"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.accountName} ({formatCurrency(acc.capital, acc.currency)})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-xs text-on-surface font-medium">Entry Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-surface-container-low font-body-md text-sm text-on-surface border border-surface-container focus:outline-none focus:bg-surface-container-lowest"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-xs text-on-surface font-medium">Entry Time</label>
                <input
                  type="text"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  placeholder="e.g. 10:15 AM"
                  className="w-full h-11 px-3 rounded-lg bg-surface-container-low font-body-md text-sm text-on-surface border border-surface-container focus:outline-none focus:bg-surface-container-lowest"
                  required
                />
              </div>

              {/* Asset Class */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="font-label-md text-xs text-on-surface font-medium">Asset Class</label>
                <div className="flex flex-wrap gap-1 p-1 bg-surface-container-low rounded-lg border border-surface-container">
                  {(['Equity', 'Futures', 'Options', 'Forex', 'Crypto'] as AssetClass[]).map((ac) => (
                    <button
                      key={ac}
                      type="button"
                      onClick={() => setAssetClass(ac)}
                      className={`flex-1 min-w-[70px] py-1.5 px-space-sm rounded-lg font-label-md text-xs text-center transition-all ${
                        assetClass === ac
                          ? 'bg-secondary text-on-secondary shadow-xs font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {ac}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Searchable Instrument Dropdown */}
              <div className="flex flex-col gap-1 md:col-span-2 relative" ref={dropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-xs text-on-surface font-semibold flex items-center gap-1.5">
                    <span>Underlying Instrument / Symbol *</span>
                    <span className="text-[11px] text-primary font-normal">
                      (Nifty, Bank Nifty, Indices &amp; 500+ Stocks)
                    </span>
                  </label>
                  {customAddSuccess && (
                    <span className="text-[11px] text-primary font-bold animate-in fade-in">
                      ✓ {customAddSuccess}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={instrumentQuery}
                    onChange={(e) => {
                      setInstrumentQuery(e.target.value);
                      setIsInstrumentDropdownOpen(true);
                    }}
                    onFocus={() => setIsInstrumentDropdownOpen(true)}
                    className="w-full h-11 pl-9 pr-24 rounded-lg bg-surface-container-low font-headline-sm text-sm text-on-surface border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all uppercase tracking-wide font-bold"
                    placeholder="Search NIFTY, BANKNIFTY, RELIANCE or type custom..."
                    required
                  />

                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {instrumentQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setInstrumentQuery('');
                          setIsInstrumentDropdownOpen(true);
                        }}
                        className="p-1 text-on-surface-variant hover:text-on-surface rounded"
                        title="Clear input"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsInstrumentDropdownOpen(!isInstrumentDropdownOpen)}
                      className="p-1 text-on-surface-variant hover:text-on-surface rounded"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isInstrumentDropdownOpen ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Dropdown Popup Menu */}
                {isInstrumentDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {/* Category Filter Pills in Dropdown Header */}
                    <div className="flex items-center gap-1 p-2 bg-surface-container-low border-b border-surface-container overflow-x-auto">
                      {(['ALL', 'Index', 'Stock', 'Custom'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setInstrumentCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                            instrumentCategoryFilter === cat
                              ? 'bg-primary text-on-primary shadow-xs'
                              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                          }`}
                        >
                          {cat === 'ALL' ? `All (${instrumentSearchResults.length})` : cat === 'Index' ? 'Indices' : cat === 'Stock' ? 'Stocks' : 'Custom'}
                        </button>
                      ))}
                    </div>

                    {/* Results List */}
                    <div className="max-h-64 overflow-y-auto divide-y divide-surface-container/50">
                      {instrumentSearchResults.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-xs text-on-surface-variant">No exact instrument found for &ldquo;{instrumentQuery}&rdquo;</p>
                          <button
                            type="button"
                            onClick={() => handleAddCustomInstrument(instrumentQuery)}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-hover transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">add_circle</span>
                            <span>Add &ldquo;{instrumentQuery.trim().toUpperCase()}&rdquo; as Custom Instrument</span>
                          </button>
                        </div>
                      ) : (
                        instrumentSearchResults.map((item) => (
                          <div
                            key={item.symbol}
                            onClick={() => handleSelectInstrument(item)}
                            className={`p-2.5 px-3 flex items-center justify-between hover:bg-surface-container-low cursor-pointer transition-colors ${
                              symbol === item.symbol ? 'bg-primary/10' : ''
                            }`}
                          >
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-on-surface">{item.symbol}</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                    item.category === 'Index'
                                      ? 'bg-primary/15 text-primary'
                                      : item.category === 'Stock'
                                      ? 'bg-secondary/15 text-secondary'
                                      : 'bg-amber-500/15 text-amber-600'
                                  }`}
                                >
                                  {item.category}
                                </span>
                                {item.exchange && (
                                  <span className="text-[10px] text-outline">{item.exchange}</span>
                                )}
                              </div>
                              <span className="text-[11px] text-on-surface-variant truncate max-w-xs sm:max-w-md">
                                {item.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {item.lotSize && (
                                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-data-table text-[10px] font-semibold">
                                  Lot: {item.lotSize}
                                </span>
                              )}
                              {symbol === item.symbol && (
                                <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Quick Add Custom Footer */}
                    {instrumentQuery.trim() && (
                      <div className="p-2 bg-surface-container-low/70 border-t border-surface-container flex items-center justify-between">
                        <span className="text-[11px] text-on-surface-variant">Want to log another contract?</span>
                        <button
                          type="button"
                          onClick={() => handleAddCustomInstrument(instrumentQuery)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          <span>Add &ldquo;{instrumentQuery.trim().toUpperCase()}&rdquo; to My Instruments</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Popular Presets Strip */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="font-label-sm text-xs text-on-surface-variant font-medium">Quick Pick:</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectInstrument({ symbol: 'NIFTY 50', name: 'Nifty 50 Benchmark Index', category: 'Index', lotSize: 50 });
                      setOptionType('CE');
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                      symbol === 'NIFTY 50'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    NIFTY 50 (Lot 50)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectInstrument({ symbol: 'BANKNIFTY', name: 'Nifty Bank Index', category: 'Index', lotSize: 15 });
                      setOptionType('PE');
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                      symbol === 'BANKNIFTY'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    BANKNIFTY (Lot 15)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectInstrument({ symbol: 'FINNIFTY', name: 'Nifty Financial Services', category: 'Index', lotSize: 25 });
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                      symbol === 'FINNIFTY'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    FINNIFTY (Lot 25)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectInstrument({ symbol: 'MIDCPNIFTY', name: 'Nifty Midcap Select', category: 'Index', lotSize: 50 });
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                      symbol === 'MIDCPNIFTY'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    MIDCPNIFTY (Lot 50)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectInstrument({ symbol: 'SENSEX', name: 'BSE S&P Sensex Index', category: 'Index', lotSize: 10 });
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                      symbol === 'SENSEX'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    SENSEX (Lot 10)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSymbol('RELIANCE');
                      setInstrumentQuery('RELIANCE');
                      setAssetClass('Equity');
                    }}
                    className="px-2.5 py-1 rounded-full bg-surface-container text-xs text-on-surface hover:bg-surface-container-high transition-colors font-medium"
                  >
                    RELIANCE EQ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSymbol('HDFCBANK');
                      setInstrumentQuery('HDFCBANK');
                      setAssetClass('Equity');
                    }}
                    className="px-2.5 py-1 rounded-full bg-surface-container text-xs text-on-surface hover:bg-surface-container-high transition-colors font-medium"
                  >
                    HDFCBANK EQ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSymbol('TATAMOTORS');
                      setInstrumentQuery('TATAMOTORS');
                      setAssetClass('Equity');
                    }}
                    className="px-2.5 py-1 rounded-full bg-surface-container text-xs text-on-surface hover:bg-surface-container-high transition-colors font-medium"
                  >
                    TATAMOTORS EQ
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Position & Execution */}
          <section className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container/60">
              <div className="flex items-center gap-space-xs">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-label-sm text-xs font-bold">
                  2
                </span>
                <h2 className="font-headline-sm text-base text-on-surface font-bold">Position &amp; Execution</h2>
              </div>
              <span className="font-label-sm text-xs text-on-surface-variant">Step 2 of 5</span>
            </div>

            {/* BUY / SELL Switcher */}
            <div className="grid grid-cols-2 gap-space-sm p-1 bg-surface-container-low rounded-xl border border-surface-container">
              <button
                type="button"
                onClick={() => setSide('BUY')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-label-lg text-sm transition-all ${
                  side === 'BUY'
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
                <span>BUY / LONG</span>
              </button>

              <button
                type="button"
                onClick={() => setSide('SELL')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-label-lg text-sm transition-all ${
                  side === 'SELL'
                    ? 'bg-error text-on-error font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-error'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">trending_down</span>
                <span>SELL / SHORT</span>
              </button>
            </div>

            {/* If Options: Expiry, Strike, Call/Put */}
            {assetClass === 'Options' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md p-space-md bg-surface-container-low rounded-xl border border-surface-container">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-xs text-on-surface-variant">Expiry Date</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest font-body-md text-xs text-on-surface border border-surface-container"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-xs text-on-surface-variant">Strike Price</label>
                  <input
                    type="number"
                    value={strikePrice}
                    onChange={(e) => setStrikePrice(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest font-body-md text-xs text-on-surface border border-surface-container"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-xs text-on-surface-variant">Option Type</label>
                  <div className="flex gap-1 h-10">
                    <button
                      type="button"
                      onClick={() => setOptionType('CE')}
                      className={`flex-1 rounded-lg font-label-md text-xs font-bold transition-all ${
                        optionType === 'CE'
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-lowest text-on-surface-variant border border-surface-container'
                      }`}
                    >
                      CE (Call)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOptionType('PE')}
                      className={`flex-1 rounded-lg font-label-md text-xs font-bold transition-all ${
                        optionType === 'PE'
                          ? 'bg-error text-on-error'
                          : 'bg-surface-container-lowest text-on-surface-variant border border-surface-container'
                      }`}
                    >
                      PE (Put)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Execution Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-xs text-on-surface font-medium">Quantity *</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full h-11 pl-3 pr-12 rounded-lg bg-surface-container-low font-data-metric-md text-sm text-on-surface border border-surface-container focus:bg-surface-container-lowest"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-sm text-xs text-outline">
                    QTY
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-xs text-on-surface font-medium">Entry Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-label-md text-xs text-outline">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                    className="w-full h-11 pl-7 pr-3 rounded-lg bg-surface-container-low font-data-metric-md text-sm text-on-surface border border-surface-container focus:bg-surface-container-lowest"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-xs text-on-surface font-medium">Exit Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-label-md text-xs text-outline">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full h-11 pl-7 pr-3 rounded-lg bg-surface-container-low font-data-metric-md text-sm text-primary font-bold border border-surface-container focus:bg-surface-container-lowest"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Risk Management & Targets */}
          <section className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container/60">
              <div className="flex items-center gap-space-xs">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-label-sm text-xs font-bold">
                  3
                </span>
                <h2 className="font-headline-sm text-base text-on-surface font-bold">Risk Management &amp; Targets</h2>
              </div>
              <span className="font-label-sm text-xs text-primary flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[16px]">shield</span> Disciplined
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-xs text-on-surface font-medium">Stop Loss (SL) Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-label-md text-xs text-error">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.05"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                    className="w-full h-11 pl-7 pr-3 rounded-lg bg-error-container/20 font-data-metric-md text-sm text-error font-bold border border-error/30"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-xs text-on-surface font-medium">Take Profit Target</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-label-md text-xs text-primary">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.05"
                    value={target}
                    onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
                    className="w-full h-11 pl-7 pr-3 rounded-lg bg-surface-container-low font-data-metric-md text-sm text-primary font-bold border border-surface-container"
                  />
                </div>
              </div>
            </div>

            {/* Brokerage & Taxes */}
            <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-outline text-[20px]">account_balance_wallet</span>
                <div>
                  <p className="font-label-md text-xs text-on-surface font-semibold">Brokerage &amp; Taxes</p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">STT, Exchange Turnover, GST</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-on-surface-variant font-medium">₹</span>
                <input
                  type="number"
                  value={charges}
                  onChange={(e) => setCharges(parseFloat(e.target.value) || 0)}
                  className="w-16 h-8 px-2 text-right rounded bg-surface-container-lowest text-xs font-semibold text-on-surface border border-surface-container"
                />
              </div>
            </div>
          </section>

          {/* Section 4: Setup & Market Context */}
          <section className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container/60">
              <div className="flex items-center gap-space-xs">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-label-sm text-xs font-bold">
                  4
                </span>
                <h2 className="font-headline-sm text-base text-on-surface font-bold">Setup &amp; Market Context</h2>
              </div>
              <span className="font-label-sm text-xs text-on-surface-variant">Step 4 of 5</span>
            </div>

            {/* Strategy Setup */}
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-xs text-on-surface font-medium">Strategy Setup</label>
              <div className="flex flex-wrap gap-2">
                {setupChips.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSetup(s)}
                    className={`px-3 py-1.5 rounded-full font-label-sm text-xs transition-all ${
                      setup === s
                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {setup === s ? '✓ ' : ''}
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Market Condition */}
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-xs text-on-surface font-medium">Market Condition</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {marketConditions.map((mc) => (
                  <button
                    key={mc}
                    type="button"
                    onClick={() => setMarketCondition(mc)}
                    className={`p-2 rounded-lg font-label-sm text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                      marketCondition === mc
                        ? 'bg-surface-container-high text-primary border-primary'
                        : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    <span>{mc}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section 5: Psychology & Reason */}
          <section className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container/60">
              <div className="flex items-center gap-space-xs">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-label-sm text-xs font-bold">
                  5
                </span>
                <h2 className="font-headline-sm text-base text-on-surface font-bold">Psychology &amp; Journal</h2>
              </div>
              <span className="font-label-sm text-xs text-on-surface-variant">Self-Review</span>
            </div>

            {/* Emotional State */}
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-xs text-on-surface font-medium">Emotional State at Execution</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {emotions.map((em) => (
                  <button
                    key={em.type}
                    type="button"
                    onClick={() => setEmotion(em.type)}
                    className={`p-2.5 rounded-xl font-label-sm text-xs font-semibold flex flex-col items-center gap-1 transition-all border ${
                      emotion === em.type
                        ? 'bg-primary text-on-primary border-primary shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    <span className="text-xl">{em.emoji}</span>
                    <span>{em.type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reasoning Textarea */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-xs text-on-surface font-medium">Why did you take this trade?</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-space-md rounded-lg bg-surface-container-low font-body-md text-xs text-on-surface border border-surface-container focus:outline-none focus:bg-surface-container-lowest resize-none"
                placeholder="Write trade rationale, confluence triggers, and observations..."
              />
            </div>
          </section>

          {/* Section 6: Screenshot Upload */}
          <section className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-surface-container/60 flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container/60">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[22px]">add_photo_alternate</span>
                <h2 className="font-headline-sm text-base text-on-surface font-bold">Chart Screenshot</h2>
              </div>
              <span className="font-label-sm text-xs text-on-surface-variant">Visual Proof</span>
            </div>

            <div className="flex flex-col gap-3">
              {chartImage ? (
                <div className="relative rounded-lg overflow-hidden border border-surface-container max-h-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={chartImage} alt="Chart preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setChartImage('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-error text-on-error shadow"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-space-md rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low transition-colors text-center cursor-pointer min-h-[120px] border border-dashed border-surface-container">
                  <span className="material-symbols-outlined text-outline text-[32px] mb-1">cloud_upload</span>
                  <p className="font-label-md text-xs text-on-surface font-semibold">
                    Upload chart screenshot or click to browse
                  </p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                    PNG, JPG, WebP supported
                  </p>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Live Risk Engine (4 cols) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-20 flex flex-col gap-space-md">
          {/* Live Calculation Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-md border border-surface-container/80 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">calculate</span>
                <span className="font-headline-sm text-base text-on-surface font-bold">Live Risk Engine</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-[10px] font-semibold uppercase tracking-wider">
                Auto-Sync
              </span>
            </div>

            {/* Big Highlight: Projected / Realized Net P&L */}
            <div className="my-space-md p-space-md rounded-xl bg-surface-container-low flex flex-col items-center justify-center text-center border border-surface-container">
              <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                Calculated Net P&amp;L
              </span>

              <div
                className={`flex items-baseline gap-1 mt-1 font-bold ${
                  calculations.netPnl >= 0 ? 'text-primary' : 'text-error'
                }`}
              >
                <span className="font-headline-xl text-3xl font-bold tracking-tight">
                  {formatCurrency(calculations.netPnl, user.baseCurrency, true)}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={`px-2 py-0.5 rounded-full font-label-sm text-xs font-bold ${
                    calculations.netPnl >= 0
                      ? 'bg-primary text-on-primary'
                      : 'bg-error text-on-error'
                  }`}
                >
                  {formatPercent(calculations.roi, true)} ROI
                </span>
                <span className="font-body-sm text-xs text-on-surface-variant">
                  {calculations.ptsGain > 0 ? `+${calculations.ptsGain.toFixed(2)} pts` : `${calculations.ptsGain.toFixed(2)} pts`}
                </span>
              </div>
            </div>

            {/* Visual Risk vs Reward Gauge */}
            <div className="mb-space-md">
              <div className="flex items-center justify-between font-label-sm text-xs mb-1.5 font-medium">
                <span className="text-error flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-error inline-block"></span>
                  Risk (SL): {formatCurrency(calculations.plannedRisk, user.baseCurrency)}
                </span>
                <span className="text-primary flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                  Reward (TP): {formatCurrency(calculations.plannedReward, user.baseCurrency)}
                </span>
              </div>
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden flex">
                <div className="h-full bg-error rounded-l-full" style={{ width: `${calculations.riskPct}%` }}></div>
                <div className="h-full bg-primary rounded-r-full" style={{ width: `${calculations.rewardPct}%` }}></div>
              </div>
            </div>

            {/* Metrics Breakdown Table */}
            <div className="flex flex-col gap-2 pt-space-xs text-xs">
              <div className="flex items-center justify-between py-1 border-b border-surface-container/60">
                <span className="text-on-surface-variant">Invested Capital</span>
                <span className="font-data-metric-md text-on-surface font-bold">
                  {formatCurrency(calculations.capital, user.baseCurrency)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-surface-container/60">
                <span className="text-on-surface-variant">Planned Risk (SL)</span>
                <span className="font-data-table text-error font-bold">
                  -{formatCurrency(calculations.plannedRisk, user.baseCurrency)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-surface-container/60">
                <span className="text-on-surface-variant">Potential Target (TP)</span>
                <span className="font-data-table text-primary font-bold">
                  +{formatCurrency(calculations.plannedReward, user.baseCurrency)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-surface-container/60">
                <span className="text-on-surface-variant">Risk : Reward Ratio</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-data-metric-md text-on-surface font-bold">
                    1 : {calculations.rrRatio}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                    {calculations.rrRatio >= 2 ? 'Grade A' : 'Grade B'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-on-surface-variant">Charges &amp; Brokerage</span>
                <span className="font-data-table text-on-surface-variant font-medium">
                  {formatCurrency(charges, user.baseCurrency)}
                </span>
              </div>
            </div>

            {/* Submission Controls */}
            <div className="flex flex-col gap-space-xs mt-space-lg pt-space-md border-t border-surface-container/60">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-space-md rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-label-lg text-sm shadow-md flex items-center justify-center gap-space-xs transition-all cursor-pointer font-bold disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                <span>{isSubmitting ? 'Saving Trade...' : '+ Save Trade to Journal'}</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/trades')}
                className="w-full py-2.5 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-md text-xs transition-colors text-center cursor-pointer border border-surface-container"
              >
                Cancel &amp; Discard
              </button>
            </div>
          </div>

          {/* Rules Compliance Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container/60 flex flex-col gap-space-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
              <span className="font-label-md text-xs text-on-surface font-bold">Rules Compliance Checklist</span>
            </div>
            <ul className="flex flex-col gap-1.5 mt-1 font-body-sm text-xs">
              <li className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                <span>Stop Loss set before trade entry</span>
              </li>
              <li className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                <span>Risk within 1% max account threshold</span>
              </li>
              <li className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                <span>Followed playbook setup criteria</span>
              </li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}
