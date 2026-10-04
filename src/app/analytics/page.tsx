'use client';
import { useTrades } from '../../context/TradeContext';
import { formatCurrency } from '../../lib/utils';
import { TradeFilters } from '../../components/common/TradeFilters';

export default function AnalyticsPage() {
  const { user, accounts, analytics: a, filteredTrades, setupStats, emotionStats, intradayEquityCurve } = useTrades();
  const currencies = new Set(filteredTrades.map(t => accounts.find(x => x.id === t.accountId)?.currency || user.baseCurrency));
  const currency = accounts.find(x => x.id === filteredTrades[0]?.accountId)?.currency || user.baseCurrency;
  const mixed = currencies.size > 1;
  const money = (n: number) => mixed ? '—' : formatCurrency(n, currency, true);
  const maxEquity = Math.max(1, ...intradayEquityCurve.map(p => Math.abs(p.cumulative)));
  return <div className="space-y-5"><div><h1 className="page-title">Trade analytics</h1><p className="text-sm text-on-surface-variant mt-1">Performance based on your closed trades after charges.</p></div><TradeFilters />
    {mixed && <p className="text-sm text-on-surface-variant">Choose one account to view monetary metrics in its currency.</p>}
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">{[['Net P&L', money(a.netRealizedPnl)], ['Win rate', a.totalTrades ? `${a.winRate}%` : '—'], ['Closed trades', a.totalTrades], ['Open positions', filteredTrades.filter(t => t.status === 'OPEN').length], ['Average win', money(a.avgWin)], ['Average loss', money(-a.avgLoss)], ['Profit factor', Number.isFinite(a.profitFactor) ? a.profitFactor.toFixed(2) : '∞'], ['Max drawdown', money(-a.maxDrawdown)]].map(([label, value]) => <div className="card" key={label}><p className="text-xs text-outline">{label}</p><p className="text-xl sm:text-2xl mt-3 font-medium tabular-nums">{value}</p></div>)}</div>
    <section className="card space-y-4"><h2 className="section-title">Cumulative realized P&amp;L</h2>{!intradayEquityCurve.length || mixed ? <p className="text-sm text-outline">{mixed ? 'Select a single-currency account to view this chart.' : 'Close a trade to see your equity history.'}</p> : <div className="space-y-2">{intradayEquityCurve.map((p, i) => <div key={i} className="grid grid-cols-[60px_1fr_90px] sm:grid-cols-[90px_1fr_120px] items-center gap-3 text-xs"><span className="text-outline">Trade {i + 1}</span><div className="bg-surface-container-low rounded h-3"><div className={`h-3 rounded ${p.cumulative < 0 ? 'bg-error/60' : 'bg-primary/60'}`} style={{ width: `${Math.max(1, Math.abs(p.cumulative) / maxEquity * 100)}%` }} /></div><span className="tabular-nums text-right">{money(p.cumulative)}</span></div>)}</div>}</section>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">{[['By setup', setupStats.map(s => ({ name: s.setup, ...s }))], ['By emotion', emotionStats.map(s => ({ name: s.emotion, ...s }))]].map(([title, rows]) => <section key={String(title)} className="card space-y-3"><h2 className="section-title">{String(title)}</h2>{(rows as { name: string; count: number; winRate: number; netPnl: number }[]).length ? (rows as { name: string; count: number; winRate: number; netPnl: number }[]).map(s => <div key={s.name} className="flex justify-between gap-3 border-b border-surface-container py-3 text-sm"><div><p>{s.name}</p><p className="text-xs text-outline mt-1">{s.count} trades · {s.winRate}% wins</p></div><p className={`tabular-nums ${s.netPnl < 0 ? 'text-error' : 'text-primary'}`}>{money(s.netPnl)}</p></div>) : <p className="text-sm text-outline">No closed trades yet.</p>}</section>)}</div>
  </div>;
}
