'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTrades } from '../../context/TradeContext';
import { localDate } from '../../lib/dates';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';
import { fieldClass } from '../../components/common/ChargeEditor';

export default function CalendarPage() {
  const { accounts, trades, user, selectedAccount, setSelectedAccount } = useTrades();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState('');
  const visible = trades.filter(t => selectedAccount === 'ALL' || t.accountId === selectedAccount);
  const monthKey = localDate(month).slice(0, 7), monthly = visible.filter(t => t.date.startsWith(monthKey) && t.status === 'CLOSED');
  const currencies = new Set(monthly.map(t => accounts.find(a => a.id === t.accountId)?.currency || user.baseCurrency));
  const mixed = currencies.size > 1, currency = accounts.find(a => a.id === monthly[0]?.accountId)?.currency || user.baseCurrency;
  const offset = (month.getDay() + 6) % 7, count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const change = (delta: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  const dayTrades = visible.filter(t => t.date === selected);
  return <div className="space-y-5"><div><h1 className="page-title">Trading calendar</h1><p className="text-sm text-outline mt-1">Tap a day to review its trades and journal.</p></div>
    <section className="card space-y-4"><label className="field-label max-w-md">Account<select className={fieldClass} value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}><option value="ALL">All accounts</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.accountName}</option>)}</select></label><div className="flex items-center justify-between gap-2"><button aria-label="Previous month" className="btn-secondary" onClick={() => change(-1)}>←</button><h2 className="section-title">{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h2><button aria-label="Next month" className="btn-secondary" onClick={() => change(1)}>→</button></div><div className="flex flex-wrap justify-between gap-3 text-sm"><p>{monthly.length} closed trades · {visible.filter(t => t.date.startsWith(monthKey) && t.status === 'OPEN').length} open</p><p className="tabular-nums">Net: {mixed ? 'Select one currency' : formatCurrency(monthly.reduce((sum, t) => sum + t.netPnl, 0), currency, true)}</p><button className="text-primary" onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>This month</button></div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span className="text-center text-xs text-outline py-2" key={i}>{d}</span>)}{Array.from({ length: offset }, (_, i) => <div key={`pad${i}`} />)}{Array.from({ length: count }, (_, i) => {
        const date = `${monthKey}-${String(i + 1).padStart(2, '0')}`, records = visible.filter(t => t.date === date), closed = records.filter(t => t.status === 'CLOSED');
        const pnl = closed.reduce((sum, t) => sum + t.netPnl, 0), today = date === localDate();
        return <button key={date} aria-label={`${formatDate(date)}, ${records.length} trades`} onClick={() => setSelected(date)} className={`rounded-xl border min-h-[76px] sm:min-h-[110px] p-1 sm:p-3 text-left flex flex-col justify-between ${today ? 'ring-2 ring-primary' : ''} ${closed.length && !mixed ? pnl > 0 ? 'bg-primary/10 border-primary/15' : pnl < 0 ? 'bg-error/10 border-error/15' : 'bg-surface-container-low border-surface-container' : 'bg-white border-surface-container'}`}><span className="text-xs sm:text-sm">{i + 1}</span>{records.length > 0 && <div><span className={`block text-[9px] sm:text-xs tabular-nums ${pnl < 0 ? 'text-error' : 'text-primary'}`}>{mixed ? `${records.length} trades` : closed.length ? formatCurrency(pnl, currency) : 'Open'}</span><span className="hidden sm:block text-xs text-outline mt-1">{records.length} trades</span></div>}</button>;
      })}</div>
    </section>
    {selected && <Modal title={formatDate(selected)} onClose={() => setSelected('')}><div className="space-y-4">{dayTrades.length ? dayTrades.map(t => <Link key={t.id} href={`/trades/${t.id}`} className="flex justify-between gap-3 py-3 border-b border-surface-container text-sm"><span className="break-words">{t.instrument}</span><span className="shrink-0 tabular-nums">{t.status === 'OPEN' ? 'Open' : formatCurrency(t.netPnl, accounts.find(a => a.id === t.accountId)?.currency || user.baseCurrency, true)}</span></Link>) : <p className="text-sm text-outline">No trades recorded for this day.</p>}<Link href={`/journal?date=${selected}`} className="btn-primary inline-block">Open this day’s journal</Link></div></Modal>}
  </div>;
}
