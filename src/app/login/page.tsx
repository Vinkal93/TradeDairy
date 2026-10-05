'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { useTrades } from '../../context/TradeContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import {
  loginWithEmail,
  signupWithEmail,
  loginWithGoogle,
  resetPassword,
} from '../../lib/firebase';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-sm text-outline">
          Loading authentication…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login } = useTrades();

  // Mode: 'login' or 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>(() => {
    return searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States: loading, success, error, notice
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Forgot password modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // QR Code Login (Secondary option)
  const [showQrOption, setShowQrOption] = useState(false);
  const [qrToken, setQrToken] = useState<string>('');
  const [qrPin, setQrPin] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrStatus, setQrStatus] = useState<'PENDING' | 'AUTHORIZED' | 'EXPIRED'>('PENDING');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (user.isLoggedIn) {
      router.replace('/');
    }
  }, [user.isLoggedIn, router]);

  // Handle post-login navigation based on onboarding status
  const handleAuthSuccess = async (
    displayName: string,
    userEmail: string,
    photoURL?: string,
    uid?: string
  ) => {
    setLoading(true);
    setLoadingMessage('Loading your cloud workspace…');
    setSuccessMessage('Authentication successful! Loading your journal…');

    try {
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#006948', '#85f8c4', '#10B981'],
      });
    } catch {}

    try {
      const result = await login(displayName, userEmail, photoURL, uid);
      // Onboarding questionnaire is strictly for brand new signups.
      // Anyone logging in (mode === 'login') or with existing account directly enters Dashboard!
      if (mode === 'login' || result.isOnboarded) {
        setSuccessMessage('Welcome back! Entering Dashboard…');
        router.push('/');
      } else {
        setSuccessMessage('Account ready! Setting up your profile…');
        router.push('/onboarding');
      }
    } catch (err: any) {
      console.error('Post-auth initialization error:', err);
      router.push('/');
    }
  };

  // 1. Primary Action: Google Sign-In
  const handleGoogleSignIn = async () => {
    setError('');
    setNotice('');
    setSuccessMessage('');
    setLoading(true);
    setLoadingMessage('Connecting with Google…');

    try {
      const userCredential = await loginWithGoogle();
      await handleAuthSuccess(
        userCredential.displayName || 'Google Trader',
        userCredential.email || 'trader@google.com',
        userCredential.photoURL || undefined,
        userCredential.uid
      );
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setLoading(false);
      setLoadingMessage('');
      if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        setError(
          `Domain "${currentDomain}" is not authorized for Google Sign-In. Add it to Firebase Console -> Authentication -> Authorized domains.`
        );
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in could not be completed. Please try again or use email.');
      }
    }
  };

  // 2. Email / Password Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setError('');
    setNotice('');
    setSuccessMessage('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    if (mode === 'signup') {
      setLoadingMessage('Creating your account…');
      const cleanName = name.trim() || cleanEmail.split('@')[0] || 'Active Trader';

      try {
        const userCredential = await signupWithEmail(cleanEmail, password, cleanName);
        await handleAuthSuccess(
          userCredential.displayName || cleanName,
          userCredential.email || cleanEmail,
          userCredential.photoURL || undefined,
          userCredential.uid
        );
      } catch (signupErr: any) {
        // Direct Login Fallback: If user already exists, try signing in directly with the password!
        if (signupErr.code === 'auth/email-already-in-use') {
          try {
            setLoadingMessage('Account exists. Signing you in…');
            const loginCredential = await loginWithEmail(cleanEmail, password);
            await handleAuthSuccess(
              loginCredential.displayName || cleanName,
              loginCredential.email || cleanEmail,
              loginCredential.photoURL || undefined,
              loginCredential.uid
            );
            return;
          } catch {
            setLoading(false);
            setLoadingMessage('');
            setMode('login');
            setError('Account already exists for this email! Please enter your password to sign in.');
            return;
          }
        }
        setLoading(false);
        setLoadingMessage('');
        if (signupErr.code === 'auth/weak-password') {
          setError('Password should be at least 6 characters.');
        } else if (signupErr.code === 'auth/invalid-email') {
          setError('Please enter a valid email address.');
        } else {
          setError(signupErr.message || 'Sign up failed. Please try again.');
        }
      }
    } else {
      // Sign In mode
      setLoadingMessage('Verifying credentials…');
      try {
        const userCredential = await loginWithEmail(cleanEmail, password);
        await handleAuthSuccess(
          userCredential.displayName || cleanEmail.split('@')[0] || 'Active Trader',
          userCredential.email || cleanEmail,
          userCredential.photoURL || undefined,
          userCredential.uid
        );
      } catch (loginErr: any) {
        setLoading(false);
        setLoadingMessage('');
        if (
          loginErr.code === 'auth/user-not-found' ||
          loginErr.code === 'auth/wrong-password' ||
          loginErr.code === 'auth/invalid-credential'
        ) {
          setError('Incorrect email or password. Please verify and try again.');
        } else if (loginErr.code === 'auth/too-many-requests') {
          setError('Too many failed attempts. Please reset your password or try again later.');
        } else {
          setError(loginErr.message || 'Could not sign in. Please verify your credentials.');
        }
      }
    }
  };

  // 3. Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    try {
      await resetPassword(resetEmail.trim());
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    }
  };

  // 4. Initialize QR Session
  const initQrSession = useCallback(async () => {
    setQrLoading(true);
    setQrStatus('PENDING');

    try {
      const res = await fetch('/api/auth/qr-session', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create QR session');

      setQrToken(data.token);
      setQrPin(data.pin);

      if (canvasRef.current) {
        const qrUrl = `${window.location.origin}/auth/qr?token=${encodeURIComponent(
          data.token
        )}&pin=${encodeURIComponent(data.pin)}`;
        await QRCode.toCanvas(canvasRef.current, qrUrl, {
          width: 180,
          margin: 1,
          color: { dark: '#006948', light: '#ffffff' },
        });
      }
      setQrLoading(false);
    } catch {
      setQrLoading(false);
    }
  }, []);

  // Poll QR session status
  useEffect(() => {
    if (!showQrOption || !qrToken || qrStatus !== 'PENDING') return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/qr-session?token=${encodeURIComponent(qrToken)}`);
        const data = await res.json();

        if (data.status === 'AUTHORIZED' && data.user) {
          setQrStatus('AUTHORIZED');
          clearInterval(pollIntervalRef.current!);
          await handleAuthSuccess(
            data.user.fullName || data.user.name || 'Mobile Trader',
            data.user.email || 'trader@mobile.com',
            data.user.avatar || data.user.photoURL || undefined,
            data.user.uid || undefined
          );
        } else if (data.status === 'EXPIRED') {
          setQrStatus('EXPIRED');
          clearInterval(pollIntervalRef.current!);
        }
      } catch {}
    }, 2000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [showQrOption, qrToken, qrStatus]);

  useEffect(() => {
    if (showQrOption && !qrToken) {
      initQrSession();
    }
  }, [showQrOption, qrToken, initQrSession]);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between antialiased selection:bg-brand-500/20">
      {/* Top Header */}
      <header className="h-16 px-4 sm:px-8 max-w-5xl mx-auto w-full flex items-center justify-between border-b border-surface-container/60 bg-white/90 backdrop-blur-md">
        <Link href="/" prefetch={true} className="flex items-center gap-2">
          <BrandLogo className="h-8 w-auto" />
          <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
            .online
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
        >
          ← Back to Home
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-card-elevated border border-slate-200 flex flex-col gap-5 relative">
          {/* Header Title */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {mode === 'signup' ? 'Create Your Account' : 'Welcome to TradeDairy'}
            </h1>
            <p className="text-xs text-slate-500">
              {mode === 'signup'
                ? 'Sign up to activate cross-device realtime cloud sync.'
                : 'Sign in to access your trading journal, ledger & analytics.'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">check_circle</span>
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {notice && !successMessage && (
            <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-800 font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[18px] text-brand-600 shrink-0">info</span>
              <span className="leading-relaxed">{notice}</span>
            </div>
          )}

          {error && !successMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0 mt-0.5">error</span>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* PRIMARY OPTION: Continue with Google */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {loading && loadingMessage.includes('Google') ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting Google…</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Recommended for instant, secure 1-click access
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-1 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">
              or continue with email
            </span>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900'
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
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Trading Alias
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vinkal Prajapati"
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@domain.com"
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setForgotModalOpen(true);
                    }}
                    className="text-[11px] text-brand-600 hover:underline font-semibold cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/20 transition-all cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading && !loadingMessage.includes('Google') ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{loadingMessage || 'Authenticating…'}</span>
                </div>
              ) : mode === 'signup' ? (
                'Create Account & Enter'
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Secondary Option: Mobile QR Login */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowQrOption(!showQrOption)}
              className="w-full flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 py-1.5 font-medium cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-brand-600">qr_code_2</span>
                <span>Log in using Phone QR code</span>
              </span>
              <span className="text-slate-400 text-sm">{showQrOption ? '▲' : '▼'}</span>
            </button>

            {showQrOption && (
              <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center animate-in fade-in duration-200">
                <p className="text-xs text-slate-600 mb-3">
                  Scan with your logged-in phone or enter the PIN to authorize this browser:
                </p>
                <div className="flex flex-col items-center justify-center">
                  <canvas ref={canvasRef} className="rounded-xl shadow-xs bg-white p-1 border border-slate-200" />
                  {qrLoading && <p className="text-xs text-slate-400 mt-2">Generating QR code…</p>}
                  {qrPin && (
                    <div className="mt-3">
                      <span className="text-[11px] text-slate-400 block mb-1">Direct Auth PIN:</span>
                      <span className="font-mono text-xl font-bold tracking-widest text-brand-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs">
                        {qrPin}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setForgotModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900 mb-1">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your email and we will send you a secure link to reset your password.
            </p>

            {resetSent ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  Password reset link sent to <strong>{resetEmail}</strong>. Please check your inbox.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(false);
                    setResetSent(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3.5 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-100">
        © 2026 TradeDairy.online • All rights reserved
      </footer>
    </div>
  );
}
