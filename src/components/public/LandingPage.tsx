'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '../common/BrandLogo';

export function LandingPage() {
  const router = useRouter();

  // Interactive Calculator State
  const [tradesPerDay, setTradesPerDay] = useState<number>(8);
  const [turnoverLakhs, setTurnoverLakhs] = useState<number>(1.5);

  // Billing Cycle State
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Accordion FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Modal & Mobile Navigation States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth Form State inside Modal
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // CTA Banner Email State
  const [ctaEmail, setCtaEmail] = useState('');

  // Calculations for True Net P&L Calculator
  const monthlyOrders = tradesPerDay * 20;
  const brokerageTotal = monthlyOrders * 20;
  const sttAndGstTotal = Math.round(
    monthlyOrders * 20 * 0.18 + monthlyOrders * turnoverLakhs * 10
  );
  const totalMonthlyCost = brokerageTotal + sttAndGstTotal;
  const totalYearlyCost = totalMonthlyCost * 12;

  // Toggle FAQ item
  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  // Google Login in Modal
  const handleGoogleLogin = () => {
    setAuthModalOpen(false);
    router.push('/login');
  };

  // Email Login in Modal
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthModalOpen(false);
    if (authEmail.trim()) {
      router.push(`/login?email=${encodeURIComponent(authEmail.trim())}`);
    } else {
      router.push('/login');
    }
  };

  // Handle CTA Email Form Submit
  const handleCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ctaEmail.trim()) {
      router.push(`/login?mode=signup&email=${encodeURIComponent(ctaEmail.trim())}`);
    } else {
      router.push('/onboarding');
    }
  };

  return (
    <div className="antialiased text-slate-800 bg-[#f8f9fc] selection:bg-brand-500/20 selection:text-brand-900">
      {/* BEGIN: MainHeader */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-3.5">
            {/* Brand Logo */}
            <Link className="flex items-center gap-2 group" href="/">
              <BrandLogo className="h-8 sm:h-9 w-auto" />
              <span className="ml-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                .online
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-600">
              <a className="hover:text-brand-600 transition-colors" href="#features">
                Features
              </a>
              <a className="hover:text-brand-600 transition-colors" href="#features">
                Charge Engine
              </a>
              <a className="hover:text-brand-600 transition-colors" href="#calculator">
                P&amp;L Calculator
              </a>
              <a className="hover:text-brand-600 transition-colors" href="#app-preview">
                App Preview
              </a>
              <a className="hover:text-brand-600 transition-colors" href="#pricing">
                Pricing
              </a>
              <a className="hover:text-brand-600 transition-colors" href="#reviews">
                Trader Reviews
              </a>
              <a className="hover:text-brand-600 transition-colors" href="#faq">
                FAQ
              </a>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 transition-colors cursor-pointer"
                onClick={() => setAuthModalOpen(true)}
              >
                Sign In
              </button>
              <Link
                className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-sm shadow-brand-600/30 transition-all"
                href="/onboarding"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Start Free Journal</span>
              </Link>
              <button
                type="button"
                aria-label="Toggle Navigation"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[22px]">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-100 flex flex-col space-y-3 font-medium text-sm text-slate-700">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:text-brand-600"
              >
                Features
              </a>
              <a
                href="#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:text-brand-600"
              >
                P&amp;L Calculator
              </a>
              <a
                href="#app-preview"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:text-brand-600"
              >
                App Preview
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:text-brand-600"
              >
                Pricing
              </a>
              <a
                href="#reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:text-brand-600"
              >
                Trader Reviews
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:text-brand-600"
              >
                FAQ
              </a>
            </div>
          )}
        </div>
      </header>
      {/* END: MainHeader */}

      {/* BEGIN: HeroSection */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-white via-[#f8f9fc] to-[#f0fdf4]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Social Proof Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-800 text-xs sm:text-sm font-medium shadow-sm">
              <span className="flex text-amber-500">★★★★★</span>
              <span className="font-semibold text-slate-900">4.9/5</span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-slate-700">Trusted by 18,650+ Indian F&amp;O &amp; Equity Traders</span>
            </div>
          </div>

          {/* Main Headline & Subtitle */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Turn Trading Chaos Into <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-600">
                Disciplined, Repeatable Profit.
              </span>
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
              The precision trading journal crafted specifically for Indian Nifty, BankNifty, and Stock traders. Automate brokerage &amp; STT deduction, identify behavioral leaks, and stop giving hard-earned gains back to the market.
            </p>

            {/* CTA Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-full shadow-lg shadow-brand-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                href="/onboarding"
              >
                <span>Get Started Free — No Credit Card</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </Link>
              <a
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-full shadow-sm transition-all hover:border-slate-400"
                href="#app-preview"
              >
                <svg className="w-5 h-5 text-brand-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Live Interactive Preview</span>
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                </svg>
                Zerodha, Groww &amp; Angel One Sync
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                </svg>
                Real STT &amp; GST Deductions
              </span>
              <span className="flex items-center gap-1.5 hidden md:flex">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                </svg>
                Bank-grade 256-bit Security
              </span>
            </div>
          </div>

          {/* Hero Visual: Product Banner & Live Desktop Mockup */}
          <div className="mt-12 relative max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/90 bg-white">
              {/* Top Browser Bar chrome */}
              <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="ml-4 text-xs font-mono text-slate-400">
                    app.tradedairy.online/dashboard/live
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Market Session
                  </span>
                </div>
              </div>

              {/* Image Asset Render: Digital Display Visual with UI preview */}
              <div className="relative bg-slate-950">
                <img
                  alt="TradeDairy Banner - Turn Data Into Disciplined Profit"
                  className="w-full h-auto object-cover max-h-[580px] shadow-inner"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1W9zjY-IK8pQu0j6fmLPP045KU6cTGReLHlNzLLvgogYpiYBfXm7NkgU629Hg104lbrrQBw-kDd26WiQbfY5ctpqJ-mdK2eg7Ni3GwmhMXa_yOaLtpVUEka0vHoHHq2O1kXEOh0BhOon4qUwcTp358Q49A-Kid0bNd3kM_lEi-2Y-sBeM8uLQEqVPggPokt9ZfkwxikRn0lGGGEXE7qlRDakDOBiYoHmaDRnyWkyDenOdaWy0mtZslg2g"
                  loading="eager"
                />
              </div>
            </div>

            {/* Floating Metric Highlight Pill */}
            <div className="absolute -bottom-6 left-6 hidden lg:flex items-center gap-3 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                ₹
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Verified Intraday Net P&amp;L</div>
                <div className="text-base font-extrabold text-slate-900">
                  +₹28,450.00 <span className="text-xs text-emerald-600 font-semibold">(62.5% Win)</span>
                </div>
              </div>
            </div>

            {/* Floating Broker Sync Status */}
            <div className="absolute -top-4 -right-4 hidden lg:flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-full shadow-lg border border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-slate-800">Zerodha Kite Connected • Realtime Sync</span>
            </div>
          </div>
        </div>
      </section>
      {/* END: HeroSection */}

      {/* BEGIN: BrokerCompatibilityBar */}
      <section className="py-10 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6">
            Works seamlessly with India&apos;s leading stock &amp; derivative brokers via direct API or 1-Click CSV
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14 opacity-85">
            {/* Zerodha */}
            <Link href="/broker-sync" className="flex items-center gap-2 text-slate-800 font-bold text-base hover:opacity-100 transition-opacity">
              <span className="w-6 h-6 rounded bg-[#387ed1] text-white text-xs flex items-center justify-center font-black">Z</span>
              <span>Zerodha Kite</span>
            </Link>
            {/* Groww */}
            <Link href="/broker-sync" className="flex items-center gap-2 text-slate-800 font-bold text-base hover:opacity-100 transition-opacity">
              <span className="w-6 h-6 rounded-full bg-[#00d09c] text-white text-xs flex items-center justify-center font-black">G</span>
              <span>Groww</span>
            </Link>
            {/* Angel One */}
            <Link href="/broker-sync" className="flex items-center gap-2 text-slate-800 font-bold text-base hover:opacity-100 transition-opacity">
              <span className="w-6 h-6 rounded bg-[#ff5722] text-white text-xs flex items-center justify-center font-bold">▲</span>
              <span>Angel One</span>
            </Link>
            {/* Upstox */}
            <Link href="/broker-sync" className="flex items-center gap-2 text-slate-800 font-bold text-base hover:opacity-100 transition-opacity">
              <span className="w-6 h-6 rounded bg-[#5a287d] text-white text-xs flex items-center justify-center font-mono font-bold">U</span>
              <span>Upstox</span>
            </Link>
            {/* Dhan */}
            <Link href="/broker-sync" className="flex items-center gap-2 text-slate-800 font-bold text-base hover:opacity-100 transition-opacity">
              <span className="w-6 h-6 rounded bg-[#104b9c] text-white text-xs flex items-center justify-center font-bold">D</span>
              <span>Dhan HQ</span>
            </Link>
            {/* Fyers */}
            <Link href="/broker-sync" className="flex items-center gap-2 text-slate-800 font-bold text-base hover:opacity-100 transition-opacity">
              <span className="w-6 h-6 rounded bg-[#ff7a00] text-white text-xs flex items-center justify-center font-bold">F</span>
              <span>Fyers</span>
            </Link>
          </div>
        </div>
      </section>
      {/* END: BrokerCompatibilityBar */}

      {/* BEGIN: ThreeCorePillarsFeatures */}
      <section className="py-20 bg-[#f8f9fc]" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-600 font-semibold text-sm tracking-wide uppercase">
              The TradeDairy Advantage
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered to Fix the 3 Silent Killers of Retail Trading Capital
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              Most retail traders fail not because of flawed technical setups, but because of emotional leaks, inaccurate charge estimation, and lack of systematic review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1: Contract Note & Fee Engine */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2.5">
                  1. Automated Statutory Fee &amp; STT Engine
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Green on screen doesn&apos;t mean green in your bank. TradeDairy calculates exact STT, GST (18%), exchange turnover fees, SEBI turnover charges, and stamp duties automatically per trade so you know your genuine net earnings before midnight.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 font-mono text-xs text-slate-700">
                <div className="flex justify-between pb-1">
                  <span>Gross Profit:</span>
                  <span className="text-emerald-600 font-bold">+₹4,200.00</span>
                </div>
                <div className="flex justify-between pb-1 text-slate-500">
                  <span>Brokerage (₹20/order):</span>
                  <span>-₹40.00</span>
                </div>
                <div className="flex justify-between pb-1 text-slate-500">
                  <span>STT + GST + Stamp:</span>
                  <span>-₹328.40</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-slate-900 font-bold">
                  <span>Net Take-Home:</span>
                  <span className="text-emerald-700 font-extrabold">+₹3,831.60</span>
                </div>
              </div>
            </div>

            {/* Pillar 2: Emotional & Psychology Leak Tracker */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2.5">
                  2. Behavioral Leak &amp; FOMO Detection
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Tag mistakes with single clicks: FOMO entry, Late Entry, Revenge Trade, or Premature Exit. Our AI analytics will correlate tagged emotions with loss margins so you know exactly which habit is sabotaging your profitability.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Identified Drain (October):
                </span>
                <div className="mt-2.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold">FOMO Entry</span>
                    <span className="text-rose-600 font-bold">-₹14,200 (6 trades)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">Early Exit</span>
                    <span className="text-amber-700 font-medium">Missed +₹19,400</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 3: Execution Playbooks & Screenshots */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2.5">
                  3. Visual Execution &amp; R:R Playbooks
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Attach TradingView chart snapshots instantly. Track Planned R:R versus Realized R:R, session timestamps (Morning Opening Bell vs. Afternoon Session), and setups like Breakout, Pullback, or CPR Reversal.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Breakout Setup #4</div>
                  <div className="text-slate-500">Planned 1:2.5 • Realized 1:2.8</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 font-bold text-[11px]">
                  Setup Win 74%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: ThreeCorePillarsFeatures */}

      {/* BEGIN: InteractiveTrueNetCalculator */}
      <section className="py-20 bg-white border-t border-slate-200" id="calculator">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
              Interactive Reality Check
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900">
              How Much Are You Really Bleeding in Brokerage &amp; STT?
            </h2>
            <p className="mt-3 text-slate-600">
              Slide your typical daily trade activity to calculate your monthly friction loss and discover how disciplined journaling recovers capital.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Controls Column */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="tradesPerDay">
                      Orders executed per trading day:
                    </label>
                    <span className="text-base font-extrabold text-brand-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm font-mono">
                      {tradesPerDay} orders
                    </span>
                  </div>
                  <input
                    id="tradesPerDay"
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    max="40"
                    min="2"
                    step="1"
                    type="range"
                    value={tradesPerDay}
                    onChange={(e) => setTradesPerDay(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>2 (Disciplined)</span>
                    <span>20 (Active F&amp;O)</span>
                    <span>40+ (Overtrading)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="avgTurnover">
                      Avg Turnover per trade (₹ Lakhs):
                    </label>
                    <span className="text-base font-extrabold text-brand-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm font-mono">
                      ₹ {turnoverLakhs.toFixed(1)} L
                    </span>
                  </div>
                  <input
                    id="avgTurnover"
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    max="10"
                    min="0.5"
                    step="0.5"
                    type="range"
                    value={turnoverLakhs}
                    onChange={(e) => setTurnoverLakhs(Number(e.target.value))}
                  />
                </div>

                <div className="p-3.5 bg-brand-50/70 rounded-xl border border-brand-200/60 text-xs text-brand-900 flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" fillRule="evenodd" />
                  </svg>
                  <span>
                    Calculated with 20 trading sessions/month, standard discount broker ₹20 flat rate + revised STT (0.02% / 0.1%) + 18% GST + Exchange fees.
                  </span>
                </div>
              </div>

              {/* Calculated Output Column */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Monthly Hidden Leakage
                </span>
                <div className="text-3xl sm:text-4xl font-black text-rose-600 mt-2 font-mono">
                  -₹{totalMonthlyCost.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-slate-500 mt-1">Eaten by Brokerage &amp; Taxes every 20 days</p>

                <div className="my-4 border-t border-slate-100"></div>

                <div className="text-left space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Brokerage:</span>
                    <span className="font-bold">₹{brokerageTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated STT &amp; GST:</span>
                    <span className="font-bold">₹{sttAndGstTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Annual Drain:</span>
                    <span className="font-bold text-rose-700">₹{totalYearlyCost.toLocaleString('en-IN')}/yr</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Link
                    className="block w-full py-2.5 px-4 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 transition-colors text-center"
                    href="/onboarding"
                  >
                    Plug This Leak with TradeDairy →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: InteractiveTrueNetCalculator */}

      {/* BEGIN: AppExperienceShowcase */}
      <section className="py-20 bg-slate-50" id="app-preview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
              Multi-Platform Ecosystem
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Comprehensive Desktop Terminal Meets 1-Tap Mobile Logging
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              Analyze deep monthly metrics at your trading desk. Log quick impulsive trades or mobile executions on the go with zero friction.
            </p>
          </div>

          {/* App Ecosystem Preview Reference Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">TradeDairy Complete Suite Snapshot</h3>
                <p className="text-xs text-slate-500">
                  Live dashboard analytics, mobile quick-entry workflow &amp; broker sync
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Desktop Web &amp; Android App
                </span>
              </div>
            </div>

            {/* Provided UI Mockup Banner with full ecosystem */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex justify-center items-center">
              <img
                alt="TradeDairy Web Dashboard and Mobile App UI screens showing P&L, calendar heatmap, broker accounts, and trade details"
                className="w-full h-auto object-cover max-h-[700px] hover:scale-[1.01] transition-transform duration-300"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNolmnn2imxpC-KKZCakrQdyhrGu8_TxJCSMu4AYSFawDLMXHlVUFNrY6QFkuSGM6_JQBN4xiYukvPlfk7oCBRF74pJ4lCYsahyN31URIj6c2IOxANJzrJU6Qj2Ltw3Mrq4ueij0YSsedjFrMJP-vVUU_VcG8p-wVp5tPASjWPOQa3hMk3BByfEGTAmcRjlqIY6mp_sDx7K47A3QnC1QOK7Ca3qyhPBtZpC3AhZqNNvumvDfCt1nJ4GnEgZ6mORfdsqw"
                loading="lazy"
              />
            </div>

            {/* Feature Callouts below the app reference */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 text-center">
              <div className="p-3 rounded-xl bg-slate-50">
                <div className="text-sm font-bold text-slate-900">1. Instant Welcome / Sync</div>
                <div className="text-xs text-slate-500 mt-0.5">Secure Google SSO &amp; Mobile QR</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <div className="text-sm font-bold text-slate-900">2. Home Dashboard</div>
                <div className="text-xs text-slate-500 mt-0.5">Real-time cumulative equity curves</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <div className="text-sm font-bold text-slate-900">3. Quick Add Form</div>
                <div className="text-xs text-slate-500 mt-0.5">Lots &amp; Units with custom lot sizes</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <div className="text-sm font-bold text-slate-900">4. Precision Analytics</div>
                <div className="text-xs text-slate-500 mt-0.5">Win rate &amp; Profit Factor breakdown</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: AppExperienceShowcase */}

      {/* BEGIN: PricingSection */}
      <section className="py-20 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
              Simple, Transparent Pricing
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900">
              Invest Less Than One Stop-Loss In Your Trading Edge
            </h2>
            <p className="mt-3 text-slate-600">
              No hidden lock-ins. Cancel anytime with a single click. All plans include automated contract fee calculators.
            </p>

            {/* Billing Toggle */}
            <div className="mt-6 inline-flex items-center p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Annual <span className="text-brand-600 font-bold">(Save 28%)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Tier 1: Free Starter */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Free Starter</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">₹0</span>
                  <span className="text-slate-500 text-sm">/ forever</span>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Great for beginners getting accustomed to logging discipline.
                </p>
                <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700 border-t border-slate-100 pt-6">
                  <li className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    Up to 25 trades logged per month
                  </li>
                  <li className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    1 Broker Book connection
                  </li>
                  <li className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    Standard STT &amp; Tax Estimator
                  </li>
                  <li className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    Basic Win Rate &amp; Profit Factor
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    Behavioral FOMO Analytics
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  className="block w-full py-3 px-4 text-center text-sm font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 transition-colors"
                  href="/onboarding"
                >
                  Start Free Today
                </Link>
              </div>
            </div>

            {/* Tier 2: Trader Pro (Featured) */}
            <div className="bg-white rounded-3xl p-8 border-2 border-brand-500 shadow-xl shadow-brand-500/10 flex flex-col justify-between relative transform md:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[11px] font-extrabold uppercase tracking-wider py-1 px-3.5 rounded-full shadow-sm">
                Most Popular • Serious Traders
              </div>
              <div>
                <div className="text-sm font-bold uppercase tracking-wider text-brand-600 mb-2">Trader Pro</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {billingCycle === 'annual' ? '₹583' : '₹799'}
                  </span>
                  <span className="text-slate-500 text-sm">/ month</span>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {billingCycle === 'annual'
                    ? 'Billed annually at ₹6,999 (Save 28%). Full institutional toolkit.'
                    : 'Billed monthly. Full institutional toolkit.'}
                </p>
                <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700 border-t border-slate-100 pt-6">
                  <li className="flex items-center gap-2.5 font-medium">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    Unlimited Monthly Trades &amp; F&amp;O Expiries
                  </li>
                  <li className="flex items-center gap-2.5 font-medium">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    Unlimited Broker API Syncs (Zerodha, Groww, Angel)
                  </li>
                  <li className="flex items-center gap-2.5 font-medium">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    Behavioral Leak AI (FOMO / Revenge tagging)
                  </li>
                  <li className="flex items-center gap-2.5 font-medium">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    365-Day P&amp;L Heatmaps &amp; Intraday Cumulative Curve
                  </li>
                  <li className="flex items-center gap-2.5 font-medium">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    TradingView Execution Screenshot Storage
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  className="w-full inline-flex justify-center items-center py-3.5 px-4 text-center text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/30 transition-all"
                  href="/login?mode=signup&plan=pro"
                >
                  Unlock Trader Pro (7-Day Trial)
                </Link>
              </div>
            </div>

            {/* Tier 3: Funded Desk */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Funded Desk / Prop
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {billingCycle === 'annual' ? '₹1,439' : '₹1,999'}
                  </span>
                  <span className="text-slate-500 text-sm">/ month</span>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  For multi-account pro traders, family offices &amp; prop accounts.
                </p>
                <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700 border-t border-slate-100 pt-6">
                  <li className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    Everything in Trader Pro
                  </li>
                  <li className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    Aggregated Multi-Account Risk Rules
                  </li>
                  <li className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    Drawdown Breaker Alarms (WhatsApp &amp; Telegram)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    Dedicated Concierge CSV Onboarding
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <a
                  className="block w-full py-3 px-4 text-center text-sm font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 transition-colors"
                  href="mailto:support@tradedairy.online?subject=Funded%20Desk%20Inquiry"
                >
                  Talk to Desk Specialist
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: PricingSection */}

      {/* BEGIN: VerifiedReviewsSection */}
      <section className="py-20 bg-slate-50 border-t border-slate-200" id="reviews">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
              Real Trader Voices
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900">
              How Disciplined Indian Traders Transformed Their Edge
            </h2>
            <p className="mt-3 text-slate-600">
              Genuine verified community reviews from Bangalore, Mumbai, Delhi, and Ahmedabad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  &ldquo;The STT &amp; brokerage engine opened my eyes. I used to think I was ₹45,000 in profit on BankNifty weekly options every month, only to discover ₹18,000 was vanishing in slippage and turnover charges. TradeDairy fixed my overtrading in 2 weeks.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  VP
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Vinkal Prajapati</div>
                  <div className="text-[11px] text-slate-500">Nifty Options Scalper • Ahmedabad</div>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  &ldquo;Tagging &lsquo;FOMO Entry&rsquo; is brutally honest. TradeDairy showed that 82% of my red days happened whenever I entered a trade after 2:30 PM. I stopped afternoon trades completely and my monthly win rate jumped from 46% to 64%.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm">
                  RK
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Rohit Krishnamurthy</div>
                  <div className="text-[11px] text-slate-500">Futures Trader (Zerodha Kite) • Bengaluru</div>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  &ldquo;Being able to import tradebooks from both Angel One and Groww into a single dashboard calendar is incredible. Clean UI, lightning fast, and works brilliantly on my Android phone when I&apos;m away from my setup.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-sm">
                  SD
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Sneha Deshmukh</div>
                  <div className="text-[11px] text-slate-500">Equity Swing Trader • Pune</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: VerifiedReviewsSection */}

      {/* BEGIN: AccordionFAQ */}
      <section className="py-20 bg-white" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
              Clear Answers
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {/* Item 1 */}
            <div className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors">
              <button
                type="button"
                className="w-full flex justify-between items-center text-left text-base font-bold text-slate-900 focus:outline-none cursor-pointer"
                onClick={() => toggleFaq(0)}
              >
                <span>Is my broker account login safe? Does TradeDairy have trade execution access?</span>
                <span className="text-slate-400 text-xl font-mono">{openFaq === 0 ? '−' : '+'}</span>
              </button>
              {openFaq === 0 && (
                <div className="pt-3 text-sm text-slate-600 leading-relaxed">
                  TradeDairy operates strictly on <strong>Read-Only API access</strong> and standard encrypted CSV tradebook uploads. We <em>never</em> have permission to place orders, execute transactions, withdraw funds, or access your banking credentials. All credentials use bank-grade AES 256-bit encryption.
                </div>
              )}
            </div>

            {/* Item 2 */}
            <div className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors">
              <button
                type="button"
                className="w-full flex justify-between items-center text-left text-base font-bold text-slate-900 focus:outline-none cursor-pointer"
                onClick={() => toggleFaq(1)}
              >
                <span>How does the contract note &amp; STT calculation handle budget revisions?</span>
                <span className="text-slate-400 text-xl font-mono">{openFaq === 1 ? '−' : '+'}</span>
              </button>
              {openFaq === 1 && (
                <div className="pt-3 text-sm text-slate-600 leading-relaxed">
                  Our statutory calculation engine is automatically updated for the latest Indian Union Budget changes (including updated F&amp;O Securities Transaction Tax rates of 0.02% on futures and 0.1% on options premium, NSE/BSE transaction charges, and state stamp duty rules).
                </div>
              )}
            </div>

            {/* Item 3 */}
            <div className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors">
              <button
                type="button"
                className="w-full flex justify-between items-center text-left text-base font-bold text-slate-900 focus:outline-none cursor-pointer"
                onClick={() => toggleFaq(2)}
              >
                <span>Can I import past trade histories from Zerodha, Groww, or Upstox?</span>
                <span className="text-slate-400 text-xl font-mono">{openFaq === 2 ? '−' : '+'}</span>
              </button>
              {openFaq === 2 && (
                <div className="pt-3 text-sm text-slate-600 leading-relaxed">
                  Yes! You can export your standard tradebook CSV or Excel file from Zerodha Console, Groww Reports, or Angel One and upload it with one click. TradeDairy parses multi-leg executions and merges buys and sells into completed P&amp;L trades automatically.
                </div>
              )}
            </div>

            {/* Item 4 */}
            <div className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors">
              <button
                type="button"
                className="w-full flex justify-between items-center text-left text-base font-bold text-slate-900 focus:outline-none cursor-pointer"
                onClick={() => toggleFaq(3)}
              >
                <span>Is there a mobile app available?</span>
                <span className="text-slate-400 text-xl font-mono">{openFaq === 3 ? '−' : '+'}</span>
              </button>
              {openFaq === 3 && (
                <div className="pt-3 text-sm text-slate-600 leading-relaxed">
                  Yes, TradeDairy is fully responsive on desktop web, mobile web, and offers our dedicated Android app with quick trade-logging buttons, push mistake notifications, and daily P&amp;L summary cards.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* END: AccordionFAQ */}

      {/* BEGIN: CallToActionBanner */}
      <section className="py-16 bg-gradient-to-tr from-brand-900 via-brand-800 to-teal-900 text-white relative overflow-hidden" id="cta">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-xs font-semibold uppercase tracking-wider mb-4">
            Stop Trading Blind
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto">
            Start Logging With Precision in Less Than 60 Seconds
          </h2>
          <p className="mt-4 text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto">
            Join 18,650+ disciplined Indian stock and options traders mastering their psychology and protecting their capital with TradeDairy.online.
          </p>

          {/* Instant Email Form */}
          <form className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-2.5" onSubmit={handleCtaSubmit}>
            <input
              className="flex-1 px-4 py-3.5 rounded-full text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 border-none shadow-inner"
              placeholder="Enter your email address"
              type="email"
              value={ctaEmail}
              onChange={(e) => setCtaEmail(e.target.value)}
            />
            <button
              className="px-6 py-3.5 bg-brand-400 hover:bg-brand-300 text-slate-950 font-bold text-sm rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer"
              type="submit"
            >
              Create Free Journal
            </button>
          </form>
          <p className="mt-3 text-xs text-brand-200">
            Free forever plan • No credit card required • Direct broker sync
          </p>
        </div>
      </section>
      {/* END: CallToActionBanner */}

      {/* BEGIN: MainFooter */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            {/* Brand Summary */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <BrandLogo className="h-7 w-auto" textColor="#ffffff" />
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-900 text-brand-300 border border-brand-800">
                  .online
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mb-4">
                India&apos;s dedicated trading journal &amp; cognitive behavior tracker designed for NSE/BSE intraday scalpers, swing traders, and F&amp;O market participants.
              </p>
              <div className="flex items-center gap-2 text-slate-500">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                  🔒 256-Bit SSL Encrypted
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                  ⚡ Read-Only API
                </span>
              </div>
            </div>

            {/* Links Column 1: Product */}
            <div>
              <div className="text-slate-200 font-semibold text-sm mb-3">Product</div>
              <ul className="space-y-2">
                <li>
                  <Link className="hover:text-white transition-colors" href="/brokerage-calculator">
                    STT &amp; Tax Engine
                  </Link>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="#features">
                    Behavior Leak AI
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="#features">
                    TradingView Overlay
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="#calculator">
                    True Net P&amp;L Tool
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="#pricing">
                    Pricing Plans
                  </a>
                </li>
              </ul>
            </div>

            {/* Links Column 2: Brokers Supported */}
            <div>
              <div className="text-slate-200 font-semibold text-sm mb-3">Brokers Supported</div>
              <ul className="space-y-2">
                <li>
                  <Link className="hover:text-white transition-colors" href="/broker-sync">
                    Zerodha Kite Sync
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition-colors" href="/broker-sync">
                    Groww Tradebook
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition-colors" href="/broker-sync">
                    Angel One SmartAPI
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition-colors" href="/broker-sync">
                    Upstox Integration
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition-colors" href="/broker-sync">
                    Dhan &amp; Fyers API
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Column 3: Legal & Policy */}
            <div>
              <div className="text-slate-200 font-semibold text-sm mb-3">Legal &amp; Policy</div>
              <ul className="space-y-2">
                <li>
                  <Link className="hover:text-white transition-colors" href="/privacy">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition-colors" href="/about">
                    About &amp; Security
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition-colors" href="/trading-journal">
                    Trading Journal
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition-colors" href="/intraday-trading-journal">
                    Intraday Journal
                  </Link>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="mailto:support@tradedairy.online">
                    Support &amp; Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Statutory SEBI & Risk Disclosures */}
          <div className="border-t border-slate-900 pt-6 text-[11px] leading-relaxed text-slate-400">
            <p className="mb-2">
              <strong>Regulatory &amp; Risk Disclosure:</strong> TradeDairy (TradeDairy.online) is a software utility and analytics tracking application for trade journaling and mathematical performance evaluation. TradeDairy is NOT a SEBI registered investment adviser, research analyst, or portfolio manager. We do not provide buy/sell recommendations, stock tips, trading signals, or algorithmic order routing.
            </p>
            <p>
              Derivatives (Futures &amp; Options) trading involves substantial risk of loss and is not suitable for all investors. According to SEBI study data, 9 out of 10 individual traders in the equity F&amp;O segment incurred net losses. Trade with capital you can afford to lose.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-slate-400 text-xs">
              <div>© 2026 TradeDairy.online. All rights reserved.</div>
              <div className="mt-2 sm:mt-0">Crafted with precision for disciplined Indian traders.</div>
            </div>
          </div>
        </div>
      </footer>
      {/* END: MainFooter */}

      {/* BEGIN: AuthenticationModal */}
      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setAuthModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 cursor-pointer"
              onClick={() => setAuthModalOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex justify-center mb-2">
                <BrandLogo showText={false} className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Welcome to TradeDairy</h3>
              <p className="text-xs text-slate-500 mt-1">Access your journal, analytics &amp; broker sync</p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-2 text-[11px] text-slate-400 uppercase tracking-wider">
                or sign in with email
              </span>
            </div>

            {/* Email form */}
            <form className="space-y-3" onSubmit={handleEmailLogin}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="trader@domain.com"
                  required
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <Link
                    className="text-[11px] text-brand-600 hover:underline"
                    href="/login"
                    onClick={() => setAuthModalOpen(false)}
                  >
                    Forgot?
                  </Link>
                </div>
                <input
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>
              <button
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors mt-2 cursor-pointer"
                type="submit"
              >
                Sign In to Dairy
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <Link
                href="/login"
                className="hover:underline text-slate-600"
                onClick={() => setAuthModalOpen(false)}
              >
                Full Login Page →
              </Link>
              <Link
                className="text-brand-600 font-bold hover:underline"
                href="/onboarding"
                onClick={() => setAuthModalOpen(false)}
              >
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* END: AuthenticationModal */}
    </div>
  );
}
