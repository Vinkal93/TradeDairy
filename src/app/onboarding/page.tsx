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
  const { user, updateUser, addAccount, accounts } = useTrades();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 State
  const [fullName, setFullName] = useState(user.fullName);
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>(user.experience);
  const [primaryMarket, setPrimaryMarket] = useState(user.primaryMarket);
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>(user.baseCurrency);
  const [styles, setStyles] = useState<string[]>(user.activeStyles);

  // Step 2 State
  const [broker, setBroker] = useState<'Zerodha' | 'Groww' | 'Angel One' | 'Upstox' | 'Dhan' | 'Custom Broker'>('Zerodha');
  const [accountName, setAccountName] = useState('Main Trading Account');
  const [capital, setCapital] = useState<number>(100000);
  const [setupError, setSetupError] = useState('');

  const toggleStyle = (styleName: string) => {
    setStyles(prev =>
      prev.includes(styleName) ? prev.filter(s => s !== styleName) : [...prev, styleName]
    );
  };

  const handleStep1Next = () => {
    if (!fullName.trim() || styles.length === 0) {
      setSetupError('Enter your name and select at least one trading style.');
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
      setSetupError('Enter an account label and positive starting capital.');
      return;
    }
    setSetupError('');
    // Add or update initial broker
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

    // Fire celebration confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#006948', '#85f8c4', '#316bf3', '#10B981'],
      });
    } catch {
      // Ignored if confetti fails
    }
  };

  const handleFinish = (target: '/add-trade' | '/') => {
    updateUser({ isOnboarded: true });
    router.push(target);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between antialiased">
      {/* Top Header Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
        <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <BrandLogo />
            <span className="font-label-sm text-xs px-2.5 py-0.5 bg-surface-container text-on-surface-variant rounded-full font-semibold">
              Setup Wizard
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              prefetch={true}
              className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg text-on-surface-variant bg-surface-container-low hover:bg-surface-container transition-all gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>Login Screen</span>
            </Link>
            <Link
              href="/"
              prefetch={true}
              className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg text-on-surface-variant bg-surface-container-low hover:bg-surface-container transition-all gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              <span>Skip to App</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full pt-20 pb-16 flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-3xl mx-auto py-space-md">
          {setupError && <p role="alert" className="mb-4 p-3 rounded-lg bg-error-container text-error text-sm">{setupError}</p>}
          {/* Progress Indicator Steps */}
          <div className="w-full max-w-xl mx-auto mb-space-lg">
            <div className="relative flex items-center justify-between">
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                    step >= 1 ? 'bg-primary text-on-primary ring-4 ring-primary-fixed/40' : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {step > 1 ? '✓' : '1'}
                </div>
                <span className="font-label-sm text-xs font-semibold text-on-surface">1. Profile</span>
              </div>

              <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${step >= 2 ? 'bg-primary' : 'bg-surface-container'}`}></div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                    step >= 2 ? 'bg-primary text-on-primary ring-4 ring-primary-fixed/40' : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {step > 2 ? '✓' : '2'}
                </div>
                <span className="font-label-sm text-xs font-semibold text-on-surface">2. Broker</span>
              </div>

              <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${step >= 3 ? 'bg-primary' : 'bg-surface-container'}`}></div>

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                    step === 3 ? 'bg-primary text-on-primary ring-4 ring-primary-fixed/40' : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  3
                </div>
                <span className="font-label-sm text-xs font-semibold text-on-surface">3. Ready</span>
              </div>
            </div>
          </div>

          {/* STEP 1: Basic Profile */}
          {step === 1 && (
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container flex flex-col gap-6 animate-in fade-in duration-200">
              <div>
                <h1 className="font-headline-xl text-xl sm:text-2xl text-on-surface font-bold tracking-tight">
                  Welcome to TradeDairy! Let&apos;s tailor your journal.
                </h1>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
                  Tell us about your trading style so we can personalize your analytics and risk metrics.
                </p>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Full Legal / Trading Alias</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vinkal Prajapati"
                  className="w-full h-11 px-3 rounded-lg bg-surface-container-low text-sm text-on-surface border border-surface-container focus:bg-surface-container-lowest"
                  required
                />
              </div>

              {/* Experience */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface">Trading Experience Level</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'beginner', title: 'Beginner', sub: 'Learning market price structure', span: '< 1 Year' },
                    { key: 'intermediate', title: 'Intermediate', sub: 'Consistent playbook, focusing on psychology', span: '1-3 Years' },
                    { key: 'advanced', title: 'Advanced', sub: 'Systematic execution & portfolio models', span: '3+ Years' },
                  ].map((exp) => (
                    <div
                      key={exp.key}
                      onClick={() => setExperience(exp.key as any)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        experience === exp.key
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/40'
                          : 'border-surface-container bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs text-on-surface">{exp.title}</span>
                          {experience === exp.key && <span className="text-primary text-xs font-bold">✓</span>}
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-snug">{exp.sub}</p>
                      </div>
                      <span className="text-[10px] text-primary font-bold mt-2">{exp.span}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Focus */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface">Primary Market Focus</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Indian Markets (NSE / BSE)',
                    'US Equities & Options',
                    'Crypto',
                    'Forex',
                    'Commodities / MCX',
                  ].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPrimaryMarket(m)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        primaryMarket === m
                          ? 'bg-primary text-on-primary border-primary shadow-xs'
                          : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Base Currency */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface">Base Currency</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
                    { code: 'USD', symbol: '$', name: 'US Dollar' },
                    { code: 'EUR', symbol: '€', name: 'Euro' },
                    { code: 'GBP', symbol: '£', name: 'British Pound' },
                  ].map((cur) => (
                    <div
                      key={cur.code}
                      onClick={() => setCurrency(cur.code as any)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        currency === cur.code
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/40'
                          : 'border-surface-container bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {cur.symbol}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-on-surface block">{cur.code}</span>
                          <span className="text-[10px] text-on-surface-variant">{cur.name}</span>
                        </div>
                      </div>
                      {currency === cur.code && <span className="text-primary text-xs font-bold">✓</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Trading Styles */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface">Active Trading Styles</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Intraday', 'Swing Trading', 'Positional', 'Scalping', 'Options'].map((st) => {
                    const checked = styles.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => toggleStyle(st)}
                        className={`p-2.5 rounded-xl text-left border transition-all text-xs font-semibold flex items-center justify-between ${
                          checked
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-surface-container bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        <span>{st}</span>
                        <span>{checked ? '✓' : '+'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 1 Next Button */}
              <div className="flex justify-end pt-4 border-t border-surface-container">
                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Continue to Broker Setup →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Broker Account Setup */}
          {step === 2 && (
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container flex flex-col gap-6 animate-in fade-in duration-200">
              <div>
                <h1 className="font-headline-xl text-xl sm:text-2xl text-on-surface font-bold tracking-tight">
                  Add your primary trading account
                </h1>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
                  Track trades across multiple accounts. Enter your starting capital for automated ROI math.
                </p>
              </div>

              {/* Broker Grid */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface">Select Broker Platform</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'Zerodha', tag: 'Kite • Direct Manual', initial: 'Z', color: '#0051d5' },
                    { name: 'Groww', tag: 'Stock & F&O Manual', initial: 'G', color: '#006948' },
                    { name: 'Angel One', tag: 'SmartAPI / Manual', initial: 'A', color: '#00873a' },
                    { name: 'Upstox', tag: 'Pro Web / Manual', initial: 'U', color: '#316bf3' },
                    { name: 'Dhan', tag: 'Options Trader', initial: 'D', color: '#00855d' },
                    { name: 'Custom Broker', tag: 'Custom Entry', initial: 'C', color: '#213145' },
                  ].map((b) => (
                    <button
                      key={b.name}
                      type="button"
                      onClick={() => setBroker(b.name as any)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        broker === b.name
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/40'
                          : 'border-surface-container bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: b.color }}
                        >
                          {b.initial}
                        </div>
                        {broker === b.name && <span className="text-primary text-xs font-bold">✓</span>}
                      </div>
                      <span className="font-bold text-xs text-on-surface block">{b.name}</span>
                      <span className="text-[10px] text-on-surface-variant">{b.tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Label */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Account Label / Portfolio Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Main Intraday Account"
                  className="h-11 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container focus:bg-surface-container-lowest"
                  required
                />
              </div>

              {/* Starting Capital */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Starting Capital Balance ({currency} {currency === 'INR' ? '₹' : '$'})</label>
                <input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
                  className="h-11 px-3 rounded-lg bg-surface-container-low text-sm font-bold text-on-surface border border-surface-container focus:bg-surface-container-lowest"
                  required
                />
                <span className="text-[11px] text-on-surface-variant">Used to compute account ROI, drawdown limits, and portfolio sizing.</span>
              </div>

              {/* Step 2 Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-on-surface-variant hover:text-on-surface font-semibold"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Complete Setup &amp; Review →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Ready & Celebration */}
          {step === 3 && (
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container flex flex-col gap-6 animate-in fade-in duration-200 text-center">
              {/* Success Badge */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl shadow-md ring-4 ring-primary-fixed/40 mb-3 animate-bounce">
                  🎉
                </div>
                <h1 className="font-headline-xl text-xl sm:text-2xl text-on-surface font-bold tracking-tight">
                  You&apos;re ready to start your trading journal!
                </h1>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-lg mt-1">
                  Your profile is configured, your <strong>{formatCurrency(capital, currency)}</strong> starting capital is recorded, and discipline tracking is active.
                </p>
              </div>

              {/* Snapshot Summary Card */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container text-left flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Setup Summary Snapshot</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-on-surface-variant block">Profile &amp; Focus:</span>
                    <strong className="text-on-surface">{fullName}</strong>
                    <p className="text-[11px] text-on-surface-variant">{primaryMarket} ({currency})</p>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Active Broker &amp; Capital:</span>
                    <strong className="text-on-surface">{broker}</strong>
                    <p className="text-[11px] text-on-surface-variant">{formatCurrency(capital, currency)} Manual Tracking</p>
                  </div>
                </div>
              </div>

              {/* 3 High-Edge Journaling Tips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3 rounded-xl bg-surface-container-low/70 border border-surface-container flex flex-col gap-1">
                  <span className="text-xl">⏱️</span>
                  <strong className="text-xs text-on-surface">1. Log Immediately</strong>
                  <p className="text-[11px] text-on-surface-variant leading-snug">
                    Record trades right away while entry logic and emotions are fresh.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low/70 border border-surface-container flex flex-col gap-1">
                  <span className="text-xl">🧠</span>
                  <strong className="text-xs text-on-surface">2. Track Emotions</strong>
                  <p className="text-[11px] text-on-surface-variant leading-snug">
                    Tag calm, FOMO, or fear to build self-awareness and eliminate tilt.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low/70 border border-surface-container flex flex-col gap-1">
                  <span className="text-xl">📊</span>
                  <strong className="text-xs text-on-surface">3. Review Weekly</strong>
                  <p className="text-[11px] text-on-surface-variant leading-snug">
                    Use the calendar heatmap and setup win-rate charts to refine your edge.
                  </p>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleFinish('/add-trade')}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>+ Record My First Trade</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFinish('/')}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs border border-surface-container transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
