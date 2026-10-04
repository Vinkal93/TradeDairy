'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTrades } from '../../context/TradeContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { formatCurrency } from '../../lib/utils';
import confetti from 'canvas-confetti';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser, addAccount, login } = useTrades();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 State: Persona & Style
  const [fullName, setFullName] = useState(user.fullName || 'Trader');
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>(
    user.experience || 'intermediate'
  );
  const [primaryMarket, setPrimaryMarket] = useState(user.primaryMarket || 'Indian Markets (NSE / BSE)');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>(user.baseCurrency || 'INR');
  const [styles, setStyles] = useState<string[]>(
    user.activeStyles?.length ? user.activeStyles : ['Intraday', 'F&O Options']
  );

  // Step 2 State: Demat Broker & Capital
  const [broker, setBroker] = useState<'Zerodha' | 'Groww' | 'Angel One' | 'Upstox' | 'Dhan' | 'Custom Broker'>(
    'Zerodha'
  );
  const [accountName, setAccountName] = useState('Primary Demat Account');
  const [capital, setCapital] = useState<number>(100000);

  // Step 3 State: Risk Shield Parameters
  const [dailyMaxLoss, setDailyMaxLoss] = useState<number>(user.dailyMaxLoss || 3000);
  const [dailyMaxTrades, setDailyMaxTrades] = useState<number>(user.dailyMaxTrades || 6);
  const [riskPercent, setRiskPercent] = useState<number>(user.defaultRiskPerTrade || 1);

  const [setupError, setSetupError] = useState('');

  const toggleStyle = (styleName: string) => {
    setStyles((prev) =>
      prev.includes(styleName) ? prev.filter((s) => s !== styleName) : [...prev, styleName]
    );
  };

  const handleStep1Next = () => {
    if (!fullName.trim() || styles.length === 0) {
      setSetupError('Please enter your name and select at least one trading style.');
      return;
    }
    setSetupError('');
    updateUser({
      fullName: fullName.trim(),
      experience,
      primaryMarket,
      baseCurrency: currency,
      activeStyles: styles,
    });
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!accountName.trim() || !Number.isFinite(capital) || capital <= 0) {
      setSetupError('Please enter an account name and a positive starting capital.');
      return;
    }
    setSetupError('');
    addAccount({
      broker,
      accountName: `${accountName} (${broker})`,
      capital,
      currency,
      accountNumber: `${broker.slice(0, 3).toUpperCase()}-101`,
      isManual: true,
      isActive: true,
      color: broker === 'Zerodha' ? '#0051d5' : broker === 'Groww' ? '#006948' : '#00873a',
      logoInitial: broker.charAt(0),
    });
    setStep(3);

    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#006948', '#85f8c4', '#0051d5', '#10B981'],
      });
    } catch {
      // ignore
    }
  };

  const handleProceedToLogin = () => {
    updateUser({
      fullName: fullName.trim(),
      dailyMaxLoss,
      dailyMaxTrades,
      defaultRiskPerTrade: riskPercent,
      isOnboarded: true,
    });
    router.push('/login');
  };

  const handleDirectDemoLogin = () => {
    login('Vinkal Prajapati', 'vinkal@tradedairy.online');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Header Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <BrandLogo />
            <span className="font-label-sm text-[11px] px-2.5 py-0.5 bg-surface-container text-primary rounded-full font-bold uppercase tracking-wider">
              Step 1 of 3: Onboarding
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectDemoLogin}
              className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-all gap-1 cursor-pointer"
              title="Skip setup and explore Demo Workspace immediately"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span className="hidden sm:inline">1-Click Demo Login</span>
            </button>

            <Link
              href="/login"
              prefetch={true}
              className="inline-flex items-center text-xs font-semibold px-3.5 py-1.5 rounded-lg text-on-surface bg-surface-container hover:bg-surface-container-high transition-all gap-1.5 border border-surface-container"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">login</span>
              <span>Log In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 w-full max-w-3xl mx-auto">
        {/* Progress Stepper Pills */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= 1 ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              1
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${step === 1 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
              Persona &amp; Style
            </span>
          </div>
          <div className={`w-8 sm:w-12 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-surface-container-high'}`} />
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= 2 ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              2
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${step === 2 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
              Broker &amp; Capital
            </span>
          </div>
          <div className={`w-8 sm:w-12 h-0.5 ${step >= 3 ? 'bg-primary' : 'bg-surface-container-high'}`} />
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= 3 ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              3
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${step === 3 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
              Risk Rules
            </span>
          </div>
        </div>

        {setupError && (
          <div className="w-full mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{setupError}</span>
          </div>
        )}

        {/* STEP 1: Trader Persona & Focus */}
        {step === 1 && (
          <div className="w-full bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-xs border border-surface-container flex flex-col gap-5 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Welcome to TradeDairy</span>
              <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight mt-1">
                Tell us about your trading style
              </h1>
              <p className="text-xs text-on-surface-variant mt-1">
                We will personalize your journaling metrics, risk gauges, and analytics charts based on your market focus.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Your Name / Trader Alias</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vinkal Prajapati"
                  className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Experience Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'beginner', label: 'Beginner', desc: '< 1 yr' },
                    { id: 'intermediate', label: 'Intermediate', desc: '1 - 3 yrs' },
                    { id: 'advanced', label: 'Pro / Prop', desc: '3+ yrs' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setExperience(lvl.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        experience === lvl.id
                          ? 'border-primary bg-primary/10 text-primary shadow-xs'
                          : 'border-surface-container bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <div className="font-bold text-xs">{lvl.label}</div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Active Trading Styles (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: 'Scalping', icon: 'speed' },
                    { name: 'Intraday', icon: 'timer' },
                    { name: 'F&O Options', icon: 'trending_up' },
                    { name: 'Swing Trading', icon: 'swap_calls' },
                  ].map((item) => {
                    const selected = styles.includes(item.name);
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => toggleStyle(item.name)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                          selected
                            ? 'border-primary bg-primary/10 text-primary shadow-xs font-bold'
                            : 'border-surface-container bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        <span className="text-xs">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Primary Market</label>
                  <select
                    value={primaryMarket}
                    onChange={(e) => setPrimaryMarket(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest"
                  >
                    <option value="Indian Markets (NSE / BSE)">Indian Markets (NSE / BSE)</option>
                    <option value="US Equities (NASDAQ / NYSE)">US Equities (NASDAQ / NYSE)</option>
                    <option value="Crypto & Web3">Crypto &amp; Web3</option>
                    <option value="Forex Majors">Forex Majors</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Base Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-container">
              <Link
                href="/login"
                className="text-xs text-on-surface-variant hover:text-primary transition-colors font-semibold"
              >
                Skip to Login
              </Link>
              <button
                type="button"
                onClick={handleStep1Next}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm hover:bg-primary-hover transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Next: Connect Broker</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Demat Broker Setup & Initial Capital */}
        {step === 2 && (
          <div className="w-full bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-xs border border-surface-container flex flex-col gap-5 animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Demat Connection</span>
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight mt-1">
                Configure your trading account
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Select your primary broker to track contract notes, accurate brokerage, and daily P&amp;L automatically.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">Select Primary Broker</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { name: 'Zerodha', tag: 'Kite Connect' },
                    { name: 'Groww', tag: 'Direct Excel' },
                    { name: 'Angel One', tag: 'SmartAPI' },
                    { name: 'Upstox', tag: 'Pro Terminal' },
                    { name: 'Dhan', tag: 'Dhan HQ' },
                    { name: 'Custom Broker', tag: 'Manual Ledger' },
                  ].map((b) => (
                    <button
                      key={b.name}
                      type="button"
                      onClick={() => setBroker(b.name as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        broker === b.name
                          ? 'border-primary bg-primary/10 shadow-xs'
                          : 'border-surface-container bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="font-bold text-xs text-on-surface">{b.name}</div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">{b.tag}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Account Display Label</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Zerodha F&O Main"
                  className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Starting Trading Capital ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline font-bold text-xs">
                    {currency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(Number(e.target.value))}
                    className="w-full h-11 pl-8 pr-3.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface font-mono font-bold focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                  />
                </div>
                <span className="text-[11px] text-on-surface-variant mt-1 block">
                  Used to calculate your real-time return on investment (ROI) and drawdown.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-on-surface-variant hover:text-on-surface transition-colors font-semibold cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStep2Next}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm hover:bg-primary-hover transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Next: Risk Shield</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Risk Protection Rules & Proceed to Login */}
        {step === 3 && (
          <div className="w-full bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-xs border border-surface-container flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl mx-auto mb-2 animate-bounce">
                🎉
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Almost Ready!</span>
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight mt-0.5">
                Set Your Discipline &amp; Risk Shield
              </h2>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto mt-1">
                Protect yourself from emotional tilt and over-trading with automatic risk alerts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container">
                <label className="block text-[11px] font-bold text-on-surface mb-1">Daily Max Loss (₹)</label>
                <input
                  type="number"
                  value={dailyMaxLoss}
                  onChange={(e) => setDailyMaxLoss(Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-lg bg-surface-container-lowest border border-surface-container text-xs font-mono font-bold text-error"
                />
                <span className="text-[10px] text-on-surface-variant mt-1 block">Halts trading alert on breach</span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container">
                <label className="block text-[11px] font-bold text-on-surface mb-1">Max Trades / Day</label>
                <input
                  type="number"
                  value={dailyMaxTrades}
                  onChange={(e) => setDailyMaxTrades(Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-lg bg-surface-container-lowest border border-surface-container text-xs font-mono font-bold text-on-surface"
                />
                <span className="text-[10px] text-on-surface-variant mt-1 block">Prevents over-trading FOMO</span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container">
                <label className="block text-[11px] font-bold text-on-surface mb-1">Risk Per Trade (%)</label>
                <input
                  type="number"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-lg bg-surface-container-lowest border border-surface-container text-xs font-mono font-bold text-primary"
                />
                <span className="text-[10px] text-on-surface-variant mt-1 block">Suggested 1% of total capital</span>
              </div>
            </div>

            {/* Summary Snapshot Card */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Your Configured Profile</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-on-surface-variant block text-[11px]">Trader:</span>
                  <span className="font-bold text-on-surface">{fullName}</span> ({experience})
                </div>
                <div>
                  <span className="text-on-surface-variant block text-[11px]">Primary Demat &amp; Capital:</span>
                  <span className="font-bold text-on-surface">{broker}</span> ({formatCurrency(capital, currency)})
                </div>
              </div>
            </div>

            {/* Primary Action Buttons: Flow to Login */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleProceedToLogin}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Save Setup &amp; Proceed to Login</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>

              <button
                type="button"
                onClick={handleDirectDemoLogin}
                className="w-full py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs border border-surface-container transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                <span>Skip Login &amp; Enter Demo Dashboard Directly</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-on-surface-variant border-t border-surface-container">
        <div>TradeDairy.online • Precision Journaling &amp; Trading Analytics</div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <Link href="/login" className="hover:text-primary transition-colors">
            Login
          </Link>
          <Link href="/su" className="hover:text-primary transition-colors font-mono">
            /su
          </Link>
        </div>
      </footer>
    </div>
  );
}
