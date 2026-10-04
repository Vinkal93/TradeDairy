'use client';
import { useState } from 'react';
import { TradingAccount } from '../../types';
import { useTrades } from '../../context/TradeContext';
import { DEFAULT_CHARGES } from '../../lib/charges';
import { encryptPassword } from '../../lib/vault';
import { ChargeEditor, fieldClass } from './ChargeEditor';

export function AccountForm({ initial, onSaved, onCancel }: {
  initial?: TradingAccount; onSaved: (account: TradingAccount) => void; onCancel: () => void;
}) {
  const { addAccount, updateAccount, user } = useTrades();
  const [broker, setBroker] = useState<TradingAccount['broker']>(initial?.broker || 'Zerodha');
  const [name, setName] = useState(initial?.accountName || '');
  const [capital, setCapital] = useState(String(initial?.capital ?? ''));
  const [currency, setCurrency] = useState(initial?.currency || user.baseCurrency);
  const [loginId, setLoginId] = useState(initial?.brokerLoginId || initial?.accountNumber || '');
  const [password, setPassword] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [removePassword, setRemovePassword] = useState(false);
  const [config, setConfig] = useState({ ...DEFAULT_CHARGES, ...initial?.chargeConfig });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!name.trim() || !Number.isFinite(Number(capital)) || Number(capital) < 0) { setError('Enter an account name and valid capital.'); return; }
    if (password && passphrase.length < 12) { setError('Use a vault passphrase of at least 12 characters to encrypt the password.'); return; }
    if (password && passphrase === password) { setError('Choose a vault passphrase different from the broker password.'); return; }
    setBusy(true); setError('');
    try {
      const encryptedPassword = password ? await encryptPassword(password, passphrase) : removePassword ? undefined : initial?.encryptedPassword;
      const data: Omit<TradingAccount, 'id'> = {
        broker, accountName: name.trim(), capital: Number(capital), currency,
        accountNumber: loginId.trim(), brokerLoginId: loginId.trim(), encryptedPassword,
        chargeConfig: config, isManual: true, isActive: initial?.isActive ?? true,
        color: initial?.color || '#006948', logoInitial: broker[0],
      };
      if (initial) { updateAccount(initial.id, data); onSaved({ ...initial, ...data }); }
      else onSaved(addAccount(data));
      setPassword(''); setPassphrase('');
    } catch { setError('Could not save the account. Check browser storage and retry.'); }
    finally { setBusy(false); }
  };
  return <form onSubmit={save} className="space-y-5">
    {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-sm text-error">{error}</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="field-label">Account name *<input className={fieldClass} value={name} required placeholder="My trading account" onChange={e => setName(e.target.value)} /></label>
      <label className="field-label">Broker<select className={fieldClass} value={broker} onChange={e => setBroker(e.target.value as TradingAccount['broker'])}>{['Zerodha', 'Groww', 'Angel One', 'Upstox', 'Dhan', 'Custom Broker'].map(b => <option key={b}>{b}</option>)}</select></label>
      <label className="field-label">Starting capital · optional<input className={fieldClass} value={capital} placeholder="0" type="number" min="0" step="0.01" onChange={e => setCapital(e.target.value)} /></label>
      <label className="field-label">Currency<select className={fieldClass} value={currency} onChange={e => setCurrency(e.target.value as TradingAccount['currency'])}>{['INR', 'USD', 'EUR', 'GBP'].map(c => <option key={c}>{c}</option>)}</select></label>
    </div>
    <div><h3 className="text-sm font-medium mb-3">Account brokerage</h3><ChargeEditor value={config} onChange={setConfig} /></div>
    <details className="rounded-xl border border-surface-container p-4">
      <summary className="text-sm font-medium cursor-pointer">Broker login details · optional</summary>
      <div className="space-y-3 mt-4">
        <label className="field-label">Broker login / client ID<input className={fieldClass} autoComplete="off" value={loginId} onChange={e => setLoginId(e.target.value)} /></label>
        <label className="field-label">{initial?.encryptedPassword ? 'New password · leave blank to keep saved password' : 'Broker password'}<input className={fieldClass} type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /></label>
        {password && <label className="field-label">Vault passphrase · at least 12 characters<input className={fieldClass} type="password" autoComplete="new-password" value={passphrase} onChange={e => setPassphrase(e.target.value)} required minLength={12} /></label>}
        {initial?.encryptedPassword && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={removePassword} onChange={e => setRemovePassword(e.target.checked)} />Remove saved password</label>}
        <p className="text-xs text-on-surface-variant leading-relaxed">Passwords are encrypted on this device with your vault passphrase. The passphrase is never saved; keep it safe to unlock your password later. No automatic broker login is performed.</p>
      </div>
    </details>
    <div className="flex gap-3"><button className="btn-primary flex-1" disabled={busy}>{busy ? 'Saving…' : initial ? 'Save account' : 'Add account'}</button><button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button></div>
  </form>;
}
