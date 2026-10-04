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
          Loading authentication terminal…
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
  const { user, login, resetDemoData } = useTrades();

  const [authType, setAuthType] = useState<'credentials' | 'qr'>('credentials');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  // QR Session State
  const [qrToken, setQrToken] = useState<string>('');
  const [qrPin, setQrPin] = useState<string>('');
  const [qrStatus, setQrStatus] = useState<'PENDING' | 'AUTHORIZED' | 'EXPIRED'>('PENDING');
  const [qrLoading, setQrLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // If already logged in, redirect to Dashboard
  useEffect(() => {
    if (user.isLoggedIn) {
      router.replace('/');
    }
  }, [user.isLoggedIn, router]);

  // Check if arriving from onboarding wizard
  useEffect(() => {
    const fromParam = searchParams.get('from');
    if (typeof window !== 'undefined') {
      const storedName = sessionStorage.getItem('tradedairy_onboarding_name');
      if (storedName) {
        setName(storedName);
      }
      if (fromParam === 'onboarding' || storedName) {
        setMode('signup');
        setAuthType('credentials');
        setNotice('Profile configured! Create your account or sign in to activate real-time cloud sync.');
      }
    }
  }, [searchParams]);

  // Initialize or Refresh QR Session
  const initQrSession = useCallback(async () => {
    setQrLoading(true);
    setQrStatus('PENDING');
    setError('');

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
          width: 200,
          margin: 1,
          color: {
            dark: '#006948',
            light: '#ffffff',
          },
        });
      }
    } catch (err: any) {
      console.warn('QR generation error', err);
      setError('Could not generate QR code. You can sign in using email & password.');
    } finally {
      setQrLoading(false);
    }
  }, []);

  // Poll for QR Code Authorization
  useEffect(() => {
    if (authType !== 'qr' || !qrToken || qrStatus === 'AUTHORIZED') {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/qr-session?token=${encodeURIComponent(qrToken)}`);
        const data = await res.json();

        if (data.status === 'AUTHORIZED' && data.user) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setQrStatus('AUTHORIZED');

          try {
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#006948', '#85f8c4', '#10B981'],
            });
          } catch {}

          login(data.user.fullName, data.user.email);
          setTimeout(() => {
            router.push('/');
          }, 1200);
        } else if (data.status === 'EXPIRED') {
          setQrStatus('EXPIRED');
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      } catch {
        // Silent network retry
      }
    }, 1600);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [authType, qrToken, qrStatus, login, router]);

  useEffect(() => {
    if (authType === 'qr') {
      initQrSession();
    }
  }, [authType, initQrSession]);

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setError('Enter your email address in the field above first.');
      return;
    }
    setLoading(true);
    setError('');
    setNotice('');
    try {
      await resetPassword(email.trim());
      setNotice('Password reset link sent! Check your inbox to set a new password.');
    } catch {
      setError('Could not send password reset email. Check email address and network.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide your email and password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your password.');
        return;
      }
    }

    setLoading(true);
    setError('');
    setNotice('');

    try {
      if (mode === 'signup') {
        const cleanName = name.trim() || email.split('@')[0] || 'Active Trader';
        const userCredential = await signupWithEmail(email.trim(), password, cleanName);
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#006948', '#85f8c4', '#10B981'],
          });
        } catch {}

        login(userCredential.displayName || cleanName, userCredential.email || email.trim());
        router.push('/');
      } else {
        const userCredential = await loginWithEmail(email.trim(), password);
        try {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#006948', '#85f8c4', '#10B981'],
          });
        } catch {}

        login(
          userCredential.displayName || email.split('@')[0] || 'Active Trader',
          userCredential.email || email.trim()
        );
        router.push('/');
      }
    } catch (err: any) {
      console.warn('Firebase auth attempt error:', err);
      let msg = err.message || 'Authentication failed. Please check credentials.';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        msg = 'Invalid email or password. Please verify your details or create an account.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please switch to "Sign In" above.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/unauthorized-domain') {
        const currentDomain =
          typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        msg = `Domain "${currentDomain}" is not in Firebase Authorized Domains. Add it in Firebase Console > Authentication > Settings.`;
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
      const userCredential = await loginWithGoogle();
      login(
        userCredential.displayName || 'Google Trader',
        userCredential.email || 'trader@google.com'
      );
      router.push('/');
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        const currentDomain =
          typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        setError(
          `Domain "${currentDomain}" is not authorized for Google Sign-In. Add "${currentDomain}" to Firebase Console -> Authentication -> Settings -> Authorized domains.`
        );
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in cancelled or not enabled.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    resetDemoData();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between antialiased">
      {/* Top Header */}
      <header className="h-16 px-4 sm:px-8 max-w-5xl mx-auto w-full flex items-center justify-between border-b border-surface-container/60 bg-white/90 backdrop-blur-md">
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
            <span>Onboarding Setup</span>
          </Link>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container flex flex-col gap-5 relative overflow-hidden">
          {/* Header Title */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
              {mode === 'signup' ? 'Create Your Account' : 'Sign In to TradeDairy'}
            </h1>
            <p className="text-xs text-on-surface-variant">
              Live multi-device trading journal, risk ledger &amp; real-time cloud sync.
            </p>
          </div>

          {/* Primary Auth Method Switcher: Email/Password vs QR Code */}
          <div className="flex p-1 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthType('credentials');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authType === 'credentials'
                  ? 'bg-white text-primary shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">mail</span>
              <span>Email &amp; Password</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthType('qr');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authType === 'qr'
                  ? 'bg-white text-primary shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
              <span>Mobile QR Scan</span>
            </button>
          </div>

          {/* Alert Messages */}
          {notice && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
              <span className="leading-relaxed">{notice}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-xs text-error font-medium flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* TAB 1: EMAIL & PASSWORD (SIGN IN / SIGN UP) */}
          {authType === 'credentials' && (
            <div className="flex flex-col gap-4">
              {/* Sign In vs Sign Up Toggle */}
              <div className="flex p-0.5 rounded-lg bg-surface-container-low border border-surface-container text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-primary shadow-xs font-bold'
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
                      ? 'bg-white text-primary shadow-xs font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Create Account (Sign Up)
                </button>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-on-surface font-semibold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60 shadow-xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>or use email</span>
                <div className="flex-1 h-px bg-surface-container"></div>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm font-medium"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="trader@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-on-surface">
                      Password *
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="text-[11px] text-primary hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm font-medium"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-sm font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Authenticating...</span>
                    </>
                  ) : mode === 'signup' ? (
                    <>
                      <span>Create Account &amp; Sync Data</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Terminal</span>
                      <span className="material-symbols-outlined text-[18px]">login</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: QR CODE INSTANT MOBILE AUTH */}
          {authType === 'qr' && (
            <div className="flex flex-col items-center gap-3.5 py-2">
              {qrStatus === 'AUTHORIZED' ? (
                <div className="py-6 text-center space-y-2 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl font-bold">
                    ✓
                  </div>
                  <h3 className="text-base font-bold text-on-surface">Authenticated via Mobile!</h3>
                  <p className="text-xs text-on-surface-variant">Entering TradeDairy Terminal...</p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-white rounded-xl border border-surface-container shadow-xs relative flex items-center justify-center min-h-[210px] min-w-[210px]">
                    {qrLoading && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                        <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                        <span className="text-[11px] text-outline">Generating Secure QR...</span>
                      </div>
                    )}

                    {qrStatus === 'EXPIRED' && (
                      <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-3 text-center gap-2">
                        <p className="text-xs text-error font-semibold">QR Code Expired</p>
                        <button
                          type="button"
                          onClick={initQrSession}
                          className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer"
                        >
                          Refresh QR
                        </button>
                      </div>
                    )}

                    <canvas ref={canvasRef} className="max-w-full rounded-lg" />
                  </div>

                  {qrPin && (
                    <div className="text-center">
                      <p className="text-[11px] text-outline">Pairing PIN code:</p>
                      <span className="text-sm font-mono font-bold tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-md">
                        {qrPin}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-center text-on-surface-variant max-w-xs">
                    Open TradeDairy on your logged-in mobile browser and tap <strong>&quot;Scan PC Login&quot;</strong> in the header to authenticate instantly.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Guest / Demo Mode Link */}
          <div className="pt-2 border-t border-surface-container text-center">
            <p className="text-xs text-outline">
              Just testing or exploring?{' '}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Launch Guest Demo Mode →
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 px-4 max-w-5xl mx-auto w-full flex items-center justify-center text-xs text-outline">
        <span>© {new Date().getFullYear()} TradeDairy • Precision Trading Intelligence</span>
      </footer>
    </div>
  );
}
