'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTrades } from '../../../context/TradeContext';
import { BrandLogo } from '../../../components/common/BrandLogo';
import { loginWithGoogle } from '../../../lib/firebase';
import confetti from 'canvas-confetti';

export default function QrAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-sm text-outline">
          Loading QR authorization…
        </div>
      }
    >
      <QrAuthContent />
    </Suspense>
  );
}

function QrAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const pin = searchParams.get('pin') || '';

  const { user, login } = useTrades();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleApprove = async (currentUser?: {
    isLoggedIn?: boolean;
    email?: string;
    fullName?: string;
    uid?: string;
    avatar?: string;
    profilePhoto?: string;
  }) => {
    const active = currentUser || user;
    if (!active.isLoggedIn || !active.email) {
      setError('Please log in first to authorize this desktop session.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/qr-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token || undefined,
          pin: pin || undefined,
          user: {
            fullName: active.fullName || 'TradeDairy Trader',
            email: active.email,
            uid: active.uid,
            avatar: active.avatar || active.profilePhoto,
            device: typeof navigator !== 'undefined' ? navigator.userAgent : 'Mobile Browser',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authorize desktop session');
      }

      setSuccess(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#006948', '#85f8c4', '#10B981'],
        });
      } catch {}

      setTimeout(() => {
        router.push('/');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Could not authorize desktop login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleQuickAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const cred = await loginWithGoogle();
      await login(
        cred.displayName || 'Trader',
        cred.email || 'trader@domain.com',
        cred.photoURL || undefined,
        cred.uid
      );
      await handleApprove({
        isLoggedIn: true,
        uid: cred.uid,
        email: cred.email || 'trader@domain.com',
        fullName: cred.displayName || 'Trader',
        avatar: cred.photoURL || '',
      });
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between p-4 sm:p-6">
      <header className="max-w-md mx-auto w-full flex items-center justify-between py-4">
        <BrandLogo className="h-8 w-auto" />
      </header>

      <main className="flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/60 shadow-xs">
            <span className="material-symbols-outlined text-[30px]">devices</span>
          </div>

          <div>
            <h1 className="text-xl font-black text-slate-900">Authorize Desktop Login</h1>
            <p className="text-xs text-slate-500 mt-1">
              A computer browser is requesting access to your TradeDairy account.
            </p>
          </div>

          {pin && (
            <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200">
              <span className="text-[11px] text-slate-400 block mb-0.5">Desktop Pairing PIN</span>
              <span className="font-mono text-xl font-bold tracking-widest text-emerald-800">
                {pin}
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium text-left">
              {error}
            </div>
          )}

          {success ? (
            <div className="py-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h2 className="text-sm font-bold text-slate-900">Desktop Approved!</h2>
              <p className="text-xs text-slate-500">
                Your computer screen is now unlocked and synced. Redirecting…
              </p>
            </div>
          ) : user.isLoggedIn ? (
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-left text-xs">
                <span className="text-slate-500 block text-[10px]">Authorizing as:</span>
                <span className="font-bold text-slate-900 block">{user.fullName}</span>
                <span className="text-slate-500 text-[11px] block">{user.email}</span>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleApprove()}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Approving…' : 'Approve & Unlock Desktop'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-700"
              >
                Cancel / Not Me
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-slate-500">
                Sign in to approve this desktop session:
              </p>

              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleQuickAuth}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue with Google to Approve</span>
              </button>

              <button
                type="button"
                onClick={() => router.push(`/login?redirect=/auth/qr?token=${encodeURIComponent(token)}&pin=${encodeURIComponent(pin)}`)}
                className="w-full py-2 text-xs font-semibold text-emerald-600 hover:underline"
              >
                Or Sign In with Email
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 py-2">
        TradeDairy Security • Safe Device Pairing
      </footer>
    </div>
  );
}
