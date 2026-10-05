'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTrades } from '../../context/TradeContext';
import { UserProfile } from '../../types';
import { fieldClass } from '../../components/common/ChargeEditor';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { QrScannerModal } from '../../components/common/QrScannerModal';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-outline">Loading settings…</div>}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get('tab');

  const {
    user,
    updateUser,
    accounts,
    trades,
    journals,
    eraseAllData,
    resetDemoData,
    exportTradesCSV,
    deviceSessions,
    revokeSession,
    logoutAllOtherSessions,
  } = useTrades();

  const [tab, setTab] = useState<'profile' | 'risk' | 'sessions' | 'data'>(
    requestedTab === 'sessions' || requestedTab === 'risk' || requestedTab === 'data'
      ? requestedTab
      : 'profile'
  );

  const [isMobile, setIsMobile] = useState(false);
  const [scanMode, setScanMode] = useState<'scan' | 'show-qr'>('show-qr');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mobile = window.innerWidth < 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
      setIsMobile(mobile);
      setScanMode(mobile ? 'scan' : 'show-qr');
    }
  }, []);

  useEffect(() => {
    if (requestedTab && ['profile', 'risk', 'sessions', 'data'].includes(requestedTab)) {
      setTab(requestedTab as any);
    }
  }, [requestedTab]);

  const [name, setName] = useState(user.fullName === 'Trader' ? '' : user.fullName);
  const [alias, setAlias] = useState(user.tradingAlias || '');
  const [currency, setCurrency] = useState(user.baseCurrency);
  const [experience, setExperience] = useState(user.experience);
  const [loss, setLoss] = useState(user.dailyMaxLoss || 0);
  const [limit, setLimit] = useState(user.dailyMaxTrades || 0);
  const [risk, setRisk] = useState(user.defaultRiskPerTrade || 0);
  const [notice, setNotice] = useState('');
  const [eraseModalOpen, setEraseModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);

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

  const handleResetConfirm = () => {
    try {
      resetDemoData();
      setResetModalOpen(false);
      setNotice('Demo data restored successfully.');
    } catch {
      setNotice('Could not reset demo data.');
      setResetModalOpen(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="page-title text-on-surface">Settings &amp; Ecosystem</h1>
        <p className="text-xs sm:text-[13px] text-on-surface-variant mt-0.5">
          Manage your account profile, risk rules, active login sessions, and data backups.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="tablist" aria-label="Settings sections">
        {[
          ['profile', 'Profile & Persona', 'person'],
          ['risk', 'Risk Shield Limits', 'shield'],
          ['sessions', 'Device Sessions', 'devices'],
          ['data', 'Data & Backups', 'storage'],
        ].map(([id, label, icon]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id as 'profile' | 'risk' | 'sessions' | 'data');
              setNotice('');
            }}
            className={`rounded-lg py-2 px-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              tab === id
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-xs'
                : 'bg-white border border-surface-container text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {notice && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{notice}</span>
        </div>
      )}

      {/* TAB 1: PROFILE */}
      {tab === 'profile' && (
        <form className="card space-y-4" onSubmit={save}>
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

          <div className="pt-2 border-t border-surface-container/60">
            <button type="submit" className="btn-primary text-xs py-2 px-4">
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: RISK LIMITS */}
      {tab === 'risk' && (
        <form className="card space-y-4" onSubmit={save}>
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

          <div className="pt-2 border-t border-surface-container/60">
            <button type="submit" className="btn-primary text-xs py-2 px-4">
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save Risk Limits</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: ACTIVE DEVICE SESSIONS & QR LINKING */}
      {tab === 'sessions' && (
        <div className="space-y-3.5">
          <section className="card space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-surface-container/60">
              <div>
                <h2 className="section-title flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">devices</span>
                  <span>Active Login Sessions</span>
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Devices currently signed into your TradeDairy account with real-time sync.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScanMode(isMobile ? 'scan' : 'show-qr');
                    setScanModalOpen(true);
                  }}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isMobile ? 'qr_code_scanner' : 'devices'}
                  </span>
                  <span>{isMobile ? 'Scan PC QR' : 'Pair Mobile Device / QR'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logoutAllOtherSessions();
                    setNotice('All other device sessions have been revoked.');
                  }}
                  className="btn-secondary text-xs py-1.5 px-3 text-error border-error/30 hover:bg-error-container/20"
                >
                  Log Out Other Devices
                </button>
              </div>
            </div>

            {/* Sessions List */}
            <div className="divide-y divide-surface-container/60">
              {deviceSessions.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        s.isCurrent ? 'bg-primary/10 text-primary' : 'bg-surface-container text-outline'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {s.deviceType === 'mobile'
                          ? 'smartphone'
                          : s.deviceType === 'tablet'
                          ? 'tablet'
                          : 'computer'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-on-surface truncate">
                          {s.deviceName}
                        </span>
                        {s.isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                            This Device • Active Now
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-outline mt-0.5">
                        {s.location} • IP: {s.ip} • Last active: {s.lastActive}
                      </p>
                    </div>
                  </div>

                  {!s.isCurrent && (
                    <button
                      type="button"
                      onClick={() => {
                        revokeSession(s.id);
                        setNotice(`Session for ${s.deviceName} revoked.`);
                      }}
                      className="btn-secondary text-xs py-1 px-2.5 h-7 text-error hover:bg-error-container/30 border-error/30"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Cross-Device Sync Info */}
          <div className="p-3.5 rounded-xl bg-surface-container-low/70 border border-surface-container/60 space-y-1.5">
            <h3 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">sync</span>
              <span>Real-Time Device Ecosystem Active</span>
            </h3>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              When you record a trade or write a journal entry on any device, it is synchronized
              instantly across all your signed-in browsers and phones without needing a manual refresh.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: DATA & BACKUPS */}
      {tab === 'data' && (
        <div className="space-y-3.5">
          <section className="card space-y-3">
            <h2 className="section-title flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">download</span>
              <span>Export &amp; Backups</span>
            </h2>
            <p className="text-xs text-on-surface-variant">
              {trades.length} trades recorded • {accounts.length} demat accounts •{' '}
              {Object.keys(journals).length} daily journal reflections. Data is stored safely on your
              device and mapped to account{' '}
              <strong className="text-on-surface">{user.email || 'Local Trader'}</strong>.
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
              Permanently erase all trade logs and daily reflections for this user from this browser,
              or reset to sample demo trades. Make sure to download a backup above first.
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

              <button
                type="button"
                className="btn-secondary text-on-surface hover:bg-surface-container-low text-xs py-1.5 px-3"
                onClick={() => setResetModalOpen(true)}
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset to Sample Trades</span>
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
              for <strong className="text-on-surface">{user.email || 'this profile'}</strong>?
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
      <ConfirmModal
        isOpen={resetModalOpen}
        title="Reset to Sample Demo Trades"
        message={
          <div>
            <p>
              This will replace any current local data with sample verified trades, Zerodha/Groww
              demat accounts, and journal entries.
            </p>
          </div>
        }
        confirmText="Reset to Demo"
        confirmVariant="primary"
        onConfirm={handleResetConfirm}
        onClose={() => setResetModalOpen(false)}
      />

      {/* Qr Scanner Modal for Phone to PC Auth */}
      <QrScannerModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        initialMode={scanMode}
      />
    </div>
  );
}
