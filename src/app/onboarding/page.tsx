'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTrades } from '../../context/TradeContext';
import { UserProfile } from '../../types';
import { BrandLogo } from '../../components/common/BrandLogo';
import { AccountForm } from '../../components/common/AccountForm';
import { fieldClass } from '../../components/common/ChargeEditor';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useTrades();
  const [step, setStep] = useState(1), [name, setName] = useState(user.fullName === 'Trader' ? '' : user.fullName);
  const [currency, setCurrency] = useState(user.baseCurrency), [experience, setExperience] = useState(user.experience);
  const [error, setError] = useState('');
  const finish = () => { try { updateUser({ isOnboarded: true, isLoggedIn: true }); router.push('/'); } catch { setError('Could not save setup. Enable browser storage and retry.'); } };
  return <div className="min-h-dvh bg-background px-4 py-6"><header className="max-w-2xl mx-auto flex items-center justify-between gap-3"><BrandLogo /><Link href="/login" className="text-sm text-primary">Sign in</Link></header>
    <main className="max-w-2xl mx-auto mt-10 space-y-5"><div><p className="text-sm text-primary mb-2">Step {step} of 2</p><h1 className="page-title">{step === 1 ? 'Make this journal yours' : 'Add your trading account'}</h1><p className="text-sm text-on-surface-variant mt-2">{step === 1 ? 'Start with your name and currency. You can change these anytime.' : 'Set your broker and brokerage. Login details are optional.'}</p></div>
      {error && <p role="alert" className="text-error text-sm">{error}</p>}
      <section className="card">{step === 1 ? <form className="space-y-4" onSubmit={e => { e.preventDefault(); if (!name.trim()) return; try { updateUser({ fullName: name.trim(), baseCurrency: currency, experience }); setStep(2); } catch { setError('Could not save profile. Check browser storage.'); } }}>
        <label className="field-label">Your name *<input className={fieldClass} required value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></label><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><label className="field-label">Base currency<select className={fieldClass} value={currency} onChange={e => setCurrency(e.target.value as UserProfile['baseCurrency'])}>{['INR', 'USD', 'EUR', 'GBP'].map(c => <option key={c}>{c}</option>)}</select></label><label className="field-label">Experience<select className={fieldClass} value={experience} onChange={e => setExperience(e.target.value as UserProfile['experience'])}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label></div><button className="btn-primary w-full">Continue to account setup</button>
      </form> : <AccountForm onSaved={finish} onCancel={() => setStep(1)} />}</section>
      {step === 2 && <button className="text-primary text-sm py-3" onClick={finish}>Add an account later →</button>}
      <p className="text-xs text-outline">Your trades are stored on this device. Account sign-in currently authenticates your profile; it does not sync trade data between devices.</p>
    </main>
  </div>;
}
