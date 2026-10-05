'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useTrades } from '../../context/TradeContext';
import { AssetClass, ChargeSegment, EmotionalState, TradeSide, DEFAULT_INDEX_LOT_SIZES } from '../../types';
import { localDate } from '../../lib/dates';
import { calculateCharges, calculatePnl, CHARGE_LABELS, DEFAULT_CHARGES } from '../../lib/charges';
import { formatCurrency } from '../../lib/utils';
import { AccountForm } from '../common/AccountForm';
import { Modal } from '../common/Modal';
import { fieldClass } from '../common/ChargeEditor';
import { InstrumentSearch } from '../common/InstrumentSearch';

export function RecordTradeModal() {
  const {
    accounts,
    addTrade,
    updateTrade,
    getTradeById,
    storageError,
    user,
    updateIndexLotSize,
    isRecordTradeModalOpen,
    recordTradeEditId,
    closeRecordTradeModal,
  } = useTrades();

  const dialogRef = useRef<HTMLDivElement>(null);

  const existing = useMemo(() => {
    return recordTradeEditId ? getTradeById(recordTradeEditId) : undefined;
  }, [recordTradeEditId, getTradeById]);

  // Mode: basic vs quick
  const [mode, setMode] = useState<'basic' | 'quick'>('basic');

  // Account
  const [accountId, setAccountId] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);

  // Basics
  const [date, setDate] = useState(localDate());
  const [instrument, setInstrument] = useState('');
  const [segment, setSegment] = useState<ChargeSegment>('options');
  const [manualAsset, setManualAsset] = useState<AssetClass>('Crypto');
  const [side, setSide] = useState<TradeSide>('BUY');

  // Lot size configuration & detection
  const lotSizes = useMemo(
    () => ({
      ...DEFAULT_INDEX_LOT_SIZES,
      ...(user.indexLotSizes || {}),
    }),
    [user.indexLotSizes]
  );

  const detectIndex = useCallback((inst: string): string => {
    const upper = inst.toUpperCase().trim();
    if (upper.includes('BANKNIFTY') || upper.includes('BANK NIFTY')) return 'BANKNIFTY';
    if (upper.includes('FINNIFTY') || upper.includes('FIN NIFTY')) return 'FINNIFTY';
    if (upper.includes('MIDCPNIFTY') || upper.includes('MIDCAP')) return 'MIDCPNIFTY';
    if (upper.includes('NIFTY NEXT 50')) return 'NIFTY NEXT 50';
    if (upper.includes('NIFTY')) return 'NIFTY';
    if (upper.includes('BANKEX')) return 'BANKEX';
    if (upper.includes('SENSEX')) return 'SENSEX';
    const firstWord = upper.split(/[\s_-]+/)[0];
    return firstWord && firstWord.length > 1 ? firstWord : 'NIFTY';
  }, []);

  const [quantityMode, setQuantityMode] = useState<'qty' | 'lots'>('lots');
  const [selectedIndex, setSelectedIndex] = useState('NIFTY');
  const activeLotSize = lotSizes[selectedIndex] || lotSizes[detectIndex(instrument)] || 25;

  const [lotsCount, setLotsCount] = useState('1');
  const [quantity, setQuantity] = useState('25');
  const [lotConfigModalOpen, setLotConfigModalOpen] = useState(false);
  const [customIndexName, setCustomIndexName] = useState('');
  const [customIndexLot, setCustomIndexLot] = useState<number>(25);

  // Sync quantity automatically when lot size or lots count updates
  useEffect(() => {
    if (quantityMode === 'lots' && activeLotSize > 0) {
      const count = Number(lotsCount) || 1;
      setQuantity(String(count * activeLotSize));
    }
  }, [activeLotSize, quantityMode, lotsCount]);

  // Prices & Orders
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [buyOrders, setBuyOrders] = useState(1);
  const [sellOrders, setSellOrders] = useState(1);

  // Charges
  const [manualCharges, setManualCharges] = useState('');
  const [chargeMode, setChargeMode] = useState<'auto' | 'manual'>('auto');

  // Psychology & Strategy
  const [setup, setSetup] = useState('');
  const [notes, setNotes] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [target, setTarget] = useState('');
  const [emotion, setEmotion] = useState<EmotionalState>('Calm');
  const [rulesFollowed, setRulesFollowed] = useState(true);

  // Submission State
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Reset or Populate form when modal opens or edit trade changes
  useEffect(() => {
    if (!isRecordTradeModalOpen) {
      setError('');
      setSaving(false);
      return;
    }

    if (existing) {
      setAccountId(existing.accountId || accounts.find((a) => a.isActive)?.id || '');
      setDate(existing.date || localDate());
      setInstrument(existing.instrument || '');
      setSegment(
        existing.segment ||
          (existing.assetClass === 'Equity'
            ? 'equity-intraday'
            : existing.assetClass === 'Futures'
            ? 'futures'
            : existing.assetClass !== 'Options'
            ? 'manual'
            : 'options')
      );
      setManualAsset(existing.assetClass || 'Crypto');
      setSide(existing.side || 'BUY');

      const detIdx = detectIndex(existing.instrument || 'NIFTY');
      setSelectedIndex(detIdx);
      const curLotSize = lotSizes[detIdx] || 25;
      const isOpts = existing.assetClass === 'Options' || existing.segment === 'options';
      setQuantityMode(isOpts ? 'lots' : 'qty');
      setQuantity(String(existing.quantity || curLotSize));
      setLotsCount(String(Math.max(1, Math.round((existing.quantity || curLotSize) / curLotSize))));

      setEntry(existing.entryPrice !== undefined ? String(existing.entryPrice) : '');
      setExit(existing.exitPrice !== undefined ? String(existing.exitPrice) : '');
      setEntryTime(existing.entryTime || new Date().toTimeString().slice(0, 5));
      setExitTime(existing.exitTime || '');
      setBuyOrders(existing.buyOrders || 1);
      setSellOrders(existing.sellOrders || 1);
      setChargeMode(existing.chargeMode || 'auto');
      setManualCharges(existing.chargeMode === 'manual' ? String(existing.charges) : '');
      setSetup(existing.setup || '');
      setNotes(existing.notes || '');
      setStopLoss(existing.stopLoss ? String(existing.stopLoss) : '');
      setTarget(existing.target ? String(existing.target) : '');
      setEmotion(existing.emotion || 'Calm');
      setRulesFollowed(existing.rulesFollowed ?? true);
    } else {
      // New trade defaults
      const defaultAcc = accounts.find((a) => a.isActive)?.id || accounts[0]?.id || '';
      setAccountId(defaultAcc);
      setDate(localDate());
      setInstrument('NIFTY');
      setSegment('options');
      setManualAsset('Crypto');
      setSide('BUY');
      setSelectedIndex('NIFTY');
      setQuantityMode('lots');
      setLotsCount('1');
      setQuantity(String(lotSizes['NIFTY'] || 25));
      setEntry('');
      setExit('');
      setEntryTime(new Date().toTimeString().slice(0, 5));
      setExitTime('');
      setBuyOrders(1);
      setSellOrders(1);
      setChargeMode('auto');
      setManualCharges('');
      setSetup('');
      setNotes('');
      setStopLoss('');
      setTarget('');
      setEmotion('Calm');
      setRulesFollowed(true);
    }
  }, [isRecordTradeModalOpen, existing, accounts, detectIndex, lotSizes]);

  // Sync index when instrument updates
  useEffect(() => {
    if (instrument) {
      const detected = detectIndex(instrument);
      if (detected && lotSizes[detected]) {
        setSelectedIndex(detected);
      }
    }
  }, [instrument, detectIndex, lotSizes]);

  // Backdrop mousedown tracker to prevent accidental dismiss on text selection/drag
  const backdropMouseDownRef = useRef(false);

  // Keyboard accessibility: ESC key to close + Focus Trap for Tab navigation
  useEffect(() => {
    if (!isRecordTradeModalOpen) return;

    // Prevent body scrolling while modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus initial input smoothly
    const timer = setTimeout(() => {
      if (dialogRef.current) {
        const firstInput = dialogRef.current.querySelector<HTMLElement>(
          'select, input:not([type="hidden"]), button'
        );
        firstInput?.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!accountOpen && !lotConfigModalOpen) {
          e.stopPropagation();
          closeRecordTradeModal();
        }
        return;
      }

      if (e.key === 'Tab') {
        // Sub-modals have their own focus traps
        if (accountOpen || lotConfigModalOpen) return;

        if (!dialogRef.current) return;
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex="0"]'
        );
        const visible = Array.from(focusableElements).filter((el) => el.getClientRects().length > 0);
        if (!visible.length) return;

        const first = visible[0];
        const last = visible[visible.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRecordTradeModalOpen, accountOpen, lotConfigModalOpen, closeRecordTradeModal]);

  const account = accounts.find((a) => a.id === accountId);
  const config = useMemo(() => ({ ...DEFAULT_CHARGES, ...account?.chargeConfig }), [account?.chargeConfig]);
  const currency = account?.currency || user.baseCurrency || 'INR';
  const closed = exit.trim() !== '';
  const canAuto = segment !== 'manual' && currency === 'INR';
  const useAuto = chargeMode === 'auto' && canAuto;

  const breakdown = useMemo(
    () =>
      calculateCharges({
        entryPrice: Number(entry),
        exitPrice: closed ? Number(exit) : undefined,
        quantity: Number(quantity),
        side,
        segment,
        date,
        config,
        buyOrders,
        sellOrders,
      }),
    [entry, exit, quantity, side, segment, date, config, buyOrders, sellOrders, closed]
  );

  const charges = useAuto ? breakdown.total : Number(manualCharges);
  const pnl = calculatePnl(Number(entry), closed ? Number(exit) : undefined, Number(quantity), side, charges);

  // Form submit handler
  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;

    if (!account?.isActive && accounts.length > 0 && !accountId) {
      setError('Select a trading account or add one first.');
      return;
    }

    if (
      !instrument.trim() ||
      !date ||
      Number(quantity) <= 0 ||
      Number(entry) <= 0 ||
      (closed && (!Number.isFinite(Number(exit)) || Number(exit) <= 0))
    ) {
      setError('Please enter instrument, date, quantity, and valid positive prices. Leave exit blank for open trade.');
      return;
    }

    if (
      ![Number(quantity), Number(entry), charges].every(Number.isFinite) ||
      charges < 0 ||
      !Number.isInteger(buyOrders) ||
      !Number.isInteger(sellOrders) ||
      buyOrders < 1 ||
      sellOrders < 1
    ) {
      setError('Please provide valid numbers for prices, charges, and order counts.');
      return;
    }

    if (storageError) {
      setError('Browser storage unavailable. Check storage permissions and retry.');
      return;
    }

    const assetClass: AssetClass = segment.startsWith('equity')
      ? 'Equity'
      : segment === 'options'
      ? 'Options'
      : segment === 'futures'
      ? 'Futures'
      : manualAsset;

    const risk = stopLoss ? Math.abs(Number(entry) - Number(stopLoss)) : 0;
    const reward = target ? Math.abs(Number(target) - Number(entry)) : 0;

    const tradeData = {
      instrument: instrument.trim().toUpperCase(),
      assetClass,
      segment,
      side,
      status: closed ? ('CLOSED' as const) : ('OPEN' as const),
      date,
      entryTime,
      exitTime: closed && exitTime ? exitTime : undefined,
      quantity: Number(quantity),
      entryPrice: Number(entry),
      exitPrice: closed ? Number(exit) : undefined,
      charges,
      ...pnl,
      accountId: accountId || accounts[0]?.id || 'acc_default',
      accountName: account?.accountName || accounts[0]?.accountName || 'Primary Account',
      chargeMode: useAuto ? ('auto' as const) : ('manual' as const),
      chargeBreakdown: useAuto ? breakdown : undefined,
      chargeConfig: useAuto ? config : undefined,
      buyOrders,
      sellOrders,
      setup: setup.trim() || 'Unspecified',
      notes: notes.trim(),
      emotion,
      rulesFollowed,
      stopLoss: stopLoss ? Number(stopLoss) : undefined,
      target: target ? Number(target) : undefined,
      rrRatio: risk > 0 && reward > 0 ? Number((reward / risk).toFixed(2)) : undefined,
    };

    try {
      setSaving(true);
      if (existing) {
        updateTrade(existing.id, tradeData);
        setSuccessToast(`Trade ${tradeData.instrument} updated!`);
      } else {
        addTrade(tradeData);
        setSuccessToast(`Trade ${tradeData.instrument} recorded!`);
      }

      setTimeout(() => {
        setSaving(false);
        closeRecordTradeModal();
      }, 300);
    } catch {
      setError('Could not save trade. Please check available storage.');
      setSaving(false);
    }
  };

  if (!isRecordTradeModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm p-2 sm:p-4 md:p-6 flex items-center justify-center animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        // Do NOT close on outside/backdrop click to avoid losing user progress
        e.stopPropagation();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-trade-title"
        className="w-full max-w-3xl max-h-[92dvh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-surface-container flex flex-col my-auto"
      >
        {/* Sticky Header with Title and Close */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 sm:px-7 py-4 border-b border-surface-container flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
              <span className="material-symbols-outlined text-[20px]">
                {existing ? 'edit' : 'candlestick_chart'}
              </span>
            </div>
            <div>
              <h1 id="record-trade-title" className="text-base sm:text-lg font-bold text-on-surface leading-tight">
                {existing ? 'Edit Trade' : 'Record Trade'}
              </h1>
              <p className="text-[11px] text-outline">
                Automated Indian STT, GST, and turnover brokerage calculations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              tabIndex={-1}
              aria-label="Close dialog"
              onClick={closeRecordTradeModal}
              className="w-9 h-9 rounded-xl border border-surface-container text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors flex items-center justify-center text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-7 space-y-5 flex-1">
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {successToast && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span>{successToast}</span>
            </div>
          )}

          {/* SECTION 1: ACCOUNT & INSTRUMENT BASICS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/60 border border-surface-container space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-outline">
                1. Account &amp; Instrument
              </span>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setAccountOpen(true)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                + Add Account
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Trading Account <span className="text-error">*</span>
                </label>
                <select
                  className={fieldClass}
                  required
                  value={accountId}
                  onChange={(e) => {
                    if (e.target.value === '__new') setAccountOpen(true);
                    else setAccountId(e.target.value);
                  }}
                >
                  <option value="">Select trading account</option>
                  {accounts
                    .filter((a) => a.isActive)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.accountName} · {a.broker} ({a.currency})
                      </option>
                    ))}
                  <option value="__new">+ Add new account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Trade Date <span className="text-error">*</span>
                </label>
                <input
                  className={fieldClass}
                  type="date"
                  required
                  max={localDate()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            {/* Instrument Search with Strike Autocomplete */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Instrument &amp; Strike <span className="text-error">*</span>
              </label>
              <InstrumentSearch
                value={instrument}
                currentSide={side}
                onSideChange={(newSide) => setSide(newSide)}
                onChange={(inst, details) => {
                  setInstrument(inst);
                  if (details?.segment) setSegment(details.segment);
                  if (details?.side) setSide(details.side);
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Market Segment</label>
                <select
                  className={fieldClass}
                  value={segment}
                  onChange={(e) => setSegment(e.target.value as ChargeSegment)}
                >
                  {Object.entries(CHARGE_LABELS).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {segment === 'manual' && (
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Asset Class</label>
                  <select
                    className={fieldClass}
                    value={manualAsset}
                    onChange={(e) => setManualAsset(e.target.value as AssetClass)}
                  >
                    {['Crypto', 'Forex', 'Commodities'].map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* BUY / SELL First Action Switcher */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">Action (Execution Side)</label>
              <div className="grid grid-cols-2 gap-2.5">
                {(['BUY', 'SELL'] as const).map((s) => (
                  <button
                    type="button"
                    key={s}
                    aria-pressed={side === s}
                    onClick={() => setSide(s)}
                    className={`rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      side === s
                        ? s === 'BUY'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-600'
                          : 'bg-rose-600 text-white shadow-md shadow-rose-600/25 ring-2 ring-rose-600'
                        : 'bg-white border border-surface-container text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {s === 'BUY' ? 'trending_up' : 'trending_down'}
                    </span>
                    <span>{s === 'BUY' ? 'BUY First · Long' : 'SELL First · Short'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: QUANTITY & PRICES */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/60 border border-surface-container space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-outline">
                2. Lots, Units &amp; Prices
              </span>

              {/* Lots vs Qty Toggle */}
              <div className="inline-flex p-0.5 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setQuantityMode('lots');
                    const calculatedLots = Math.max(
                      1,
                      Math.round((Number(quantity) || activeLotSize) / activeLotSize)
                    );
                    setLotsCount(String(calculatedLots));
                    setQuantity(String(calculatedLots * activeLotSize));
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    quantityMode === 'lots'
                      ? 'bg-white text-emerald-800 shadow-xs font-bold'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">layers</span>
                  <span>Lots</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuantityMode('qty')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    quantityMode === 'qty'
                      ? 'bg-white text-emerald-800 shadow-xs font-bold'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">tag</span>
                  <span>Total Qty</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-start">
              {/* Lots / Quantity Column */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  {quantityMode === 'lots' ? 'Lots Count *' : 'Total Quantity *'}
                </label>

                {quantityMode === 'lots' ? (
                  <div className="space-y-2">
                    {/* Index Selector with Edit lot size */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-surface-container text-xs shadow-2xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">data_exploration</span>
                        <select
                          value={selectedIndex}
                          onChange={(e) => {
                            const newIdx = e.target.value;
                            setSelectedIndex(newIdx);
                            const newLotSize = lotSizes[newIdx] || 25;
                            setQuantity(String((Number(lotsCount) || 1) * newLotSize));
                          }}
                          className="font-bold text-slate-800 bg-transparent outline-none cursor-pointer text-xs"
                        >
                          {Object.keys(lotSizes).map((idx) => (
                            <option key={idx} value={idx}>
                              {idx} · 1 Lot = {lotSizes[idx]} units
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCustomIndexName(selectedIndex);
                          setCustomIndexLot(activeLotSize);
                          setLotConfigModalOpen(true);
                        }}
                        title="Edit Lot Size for this Index"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 hover:underline font-bold cursor-pointer text-[11px] px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200/60 shrink-0"
                      >
                        <span className="material-symbols-outlined text-[13px]">tune</span>
                        <span>Edit</span>
                      </button>
                    </div>

                    {/* Lots input with quick increment pills */}
                    <div className="flex items-center gap-1.5">
                      <input
                        className={fieldClass}
                        type="number"
                        min="1"
                        step="1"
                        required
                        inputMode="numeric"
                        value={lotsCount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLotsCount(val);
                          const num = Number(val);
                          if (num > 0) {
                            setQuantity(String(num * activeLotSize));
                          }
                        }}
                        placeholder="e.g. 2"
                      />

                      <div className="flex gap-1 shrink-0">
                        {[1, 2, 5].map((count) => (
                          <button
                            type="button"
                            tabIndex={-1}
                            key={count}
                            onClick={() => {
                              const newLots = String((Number(lotsCount) || 0) + count);
                              setLotsCount(newLots);
                              setQuantity(String(Number(newLots) * activeLotSize));
                            }}
                            className="px-2.5 py-2 text-xs font-bold rounded-lg bg-white hover:bg-surface-container border border-surface-container text-on-surface cursor-pointer"
                          >
                            +{count}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between text-[11px] font-semibold text-emerald-800">
                      <span>Total Units:</span>
                      <span className="font-bold font-mono">
                        {quantity || 0} Units ({lotsCount || 0} Lots × {activeLotSize})
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      className={fieldClass}
                      type="number"
                      min="0.000001"
                      step="any"
                      required
                      inputMode="decimal"
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(e.target.value);
                        const num = Number(e.target.value);
                        if (num > 0) {
                          setLotsCount(String(Math.round(num / activeLotSize) || 1));
                        }
                      }}
                      placeholder="Units"
                    />
                    <p className="text-[11px] text-outline mt-1 font-medium">
                      ≈ {(Number(quantity) / activeLotSize).toFixed(1)} Lots ({selectedIndex}: 1 Lot = {activeLotSize})
                    </p>
                  </div>
                )}
              </div>

              {/* Entry Price */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  {side === 'BUY' ? 'Buy Entry Price' : 'Sell Entry Price'} ({currency}) <span className="text-error">*</span>
                </label>
                <input
                  className={fieldClass}
                  type="number"
                  min="0.000001"
                  step="any"
                  required
                  inputMode="decimal"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="e.g. 142.50"
                />
              </div>

              {/* Exit Price */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  {side === 'BUY' ? 'Sell Exit Price' : 'Buy Exit Price'} ({currency})
                </label>
                <input
                  className={fieldClass}
                  type="number"
                  min="0.000001"
                  step="any"
                  inputMode="decimal"
                  value={exit}
                  onChange={(e) => setExit(e.target.value)}
                  placeholder="Blank = Open trade"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: REAL-TIME CHARGES & NET P&L CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-surface-container shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-outline">
                3. Live Result &amp; Brokerage Breakdown
              </span>
              <span className="text-[11px] text-outline">{closed ? 'Entry + Exit Orders' : 'Entry Order Only'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-surface-container-low/70 border border-surface-container">
              <div>
                <span className="text-[11px] text-outline block">Gross P&amp;L</span>
                <strong className={`text-base font-data-metric-md ${pnl.grossPnl < 0 ? 'text-error' : 'text-emerald-700'}`}>
                  {closed ? formatCurrency(pnl.grossPnl, currency, true) : '—'}
                </strong>
              </div>

              <div>
                <span className="text-[11px] text-outline block">Estimated Charges</span>
                <strong className="text-base text-on-surface font-data-metric-md">
                  {formatCurrency(charges, currency)}
                </strong>
              </div>

              <div>
                <span className="text-[11px] text-outline block">Net Realized P&amp;L</span>
                <strong
                  className={`text-xl font-bold font-data-metric-lg ${
                    !closed ? 'text-outline' : pnl.netPnl < 0 ? 'text-error' : 'text-emerald-700'
                  }`}
                >
                  {closed ? formatCurrency(pnl.netPnl, currency, true) : 'Open Position'}
                </strong>
              </div>
            </div>

            {/* Collapsible Detailed Tax Breakdown */}
            <details className="text-xs text-on-surface-variant group">
              <summary className="font-semibold text-emerald-700 cursor-pointer hover:underline py-1">
                View STT, GST &amp; Exchange Fee details
              </summary>
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded bg-surface-container-low">
                  <span className="text-outline block">Brokerage</span>
                  <strong className="font-medium text-on-surface">{formatCurrency(breakdown.brokerage, currency)}</strong>
                </div>
                <div className="p-2 rounded bg-surface-container-low">
                  <span className="text-outline block">STT</span>
                  <strong className="font-medium text-on-surface">{formatCurrency(breakdown.stt, currency)}</strong>
                </div>
                <div className="p-2 rounded bg-surface-container-low">
                  <span className="text-outline block">GST (18%)</span>
                  <strong className="font-medium text-on-surface">{formatCurrency(breakdown.gst, currency)}</strong>
                </div>
                <div className="p-2 rounded bg-surface-container-low">
                  <span className="text-outline block">Exchange/SEBI</span>
                  <strong className="font-medium text-on-surface">
                    {formatCurrency(breakdown.exchange + breakdown.sebi + breakdown.stamp, currency)}
                  </strong>
                </div>
              </div>
            </details>
          </div>

          {/* SECTION 4: OPTIONAL RISK & PSYCHOLOGY (Expandable in Full Mode) */}
          {mode === 'basic' && (
            <details className="p-4 rounded-2xl bg-surface-container-low/40 border border-surface-container" open={Boolean(existing)}>
              <summary className="text-xs font-bold uppercase tracking-wider text-outline cursor-pointer py-1">
                4. Psychology, Strategy &amp; Risk (Optional)
              </summary>
              <div className="space-y-3.5 pt-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-on-surface mb-1">Stop Loss</label>
                    <input
                      className={fieldClass}
                      type="number"
                      min="0"
                      step="any"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      placeholder="SL Price"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-on-surface mb-1">Target Price</label>
                    <input
                      className={fieldClass}
                      type="number"
                      min="0"
                      step="any"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="Target"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-on-surface mb-1">Entry Time</label>
                    <input
                      className={fieldClass}
                      type="time"
                      value={entryTime}
                      onChange={(e) => setEntryTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-on-surface mb-1">Emotion</label>
                    <select
                      className={fieldClass}
                      value={emotion}
                      onChange={(e) => setEmotion(e.target.value as EmotionalState)}
                    >
                      {['Calm', 'Confident', 'Fear', 'FOMO', 'Greedy', 'Revenge'].map((em) => (
                        <option key={em}>{em}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-on-surface mb-1">Trading Setup / Strategy</label>
                    <input
                      className={fieldClass}
                      value={setup}
                      onChange={(e) => setSetup(e.target.value)}
                      placeholder="e.g. 5EMA Pullback, Breakout, CPR"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-on-surface mb-1">Notes &amp; Reflection</label>
                    <input
                      className={fieldClass}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Why did you take this trade?"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-on-surface cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={rulesFollowed}
                    onChange={(e) => setRulesFollowed(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>I followed my trading plan and risk management rules</span>
                </label>
              </div>
            </details>
          )}

          {/* Sticky Bottom Actions inside Modal */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-surface-container">
            <button
              type="button"
              onClick={closeRecordTradeModal}
              className="px-4 py-2.5 rounded-xl border border-surface-container text-xs font-semibold text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary py-2.5 px-6 text-xs sm:text-sm font-bold shadow-md cursor-pointer flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Trade…</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>{existing ? 'Save Changes' : 'Record Trade'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sub-modals for Account Creation and Lot Size Configuration */}
      {accountOpen && (
        <Modal title="Add trading account" onClose={() => setAccountOpen(false)}>
          <AccountForm
            onCancel={() => setAccountOpen(false)}
            onSaved={(a) => {
              setAccountId(a.id);
              setAccountOpen(false);
            }}
          />
        </Modal>
      )}

      {lotConfigModalOpen && (
        <Modal title="Configure Index Lot Sizes" onClose={() => setLotConfigModalOpen(false)}>
          <div className="space-y-4">
            <p className="text-xs text-on-surface-variant">
              Customize lot sizes for your preferred indices or symbols. These settings are saved to your account and automatically synced across devices.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {Object.entries(lotSizes).map(([idx, size]) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-surface-container"
                >
                  <span className="font-semibold text-sm text-on-surface">{idx}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      defaultValue={size}
                      id={`lot-size-${idx}`}
                      className="w-20 px-2 py-1 text-sm bg-surface-container rounded-lg border border-outline/20 text-on-surface text-right"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(`lot-size-${idx}`) as HTMLInputElement;
                        const val = Number(el?.value);
                        if (val > 0) {
                          updateIndexLotSize(idx, val);
                        }
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary/90"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-surface-container">
              <label className="text-xs font-semibold text-on-surface mb-1.5 block">
                Add Custom Symbol / Stock Lot
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. RELIANCE or CRUDEOIL"
                  value={customIndexName}
                  onChange={(e) => setCustomIndexName(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-1.5 text-sm bg-surface-container-low rounded-lg border border-outline/20 text-on-surface uppercase"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Lot"
                  value={customIndexLot}
                  onChange={(e) => setCustomIndexLot(Number(e.target.value))}
                  className="w-20 px-2 py-1.5 text-sm bg-surface-container-low rounded-lg border border-outline/20 text-on-surface text-right"
                />
                <button
                  type="button"
                  disabled={!customIndexName.trim() || customIndexLot <= 0}
                  onClick={() => {
                    if (customIndexName.trim() && customIndexLot > 0) {
                      updateIndexLotSize(customIndexName.trim().toUpperCase(), customIndexLot);
                      setSelectedIndex(customIndexName.trim().toUpperCase());
                      setCustomIndexName('');
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setLotConfigModalOpen(false)}
                className="btn-primary py-2 px-5 text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
