'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTrades } from '../../context/TradeContext';
import { TradingAccount } from '../../types';
import { DEFAULT_CHARGES } from '../../lib/charges';
import { formatCurrency } from '../../lib/utils';
import { decryptPassword } from '../../lib/vault';
import { AccountForm } from '../../components/common/AccountForm';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { fieldClass } from '../../components/common/ChargeEditor';

export default function AccountsPage() {
  const { accounts, trades, updateAccount, deleteAccount } = useTrades();
  const [editing, setEditing] = useState<TradingAccount | 'new' | null>(null);
  const [unlocking, setUnlocking] = useState<TradingAccount | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [revealed, setRevealed] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<TradingAccount | null>(null);

  const closeVault = () => {
    setUnlocking(null);
    setPassphrase('');
    setRevealed('');
    setError('');
  };

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlocking?.encryptedPassword) return;
    setBusy(true);
    setError('');
    try {
      setRevealed(await decryptPassword(unlocking.encryptedPassword, passphrase));
      setPassphrase('');
    } catch {
      setError('Incorrect passphrase or damaged encrypted password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title & Action */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="page-title text-on-surface">Trading Accounts</h1>
          <p className="text-xs sm:text-[13px] text-on-surface-variant mt-0.5">
            Your connected brokers, capital, vault credentials, and brokerage calculation rules.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary text-xs sm:text-sm font-semibold py-1.5 px-3"
          onClick={() => setEditing('new')}
        >
          <span className="material-symbols-outlined text-[17px]">add_circle</span>
          <span>+ Add Account</span>
        </button>
      </div>

      {error && !unlocking && (
        <div className="p-3 rounded-lg bg-error-container/30 border border-error/30 text-xs text-error font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {accounts.length === 0 && (
        <div className="card text-center py-10 space-y-3">
          <h2 className="section-title">Add your first account</h2>
          <p className="text-xs text-on-surface-variant">
            Choose your broker and per-order brokerage to calculate trade charges automatically.
          </p>
          <button className="btn-primary inline-flex text-xs" onClick={() => setEditing('new')}>
            Add trading account
          </button>
        </div>
      )}

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
        {accounts.map((a) => {
          const all = trades.filter((t) => t.accountId === a.id);
          const closed = all.filter((t) => t.status === 'CLOSED');
          const pnl = closed.reduce((sum, t) => sum + t.netPnl, 0);
          const charges = all.reduce((sum, t) => sum + t.charges, 0);
          const wins = closed.filter((t) => t.netPnl > 0).length;

          return (
            <section className="card space-y-3" key={a.id}>
              <div className="flex justify-between items-start gap-2.5 pb-2 border-b border-surface-container/60">
                <div className="min-w-0">
                  <h2 className="section-title break-words">{a.accountName}</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {a.broker} • Base {a.currency}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase rounded-full px-2 py-0.5 ${
                    a.isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-surface-container text-outline'
                  }`}
                >
                  {a.isActive ? 'Active' : 'Archived'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <p className="text-outline mb-0.5">Starting Capital</p>
                  <p className="tabular-nums font-semibold text-on-surface">
                    {formatCurrency(a.capital, a.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-outline mb-0.5">Realized P&amp;L</p>
                  <p
                    className={`tabular-nums font-bold ${
                      pnl < 0 ? 'text-error' : 'text-primary'
                    }`}
                  >
                    {formatCurrency(pnl, a.currency, true)}
                  </p>
                </div>
                <div>
                  <p className="text-outline mb-0.5">Trades</p>
                  <p className="font-semibold text-on-surface">
                    {closed.length} closed • {all.length - closed.length} open
                  </p>
                </div>
                <div>
                  <p className="text-outline mb-0.5">Win Rate</p>
                  <p className="font-semibold text-on-surface">
                    {closed.length ? `${((wins / closed.length) * 100).toFixed(1)}%` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-outline mb-0.5">Brokerage Rate</p>
                  <p className="font-semibold text-on-surface">
                    ₹{(a.chargeConfig || DEFAULT_CHARGES).brokeragePerOrder} / order
                  </p>
                </div>
                <div>
                  <p className="text-outline mb-0.5">Charges Paid</p>
                  <p className="tabular-nums font-semibold text-outline">
                    {formatCurrency(charges, a.currency)}
                  </p>
                </div>
              </div>

              <details className="rounded-lg bg-surface-container-low/80 p-2.5 text-xs">
                <summary className="font-medium cursor-pointer text-on-surface">
                  Account Credentials &amp; Vault
                </summary>
                <div className="mt-2 space-y-1.5 pt-2 border-t border-surface-container/60">
                  <p className="break-all text-on-surface-variant">
                    Client ID: {a.brokerLoginId || a.accountNumber || 'Not added'}
                  </p>
                  <p className="text-on-surface-variant">
                    Password:{' '}
                    {a.encryptedPassword
                      ? 'Encrypted in client browser vault'
                      : 'No password saved'}
                  </p>
                  {a.encryptedPassword && (
                    <button
                      type="button"
                      className="btn-secondary text-xs py-1 px-2.5 h-7 mt-1"
                      onClick={() => {
                        setUnlocking(a);
                        setError('');
                      }}
                    >
                      <span className="material-symbols-outlined text-[14px]">key</span>
                      <span>Unlock Password</span>
                    </button>
                  )}
                </div>
              </details>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-surface-container/60">
                <Link
                  className="btn-secondary text-xs py-1.5 px-2.5 h-8"
                  href={`/trades?account=${encodeURIComponent(a.id)}`}
                >
                  <span className="material-symbols-outlined text-[15px]">visibility</span>
                  <span>View Trades</span>
                </Link>

                <button
                  type="button"
                  className="btn-secondary text-xs py-1.5 px-2.5 h-8"
                  onClick={() => setEditing(a)}
                >
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                  <span>Edit Account</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary text-xs py-1.5 px-2.5 h-8"
                  onClick={() => {
                    try {
                      updateAccount(a.id, { isActive: !a.isActive });
                    } catch {
                      setError('Could not update account status.');
                    }
                  }}
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {a.isActive ? 'archive' : 'unarchive'}
                  </span>
                  <span>{a.isActive ? 'Archive' : 'Activate'}</span>
                </button>

                {all.length === 0 && (
                  <button
                    type="button"
                    className="btn-secondary text-xs text-error hover:bg-error-container/30 border-error/30 py-1.5 px-2.5 h-8 ml-auto"
                    onClick={() => setAccountToDelete(a)}
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-[11px] text-on-surface-variant">
        Accounts and credentials are saved locally in your browser. Export a backup from Settings before clearing browser data.
      </p>

      {/* Account Edit/Create Modal */}
      {editing && (
        <Modal
          title={editing === 'new' ? 'Add Trading Account' : 'Edit Trading Account'}
          onClose={() => setEditing(null)}
        >
          <AccountForm
            initial={editing === 'new' ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => setEditing(null)}
          />
        </Modal>
      )}

      {/* Password Vault Modal */}
      {unlocking && (
        <Modal title="Unlock Broker Password" onClose={closeVault}>
          {error && <p role="alert" className="text-error mb-3 text-xs">{error}</p>}
          {revealed ? (
            <div className="space-y-3">
              <label className="field-label">
                Broker password
                <input className={fieldClass} readOnly value={revealed} autoComplete="off" />
              </label>
              <p className="text-xs text-outline">
                Close this dialog to remove the decrypted password from memory.
              </p>
              <button className="btn-primary text-xs" onClick={closeVault}>
                Lock again
              </button>
            </div>
          ) : (
            <form onSubmit={unlock} className="space-y-3">
              <label className="field-label">
                Vault passphrase
                <input
                  className={fieldClass}
                  type="password"
                  autoComplete="off"
                  required
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                />
              </label>
              <button disabled={busy} className="btn-primary w-full text-xs">
                {busy ? 'Unlocking…' : 'Unlock Password'}
              </button>
            </form>
          )}
        </Modal>
      )}

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(accountToDelete)}
        title="Delete Trading Account"
        message={
          <div>
            <p>
              Are you sure you want to permanently delete account{' '}
              <strong className="text-on-surface">{accountToDelete?.accountName}</strong> (
              {accountToDelete?.broker})?
            </p>
            <p className="mt-2 text-xs text-error font-medium">
              Only accounts with 0 recorded trades can be deleted. This action cannot be undone.
            </p>
          </div>
        }
        confirmText="Delete Account"
        confirmVariant="danger"
        onConfirm={() => {
          if (!accountToDelete) return;
          try {
            deleteAccount(accountToDelete.id);
            setAccountToDelete(null);
          } catch {
            setError('Could not delete account.');
            setAccountToDelete(null);
          }
        }}
        onClose={() => setAccountToDelete(null)}
      />
    </div>
  );
}
