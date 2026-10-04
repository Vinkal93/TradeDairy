'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTrades } from '../../context/TradeContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { loginWithEmail, signupWithEmail, loginWithGoogle, resetPassword } from '../../lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useTrades();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const handlePasswordReset = async () => {
    if (!email.trim()) { setError('Enter your email address first.'); return; }
    setLoading(true);
    setError('');
    setNotice('');
    try {
      await resetPassword(email.trim());
      setNotice('Password reset requested. Check your email for the next steps.');
    } catch {
      setError('Could not request a password reset. Check your email and connection.');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const user = await signupWithEmail(email, password, name || email.split('@')[0]);
        login(user.displayName || name || email.split('@')[0], user.email || email);
        router.push('/');
      } else {
        const user = await loginWithEmail(email, password);
        login(user.displayName || email.split('@')[0], user.email || email);
        router.push('/');
      }
    } catch (err: any) {
      console.warn('Firebase auth attempt error:', err);
      // Friendly message based on Firebase error code
      let msg = err.message || 'Authentication failed. Please check credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. You can also sign up or use 1-Click Demo Login below.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please switch to Sign In.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        msg = `Domain "${currentDomain}" is not in Firebase Authorized Domains. Add it in Firebase Console > Authentication > Settings > Authorized domains.`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await loginWithGoogle();
      login(user.displayName || 'Google Trader', user.email || 'trader@google.com');
      router.push('/');
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'your-app.vercel.app';
        setError(
          `Domain "${currentDomain}" is not authorized for Google Sign-In. Please add "${currentDomain}" to Firebase Console -> Authentication -> Settings -> Authorized domains. You can also use 1-Click Demo Login or Email/Password below!`
        );
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in cancelled or not enabled.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    login('Vinkal Prajapati', 'vinkal@tradedairy.online');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between antialiased">
      {/* Top Header */}
      <header className="h-16 px-6 lg:px-12 flex items-center justify-between border-b border-surface-container/60 bg-surface-container-lowest/80 backdrop-blur-md">
        <Link href="/" prefetch={true}>
          <BrandLogo />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/onboarding"
            prefetch={true}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-on-surface-variant bg-surface-container-low hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span className="hidden sm:inline">Setup Wizard</span>
          </Link>
          <Link
            href="/su"
            prefetch={true}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
            title="Super Admin Portal"
          >
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            <span className="hidden sm:inline">Super Admin (/su)</span>
          </Link>
          <Link
            href="/"
            prefetch={true}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-hover shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-md border border-surface-container/80 flex flex-col gap-5 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>

          {/* Title & Mode Switcher */}
          <div className="text-center">
            <h1 className="font-headline-xl text-2xl font-bold text-on-surface tracking-tight">
              {mode === 'login' ? 'Welcome Back to TradeDairy' : 'Create Your Trader Account'}
            </h1>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">
              {mode === 'login'
                ? 'Sign in to access your journal, analytics, and risk ledger.'
                : 'Start tracking your setups, emotions, and trading performance.'}
            </p>
          </div>

          {/* Quick Demo One-Click Login */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-primary-fixed/40 hover:bg-primary-fixed/60 border border-primary/20 text-on-primary-fixed font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">bolt</span>
            <span>1-Click Demo Login (Vinkal Prajapati)</span>
          </button>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-on-surface font-semibold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 text-xs text-outline my-0.5">
            <div className="flex-1 h-px bg-surface-container"></div>
            <span>or email credentials</span>
            <div className="flex-1 h-px bg-surface-container"></div>
          </div>

          {/* Tab Selector */}
          <div className="flex p-1 rounded-lg bg-surface-container-low border border-surface-container text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign Up (New Trader)
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {notice && <p role="status" className="p-3 rounded-lg bg-primary/10 text-primary text-xs">{notice}</p>}
            {error && (
              <div className="p-3 rounded-lg bg-error-container/30 border border-error/40 text-xs text-error font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] flex-shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {mode === 'signup' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Your Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vinkal Prajapati"
                  className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container focus:bg-surface-container-lowest"
                  required={mode === 'signup'}
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container focus:bg-surface-container-lowest"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-on-surface">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={loading}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container focus:bg-surface-container-lowest"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs shadow-md transition-all cursor-pointer mt-2 disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              <span>{mode === 'login' ? 'Sign In to Journal' : 'Create Account & Begin Setup'}</span>
            </button>
          </form>

          {/* Super Admin Access Direct Link */}
          <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">security</span>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-on-surface">Super Admin Access</span>
                <span className="text-[10px] text-on-surface-variant">Platform governance &amp; telemetry</span>
              </div>
            </div>
            <Link
              href="/su"
              className="px-2.5 py-1 rounded bg-secondary text-on-secondary text-[10px] font-bold hover:bg-secondary/90 transition-colors"
            >
              Open /su
            </Link>
          </div>

          <p className="text-center text-[11px] text-on-surface-variant">
            By signing in, you agree to TradeDairy&apos;s Terms of Service &amp; Zero-Knowledge Data Privacy policy.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-on-surface-variant border-t border-surface-container/60">
        © 2026 TradeDairy.online • Focused Journaling for Disciplined Traders
      </footer>
    </div>
  );
}
