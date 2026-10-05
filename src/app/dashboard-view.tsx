'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTrades, TimeframeFilter } from '../context/TradeContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { localDate } from '../lib/dates';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded, accounts, filteredTrades, journals, analytics, selectedTimeframe, setTimeframe, selectedAccount, setSelectedAccount } = useTrades();
  useEffect(() => {
    if (!isLoaded) return;
    if (!user.isLoggedIn) {
      router.replace('/login');
    } else if (!user.isOnboarded) {
      router.replace('/onboarding');
    }
  }, [isLoaded, user.isLoggedIn, user.isOnboarded, router]);
  if (!isLoaded || !user.isLoggedIn) return <div className="py-24 text-center text-outline">Loading your dashboard…</div>;
  const currencies = new Set(filteredTrades.map(t => accounts.find(a => a.id === t.accountId)?.currency || user.baseCurrency));
  const mixed = currencies.size > 1;
  const currency = currencies.values().next().value || user.baseCurrency;
  const money = (value: number, signed = false) => mixed ? '—' : formatCurrency(value, currency, signed);
  const closed = filteredTrades.filter(t => t.status === 'CLOSED').sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
  const recent = [...filteredTrades].sort((a,b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0,5);
  const daily = new Map<string, number>();
  closed.forEach(t => daily.set(t.date, (daily.get(t.date) || 0) + t.netPnl));
  let balance = 0;
  const series = [{ date: '', value: 0 }, ...Array.from(daily, ([date, pnl]) => ({date, value: balance += pnl}))];
  const low = Math.min(0, ...series.map(p => p.value)), high = Math.max(0, ...series.map(p => p.value));
  const range = high - low || 1;
  const x = (i: number) => 54 + i / Math.max(1, series.length - 1) * 650;
  const y = (value: number) => 214 - (value - low) / range * 170;
  const line = series.map((p,i) => `${i ? 'L' : 'M'} ${x(i)} ${y(p.value)}`).join(' ');
  const journal = journals[localDate()];
  const totalCharges = filteredTrades.reduce((sum,t) => sum + t.charges,0);
  const todayCount = filteredTrades.filter(t => t.date === localDate()).length;
  const winRate = Number(analytics.winRate) || 0;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  return <div className="dashboard space-y-6 lg:space-y-8">
    <section className="card dashboard-hero">
      <div className="flex flex-wrap items-center gap-3"><h1 className="page-title">{greeting}, {user.fullName.split(' ')[0] || 'Trader'} <span className="text-2xl">👋</span></h1><span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">Your trading overview</span></div>
      <p className="text-on-surface-variant mt-3 text-sm sm:text-base">Track. Learn. Improve. Grow. Here is your trading performance summary.</p>
      <div className="flex flex-wrap gap-3 items-center mt-6">
        <div className="flex flex-wrap gap-1 bg-surface-container-low border border-surface-container rounded-xl p-1" role="group" aria-label="Dashboard timeframe">{(['Today','This Week','This Month','This Year','All Time'] as TimeframeFilter[]).map(t => <button type="button" key={t} aria-pressed={t === selectedTimeframe} onClick={() => setTimeframe(t)} className={`px-3 sm:px-4 py-2.5 rounded-lg text-sm transition-colors ${t === selectedTimeframe ? 'bg-primary text-white shadow-sm font-semibold' : 'text-on-surface-variant hover:bg-white'}`}>{t}</button>)}</div>
        <Link href="/add-trade" className="btn-primary"><span className="material-symbols-outlined">add_circle</span> Record Trade</Link>
        <select aria-label="Dashboard account" className="bg-white border border-surface-container rounded-xl px-4 py-3 text-sm lg:ml-auto max-w-full" value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}><option value="ALL">All accounts</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.accountName}</option>)}</select>
      </div>
    </section>
    {mixed && <p className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">Choose an account to view monetary metrics and charts in its currency.</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
      <section className="card dashboard-metric"><div className="metric-heading"><h2>Net realized P&L</h2><span className="material-symbols-outlined text-primary">monitoring</span></div><p className={`metric-value ${analytics.netRealizedPnl < 0 ? 'text-error' : 'text-primary'}`}>{money(analytics.netRealizedPnl,true)}</p><div className="metric-footer"><span className="text-primary">{analytics.winningTrades} Wins</span><span className="text-error">{analytics.losingTrades} Losses</span><span>{analytics.breakevenTrades} Breakeven</span></div></section>
      <section className="card dashboard-metric"><div className="metric-heading"><h2>Win rate</h2><span>{analytics.winningTrades} / {closed.length} closed</span></div><div className="flex items-center justify-between mt-4"><p className="metric-value !mt-0">{closed.length ? `${winRate}%` : '—'}</p><svg width="62" height="62" viewBox="0 0 64 64" role="img" aria-label={`Win rate ${winRate}%`}><circle cx="32" cy="32" r="26" fill="none" stroke="#e9eefb" strokeWidth="6"/><circle cx="32" cy="32" r="26" fill="none" stroke="#006948" strokeWidth="6" strokeDasharray={`${winRate / 100 * 163.36} 163.36`} transform="rotate(-90 32 32)" strokeLinecap="round"/></svg></div><div className="metric-footer"><span>Based on net P&L after charges</span><span>{closed.length ? `${analytics.losingTrades} losing trades` : 'No closed trades yet'}</span></div></section>
      <section className="card dashboard-metric"><div className="metric-heading"><h2>Total trades</h2><span className="rounded-full bg-surface-container-low px-3 py-1 text-xs">{todayCount} Today</span></div><div className="flex items-end justify-between gap-3"><p className="metric-value">{filteredTrades.length}</p><div className="flex gap-2 text-xs pb-2"><span className="bg-surface-container-low rounded-md px-2 py-1">{closed.length} Closed</span><span className="bg-primary/10 text-primary rounded-md px-2 py-1">{filteredTrades.length - closed.length} Open</span></div></div><div className="metric-footer"><span>Total charges</span><span>{money(totalCharges)}</span></div></section>
      <section className="card dashboard-metric"><div className="metric-heading"><h2>Profit factor</h2><span className="material-symbols-outlined text-primary">verified</span></div><p className="metric-value">{mixed || !closed.length ? '—' : Number.isFinite(analytics.profitFactor) ? analytics.profitFactor.toFixed(2) : '∞'}</p><div className="metric-footer"><span>Avg win: <strong className="text-primary">{money(analytics.avgWin)}</strong></span><span>Avg loss: <strong className="text-error">{money(analytics.avgLoss)}</strong></span></div></section>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-5 lg:gap-6">
      <section className="card"><div className="flex items-start justify-between gap-3"><div><h2 className="section-title">Cumulative net P&L</h2><p className="text-sm text-outline mt-1">Your performance across recorded trading days</p></div><Link href="/analytics" className="text-primary text-sm">Analytics →</Link></div>
        {closed.length && !mixed ? <><div className="mt-6 flex items-baseline gap-3"><strong className={`text-2xl tabular-nums ${balance < 0 ? 'text-error' : 'text-primary'}`}>{money(balance,true)}</strong><span className="text-xs text-outline">{daily.size} trading days</span></div><svg viewBox="0 0 730 255" className="w-full mt-4" role="img" aria-label="Cumulative net profit and loss chart"><defs><linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#006948" stopOpacity=".18"/><stop offset="100%" stopColor="#006948" stopOpacity="0"/></linearGradient></defs>{[0,.5,1].map(f => <g key={f}><line x1="54" x2="704" y1={44+170*f} y2={44+170*f} stroke="#e8edf4" strokeDasharray="4 4"/><text x="46" y={48+170*f} textAnchor="end" fontSize="10" fill="#74817a">{Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:1}).format(high-range*f)}</text></g>)}<path d={`${line} L 704 214 L 54 214 Z`} fill="url(#pnlFill)"/><path d={line} fill="none" stroke={balance < 0 ? '#ba1a1a' : '#006948'} strokeWidth="3" strokeLinejoin="round"/>{series.slice(1).map((p,i) => <circle key={p.date} cx={x(i+1)} cy={y(p.value)} r="4" fill="#006948" stroke="white" strokeWidth="2"><title>{formatDate(p.date)}: {money(p.value,true)}</title></circle>)}<text x="54" y="245" fontSize="11" fill="#74817a">{formatDate(closed[0].date)}</text><text x="704" y="245" textAnchor="end" fontSize="11" fill="#74817a">{formatDate(closed[closed.length-1].date)}</text></svg></> : <div className="min-h-[230px] flex flex-col items-center justify-center gap-3 bg-surface-container-low/40 rounded-xl mt-6"><span className="material-symbols-outlined text-4xl text-primary/50">show_chart</span><p className="text-sm text-outline">{mixed ? 'Select one currency to see your curve.' : 'Your curve starts with your first closed trade.'}</p><Link href="/add-trade" className="text-primary text-sm">Record a trade →</Link></div>}
      </section>
      <section className="card"><h2 className="section-title">Daily performance</h2><p className="text-sm text-outline mt-1">Net result for your latest trading days</p><div className="mt-6 space-y-4">{!daily.size || mixed ? <p className="text-sm text-outline py-12">{mixed ? 'Choose an account to compare daily results.' : 'Daily results appear after you close a trade.'}</p> : Array.from(daily).slice(-6).reverse().map(([date,pnl]) => <div key={date}><div className="flex justify-between gap-3 text-sm mb-2"><span>{formatDate(date)}</span><strong className={pnl < 0 ? 'text-error' : 'text-primary'}>{money(pnl,true)}</strong></div><div className="h-2 rounded-full bg-surface-container-low overflow-hidden"><div className={`h-full rounded-full ${pnl < 0 ? 'bg-error/70' : 'bg-primary/70'}`} style={{width:`${Math.max(2,Math.abs(pnl)/Math.max(1,...Array.from(daily.values()).map(Math.abs))*100)}%`}}/></div></div>)}</div></section>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-5 lg:gap-6 items-start">
      <section className="card"><div className="flex justify-between gap-3 items-center mb-5"><h2 className="section-title">Recent executions</h2><Link href="/trades" className="text-primary text-sm">View all →</Link></div>{!recent.length ? <p className="py-12 text-center text-outline text-sm">No trades recorded in this timeframe.</p> : <div className="divide-y divide-surface-container">{recent.map(t => <Link key={t.id} href={`/trades/${t.id}`} className="flex items-center justify-between gap-3 py-4 hover:bg-surface-container-low/40 rounded-lg"><div className="min-w-0"><p className="font-semibold text-sm">{t.instrument} <span className={`text-[11px] rounded px-2 py-1 ml-2 ${t.side === 'BUY' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>{t.side}</span></p><p className="text-xs text-outline mt-2">{formatDate(t.date)} · {t.quantity} qty · {t.accountName}</p></div><strong className={`text-sm shrink-0 ${t.netPnl < 0 ? 'text-error' : 'text-primary'}`}>{t.status === 'OPEN' ? 'Open' : formatCurrency(t.netPnl,accounts.find(a=>a.id===t.accountId)?.currency || user.baseCurrency,true)}</strong></Link>)}</div>}</section>
      <div className="space-y-5"><section className="card"><div className="flex justify-between gap-3 mb-4"><h2 className="section-title">Today’s reflection</h2><Link href="/journal" className="text-primary text-sm">Open →</Link></div><p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 whitespace-pre-wrap">{journal?.postMarketNotes || journal?.preMarketNotes || 'Plan your session, capture your mindset, and reflect on your decisions.'}</p></section><section className="card"><div className="flex justify-between gap-3 mb-4"><h2 className="section-title">Trading accounts</h2><Link href="/accounts" className="text-primary text-sm">Manage →</Link></div>{accounts.length ? accounts.slice(0,3).map(a => <Link key={a.id} href={`/trades?account=${encodeURIComponent(a.id)}`} className="flex justify-between items-center py-3"><div><p className="text-sm font-medium">{a.accountName}</p><p className="text-xs text-outline mt-1">{a.broker} · {a.isActive ? 'Active' : 'Archived'}</p></div><span className="text-outline">→</span></Link>) : <Link href="/accounts" className="text-primary text-sm">Add your first account →</Link>}</section></div>
    </div>
    <p className="text-xs text-outline">Your journal is saved on this browser. Back up your records from Settings.</p>
  </div>;
}
