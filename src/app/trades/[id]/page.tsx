'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTrades } from '../../../context/TradeContext';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { CHARGE_LABELS } from '../../../lib/charges';
import { ConfirmModal } from '../../../components/common/ConfirmModal';

export default function TradeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { accounts, trades, getTradeById, deleteTrade, user } = useTrades();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const t = getTradeById(params.id as string);

  if (!t) {
    return (
      <div className="card space-y-3 max-w-xl mx-auto text-center py-10">
        <h1 className="page-title text-on-surface">Trade Not Found</h1>
        <p className="text-xs text-on-surface-variant">This trade may have been deleted or the ID is invalid.</p>
        <Link href="/trades" className="btn-primary inline-flex text-xs">
          Return to Trades
        </Link>
      </div>
    );
  }

  const account = accounts.find((a) => a.id === t.accountId);
  const currency = account?.currency || user.baseCurrency;
  const index = trades.findIndex((x) => x.id === t.id);
  const previous = trades[index - 1];
  const next = trades[index + 1];

  const handleDeleteConfirm = () => {
    setIsDeleting(true);
    try {
      deleteTrade(t.id);
      router.push('/trades');
    } catch (err) {
      console.error('Delete error', err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Navigation Top */}
      <div className="flex items-center justify-between">
        <Link
          href="/trades"
          className="text-xs font-semibold text-outline hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>All Trades</span>
        </Link>

        <div className="flex items-center gap-2">
          {previous && (
            <Link
              href={`/trades/${previous.id}`}
              className="btn-secondary text-xs py-1.5 px-2.5 h-8"
              title="Previous Trade"
            >
              ← Prev
            </Link>
          )}
          {next && (
            <Link
              href={`/trades/${next.id}`}
              className="btn-secondary text-xs py-1.5 px-2.5 h-8"
              title="Next Trade"
            >
              Next →
            </Link>
          )}
        </div>
      </div>

      {/* Main Title & Action Bar */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="page-title break-words">{t.instrument}</h1>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                t.side === 'BUY'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-error-container/40 text-error'
              }`}
            >
              {t.side}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                t.status === 'OPEN'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {t.status === 'OPEN' ? 'OPEN POSITION' : 'CLOSED'}
            </span>
          </div>
          <p className="text-xs text-outline mt-1">
            {formatDate(t.date)} • {account?.accountName || t.accountName} • {t.quantity} qty
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/add-trade?edit=${encodeURIComponent(t.id)}`}
            className="btn-primary text-xs py-1.5 px-3"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>{t.status === 'OPEN' ? 'Add Exit / Edit' : 'Edit Trade'}</span>
          </Link>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="btn-secondary text-xs text-error hover:bg-error-container/30 border-error/30 py-1.5 px-3"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          [
            'Gross P&L',
            t.status === 'OPEN' ? '—' : formatCurrency(t.grossPnl, currency, true),
            t.grossPnl < 0 ? 'text-error' : 'text-primary',
          ],
          ['Charges & Taxes', formatCurrency(t.charges, currency), 'text-outline'],
          [
            'Net P&L',
            t.status === 'OPEN' ? 'Pending exit' : formatCurrency(t.netPnl, currency, true),
            t.netPnl < 0 ? 'text-error' : 'text-primary',
          ],
          ['ROI on Entry', t.status === 'OPEN' ? '—' : `${t.roi}%`, 'text-on-surface'],
        ].map(([label, value, color]) => (
          <div className="card py-3 px-3.5" key={label}>
            <p className="text-xs text-outline font-medium">{label}</p>
            <p className={`text-lg sm:text-xl font-bold mt-1.5 tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Execution Details & Charges Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        <section className="card space-y-3">
          <h2 className="section-title flex items-center gap-1.5 pb-2 border-b border-surface-container/60">
            <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
            <span>Execution Details</span>
          </h2>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            {[
              ['Entry Side', t.side],
              ['Quantity', t.quantity],
              ['Entry Price', formatCurrency(t.entryPrice, currency)],
              [
                'Exit Price',
                t.exitPrice !== undefined ? formatCurrency(t.exitPrice, currency) : 'Not recorded',
              ],
              ['Entry Time', t.entryTime || 'Not recorded'],
              ['Exit Time', t.exitTime || 'Not recorded'],
              ['Segment', t.segment ? CHARGE_LABELS[t.segment] : t.assetClass],
              ['Stop Loss', t.stopLoss ? formatCurrency(t.stopLoss, currency) : 'Not set'],
              ['Target', t.target ? formatCurrency(t.target, currency) : 'Not set'],
              ['Planned R:R', t.rrRatio ? `${t.rrRatio} : 1` : 'Not set'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-outline mb-0.5">{label}</dt>
                <dd className="font-semibold text-on-surface">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="card space-y-3">
          <h2 className="section-title flex items-center gap-1.5 pb-2 border-b border-surface-container/60">
            <span className="material-symbols-outlined text-primary text-[18px]">calculate</span>
            <span>Recorded Charge Breakdown</span>
          </h2>

          {t.chargeBreakdown ? (
            <dl className="space-y-1.5 text-xs">
              {[
                ['Brokerage', t.chargeBreakdown.brokerage],
                ['STT (Securities Transaction Tax)', t.chargeBreakdown.stt],
                ['Exchange Turnover Charges', t.chargeBreakdown.exchange],
                ['SEBI Turnover Charges', t.chargeBreakdown.sebi],
                ['Stamp Duty', t.chargeBreakdown.stamp],
                ['GST', t.chargeBreakdown.gst],
                ['DP Charges (Delivery)', t.chargeBreakdown.dp],
                ['Other / Misc Fees', t.chargeBreakdown.other],
              ].map(([label, value]) => (
                <div className="flex justify-between py-0.5" key={label}>
                  <dt className="text-on-surface-variant">{label}</dt>
                  <dd className="tabular-nums font-semibold text-on-surface">
                    {formatCurrency(Number(value), currency)}
                  </dd>
                </div>
              ))}
              <div className="flex justify-between pt-1.5 border-t border-surface-container font-bold text-xs">
                <span>Total Charges & Taxes</span>
                <span className="tabular-nums text-error">{formatCurrency(t.charges, currency)}</span>
              </div>
            </dl>
          ) : (
            <p className="text-xs text-outline py-2">
              Total charges recorded manually: {formatCurrency(t.charges, currency)}.
            </p>
          )}
        </section>
      </div>

      {/* Notes & Discipline */}
      <section className="card space-y-3">
        <h2 className="section-title flex items-center gap-1.5 pb-2 border-b border-surface-container/60">
          <span className="material-symbols-outlined text-primary text-[18px]">psychology</span>
          <span>Notes, Setup & Psychology</span>
        </h2>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface font-medium">
            Setup: {t.setup || 'General Setup'}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface font-medium">
            Emotion: {t.emotion || 'Calm'}
          </span>
          <span
            className={`px-2.5 py-1 rounded-md font-medium ${
              t.rulesFollowed ? 'bg-primary/10 text-primary' : 'bg-error-container/30 text-error'
            }`}
          >
            {t.rulesFollowed ? '✓ Trading Rules Followed' : '✗ Rules Broken'}
          </span>
        </div>
        <p className="text-xs sm:text-sm whitespace-pre-wrap text-on-surface-variant leading-relaxed">
          {t.notes || 'No reflections or trade notes added for this position.'}
        </p>
        {t.chartImage && (
          <img
            src={t.chartImage}
            alt="Trade chart screenshot"
            className="w-full max-h-[420px] object-contain rounded-lg border border-surface-container"
          />
        )}
      </section>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-outline pt-1">
        <span>Trade Record ID: {t.id}</span>
        <span>Saved: {formatDate(t.createdAt)}</span>
      </div>

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Trade Record"
        message={
          <div>
            <p>
              Are you sure you want to permanently delete this trade record for{' '}
              <strong className="text-on-surface">{t.instrument}</strong> ({t.side} • {t.quantity}{' '}
              units)?
            </p>
            <p className="mt-2 text-xs text-error font-medium">
              This action cannot be undone and will update your cumulative analytics.
            </p>
          </div>
        }
        confirmText="Delete Trade"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
