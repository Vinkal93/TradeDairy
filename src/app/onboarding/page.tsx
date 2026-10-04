'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTrades } from '../../context/TradeContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { UserProfile } from '../../types';

const TRADING_STYLES = [
  'Index Options (NIFTY / BANKNIFTY)',
  'Stock Options & Futures',
  'Equity Intraday',
  'Swing & Positional',
  'Commodities (MCX)',
  'Crypto / Forex',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useTrades();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(user.fullName && user.fullName !== 'Trader' ? user.fullName : '');
  const [currency, setCurrency] = useState<UserProfile['baseCurrency']>(user.baseCurrency || 'INR');
  const [experience, setExperience] = useState<UserProfile['experience']>(user.experience || 'beginner');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    user.activeStyles && user.activeStyles.length > 0
      ? user.activeStyles
      : ['Index Options (NIFTY / BANKNIFTY)']
  );
  const [dailyMaxLoss, setDailyMaxLoss] = useState<number>(user.dailyMaxLoss || 3000);
  const [error, setError] = useState('');

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleStep1Next = () => {
    setStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name or trader alias.');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleFinishOnboarding = () => {
    try {
      const cleanName = name.trim() || 'Active Trader';
      // Mark onboarded, save profile preferences, but DO NOT log in yet!
      updateUser({
        fullName: cleanName,
        baseCurrency: currency,
        experience,
        activeStyles: selectedStyles,
        dailyMaxLoss,
        isOnboarded: true,
        isLoggedIn: false,
      });

      // Pass user name to login page for seamless sign-up experience
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('tradedairy_onboarding_name', cleanName);
        sessionStorage.setItem('tradedairy_onboarding_currency', currency);
      }

      router.push('/login?from=onboarding');
    } catch (err) {
      console.error('Onboarding save error:', err);
      setError('Could not save profile setup. Check browser storage permissions.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between antialiased selection:bg-primary/20">
      {/* Top Header */}
      <header className="h-16 px-4 sm:px-8 max-w-5xl mx-auto w-full flex items-center justify-between border-b border-surface-container/60">
        <Link href="/" prefetch={true}>
          <BrandLogo />
        </Link>
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <span className="text-outline hidden sm:inline">Already registered?</span>
          <Link
            href="/login"
            prefetch={true}
            className="font-semibold text-primary hover:text-primary-hover px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors"
          >
            Sign In →
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col justify-center">
        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-outline uppercase tracking-wider mb-2">
            <span className={step >= 1 ? 'text-primary' : ''}>1. Welcome</span>
            <span className={step >= 2 ? 'text-primary' : ''}>2. Trading Persona</span>
            <span className={step >= 3 ? 'text-primary' : ''}>3. Connect Account</span>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
            {error}
          </div>
        )}

        {/* STEP 1: VALUE PROPOSITION & OVERVIEW */}
        {step === 1 && (
          <div className="card space-y-6 animate-in fade-in-50 duration-300">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide">
                Welcome to TradeDairy
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
                Trade with Discipline. Scale with Intelligence.
              </h1>
              <p className="text-sm sm:text-base text-on-surface-variant">
                Your high-speed trading journal, real-time risk engine, and automated options P&amp;L analytics.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container/60 space-y-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">candlestick_chart</span>
                </div>
                <h3 className="font-bold text-sm text-on-surface">Smart Options &amp; Stocks</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Type NIFTY 23000 to pick CE/PE with auto-calculated STT, GST, and turnover brokerage.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container/60 space-y-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">sync</span>
                </div>
                <h3 className="font-bold text-sm text-on-surface">Realtime Cloud Sync</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Seamless ecosystem across PC workstation, laptop, and phone. Record anywhere, reflect anytime.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container/60 space-y-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">psychology</span>
                </div>
                <h3 className="font-bold text-sm text-on-surface">Psychology &amp; Rules</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Audit revenge trading, FOMO, and rule compliance with granular daily reflection logs.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleStep1Next}
                className="btn-primary w-full py-3.5 text-sm sm:text-base font-semibold shadow-md flex items-center justify-center gap-2"
              >
                <span>Get Started — Customize Profile</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROFILE & TRADING PREFERENCES */}
        {step === 2 && (
          <form onSubmit={handleStep2Next} className="card space-y-6 animate-in fade-in-50 duration-300">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">Personalize Your Journal</p>
              <h1 className="text-xl sm:text-2xl font-bold text-on-surface mt-1">
                Tell us about your trading setup
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                We customize your analytics, charts, and risk limits based on your trading style.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface mb-1.5">
                  Your Full Name or Trader Alias *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vinkal Prajapati"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value as UserProfile['experience'])}
                    className="w-full px-4 py-3 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                  >
                    <option value="beginner">Beginner (&lt; 1 Year)</option>
                    <option value="intermediate">Intermediate (1 – 3 Years)</option>
                    <option value="advanced">Advanced (3+ Years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface mb-1.5">
                    Base Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as UserProfile['baseCurrency'])}
                    className="w-full px-4 py-3 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                  >
                    <option value="INR">INR (₹) — Indian Rupee</option>
                    <option value="USD">USD ($) — US Dollar</option>
                    <option value="EUR">EUR (€) — Euro</option>
                    <option value="GBP">GBP (£) — British Pound</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface mb-2">
                  What Markets Do You Trade?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TRADING_STYLES.map((style) => {
                    const active = selectedStyles.includes(style);
                    return (
                      <button
                        type="button"
                        key={style}
                        onClick={() => toggleStyle(style)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                          active
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-surface-container-low border-surface-container text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        <span>{style}</span>
                        {active && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface mb-1.5">
                  Daily Max Loss Guardrail ({currency})
                </label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={dailyMaxLoss}
                  onChange={(e) => setDailyMaxLoss(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                />
                <p className="text-[11px] text-outline mt-1">
                  TradeDairy alerts you if your cumulative loss hits this threshold in a session.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl border border-surface-container text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                ← Back
              </button>

              <button
                type="submit"
                className="btn-primary py-3 px-6 text-sm font-semibold shadow-md flex items-center gap-2"
              >
                <span>Continue to Account Setup</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SETUP COMPLETE -> PROCEED TO AUTH */}
        {step === 3 && (
          <div className="card space-y-6 animate-in fade-in-50 duration-300">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>
              <h1 className="text-2xl font-extrabold text-on-surface">
                Ready to Join TradeDairy, {name || 'Trader'}!
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
                Your profile configuration is ready. Now sign in or create your secure account to activate real-time cross-device cloud sync.
              </p>
            </div>

            {/* Profile Review Box */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-surface-container">
                <span className="text-outline">Trader Profile:</span>
                <strong className="text-on-surface">{name || 'Active Trader'}</strong>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-surface-container">
                <span className="text-outline">Experience &amp; Currency:</span>
                <span className="font-semibold text-on-surface">
                  {experience.toUpperCase()} • {currency}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-surface-container">
                <span className="text-outline">Primary Focus:</span>
                <span className="font-semibold text-primary truncate max-w-[200px]">
                  {selectedStyles.slice(0, 2).join(', ') || 'Options & Equities'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-outline">Cloud Ecosystem:</span>
                <span className="inline-flex items-center gap-1 text-primary font-bold">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Realtime Ready
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="btn-primary w-full py-4 text-sm sm:text-base font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Sign In / Sign Up</span>
                <span className="material-symbols-outlined text-[20px]">login</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-center text-xs text-outline hover:text-on-surface py-2 transition-colors"
              >
                ← Edit profile setup
              </button>
            </div>

            <p className="text-[11px] text-center text-outline">
              🔒 Your trade data is encrypted and synced directly with your personal credentials.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="h-12 px-4 max-w-5xl mx-auto w-full flex items-center justify-center text-xs text-outline">
        <span>© {new Date().getFullYear()} TradeDairy • Precision Trading Intelligence</span>
      </footer>
    </div>
  );
}
