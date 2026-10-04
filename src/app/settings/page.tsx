'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTrades } from '../../context/TradeContext';
import { UserProfile } from '../../types';
import { fieldClass } from '../../components/common/ChargeEditor';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export default function SettingsPage() {
  const {
    user,
    updateUser,
    accounts,
    trades,
    journals,
    eraseAllData,
    exportTradesCSV,
  } = useTrades();

  const [tab, setTab] = useState<'profile' | 'risk' | 'data'>('profile');
  const [name, setName] = useState(user.fullName === 'Trader' ? '' : user.fullName);
  const [alias, setAlias] = useState(user.tradingAlias || '');
  const [currency, setCurrency] = useState(user.baseCurrency);
  const [experience, setExperience] = useState(user.experience);
  const [loss, setLoss] = useState(user.dailyMaxLoss || 0);
  const [limit, setLimit] = useState(user.dailyMaxTrades || 0);
  const [risk, setRisk] = useState(user.defaultRiskPerTrade || 0);
  const [notice, setNotice] = useState('');
  const [eraseModalOpen, setEraseModalOpen] = useState(false);

  const download = (content: string, filename: string, type: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      updateUser({
        fullName: name.trim() || user.fullName,
        tradingAlias: alias.trim(),
        baseCurrency: currency,
        experience,
        dailyMaxLoss: loss,
        dailyMaxTrades: limit,
        defaultRiskPerTrade: risk,
      });
      setNotice('Settings saved successfully.');
    } catch {
      setNotice('Could not save settings. Please check browser storage.');
    }
  };

  const handleEraseConfirm = () => {
    try {
      eraseAllData();
      setEraseModalOpen(false);
      setNotice('All recorded trades and daily journals have been permanently erased.');
    } catch {
      setNotice('Could not erase data.');
      setEraseModalOpen(false);
    }
  };

return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="page-title text-on-surface">Settings & Preferences</h1>
        <p className="text-xs sm:text-[13px] text-on-surface-variant mt-0.5">
          Configure trader persona, risk limits, broker charges, and data backups.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Settings sections">
        {[
          ['profile', 'Profile & Persona'],
          ['risk', 'Risk Shield Limits'],
          ['data', 'Data & Backups'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id as 'profile' | 'risk' | 'data');
              setNotice('');
            }}
            className={`rounded-lg py-2 px-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              tab === id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-white border border-surface-container text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {notice && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{notice}</span>
        </div>
      )}

      {tab !== 'data' ? (
        <form className="card space-y-4" onSubmit={save}>
          {tab === 'profile' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="field-label">
                  Your Full Name
                  <input
                    className={fieldClass}
                    required
                    value={name}
                    placeholder="e.g. Vinkal Prajapati"
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="field-label">
                  Trading Alias (Optional)
                  <input
                    className={fieldClass}
                    value={alias}
                    placeholder="e.g. ScalpMaster"
                    onChange={(e) => setAlias(e.target.value)}
                  />
                </label>
                <label className="field-label">
                  Base Currency
                  <select
                    className={fieldClass}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as UserProfile['baseCurrency'])}
                  >
                    {['INR', 'USD', 'EUR', 'GBP'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="field-label">
                  Experience Level
                  <select
                    className={fieldClass}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value as UserProfile['experience'])}
                  >
                    <option value="beginner">Beginner (&lt; 1 Year)</option>
                    <option value="intermediate">Intermediate (1 - 3 Years)</option>
                    <option value="advanced">Advanced (3+ Years)</option>
                  </select>
                </label>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container-low/70 border border-surface-container text-xs text-on-surface-variant flex items-center justify-between">
                <span>
                  {user.email ? `Signed-in Email: ${user.email}` : 'Local Browser Workspace'}
                </span>
                <Link href="/login" className="text-primary font-bold hover:underline">
                  {user.isLoggedIn ? 'Account Status' : 'Sign in / Switch'}
                </Link>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <Link href="/accounts" className="btn-secondary text-xs py-1.5 px-3">
                  <span className="material-symbols-outlined text-[15px]">account_balance</span>
                  <span>Manage Trading Accounts</span>
                </Link>
                <Link href="/settings/charges" className="btn-secondary text-xs py-1.5 px-3">
                  <span className="material-symbols-outlined text-[15px]">calculate</span>
                  <span>Broker Charges Rules</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-on-surface-variant">
                Set strict risk parameters to protect capital. Setting 0 disables the limit.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="field-label">
                  Daily Maximum Loss ({currency})
                  <input
                    className={fieldClass}
                    type="number"
                    min="0"
                    step="100"
                    value={loss}
                    onChange={(e) => setLoss(Number(e.target.value))}
                  />
                </label>
                <label className="field-label">
                  Max Trades Per Day
                  <input
                    className={fieldClass}
                    type="number"
                    min="0"
                    step="1"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                  />
                </label>
                <label className="field-label">
                  Default Risk Per Trade (%)
                  <input
                    className={fieldClass}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={risk}
                    onChange={(e) => setRisk(Number(e.target.value))}
                  />
                </label>
              </div>
            </>
          )}

          <div className="pt-2 border-t border-surface-container/60">
            <button type="submit" className="btn-primary text-xs py-2 px-4">
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3.5">
          {/* Export section */}
          <section className="card space-y-3">
            <h2 className="section-title flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">download</span>
              <span>Export &amp; Backups</span>
            </h2>
            <p className="text-xs text-on-surface-variant">
              {trades.length} trades recorded • {accounts.length} demat accounts •{' '}
              {Object.keys(journals).length} daily journal reflections. Data is stored safely on your
              device.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                className="btn-primary text-xs py-1.5 px-3"
                onClick={() =>
                  download(
                    JSON.stringify(
                      {
                        version: 1,
                        exportedAt: new Date().toISOString(),
                        user,
                        accounts,
                        trades,
                        journals,
                      },
                      null,
                      2
                    ),
                    `TradeDairy-backup-${new Date().toISOString().slice(0, 10)}.json`,
                    'application/json'
                  )
                }
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                <span>Download Full JSON Backup</span>
              </button>

              <button
                type="button"
                className="btn-secondary text-xs py-1.5 px-3"
                onClick={() =>
                  download(exportTradesCSV(), 'TradeDairy-all-trades.csv', 'text/csv')
                }
              >
                <span className="material-symbols-outlined text-[16px]">table_chart</span>
                <span>Export Trades CSV</span>
              </button>

              <Link href="/trades" className="btn-secondary text-xs py-1.5 px-3">
                <span className="material-symbols-outlined text-[16px]">file_upload</span>
                <span>Import Trades CSV</span>
              </Link>
            </div>
          </section>

          {/* Danger Zone: Erase / Reset */}
          <section className="card space-y-3 border-error/30 bg-error-container/5">
            <h2 className="section-title text-error flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>Danger Zone (Erase Data)</span>
            </h2>
            <p className="text-xs text-on-surface-variant">
              Permanently erase all trade logs and daily reflections from this browser, or reset to
              sample demo trades. Make sure to download a backup above first.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                className="btn-secondary text-error hover:bg-error-container/40 border-error/40 text-xs py-1.5 px-3"
                onClick={() => setEraseModalOpen(true)}
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                <span>Delete All Trades &amp; Journals</span>
              </button>

              
            </div>
          </section>
        </div>
      )}

      {/* Custom Erase All Confirmation Modal */}
      <ConfirmModal
        isOpen={eraseModalOpen}
        title="Permanently Erase All Data"
        message={
          <div>
            <p>
              Are you sure you want to permanently delete all{' '}
              <strong className="text-on-surface">{trades.length} recorded trades</strong> and{' '}
              <strong className="text-on-surface">
                {Object.keys(journals).length} daily journals
              </strong>{' '}
              from this device?
            </p>
            <p className="mt-2 text-xs text-error font-medium">
              This action cannot be undone. Make sure you have exported a JSON backup first.
            </p>
          </div>
        }
        confirmText="Yes, Erase Everything"
        confirmVariant="danger"
        onConfirm={handleEraseConfirm}
        onClose={() => setEraseModalOpen(false)}
      />

      {/* Custom Reset Confirmation Modal */}
      
    </div>
  );
}
