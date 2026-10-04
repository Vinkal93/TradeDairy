'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTrades } from '../../../context/TradeContext';
import { ChargeSegment } from '../../../types';
import { calculateCharges, calculatePnl, CHARGE_LABELS, DEFAULT_CHARGES, ratesFor } from '../../../lib/charges';
import { localDate } from '../../../lib/dates';
import { formatCurrency } from '../../../lib/utils';
import { ChargeEditor, fieldClass } from '../../../components/common/ChargeEditor';

export default function BrokerChargesPage() {
  const { accounts, updateAccount } = useTrades();
  const [id, setId] = useState(accounts[0]?.id || '');
  const account = accounts.find(a => a.id === id);
  const [config, setConfig] = useState({ ...DEFAULT_CHARGES, ...account?.chargeConfig });
  const [segment, setSegment] = useState<ChargeSegment>('options');
  const [buy, setBuy] = useState(''), [sell, setSell] = useState(''), [qty, setQty] = useState('');
  const [feedback, setFeedback] = useState('');
  useEffect(() => { setConfig({ ...DEFAULT_CHARGES, ...account?.chargeConfig }); setFeedback(''); }, [id, account?.chargeConfig]);
  const breakdown = useMemo(() => calculateCharges({ entryPrice: Number(buy), exitPrice: sell ? Number(sell) : undefined, quantity: Number(qty), side: 'BUY', segment, date: localDate(), config }), [buy, sell, qty, segment, config]);
  const pnl = calculatePnl(Number(buy), sell ? Number(sell) : undefined, Number(qty), 'BUY', breakdown.total);
  const rates = ratesFor(segment, config, localDate());
  const changeRate = (key: keyof typeof rates, value: number) => setConfig({ ...config, overrides: { ...config.overrides, [segment]: { ...rates, [key]: value } } });
  return <div className="space-y-5 max-w-5xl mx-auto"><div><Link href="/settings" className="text-sm text-outline">← Settings</Link><h1 className="page-title mt-2">Broker charges</h1><p className="text-sm text-on-surface-variant mt-1">Set your actual brokerage for each trading account.</p></div>
    {!accounts.length ? <div className="card space-y-3"><p>Add a trading account to configure charges.</p><Link href="/accounts" className="btn-primary inline-block">Add account</Link></div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <form className="card space-y-5" onSubmit={e => { e.preventDefault(); if (!account) return; try { updateAccount(id, { chargeConfig: config }); setFeedback('Account charge rules saved. Existing trades keep their recorded charges.'); } catch { setFeedback('Could not save charge rules. Check browser storage.'); } }}>
        <label className="field-label">Account<select className={fieldClass} value={id} onChange={e => setId(e.target.value)}>{accounts.map(a => <option value={a.id} key={a.id}>{a.accountName}</option>)}</select></label><ChargeEditor value={config} onChange={setConfig} />
        <details className="border border-surface-container rounded-xl p-3"><summary className="text-sm cursor-pointer">Advanced tax and exchange overrides</summary><div className="space-y-3 mt-4"><label className="field-label">Segment<select className={fieldClass} value={segment} onChange={e => setSegment(e.target.value as ChargeSegment)}>{Object.entries(CHARGE_LABELS).filter(([s]) => s !== 'manual').map(([s, label]) => <option key={s} value={s}>{label}</option>)}</select></label><div className="grid grid-cols-2 gap-3">{([['sttBuy', 'STT buy (%)'], ['sttSell', 'STT sell (%)'], ['exchange', 'Exchange fee (%)'], ['stamp', 'Stamp duty buy (%)']] as const).map(([key, label]) => <label className="field-label" key={key}>{label}<input className={fieldClass} type="number" min="0" step="0.00001" value={rates[key]} onChange={e => changeRate(key, Number(e.target.value))} /></label>)}</div><button type="button" className="btn-secondary" onClick={() => setConfig({ ...config, overrides: undefined })}>Reset tax overrides</button></div></details>
        {feedback && <p role="status" className="text-sm text-primary">{feedback}</p>}<button className="btn-primary w-full">Save account charges</button>
      </form>
      <section className="card space-y-4"><h2 className="section-title">Try your prices</h2><label className="field-label">Segment<select className={fieldClass} value={segment} onChange={e => setSegment(e.target.value as ChargeSegment)}>{Object.entries(CHARGE_LABELS).filter(([s]) => s !== 'manual').map(([s, label]) => <option key={s} value={s}>{label}</option>)}</select></label><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{[['Buy price', buy, setBuy], ['Sell price', sell, setSell], ['Quantity', qty, setQty]].map(([label, value, setter]) => <label key={String(label)} className="field-label">{String(label)}<input className={fieldClass} type="number" min="0" step="any" value={String(value)} onChange={e => (setter as (v: string) => void)(e.target.value)} /></label>)}</div>
        <dl className="space-y-2 text-sm">{[['Brokerage', breakdown.brokerage], ['STT', breakdown.stt], ['Exchange', breakdown.exchange], ['SEBI', breakdown.sebi], ['Stamp duty', breakdown.stamp], ['GST', breakdown.gst], ['DP', breakdown.dp], ['Other', breakdown.other], ['Total charges', breakdown.total], ['Net P&L', pnl.netPnl]].map(([label, value]) => <div key={label} className="flex justify-between gap-2"><dt>{label}</dt><dd className="tabular-nums">{formatCurrency(Number(value))}</dd></div>)}</dl>
        <p className="text-xs text-on-surface-variant leading-relaxed">These are estimates for regular Indian equity/F&O trades. Broker rounding, daily DP charges, special settlement and historical exchange tariffs can differ. For other markets or exact accounting, enter contract-note charges in the trade form.</p><a className="text-xs text-primary underline" href="https://zerodha.com/charges" target="_blank" rel="noreferrer">Rate reference · checked 5 Oct 2026</a>
      </section>
    </div>}
  </div>;
}
