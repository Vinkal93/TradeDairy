'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTrades } from '../../context/TradeContext';
import { Trade } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { TradeFilters } from '../../components/common/TradeFilters';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { fieldClass } from '../../components/common/ChargeEditor';

export default function TradesPage() {
  return (
    <Suspense fallback={<p className="text-xs text-on-surface-variant p-4">Loading trades…</p>}>
      <TradeLog />
    </Suspense>
  );
}

function TradeLog() {
  const params = useSearchParams();
  const q = params.get('q') || '';
  const accountParam = params.get('account');
  const {
    accounts,
    user,
    filteredTrades,
    deleteTrade,
    setSelectedAccount,
    setTimeframe,
    exportTradesCSV,
    importTradesCSV,
  } = useTrades();

  const [search, setSearch] = useState(q);
  const [status, setStatus] = useState('ALL');
  const [side, setSide] = useState('ALL');
  const [importOpen, setImportOpen] = useState(false);
  const [csv, setCsv] = useState('');
  const [notice, setNotice] = useState('');
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);

  useEffect(() => {
    setSearch(q);
  }, [q]);

  useEffect(() => {
    if (accountParam && accounts.some((a) => a.id === accountParam)) {
      setSelectedAccount(accountParam);
      setTimeframe('All Time');
    }
  }, [accountParam, accounts, setSelectedAccount, setTimeframe]);

  const displayed = useMemo(
    () =>
      filteredTrades
        .filter(
          (t) =>
            (status === 'ALL' ||
              (status === 'OPEN'
                ? t.status === 'OPEN'
                : status === 'CLOSED'
                ? t.status === 'CLOSED'
                : status === 'WIN'
                ? t.status === 'CLOSED' && t.netPnl > 0
                : t.status === 'CLOSED' && t.netPnl < 0)) &&
            (side === 'ALL' || t.side === side) &&
            (!search.trim() ||
              [t.instrument, t.id, t.setup, t.notes, t.emotion, t.accountName].some((value) =>
                value?.toLowerCase().includes(search.trim().toLowerCase())
              ))
        )
        .sort((a, b) =>
          `${b.date} ${b.entryTime || ''}`.localeCompare(`${a.date} ${a.entryTime || ''}`)
        ),
    [filteredTrades, status, side, search]
  );

  const exportCSV = () => {
    const url = URL.createObjectURL(
      new Blob([exportTradesCSV()], { type: 'text/csv;charset=utf-8' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `TradeDairy-trades-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleConfirmDelete = () => {
    if (!tradeToDelete) return;
    try {
      deleteTrade(tradeToDelete.id);
      setNotice(`Trade ${tradeToDelete.instrument} deleted successfully.`);
      setTradeToDelete(null);
    } catch {
      setNotice('Could not delete trade.');
      setTradeToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary mb-3">TRADING LEDGER</p>
          <h1 className="page-title text-on-surface">Trade Log &amp; History</h1>
          <p className="text-sm text-on-surface-variant mt-3">
            Search, filter, review contract notes, or export your execution journal.
          </p>
        </div>
        <Link className="btn-primary text-xs sm:text-sm font-semibold py-1.5 px-3" href="/add-trade">
          <span className="material-symbols-outlined text-[17px]">add_circle</span>
          <span>+ Record Trade</span>
        </Link>
      </div>

      {notice && (
        <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center justify-between">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice('')}
            className="text-primary hover:opacity-75"
          >
            ✕
          </button>
        </div>
      )}

      {/* Account & Date Filters */}
      <TradeFilters />

      {/* Filter & Search Bar */}
      <section className="card space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <label className="field-label">
            Search
            <input
              className={fieldClass}
              type="search"
              value={search}
              placeholder="Instrument, setup, tags..."
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label className="field-label">
            Status
            <select
              className={fieldClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ALL">All Trades ({filteredTrades.length})</option>
              <option value="OPEN">Open Positions</option>
              <option value="CLOSED">Closed Positions</option>
              <option value="WIN">Profitable Only</option>
              <option value="LOSS">Loss Only</option>
            </select>
          </label>
          <label className="field-label">
            Side
            <select className={fieldClass} value={side} onChange={(e) => setSide(e.target.value)}>
              <option value="ALL">All Sides (BUY &amp; SELL)</option>
              <option value="BUY">BUY Long</option>
              <option value="SELL">SELL Short</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between pt-1 border-t border-surface-container/60">
          <span className="text-xs text-outline font-medium">
            {displayed.length} trades match current view
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary text-xs py-1.5 px-2.5 h-8"
              onClick={() => {
                setNotice('');
                setImportOpen(true);
              }}
            >
              <span className="material-symbols-outlined text-[15px]">file_upload</span>
              <span>Import CSV</span>
            </button>
            <button
              type="button"
              className="btn-secondary text-xs py-1.5 px-2.5 h-8"
              onClick={exportCSV}
            >
              <span className="material-symbols-outlined text-[15px]">file_download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </section>

      {/* Trade Cards Grid */}
      {!!displayed.length && <div className="hidden lg:block card !p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm text-left min-w-[900px]"><thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wide"><tr>{['Date & time','Instrument','Side','Qty','Entry','Exit','Net P&L','ROI','Setup','Actions'].map(label => <th className="px-5 py-5 font-medium" key={label}>{label}</th>)}</tr></thead><tbody className="divide-y divide-surface-container">{displayed.map(t => { const currency = accounts.find(a => a.id === t.accountId)?.currency || user.baseCurrency; return <tr key={t.id} className="hover:bg-surface-container-low/30"><td className="px-5 py-5 whitespace-nowrap"><p className="font-medium">{formatDate(t.date)}</p><p className="text-xs text-outline mt-1">{t.entryTime}</p></td><td className="px-5 py-5"><Link className="font-semibold hover:text-primary" href={`/trades/${t.id}`}>{t.instrument}</Link><p className="text-xs text-outline mt-1">{t.assetClass} · {t.accountName}</p></td><td className="px-5 py-5"><span className={`rounded-full px-2 py-1 text-xs ${t.side === 'BUY' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>{t.side}</span></td><td className="px-5 py-5">{t.quantity}</td><td className="px-5 py-5 whitespace-nowrap">{formatCurrency(t.entryPrice,currency)}</td><td className="px-5 py-5 whitespace-nowrap">{t.exitPrice ? formatCurrency(t.exitPrice,currency) : '—'}</td><td className={`px-5 py-5 whitespace-nowrap font-semibold ${t.netPnl < 0 ? 'text-error' : 'text-primary'}`}>{t.status === 'OPEN' ? 'Open' : formatCurrency(t.netPnl,currency,true)}</td><td className="px-5 py-5">{t.status === 'CLOSED' ? `${t.roi}%` : '—'}</td><td className="px-5 py-5">{t.setup || '—'}</td><td className="px-5 py-5"><div className="flex gap-3"><Link href={`/trades/${t.id}`} aria-label={`View ${t.instrument}`}><span className="material-symbols-outlined text-xl">visibility</span></Link><Link href={`/add-trade?edit=${encodeURIComponent(t.id)}`} aria-label={`Edit ${t.instrument}`}><span className="material-symbols-outlined text-xl">edit</span></Link><button type="button" onClick={() => setTradeToDelete(t)} aria-label={`Delete ${t.instrument}`}><span className="material-symbols-outlined text-xl text-outline">delete</span></button></div></td></tr>;})}</tbody></table></div></div>}
      {!displayed.length ? (
        <div className="card text-center py-10 space-y-2.5">
          <span className="material-symbols-outlined text-[36px] text-outline/50">search_off</span>
          <h2 className="section-title">No trades found</h2>
          <p className="text-xs text-outline">
            No trades match your search or filters. Clear filters or record a new trade.
          </p>
          <Link href="/add-trade" className="btn-primary text-xs inline-flex mt-1">
            + Record Trade
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
          {displayed.map((t) => {
            const acc = accounts.find((a) => a.id === t.accountId);
            const currency = acc?.currency || user.baseCurrency;

            return (
              <div
                key={t.id}
                className="card hover:border-primary/40 transition-all space-y-2.5 relative group py-3 px-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <Link href={`/trades/${t.id}`} className="min-w-0 flex-1 group-hover:underline">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-xs sm:text-sm font-bold text-on-surface break-words">
                          {t.instrument}
                        </h2>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            t.side === 'BUY'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-error-container/40 text-error'
                          }`}
                        >
                          {t.side}
                        </span>
                      </div>
                      <p className="text-[11px] text-outline mt-0.5">
                        {formatDate(t.date)} • {t.entryTime || '—'}
                      </p>
                    </Link>

                    <div className="text-right shrink-0">
                      <p
                        className={`tabular-nums text-xs sm:text-sm font-bold ${
                          t.netPnl < 0 ? 'text-error' : 'text-primary'
                        }`}
                      >
                        {t.status === 'OPEN' ? 'Open' : formatCurrency(t.netPnl, currency, true)}
                      </p>
                      <p className="text-[10px] text-outline">
                        {t.status === 'OPEN' ? 'In position' : 'Net P&L'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[11px] mt-2.5 pt-2 border-t border-surface-container/60">
                    <div>
                      <span className="text-outline block text-[10px]">Entry Price</span>
                      <span className="font-semibold text-on-surface">
                        {formatCurrency(t.entryPrice, currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-outline block text-[10px]">Exit Price</span>
                      <span className="font-semibold text-on-surface">
                        {t.exitPrice !== undefined ? formatCurrency(t.exitPrice, currency) : 'Pending'}
                      </span>
                    </div>
                    <div>
                      <span className="text-outline block text-[10px]">Quantity</span>
                      <span className="font-semibold text-on-surface">{t.quantity}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-container/60 text-[11px]">
                  <span className="text-outline truncate max-w-[150px]">
                    {acc?.accountName || t.accountName}
                  </span>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/add-trade?edit=${encodeURIComponent(t.id)}`}
                      className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors"
                      title="Edit Trade"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setTradeToDelete(t)}
                      className="p-1 rounded text-outline hover:text-error hover:bg-error-container/30 transition-colors cursor-pointer"
                      title="Delete Trade"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>

                    <Link
                      href={`/trades/${t.id}`}
                      className="text-primary hover:underline font-semibold ml-1 text-xs"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CSV Import Modal */}
      {importOpen && (
        <Modal title="Import Trades from CSV" onClose={() => setImportOpen(false)}>
          <div className="space-y-3">
            <p className="text-xs text-on-surface-variant">
              Upload or paste a TradeDairy CSV export. Corresponding Demat accounts should be added
              first.
            </p>
            <label className="field-label">
              Select CSV File
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      setNotice('File is larger than 5 MB.');
                    } else {
                      setCsv(await file.text());
                    }
                  }
                }}
              />
            </label>
            <label className="field-label">
              Or Paste CSV Content
              <textarea
                className={fieldClass}
                rows={6}
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn-primary w-full text-xs"
              disabled={!csv.trim()}
              onClick={() => {
                const count = importTradesCSV(csv);
                setNotice(
                  count
                    ? `${count} trades imported and saved successfully.`
                    : 'No valid rows found to import. Check format and account IDs.'
                );
                if (count) {
                  setCsv('');
                  setImportOpen(false);
                }
              }}
            >
              Import &amp; Save Trades
            </button>
          </div>
        </Modal>
      )}

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(tradeToDelete)}
        title="Delete Trade Record"
        message={
          <div>
            <p>
              Are you sure you want to delete{' '}
              <strong className="text-on-surface">{tradeToDelete?.instrument}</strong> (
              {tradeToDelete?.side} • {tradeToDelete?.quantity} qty)?
            </p>
            <p className="mt-2 text-xs text-error font-medium">
              This action cannot be undone. Realized P&amp;L and win rate will update immediately.
            </p>
          </div>
        }
        confirmText="Delete Trade"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setTradeToDelete(null)}
      />
    </div>
  );
}
