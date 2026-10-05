'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useTrades } from '../../context/TradeContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { UserProfile } from '../../types';

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

interface BadgePreset {
  id: string;
  emoji: string;
  name: string;
  subtitle: string;
  colors: [string, string];
}

const TRADER_BADGES: BadgePreset[] = [
  { id: 'bull', emoji: '🐂', name: 'Bull Leader', subtitle: 'Trend Following', colors: ['#059669', '#10B981'] },
  { id: 'bear', emoji: '🐻', name: 'Bear Hunter', subtitle: 'Shorts & Put Options', colors: ['#DC2626', '#EF4444'] },
  { id: 'scalper', emoji: '⚡', name: 'Scalper King', subtitle: 'Speed & Quick Exits', colors: ['#D97706', '#F59E0B'] },
  { id: 'sniper', emoji: '🎯', name: 'Sniper Precision', subtitle: 'High R:R Setups', colors: ['#2563EB', '#3B82F6'] },
  { id: 'hawk', emoji: '🦅', name: 'Hawk Eye', subtitle: 'Patience & Watchlists', colors: ['#4F46E5', '#6366F1'] },
  { id: 'diamond', emoji: '💎', name: 'Diamond Hands', subtitle: 'Strong Conviction', colors: ['#0284C7', '#38BDF8'] },
  { id: 'quant', emoji: '🧠', name: 'Quant Mind', subtitle: 'Data & Probability', colors: ['#7C3AED', '#8B5CF6'] },
  { id: 'rocket', emoji: '🚀', name: 'Breakout Pro', subtitle: 'Momentum Scalping', colors: ['#059669', '#34D399'] },
];

function createEmojiBadgeSvg(emoji: string, colors: [string, string]): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colors[0]}" />
        <stop offset="100%" stop-color="${colors[1]}" />
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="64" fill="url(#g)" />
    <text x="50%" y="54%" font-size="58" dominant-baseline="central" text-anchor="middle">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const DISCOVERY_SOURCES = [
  { id: 'youtube', label: 'YouTube', icon: 'smart_display', detail: 'Trading tutorials, option reviews, educational videos' },
  { id: 'instagram', label: 'Instagram', icon: 'photo_camera', detail: 'Trading reels, stories, financial creator posts' },
  { id: 'twitter', label: 'Twitter / X', icon: 'tag', detail: 'FinTwit, live market commentary, trading setups' },
  { id: 'telegram', label: 'Telegram', icon: 'chat', detail: 'Option buying/selling groups, trader channels' },
  { id: 'friend', label: 'Trader Friend / Mentor', icon: 'group', detail: 'Personal recommendation from fellow trader' },
  { id: 'google', label: 'Google Search', icon: 'search', detail: 'Searching for trade journal, STT or brokerage calculator' },
  { id: 'reddit', label: 'Reddit / Trading Forum', icon: 'forum', detail: 'r/IndianStreetBets, Discord or trading discussions' },
  { id: 'other', label: 'Other Source', icon: 'more_horiz', detail: 'Another platform, podcast, or blog' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser, isLoaded, logout } = useTrades();
  const [isPending, startTransition] = useTransition();

  // Step state (1: Welcome, 2: Name, 3: Photo, 4: Discovery, 5: Success)
  const [step, setStep] = useState<OnboardingStep>(1);

  // Form states
  const [name, setName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [discoverySource, setDiscoverySource] = useState('');
  const [otherText, setOtherText] = useState('');

  // UI states
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasInitializedRef = useRef(false);

  // 1. Guard check:
  // - If user is not logged in: send them to /login (Onboarding is strictly POST-AUTH)
  // - If user is already onboarded: send them directly to dashboard /
  useEffect(() => {
    if (!isLoaded) return;
    if (!user.isLoggedIn) {
      router.replace('/login');
    } else if (user.isOnboarded) {
      router.replace('/');
    }
  }, [isLoaded, user.isLoggedIn, user.isOnboarded, router]);

  // 2. Resume saved onboarding step and restore profile defaults
  useEffect(() => {
    if (!isLoaded || !user.isLoggedIn || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // Initialize fields from existing user state
    if (user.fullName && user.fullName !== 'Trader' && user.fullName !== 'Active Trader') {
      setName(user.fullName);
    } else if (user.email) {
      // Clean fallback from email username
      const defaultFromEmail = user.email.split('@')[0].replace(/[._-]/g, ' ');
      const capitalized = defaultFromEmail
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      setName(capitalized);
    }

    if (user.profilePhoto || user.avatar) {
      setProfilePhoto(user.profilePhoto || user.avatar || '');
    }

    if (user.discoverySource) {
      if (user.discoverySource.startsWith('Other: ')) {
        setDiscoverySource('other');
        setOtherText(user.discoverySource.replace('Other: ', ''));
      } else {
        setDiscoverySource(user.discoverySource);
      }
    }

    // Resume from saved step if valid
    if (user.onboardingStep && user.onboardingStep >= 1 && user.onboardingStep <= 5) {
      setStep(user.onboardingStep as OnboardingStep);
    }
  }, [isLoaded, user]);

  // Trigger celebration confetti on step 5
  useEffect(() => {
    if (step === 5) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#006948', '#10B981', '#34D399', '#38BDF8'],
        });
      } catch {}
    }
  }, [step]);

  // Helper to persist step changes to local & cloud sync
  const advanceToStep = (nextStep: OnboardingStep, extraProfileUpdates?: Partial<UserProfile>) => {
    setError('');
    const updates: Partial<UserProfile> = {
      onboardingStep: nextStep,
      ...(extraProfileUpdates || {}),
    };
    updateUser(updates);
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 1: Welcome Next
  const handleWelcomeNext = () => {
    advanceToStep(2);
  };

  // Step 2: Name Validation & Continue
  const handleNameNext = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter your full name or trader alias.');
      return;
    }
    advanceToStep(3, { fullName: cleanName });
  };

  // Step 3: Photo Upload & Selection Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setError('Image size exceeds 2.5MB. Please choose a smaller photo.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setProfilePhoto(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectBadge = (badge: BadgePreset) => {
    const badgeSvgData = createEmojiBadgeSvg(badge.emoji, badge.colors);
    setProfilePhoto(badgeSvgData);
    setError('');
  };

  const handleRemovePhoto = () => {
    setProfilePhoto('');
  };

  const handlePhotoContinue = () => {
    advanceToStep(4, {
      profilePhoto: profilePhoto || '',
      avatar: profilePhoto || user.avatar || '',
    });
  };

  const handlePhotoSkip = () => {
    advanceToStep(4);
  };

  // Step 4: Discovery Source Handler
  const handleSelectDiscovery = (id: string) => {
    setDiscoverySource(id);
    setError('');
  };

  const getResolvedDiscoveryString = (): string => {
    if (!discoverySource) return '';
    if (discoverySource === 'other') {
      return otherText.trim() ? `Other: ${otherText.trim()}` : 'Other';
    }
    const match = DISCOVERY_SOURCES.find((s) => s.id === discoverySource);
    return match ? match.label : discoverySource;
  };

  const handleDiscoveryContinue = () => {
    const resolved = getResolvedDiscoveryString();
    advanceToStep(5, { discoverySource: resolved });
  };

  const handleDiscoverySkip = () => {
    advanceToStep(5);
  };

  // Step 5: Final Launch to Dashboard
  const handleLaunchDashboard = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    const resolvedName = name.trim() || user.fullName || 'Active Trader';
    const resolvedPhoto = profilePhoto || user.profilePhoto || user.avatar || '';
    const resolvedDiscovery = getResolvedDiscoveryString() || user.discoverySource || 'Direct';

    const finalProfile: Partial<UserProfile> = {
      fullName: resolvedName,
      profilePhoto: resolvedPhoto,
      avatar: resolvedPhoto,
      discoverySource: resolvedDiscovery,
      isOnboarded: true,
      onboardingStep: 5,
    };

    // 1. Update React context & localStorage immediately
    updateUser(finalProfile);

    // 2. Push directly to user cloud sync API
    try {
      if (user.email) {
        await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email.trim().toLowerCase(),
            user: finalProfile,
          }),
        });
      }
    } catch (e) {
      console.warn('Direct cloud sync push on onboarding complete:', e);
    }

    // 3. Enter Dashboard
    startTransition(() => {
      router.replace('/');
    });
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!isLoaded || !user.isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-outline">Loading your onboarding setup…</p>
      </div>
    );
  }

  const stepLabels = ['Welcome', 'Student Name', 'Profile Photo', 'Discovery', 'Complete'];
  const stepPercent = Math.round((step / 5) * 100);

  return (
    <div className="min-h-screen bg-[#f8faf9] text-on-surface flex flex-col justify-between antialiased selection:bg-primary/20">
      {/* Top Header */}
      <header className="h-16 px-4 sm:px-8 max-w-4xl mx-auto w-full flex items-center justify-between border-b border-surface-container/60">
        <Link href="/" prefetch={true} className="flex items-center gap-2">
          <BrandLogo />
        </Link>

        {/* Authenticated user pill & logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-medium text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="max-w-[170px] truncate">{user.email}</span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs text-outline hover:text-error transition-colors px-2 py-1 rounded hover:bg-error/5"
            title="Sign out of current account"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 sm:py-10 flex flex-col justify-center">
        {/* Progress Stepper Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-outline uppercase tracking-wider mb-2.5">
            <span className="text-primary font-bold">
              Step {step} of 5: {stepLabels[step - 1]}
            </span>
            <span className="text-on-surface-variant font-data-metric-md">{stepPercent}% completed</span>
          </div>

          {/* Stepper Dots & Track */}
          <div className="relative">
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${stepPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center -mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    step >= s
                      ? 'border-emerald-600 bg-white text-emerald-600'
                      : 'border-surface-container-high bg-surface-container-low text-outline'
                  }`}
                >
                  {step > s ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  ) : (
                    <span className="text-[9px] font-bold">{s}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div role="alert" className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* =========================================================================
            SCREEN 1: WELCOME
           ========================================================================= */}
        {step === 1 && (
          <div className="card space-y-6 animate-in fade-in-50 duration-300">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Account Authenticated
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
                Welcome to TradeDairy! 🚀
              </h1>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Precision trading journal &amp; performance analytics platform engineered for Indian intraday, F&amp;O options, and swing traders.
              </p>
            </div>

            {/* Signed-in Card */}
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'T'}
                </div>
                <div>
                  <p className="font-semibold text-on-surface">{user.fullName || 'New Trader'}</p>
                  <p className="text-outline">{user.email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Cloud Sync Ready
              </span>
            </div>

            {/* Core Value Props */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container/60 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">candlestick_chart</span>
                </div>
                <h2 className="font-bold text-xs text-on-surface">Options &amp; STT Engine</h2>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Type NIFTY 23000 to pick CE/PE. Auto-calculates STT, GST, and turnover brokerage.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container/60 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">devices</span>
                </div>
                <h2 className="font-bold text-xs text-on-surface">Cross-Device Sync</h2>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Your trades, journals, and accounts sync in real time across phone, tablet, and PC.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container/60 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">psychology</span>
                </div>
                <h2 className="font-bold text-xs text-on-surface">Discipline &amp; Rules</h2>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Audit emotional leaks, revenge trading, and rule compliance with daily reflection logs.
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleWelcomeNext}
                className="btn-primary w-full py-3.5 text-sm sm:text-base font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Started — Personalize Profile</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
              <p className="text-[11px] text-center text-outline mt-2">
                Takes less than 1 minute • You can update any detail later in Settings
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 2: STUDENT / TRADER NAME
           ========================================================================= */}
        {step === 2 && (
          <form onSubmit={handleNameNext} className="card space-y-6 animate-in fade-in-50 duration-300">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Step 2 of 5</span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface mt-1">
                What should we call you?
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
                Enter your real name or trader alias. This will personalize your daily trade reports, performance scorecards, and exported statements.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="studentNameInput" className="block text-xs font-bold uppercase text-on-surface mb-2">
                  Student / Trader Name <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    person
                  </span>
                  <input
                    id="studentNameInput"
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Vinkal Prajapati or Apex Trader"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Suggestions from Google / Email */}
              {user.email && (
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container/60 flex items-center justify-between text-xs">
                  <span className="text-outline">Signed-in account:</span>
                  <span className="font-semibold text-on-surface truncate max-w-[200px]">{user.email}</span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-800">
                <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0 mt-0.5">
                  info
                </span>
                <p className="leading-relaxed">
                  Your identity is private. You can customize this or switch to an alias anytime from your profile settings.
                </p>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => advanceToStep(1)}
                className="px-4 py-3 rounded-xl border border-surface-container text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                ← Back
              </button>

              <button
                type="submit"
                className="btn-primary py-3 px-6 text-sm font-semibold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        )}

        {/* =========================================================================
            SCREEN 3: PROFILE PHOTO UPLOAD
           ========================================================================= */}
        {step === 3 && (
          <div className="card space-y-6 animate-in fade-in-50 duration-300">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Step 3 of 5</span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface mt-1">
                Profile Picture &amp; Trader Badge
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
                Personalize your trading workspace with a profile photo, or select a trader badge.
              </p>
            </div>

            {/* Photo Preview & Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-surface-container-low border border-surface-container">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-3 border-emerald-600 p-0.5 shadow-md flex items-center justify-center bg-white overflow-hidden shrink-0">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Trader avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-3xl font-extrabold">
                      {name ? name.charAt(0).toUpperCase() : 'T'}
                    </div>
                  )}
                </div>

                {profilePhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    title="Remove photo"
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-error text-white flex items-center justify-center shadow-md hover:bg-error/90 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <h2 className="font-bold text-sm text-on-surface">
                  {name || 'Active Trader'}
                </h2>
                <p className="text-xs text-on-surface-variant">
                  {profilePhoto
                    ? 'Custom avatar selected. Fits your navigation and trade cards.'
                    : 'Upload your own image (PNG, JPG) or choose one of our trader badges below.'}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-white border border-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">upload</span>
                    <span>Upload Picture</span>
                  </button>

                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-2 rounded-xl border border-surface-container text-xs font-medium text-outline hover:text-error transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Trader Avatar Badges */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-on-surface">
                Or pick a quick trader badge:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TRADER_BADGES.map((badge) => (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => handleSelectBadge(badge)}
                    className="p-2.5 rounded-xl border border-surface-container bg-surface-container-lowest hover:bg-surface-container-low hover:border-emerald-600/50 transition-all text-left flex items-center gap-2 group cursor-pointer"
                  >
                    <span className="text-2xl p-1 rounded-lg bg-surface-container-low group-hover:scale-110 transition-transform">
                      {badge.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-on-surface truncate group-hover:text-emerald-700">
                        {badge.name}
                      </p>
                      <p className="text-[10px] text-outline truncate">{badge.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => advanceToStep(2)}
                className="px-4 py-3 rounded-xl border border-surface-container text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                ← Back
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePhotoSkip}
                  className="px-4 py-3 rounded-xl text-xs font-semibold text-outline hover:text-on-surface transition-colors"
                >
                  Skip for now
                </button>

                <button
                  type="button"
                  onClick={handlePhotoContinue}
                  className="btn-primary py-3 px-6 text-sm font-semibold shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 4: “WHERE DID YOU FIND US?”
           ========================================================================= */}
        {step === 4 && (
          <div className="card space-y-6 animate-in fade-in-50 duration-300">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Step 4 of 5</span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface mt-1">
                Where did you discover TradeDairy?
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
                Help us learn how you discovered us so we can continue providing the best features and tutorials for the trading community.
              </p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DISCOVERY_SOURCES.map((source) => {
                const isSelected = discoverySource === source.id;
                return (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => handleSelectDiscovery(source.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-600'
                        : 'border-surface-container bg-surface-container-lowest hover:bg-surface-container-low hover:border-surface-container-high'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {source.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold ${isSelected ? 'text-emerald-900' : 'text-on-surface'}`}>
                          {source.label}
                        </p>
                        {isSelected && (
                          <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                            check_circle
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-outline mt-0.5 leading-snug">{source.detail}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Conditional input if 'Other' is picked */}
            {discoverySource === 'other' && (
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container space-y-1.5 animate-in fade-in-50 duration-200">
                <label htmlFor="otherSourceInput" className="block text-xs font-semibold text-on-surface">
                  Please tell us where you heard about us:
                </label>
                <input
                  id="otherSourceInput"
                  type="text"
                  placeholder="e.g. Substack, WhatsApp community, Trading mentor..."
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>
            )}

            {/* Navigation buttons */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => advanceToStep(3)}
                className="px-4 py-3 rounded-xl border border-surface-container text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                ← Back
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDiscoverySkip}
                  className="px-4 py-3 rounded-xl text-xs font-semibold text-outline hover:text-on-surface transition-colors"
                >
                  Skip
                </button>

                <button
                  type="button"
                  onClick={handleDiscoveryContinue}
                  className="btn-primary py-3 px-6 text-sm font-semibold shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 5: FINAL SETUP / SUCCESS SCREEN → DASHBOARD
           ========================================================================= */}
        {step === 5 && (
          <div className="card space-y-6 animate-in fade-in-50 duration-300">
            <div className="text-center space-y-3">
              {/* Pulsing Success Badge */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <span className="material-symbols-outlined text-4xl">check</span>
                </div>
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  Ready to Trade with Discipline
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface mt-2">
                  You&apos;re All Set, {name || 'Trader'}!
                </h1>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto mt-1 leading-relaxed">
                  Your profile has been created and synced with your cloud trading account across all your devices.
                </p>
              </div>
            </div>

            {/* Profile Overview Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-surface-container space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-surface-container">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-600 shrink-0 bg-white flex items-center justify-center">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-emerald-800">
                      {name ? name.charAt(0).toUpperCase() : 'T'}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-sm text-on-surface truncate">{name || 'Active Trader'}</h2>
                  <p className="text-xs text-outline truncate">{user.email}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  Connected
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container/60">
                  <span className="text-[11px] text-outline block">Discovery Source</span>
                  <strong className="text-on-surface text-xs font-semibold truncate block mt-0.5">
                    {getResolvedDiscoveryString() || 'Direct Visit'}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container/60">
                  <span className="text-[11px] text-outline block">STT &amp; Charges Engine</span>
                  <strong className="text-emerald-700 text-xs font-semibold truncate block mt-0.5">
                    NSE / BSE / MCX Active
                  </strong>
                </div>
              </div>
            </div>

            {/* Final Launch Action */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting || isPending}
                onClick={handleLaunchDashboard}
                className="btn-primary w-full py-4 text-sm sm:text-base font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                {isSubmitting || isPending ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Launching Workspace…</span>
                  </>
                ) : (
                  <>
                    <span>Launch My Trading Dashboard 🚀</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => advanceToStep(4)}
                className="w-full text-center text-xs text-outline hover:text-on-surface py-1 transition-colors"
              >
                ← Back to edit discovery source
              </button>
            </div>

            <p className="text-[11px] text-center text-outline">
              🔒 Your trade data is encrypted and synced directly with your personal credentials.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="h-12 px-4 max-w-4xl mx-auto w-full flex items-center justify-center text-xs text-outline border-t border-surface-container/40">
        <span>© {new Date().getFullYear()} TradeDairy • Disciplined Trading Intelligence</span>
      </footer>
    </div>
  );
}
