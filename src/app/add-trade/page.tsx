'use client';
import { Suspense, useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTrades } from '../../context/TradeContext';
import { AssetClass, ChargeSegment, EmotionalState, TradeSide, DEFAULT_INDEX_LOT_SIZES } from '../../types';
import { localDate } from '../../lib/dates';
import { calculateCharges, calculatePnl, CHARGE_LABELS, DEFAULT_CHARGES } from '../../lib/charges';
import { formatCurrency } from '../../lib/utils';
import { searchInstruments } from '../../lib/instruments';
import { AccountForm } from '../../components/common/AccountForm';
import { Modal } from '../../components/common/Modal';
import { fieldClass } from '../../components/common/ChargeEditor';
import { InstrumentSearch } from '../../components/common/InstrumentSearch';

export default function AddTradePage() {
  return <Suspense fallback={<p role="status">Loading trade form…</p>}><TradeForm /></Suspense>;
}
function TradeForm() {
  const router = useRouter(), query = useSearchParams();
  const { accounts, addTrade, updateTrade, getTradeById, storageError, user, updateIndexLotSize } = useTrades();
  const existing = query.get('edit') ? getTradeById(query.get('edit')!) : undefined;
  const [mode, setMode] = useState<'basic' | 'quick'>('basic');
  const [accountId, setAccountId] = useState(existing?.accountId || accounts.find(a => a.isActive)?.id || '');
  const [accountOpen, setAccountOpen] = useState(false);
  const [date, setDate] = useState(existing?.date || localDate());
  const [instrument, setInstrument] = useState(existing?.instrument || '');
  const [segment, setSegment] = useState<ChargeSegment>(existing?.segment || (existing?.assetClass === 'Equity' ? 'equity-intraday' : existing?.assetClass === 'Futures' ? 'futures' : existing && existing.assetClass !== 'Options' ? 'manual' : 'options'));
  const [manualAsset, setManualAsset] = useState<AssetClass>(existing?.assetClass || 'Crypto');
  const [side, setSide] = useState<TradeSide>(existing?.side || 'BUY');

  // Index Lot Size configuration & detection
  const lotSizes = useMemo(() => ({
    ...DEFAULT_INDEX_LOT_SIZES,
    ...(user.indexLotSizes || {}),
  }), [user.indexLotSizes]);

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

  const [quantityMode, setQuantityMode] = useState<'qty' | 'lots'>(() => {
    return existing && existing.assetClass !== 'Options' ? 'qty' : 'lots';
  });
  const [selectedIndex, setSelectedIndex] = useState(() => detectIndex(existing?.instrument || 'NIFTY'));
  const activeLotSize = lotSizes[selectedIndex] || lotSizes[detectIndex(instrument)] || 25;
  const [lotsCount, setLotsCount] = useState(() => {
    if (existing?.quantity) {
      return String(Math.max(1, Math.round(existing.quantity / activeLotSize)));
    }
    return '1';
  });
  const [lotConfigModalOpen, setLotConfigModalOpen] = useState(false);
  const [customIndexName, setCustomIndexName] = useState('');
  const [customIndexLot, setCustomIndexLot] = useState<number>(25);

  const [quantity, setQuantity] = useState(existing ? String(existing.quantity) : String(activeLotSize));

  // Sync index when instrument updates
  useEffect(() => {
    if (instrument) {
      const detected = detectIndex(instrument);
      if (detected && lotSizes[detected]) {
        setSelectedIndex(detected);
      }
    }
  }, [instrument, detectIndex, lotSizes]);
  const [entry, setEntry] = useState(existing ? String(existing.entryPrice) : '');
  const [exit, setExit] = useState(existing?.exitPrice !== undefined ? String(existing.exitPrice) : '');
  const [entryTime, setEntryTime] = useState(existing?.entryTime || new Date().toTimeString().slice(0, 5));
  const [exitTime, setExitTime] = useState(existing?.exitTime || '');
  const [buyOrders, setBuyOrders] = useState(existing?.buyOrders || 1);
  const [sellOrders, setSellOrders] = useState(existing?.sellOrders || 1);
  const [manualCharges, setManualCharges] = useState(existing?.chargeMode === 'manual' || (existing && !existing.chargeMode) ? String(existing.charges) : '');
  const [chargeMode, setChargeMode] = useState<'auto' | 'manual'>(existing?.chargeMode || (existing ? 'manual' : 'auto'));
  const [setup, setSetup] = useState(existing?.setup || '');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [stopLoss, setStopLoss] = useState(existing?.stopLoss ? String(existing.stopLoss) : '');
  const [target, setTarget] = useState(existing?.target ? String(existing.target) : '');
  const [emotion, setEmotion] = useState<EmotionalState>(existing?.emotion || 'Calm');
  const [rulesFollowed, setRulesFollowed] = useState(existing?.rulesFollowed ?? true);
  const [error, setError] = useState(''), [saving, setSaving] = useState(false);
  const account = accounts.find(a => a.id === accountId);
  const config = useMemo(() => ({ ...DEFAULT_CHARGES, ...account?.chargeConfig }), [account?.chargeConfig]);
  const currency = account?.currency || 'INR';
  const closed = exit.trim() !== '', canAuto = segment !== 'manual' && currency === 'INR';
  const useAuto = chargeMode === 'auto' && canAuto;
  const breakdown = useMemo(() => calculateCharges({ entryPrice: Number(entry), exitPrice: closed ? Number(exit) : undefined,
    quantity: Number(quantity), side, segment, date, config, buyOrders, sellOrders }),
    [entry, exit, quantity, side, segment, date, config, buyOrders, sellOrders, closed]);
  const charges = useAuto ? breakdown.total : Number(manualCharges);
  const pnl = calculatePnl(Number(entry), closed ? Number(exit) : undefined, Number(quantity), side, charges);
  const suggestions = useMemo(() => instrument.length >= 2 ? searchInstruments(instrument).slice(0, 8) : [], [instrument]);
  const save = (event: React.FormEvent) => {
    event.preventDefault(); if (saving) return;
    if (!account?.isActive) { setError('Select an active account or add one here first.'); return; }
    if (!instrument.trim() || !date || Number(quantity) <= 0 || Number(entry) <= 0 || (closed && (!Number.isFinite(Number(exit)) || Number(exit) <= 0))) { setError('Enter the instrument, date, quantity and positive prices. Leave exit blank for an open position.'); return; }
    if (![Number(quantity), Number(entry), charges, Number(stopLoss), Number(target)].every(Number.isFinite) || charges < 0 || Number(stopLoss) < 0 || Number(target) < 0 || !Number.isInteger(buyOrders) || !Number.isInteger(sellOrders) || buyOrders < 1 || sellOrders < 1) { setError('Use valid prices, charges and positive whole order counts.'); return; }
    if (!useAuto && manualCharges.trim() === '') { setError('Enter total contract-note charges, including zero when applicable.'); return; }
    if (storageError) { setError('Enable browser storage before saving.'); return; }
    const assetClass: AssetClass = segment.startsWith('equity') ? 'Equity' : segment === 'options' ? 'Options' : segment === 'futures' ? 'Futures' : manualAsset;
    const risk = stopLoss ? Math.abs(Number(entry) - Number(stopLoss)) : 0, reward = target ? Math.abs(Number(target) - Number(entry)) : 0;
    const data = { instrument: instrument.trim().toUpperCase(), assetClass, segment, side,
      status: closed ? 'CLOSED' as const : 'OPEN' as const, date, entryTime, exitTime: closed && exitTime ? exitTime : undefined,
      quantity: Number(quantity), entryPrice: Number(entry), exitPrice: closed ? Number(exit) : undefined,
      charges, ...pnl, accountId, accountName: account.accountName, chargeMode: useAuto ? 'auto' as const : 'manual' as const,
      chargeBreakdown: useAuto ? breakdown : undefined, chargeConfig: useAuto ? config : undefined, buyOrders, sellOrders,
      setup: setup.trim() || 'Unspecified', notes: notes.trim(), emotion, rulesFollowed,
      stopLoss: stopLoss ? Number(stopLoss) : undefined, target: target ? Number(target) : undefined,
      rrRatio: risk > 0 && reward > 0 ? Number((reward / risk).toFixed(2)) : undefined };
    try {
      setSaving(true);
      if (existing) { updateTrade(existing.id, data); router.push(`/trades/${existing.id}`); }
      else { const trade = addTrade(data); router.push(`/trades/${trade.id}`); }
    } catch { setError('Could not save. Check available browser storage and retry.'); setSaving(false); }
  };
  if (query.get('edit') && !existing) return <div className="card"><h1>Trade not found</h1><Link href="/trades">Return to trades</Link></div>;
  return <div className="space-y-5 max-w-5xl mx-auto">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><Link href="/trades" className="text-sm text-on-surface-variant">← Trades</Link><h1 className="page-title mt-2">{existing ? 'Edit trade' : 'Record a trade'}</h1><p className="text-sm text-on-surface-variant mt-1">Enter actual prices. We’ll calculate your result and charges.</p></div>
      {!existing && <div className="flex rounded-xl bg-surface-container p-1" aria-label="Entry mode">{(['basic', 'quick'] as const).map(m => <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-lg text-sm ${mode === m ? 'bg-white shadow-sm text-primary font-medium' : 'text-on-surface-variant'}`}>{m === 'basic' ? 'Basic entry' : 'Quick log'}</button>)}</div>}
    </div>
    <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
      <div className="space-y-4">{error && <p role="alert" className="rounded-xl bg-error-container p-3 text-sm text-error">{error}</p>}
        <section className="card space-y-4"><div className="flex items-center justify-between gap-2"><h2 className="section-title">Trade basics</h2><button type="button" className="text-primary text-sm font-medium py-2" onClick={() => setAccountOpen(true)}>+ Add account</button></div>
          <label className="field-label">Trading account *<select className={fieldClass} required value={accountId} onChange={e => { if (e.target.value === '__new') setAccountOpen(true); else setAccountId(e.target.value); }}><option value="">Select an account</option>{accounts.filter(a => a.isActive).map(a => <option key={a.id} value={a.id}>{a.accountName} · {a.broker}</option>)}<option value="__new">+ Add new account</option></select></label>
          {account && <p className="text-xs text-on-surface-variant">₹{config.brokeragePerOrder} per order · {config.exchange} · <Link href="/settings/charges" className="text-primary underline">Edit charges</Link></p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="field-label">
              <span>Instrument *</span>
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
            <label className="field-label">Trade date *<input className={fieldClass} type="date" required max={localDate()} value={date} onChange={e => setDate(e.target.value)} /></label>
            <label className="field-label">Segment<select className={fieldClass} value={segment} onChange={e => setSegment(e.target.value as ChargeSegment)}>{Object.entries(CHARGE_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            {segment === 'manual' && <label className="field-label">Market<select className={fieldClass} value={manualAsset} onChange={e => setManualAsset(e.target.value as AssetClass)}>{['Crypto', 'Forex', 'Commodities'].map(a => <option key={a}>{a}</option>)}</select></label>}
          </div>
          <fieldset><legend className="field-label mb-2">What did you do first?</legend><div className="grid grid-cols-2 gap-2">{(['BUY', 'SELL'] as const).map(s => <button type="button" key={s} aria-pressed={side === s} onClick={() => setSide(s)} className={`rounded-xl border py-3 text-sm ${side === s ? s === 'BUY' ? 'bg-primary/10 border-primary text-primary font-medium' : 'bg-error/10 border-error text-error font-medium' : 'border-surface-container text-on-surface-variant'}`}>{s === 'BUY' ? 'Buy first · Long' : 'Sell first · Short'}</button>)}</div></fieldset>
          {/* Quantity & Price Section with Lots vs Qty Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="field-label !mb-0 font-bold">
                  {quantityMode === 'lots' ? 'Lots *' : 'Quantity *'}
                </span>

                {/* Lots vs Qty Toggle */}
                <div className="inline-flex p-0.5 rounded-lg bg-surface-container border border-surface-container-high text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setQuantityMode('lots');
                      const calculatedLots = Math.max(1, Math.round((Number(quantity) || activeLotSize) / activeLotSize));
                      setLotsCount(String(calculatedLots));
                      setQuantity(String(calculatedLots * activeLotSize));
                    }}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      quantityMode === 'lots'
                        ? 'bg-white text-primary shadow-xs font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    📦 Lots
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantityMode('qty')}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      quantityMode === 'qty'
                        ? 'bg-white text-primary shadow-xs font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    🔢 Qty
                  </button>
                </div>
              </div>

              {quantityMode === 'lots' ? (
                <div className="space-y-2">
                  {/* Selected Index & Lot Size Pill */}
                  <div className="flex items-center justify-between gap-1 p-1.5 rounded-lg bg-surface-container-low border border-surface-container text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-outline font-medium">Index:</span>
                      <select
                        value={selectedIndex}
                        onChange={(e) => {
                          const newIdx = e.target.value;
                          setSelectedIndex(newIdx);
                          const newLotSize = lotSizes[newIdx] || 25;
                          setQuantity(String((Number(lotsCount) || 1) * newLotSize));
                        }}
                        className="font-bold text-primary bg-white border border-surface-container rounded px-1.5 py-0.5 text-xs outline-none"
                      >
                        {Object.keys(lotSizes).map((idx) => (
                          <option key={idx} value={idx}>
                            {idx} (1 Lot = {lotSizes[idx]})
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
                      className="text-primary hover:underline font-semibold shrink-0 cursor-pointer text-[11px]"
                    >
                      ⚙️ Edit
                    </button>
                  </div>

                  {/* Lots Input with quick increment pills */}
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

                    {/* Quick +Lots Pills */}
                    <div className="flex gap-1 shrink-0">
                      {[1, 2, 5].map((count) => (
                        <button
                          type="button"
                          key={count}
                          onClick={() => {
                            const newLots = String((Number(lotsCount) || 0) + count);
                            setLotsCount(newLots);
                            setQuantity(String(Number(newLots) * activeLotSize));
                          }}
                          className="px-2 py-2 text-xs font-semibold rounded-lg bg-surface-container-low hover:bg-surface-container border border-surface-container text-on-surface"
                        >
                          +{count}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-primary font-semibold">
                    = {quantity || 0} Total Units ({lotsCount || 0} Lots × {activeLotSize})
                  </p>
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
                    placeholder="Units, not lots"
                  />
                  <div className="flex items-center justify-between text-[11px] text-outline mt-1">
                    <span>
                      ≈ {(Number(quantity) / activeLotSize).toFixed(1)} Lots ({selectedIndex}: 1 Lot = {activeLotSize})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomIndexName(selectedIndex);
                        setCustomIndexLot(activeLotSize);
                        setLotConfigModalOpen(true);
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      Set lot
                    </button>
                  </div>
                </div>
              )}
            </div>

            <label className="field-label">{side === 'BUY' ? 'Buy' : 'Sell'} price *<input className={fieldClass} type="number" min="0.000001" step="any" required inputMode="decimal" value={entry} onChange={e => setEntry(e.target.value)} placeholder="Entry price" /></label>
            <label className="field-label">{side === 'BUY' ? 'Sell' : 'Buy'} price · optional<input className={fieldClass} type="number" min="0.000001" step="any" inputMode="decimal" value={exit} onChange={e => setExit(e.target.value)} placeholder="Blank = open position" /></label>
          </div>
          <p className="text-xs text-on-surface-variant">Switch between Lots and Quantity anytime. Configured lot sizes are saved to your account and synced.</p>
        </section>
        <section className="card space-y-4"><div className="flex items-center justify-between"><h2 className="section-title">Charges</h2><span className="text-xs text-on-surface-variant">{closed ? 'Entry + exit' : 'Entry only'}</span></div>
          {canAuto && <div className="flex flex-wrap gap-2">{(['auto', 'manual'] as const).map(m => <button key={m} type="button" aria-pressed={chargeMode === m} onClick={() => setChargeMode(m)} className={`btn-secondary ${chargeMode === m ? 'border-primary text-primary bg-primary/5' : ''}`}>{m === 'auto' ? 'Calculate automatically' : 'Enter contract-note total'}</button>)}</div>}
          {!useAuto ? <label className="field-label">Total charges ({currency}) *<input className={fieldClass} type="number" min="0" step="0.01" required value={manualCharges} onChange={e => setManualCharges(e.target.value)} placeholder="Total from your broker" /></label> : <>
            <details><summary className="text-sm cursor-pointer text-on-surface-variant">More than one executed order?</summary><div className="grid grid-cols-2 gap-3 mt-3"><label className="field-label">Buy orders<input className={fieldClass} type="number" min="1" step="1" value={buyOrders} onChange={e => setBuyOrders(Number(e.target.value))} /></label><label className="field-label">Sell orders<input className={fieldClass} type="number" min="1" step="1" value={sellOrders} onChange={e => setSellOrders(Number(e.target.value))} /></label></div></details>
            <dl className="space-y-2 text-sm">{[['Brokerage', breakdown.brokerage], ['STT', breakdown.stt], ['Exchange fee', breakdown.exchange], ['SEBI fee', breakdown.sebi], ['Stamp duty', breakdown.stamp], ['GST', breakdown.gst], ['DP fee', breakdown.dp], ['Other fees', breakdown.other]].map(([label, value]) => <div className="flex justify-between gap-2" key={label}><dt className="text-on-surface-variant">{label}</dt><dd className="tabular-nums">{formatCurrency(Number(value), currency)}</dd></div>)}</dl>
            <p className="text-xs text-on-surface-variant leading-relaxed">Estimated normal buy/sell charges. Enter the contract-note total for exact fees, historical exchange rates, exercised options or special settlement.</p>
          </>}
        </section>
        {mode === 'basic' && <details className="card" open={!!existing}><summary className="section-title cursor-pointer">Notes, timing & risk · optional</summary><div className="space-y-4 mt-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="field-label">Entry time<input className={fieldClass} value={entryTime} placeholder="09:30" onChange={e => setEntryTime(e.target.value)} /></label>
          {closed && <label className="field-label">Exit time<input className={fieldClass} value={exitTime} placeholder="15:00" onChange={e => setExitTime(e.target.value)} /></label>}
          <label className="field-label">Stop loss<input className={fieldClass} type="number" min="0" step="any" value={stopLoss} onChange={e => setStopLoss(e.target.value)} /></label><label className="field-label">Target<input className={fieldClass} type="number" min="0" step="any" value={target} onChange={e => setTarget(e.target.value)} /></label>
          <label className="field-label">Setup<input className={fieldClass} value={setup} placeholder="Your setup name" onChange={e => setSetup(e.target.value)} /></label><label className="field-label">Emotion<select className={fieldClass} value={emotion} onChange={e => setEmotion(e.target.value as EmotionalState)}>{['Calm', 'Confident', 'Fear', 'FOMO', 'Greedy', 'Revenge'].map(e => <option key={e}>{e}</option>)}</select></label>
          </div><label className="field-label">Notes<textarea className={fieldClass} rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Why did you take this trade?" /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={rulesFollowed} onChange={e => setRulesFollowed(e.target.checked)} />I followed my trading rules</label></div></details>}
      </div>
      <aside className="card lg:sticky lg:top-20 space-y-4"><h2 className="section-title">Trade result</h2><p className="text-xs text-on-surface-variant">{closed ? 'Realized after charges' : 'Open position · P&L pending'}</p><div aria-live="polite" className={`text-3xl tabular-nums font-semibold ${pnl.netPnl < 0 ? 'text-error' : 'text-primary'}`}>{closed ? formatCurrency(pnl.netPnl, currency, true) : '—'}</div>
        <dl className="space-y-3 text-sm"><div className="flex justify-between"><dt>Gross P&amp;L</dt><dd>{closed ? formatCurrency(pnl.grossPnl, currency, true) : '—'}</dd></div><div className="flex justify-between"><dt>Total charges</dt><dd>{formatCurrency(charges, currency)}</dd></div><div className="flex justify-between"><dt>Status</dt><dd>{closed ? pnl.netPnl > 0 ? 'Profit' : pnl.netPnl < 0 ? 'Loss' : 'Breakeven' : 'Open'}</dd></div></dl>
        <button className="btn-primary w-full" disabled={saving || !!storageError}>{saving ? 'Saving…' : existing ? 'Save changes' : mode === 'quick' ? 'Save quick log' : 'Save trade'}</button><Link className="btn-secondary w-full text-center block" href={existing ? `/trades/${existing.id}` : '/trades'}>Cancel</Link><p className="text-xs text-on-surface-variant">Saved trades appear in your dashboard, ledger, analytics, calendar and accounts.</p>
      </aside>
    </form>
    {accountOpen && <Modal title="Add trading account" onClose={() => setAccountOpen(false)}><AccountForm onCancel={() => setAccountOpen(false)} onSaved={a => { setAccountId(a.id); setAccountOpen(false); }} /></Modal>}
    {lotConfigModalOpen && (
      <Modal title="Configure Index Lot Sizes" onClose={() => setLotConfigModalOpen(false)}>
        <div className="space-y-4">
          <p className="text-xs text-on-surface-variant">
            Customize lot sizes for your preferred indices or symbols. These settings are saved to your account and automatically synced across devices.
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {Object.entries(lotSizes).map(([idx, size]) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-surface-container">
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
            <label className="text-xs font-semibold text-on-surface mb-1.5 block">Add Custom Symbol / Stock Lot</label>
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
  </div>;
}
