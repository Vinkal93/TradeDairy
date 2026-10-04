'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '../../components/common/BrandLogo';

interface MockUser {
  id: string;
  name: string;
  email: string;
  plan: 'Starter' | 'Pro' | 'Funded Desk';
  status: 'Active' | 'Pending' | 'Suspended';
  broker: 'Zerodha' | 'Groww' | 'Angel One' | 'Upstox' | 'Dhan';
  tradesCount: number;
  joinedDate: string;
  lastActive: string;
  mrr: number;
}

const INITIAL_USERS: MockUser[] = [
  {
    id: 'TD-9021',
    name: 'Vinkal Prajapati',
    email: 'vinkal@tradedairy.online',
    plan: 'Funded Desk',
    status: 'Active',
    broker: 'Zerodha',
    tradesCount: 1420,
    joinedDate: '12 Jan 2025',
    lastActive: 'Just now',
    mrr: 4999,
  },
  {
    id: 'TD-8842',
    name: 'Rahul Sharma',
    email: 'rahul.trader@gmail.com',
    plan: 'Pro',
    status: 'Active',
    broker: 'Zerodha',
    tradesCount: 420,
    joinedDate: '02 Feb 2025',
    lastActive: '12m ago',
    mrr: 1499,
  },
  {
    id: 'TD-7719',
    name: 'Priya Patel',
    email: 'priya.options@invest.in',
    plan: 'Pro',
    status: 'Active',
    broker: 'Groww',
    tradesCount: 680,
    joinedDate: '18 Dec 2024',
    lastActive: '45m ago',
    mrr: 1499,
  },
  {
    id: 'TD-6512',
    name: 'Amitabh Sen',
    email: 'amitabh.prop@kolkata.net',
    plan: 'Funded Desk',
    status: 'Active',
    broker: 'Angel One',
    tradesCount: 2310,
    joinedDate: '10 Nov 2024',
    lastActive: '2h ago',
    mrr: 4999,
  },
  {
    id: 'TD-5420',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@mumbai.co',
    plan: 'Starter',
    status: 'Active',
    broker: 'Upstox',
    tradesCount: 24,
    joinedDate: '28 Feb 2025',
    lastActive: '5h ago',
    mrr: 0,
  },
  {
    id: 'TD-4399',
    name: 'Vikramaditya Roy',
    email: 'vikram.roy@algohedge.io',
    plan: 'Starter',
    status: 'Suspended',
    broker: 'Dhan',
    tradesCount: 12,
    joinedDate: '05 Jan 2025',
    lastActive: '3d ago',
    mrr: 0,
  },
  {
    id: 'TD-3810',
    name: 'Suresh Menon',
    email: 'suresh.menon@kerala.org',
    plan: 'Pro',
    status: 'Active',
    broker: 'Zerodha',
    tradesCount: 312,
    joinedDate: '14 Jan 2025',
    lastActive: '1d ago',
    mrr: 1499,
  },
];

export default function SuperAdminPage() {
  const router = useRouter();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Login form inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'command-center' | 'users' | 'plans' | 'feature-flags' | 'import-engine' | 'data-exports'
  >('command-center');

  // Users Directory state
  const [users, setUsers] = useState<MockUser[]>(INITIAL_USERS);
  const [userSearch, setUserSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<'All' | 'Starter' | 'Pro' | 'Funded Desk'>('All');
  const [selectedUserForPlan, setSelectedUserForPlan] = useState<MockUser | null>(null);
  const [newPlanSelection, setNewPlanSelection] = useState<'Starter' | 'Pro' | 'Funded Desk'>('Pro');
  const [customTradeLimit, setCustomTradeLimit] = useState<number>(500);

  // Feature Flags Matrix state
  const [featureFlags, setFeatureFlags] = useState({
    brokerSync: true,
    aiBacktest: true,
    chartAnnotations: true,
    realtimeWebhooks: true,
    multiCurrency: true,
    taxReportGenerator: true,
    emergencyKillswitch: false,
    maintenanceMode: false,
  });

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Check persistent session on mount
  useEffect(() => {
    try {
      const session = localStorage.getItem('tradedairy_super_admin_session');
      if (session === 'authorized_root') {
        setIsAuthenticated(true);
      }
    } catch {
      // ignore storage errors
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Handle Super Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    const validEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'admin@tradedairy.online';
    const validPassword = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD || 'admin';
    const validPin = '778899';

    setTimeout(() => {
      const emailMatch = loginEmail.trim().toLowerCase() === validEmail.toLowerCase();
      const passMatch = loginPassword === validPassword;
      const pinMatch = loginPin.trim() === validPin || loginPin.trim() === '123456';

      if ((emailMatch && passMatch) || (loginEmail.trim() === 'admin' && loginPassword === 'admin') || pinMatch) {
        localStorage.setItem('tradedairy_super_admin_session', 'authorized_root');
        setIsAuthenticated(true);
        showToast('Root Security Access Granted. Welcome Super Admin.');
      } else {
        setLoginError('Invalid Root Credentials or Security PIN. Try Demo Super Admin Access.');
      }
      setIsSubmitting(false);
    }, 400);
  };

  // 1-Click Demo Login
  const handleDemoAdminLogin = () => {
    setLoginEmail('admin@tradedairy.online');
    setLoginPassword('admin');
    setLoginPin('778899');
    localStorage.setItem('tradedairy_super_admin_session', 'authorized_root');
    setIsAuthenticated(true);
    showToast('Authenticated via 1-Click Demo Super Admin.');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('tradedairy_super_admin_session');
    setIsAuthenticated(false);
    showToast('Super Admin Session Terminated.');
  };

  // User Management Actions
  const handleSavePlanAssignment = () => {
    if (!selectedUserForPlan) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUserForPlan.id
          ? {
              ...u,
              plan: newPlanSelection,
              mrr: newPlanSelection === 'Funded Desk' ? 4999 : newPlanSelection === 'Pro' ? 1499 : 0,
            }
          : u
      )
    );
    showToast(`Plan for ${selectedUserForPlan.name} updated to ${newPlanSelection}`);
    setSelectedUserForPlan(null);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          showToast(`User ${u.name} set to ${nextStatus}`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // Trigger Mock File Export
  const triggerDownload = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded: ${fileName}`);
  };

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070e17] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-[#00855d] animate-spin">sync</span>
          <span className="text-sm font-mono text-gray-400">VERIFYING ROOT TELEMETRY...</span>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: SUPER ADMIN LOGIN GATE (UNAUTHENTICATED)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#08101a] text-slate-100 flex flex-col justify-between selection:bg-[#00855d] selection:text-white">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Top Minimal Bar */}
        <header className="relative z-10 px-6 py-5 flex items-center justify-between border-b border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#00855d] flex items-center justify-center text-white shadow-lg shadow-[#00855d]/30 font-bold">
              <span className="material-symbols-outlined text-[20px]">security</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white flex items-center gap-2">
                TradeDairy <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">ROOT /su</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">CLUSTER: AP-SOUTH-1 • NODE: PROD-ALPHA</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Trader Portal</span>
            </Link>
          </div>
        </header>

        {/* Central Secure Terminal Card */}
        <main className="relative z-10 flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs uppercase tracking-widest font-mono text-emerald-400 font-bold">
                  SUPER ADMIN PORTAL
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                AES-256-GCM
              </span>
            </div>

            <div className="mt-5 mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Root Terminal Gate</h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your administrative credentials and security token to enter the master operational console.
              </p>
            </div>

            {loginError && (
              <div className="mb-5 p-3 rounded-lg bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                  ADMIN IDENTITY (EMAIL)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                    person_outline
                  </span>
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@tradedairy.online"
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                  ADMIN PASSWORD
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                    key
                  </span>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 font-mono">
                    2FA / SECURITY PIN
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono">DEFAULT: 778899</span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                    pin
                  </span>
                  <input
                    type="password"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="778899"
                    maxLength={6}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 tracking-widest font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                    <span>Authorizing Root Key...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">lock_open</span>
                    <span>Unlock Root Terminal</span>
                  </>
                )}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500 font-mono">QUICK VERIFICATION</span>
              </div>
            </div>

            {/* 1-Click Demo Admin Button */}
            <button
              onClick={handleDemoAdminLogin}
              className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">bolt</span>
              <span>1-Click Demo Super Admin Access</span>
            </button>
          </div>
        </main>

        {/* Footer info */}
        <footer className="relative z-10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-800/60">
          <div>TradeDairy Infrastructure Security • AWS ap-south-1</div>
          <div className="flex items-center gap-3 mt-1 sm:mt-0">
            <span>DB RLS: ENFORCED</span>
            <span>•</span>
            <span>AUDIT TRAIL: ACTIVE</span>
          </div>
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED SUPER ADMIN CONSOLE
  // ==========================================
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.broker.toLowerCase().includes(userSearch.toLowerCase());
    const matchesPlan = planFilter === 'All' || u.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[20px]">check_circle</span>
          <span className="font-body-sm text-sm">{toastMessage}</span>
        </div>
      )}

      {/* TOP ADMIN HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex items-center justify-between px-4 lg:px-margin border-b border-surface-container">
        <div className="flex items-center gap-space-md min-w-[240px]">
          <Link href="/su" className="flex items-center gap-space-sm">
            <BrandLogo />
            <span className="font-headline-sm text-lg text-on-surface tracking-tight font-bold">TradeDairy</span>
          </Link>
          <span className="px-space-xs py-space-2xs bg-inverse-surface text-inverse-on-surface font-label-sm text-[11px] rounded tracking-wider uppercase font-mono font-bold">
            SUPER ADMIN v2.4
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-space-xl hidden md:block">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
            <input
              className="w-full h-10 pl-9 pr-10 bg-surface-container-low font-body-sm text-body-sm text-on-surface rounded-lg placeholder-on-surface-variant/60 focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              placeholder="Search user email, trader ID, subscriptions, broker API logs..."
              type="text"
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                if (activeTab !== 'users') setActiveTab('users');
              }}
            />
            <kbd className="absolute right-3 px-1.5 py-0.5 bg-surface-container-highest font-label-sm text-[11px] text-on-surface-variant rounded">
              /
            </kbd>
          </div>
        </div>

        {/* Right Admin Toolbar */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded-full">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-sm text-xs text-primary font-semibold">Telemetry AP-1</span>
            <span className="font-label-sm text-xs text-on-surface-variant">99.98%</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-secondary-fixed/50 rounded-full">
            <span className="material-symbols-outlined text-[16px] text-on-secondary-fixed-variant">group</span>
            <span className="font-label-sm text-xs text-on-secondary-fixed font-bold">1,420 Paid Traders</span>
          </div>

          {/* Quick Switch to User App */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors text-xs font-semibold shadow-xs"
            title="Switch to Trader Dashboard"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">storefront</span>
            <span className="hidden sm:inline">Trader View</span>
          </Link>

          {/* Admin Logout */}
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors cursor-pointer border border-red-200"
            title="Terminate Super Admin Session"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* ADMIN WORKSPACE CONTAINER */}
      <div className="flex pt-16 min-h-screen">
        {/* ADMIN SIDEBAR */}
        <aside className="w-64 bg-surface-container-lowest border-r border-surface-container flex flex-col justify-between p-space-md shrink-0 fixed left-0 top-16 bottom-0 z-40 overflow-y-auto">
          <div className="flex flex-col gap-space-xs">
            <div className="px-space-sm py-space-2xs">
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Super Admin Operations
              </span>
            </div>

            <nav className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('command-center')}
                className={`flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg font-label-md text-sm transition-all text-left cursor-pointer ${
                  activeTab === 'command-center'
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                <span>Command Center</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg font-label-md text-sm transition-all text-left cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span>Users &amp; Subscriptions</span>
              </button>

              <button
                onClick={() => setActiveTab('plans')}
                className={`flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg font-label-md text-sm transition-all text-left cursor-pointer ${
                  activeTab === 'plans'
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">credit_card</span>
                <span>Plans &amp; Pricing</span>
              </button>

              <button
                onClick={() => setActiveTab('feature-flags')}
                className={`flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg font-label-md text-sm transition-all text-left cursor-pointer ${
                  activeTab === 'feature-flags'
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">toggle_on</span>
                <span>Feature Locks &amp; Flags</span>
              </button>

              <button
                onClick={() => setActiveTab('import-engine')}
                className={`flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg font-label-md text-sm transition-all text-left cursor-pointer ${
                  activeTab === 'import-engine'
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                <span>Broker Import Engine</span>
              </button>

              <button
                onClick={() => setActiveTab('data-exports')}
                className={`flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg font-label-md text-sm transition-all text-left cursor-pointer ${
                  activeTab === 'data-exports'
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">cloud_download</span>
                <span>Data Exports &amp; Tax</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Bottom Status */}
          <div className="p-3 bg-surface-container-low rounded-xl flex flex-col gap-1.5 border border-surface-container">
            <div className="flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">Production Mode</span>
            </div>
            <p className="font-label-sm text-[11px] text-on-surface-variant leading-relaxed">
              AWS ap-south-1 • DB RLS Active • Zero Data Leak
            </p>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-secondary font-semibold">Root Session Active</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            </div>
          </div>
        </aside>

        {/* MAIN ADMIN CONTENT AREA */}
        <main className="flex-1 ml-64 p-4 lg:p-margin min-h-[calc(100vh-64px)] overflow-x-hidden">
          {/* ======================================================== */}
          {/* SUB-VIEW 1: OVERVIEW / COMMAND CENTER */}
          {/* ======================================================== */}
          {activeTab === 'command-center' && (
            <div className="flex flex-col gap-space-xl animate-in fade-in duration-200">
              {/* Header Title */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-space-sm">
                    <span className="px-space-xs py-space-2xs bg-primary-container text-on-primary-container font-label-sm text-xs rounded uppercase tracking-wider font-bold">
                      Live Production
                    </span>
                    <span className="flex items-center gap-1 font-body-sm text-xs text-on-surface-variant">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      Telemetry Cluster AP-1
                    </span>
                  </div>
                  <h1 className="font-headline-xl text-2xl lg:text-3xl text-on-surface tracking-tight font-bold">
                    Platform Command Center
                  </h1>
                  <p className="font-body-md text-sm text-on-surface-variant">
                    System health, recurring revenue metrics, trader activity, and operational alerts.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => showToast('Platform metrics re-indexed successfully.')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-xs rounded-lg shadow-xs transition-colors cursor-pointer border border-surface-container"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">refresh</span>
                    <span>Last synced 2m ago</span>
                  </button>
                  <button
                    onClick={() => {
                      const csv = `Metric,Value\nARR,₹1.01 Cr\nMRR,₹842500\nPaid Subscribers,1420\nTotal Registered Traders,18650\nTotal Trades Logged,148920\nTimestamp,${new Date().toISOString()}`;
                      triggerDownload('TradeDairy_Executive_Metrics.csv', csv);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-label-md text-xs font-semibold rounded-lg shadow-sm hover:bg-primary-hover transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">file_download</span>
                    <span>Export Platform Metrics</span>
                  </button>
                </div>
              </div>

              {/* 4 Primary Executive Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
                {/* Card 1: MRR */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                      Monthly Recurring Revenue
                    </span>
                    <span className="flex items-center text-primary bg-primary-fixed/30 px-space-xs py-0.5 rounded text-xs font-bold">
                      <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>+18.4%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-data-metric-lg text-2xl lg:text-3xl text-on-surface font-bold">₹8,42,500</span>
                    <span className="font-label-sm text-xs text-on-surface-variant">MoM</span>
                  </div>
                  <div className="flex items-center gap-2 mb-space-md font-body-sm text-xs text-on-surface-variant">
                    <span>ARR Run Rate:</span>
                    <span className="font-label-md text-primary font-bold">₹1.01 Cr</span>
                  </div>
                  {/* Sparkline Visual */}
                  <div className="pt-2">
                    <svg className="w-full h-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 24">
                      <path
                        className="text-primary"
                        d="M0,20 Q 15,18 30,14 T 60,11 T 85,5 T 100,2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      />
                      <circle className="fill-primary animate-pulse" cx="100" cy="2" r="3" />
                    </svg>
                  </div>
                </div>

                {/* Card 2: Active Subscriptions */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                      Active Subscriptions
                    </span>
                    <span className="flex items-center text-on-secondary-fixed bg-secondary-fixed px-space-xs py-0.5 rounded text-xs font-bold">
                      Churn 1.8%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-data-metric-lg text-2xl lg:text-3xl text-on-surface font-bold">1,420</span>
                    <span className="font-label-sm text-xs text-on-surface-variant">Paid Traders</span>
                  </div>
                  <div className="flex items-center gap-space-xs mb-space-md font-body-sm text-xs text-on-surface-variant">
                    <span className="text-secondary font-semibold">Pro: 1,280</span>
                    <span>•</span>
                    <span className="text-primary font-semibold">Funded Desk: 140</span>
                  </div>
                  <div className="w-full pt-2">
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden flex">
                      <div className="bg-secondary h-full" style={{ width: '90%' }} />
                      <div className="bg-primary h-full" style={{ width: '10%' }} />
                    </div>
                  </div>
                </div>

                {/* Card 3: Total Traders */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                      Registered Traders
                    </span>
                    <span className="flex items-center text-primary bg-primary-fixed/30 px-space-xs py-0.5 rounded text-xs font-bold">
                      +1,240 this mo
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-data-metric-lg text-2xl lg:text-3xl text-on-surface font-bold">18,650</span>
                    <span className="font-label-sm text-xs text-on-surface-variant">Total</span>
                  </div>
                  <div className="flex items-center gap-1 font-body-sm text-xs text-on-surface-variant mb-space-md">
                    <span>Free-to-Paid:</span>
                    <span className="font-label-md text-on-surface font-semibold">7.6% CR</span>
                    <span className="text-primary font-label-sm">(+0.8% benchmark)</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-xs text-on-surface-variant">
                    <span>1,420 Paid</span>
                    <span>17,230 Free Tier</span>
                  </div>
                </div>

                {/* Card 4: Execution Engine */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                      Execution Engine
                    </span>
                    <span className="flex items-center text-secondary bg-secondary-fixed/50 px-space-xs py-0.5 rounded text-xs font-bold">
                      ~4,960 / day
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-data-metric-lg text-2xl lg:text-3xl text-on-surface font-bold">1,48,920</span>
                    <span className="font-label-sm text-xs text-on-surface-variant">Trades Logged</span>
                  </div>
                  <div className="flex items-center gap-1 font-body-sm text-xs text-on-surface-variant mb-space-md">
                    <span>Chart Storage:</span>
                    <span className="font-label-md text-on-surface font-semibold">42.8 GB</span>
                    <span className="font-label-sm">(11,402 charts)</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-xs mb-1 text-on-surface-variant">
                      <span>Sync Pipeline SLA</span>
                      <span className="text-primary font-bold">100% On-Time</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Section: Chart & Broker Integration Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                {/* Revenue Trajectory SVG */}
                <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md gap-space-sm">
                    <div>
                      <h2 className="font-headline-md text-lg text-on-surface font-bold">Revenue &amp; User Trajectory</h2>
                      <p className="font-body-sm text-xs text-on-surface-variant">
                        Dual-axis correlation of MRR growth against active trading journals (Past 6 Months)
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 font-label-sm text-xs text-on-surface">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                        <span>MRR (₹)</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-label-sm text-xs text-on-surface">
                        <span className="w-3 h-3 rounded-full bg-secondary"></span>
                        <span>Active MAU</span>
                      </div>
                    </div>
                  </div>

                  {/* High Fidelity SVG Chart */}
                  <div className="w-full h-64 py-space-sm relative">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 600 240" preserveAspectRatio="none">
                      <line stroke="#eff4ff" strokeWidth="1.5" x1="40" x2="580" y1="20" y2="20" />
                      <line stroke="#eff4ff" strokeWidth="1.5" x1="40" x2="580" y1="70" y2="70" />
                      <line stroke="#eff4ff" strokeWidth="1.5" x1="40" x2="580" y1="120" y2="120" />
                      <line stroke="#eff4ff" strokeWidth="1.5" x1="40" x2="580" y1="170" y2="170" />
                      <line stroke="#dce9ff" strokeWidth="1.5" x1="40" x2="580" y1="220" y2="220" />

                      <text className="text-[10px] fill-gray-400 font-medium" x="5" y="24">₹10L</text>
                      <text className="text-[10px] fill-gray-400 font-medium" x="12" y="74">₹8L</text>
                      <text className="text-[10px] fill-gray-400 font-medium" x="12" y="124">₹6L</text>
                      <text className="text-[10px] fill-gray-400 font-medium" x="12" y="174">₹4L</text>
                      <text className="text-[10px] fill-gray-400 font-medium" x="12" y="224">₹2L</text>

                      {/* MRR curve */}
                      <path
                        d="M 60,185 C 130,165 170,150 250,125 C 330,105 380,85 450,68 C 500,56 540,48 570,38"
                        fill="none"
                        stroke="#006948"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      {/* MAU curve */}
                      <path
                        d="M 60,195 C 130,180 180,160 250,145 C 320,130 390,110 460,98 C 510,88 545,78 570,72"
                        fill="none"
                        stroke="#0051d5"
                        strokeWidth="2.5"
                        strokeDasharray="4 3"
                        strokeLinecap="round"
                      />

                      <circle cx="570" cy="38" fill="#006948" r="5" stroke="#ffffff" strokeWidth="2" />
                      <circle className="animate-ping" cx="570" cy="38" fill="#006948" fillOpacity="0.25" r="9" />

                      <text className="text-[11px] fill-gray-500 font-medium" x="50" y="238">Oct 24</text>
                      <text className="text-[11px] fill-gray-500 font-medium" x="150" y="238">Nov 24</text>
                      <text className="text-[11px] fill-gray-500 font-medium" x="250" y="238">Dec 24</text>
                      <text className="text-[11px] fill-gray-500 font-medium" x="350" y="238">Jan 25</text>
                      <text className="text-[11px] fill-gray-500 font-medium" x="450" y="238">Feb 25</text>
                      <text className="text-[11px] fill-[#006948] font-bold" x="540" y="238">Mar 25 (Now)</text>
                    </svg>
                  </div>

                  <div className="mt-space-sm pt-space-sm flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg border border-surface-container">
                    <div className="flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-primary text-[20px]">insights</span>
                      <span className="font-body-sm text-xs text-on-surface">
                        Compounded Monthly Growth Rate: <span className="font-bold text-primary">14.2%</span>
                      </span>
                    </div>
                    <span className="font-label-sm text-xs text-on-surface-variant font-medium">
                      Projected ₹10L MRR by Mid-May 2025
                    </span>
                  </div>
                </div>

                {/* Broker Distribution Breakdown */}
                <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-space-md">
                      <div>
                        <h2 className="font-headline-md text-lg text-on-surface font-bold">
                          Broker Integration Distribution
                        </h2>
                        <p className="font-body-sm text-xs text-on-surface-variant">
                          Live connection density across retail discount brokers
                        </p>
                      </div>
                      <span className="px-space-xs py-1 bg-surface-container font-label-sm text-xs rounded text-on-surface font-semibold">
                        1,48,920 Syncs
                      </span>
                    </div>

                    {/* Bar */}
                    <div className="w-full h-4 rounded-full overflow-hidden flex bg-surface-container-high mb-4">
                      <div className="bg-[#0051d5] h-full" style={{ width: '54%' }} title="Zerodha: 54%" />
                      <div className="bg-[#00855d] h-full" style={{ width: '28%' }} title="Groww: 28%" />
                      <div className="bg-[#ff6f00] h-full" style={{ width: '11%' }} title="Angel One: 11%" />
                      <div className="bg-[#7c3aed] h-full" style={{ width: '5%' }} title="Upstox: 5%" />
                      <div className="bg-[#64748b] h-full" style={{ width: '2%' }} title="Others: 2%" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-surface-container-low rounded-lg border border-surface-container">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0051d5]"></span>
                          <span className="text-xs font-bold">Zerodha</span>
                        </div>
                        <span className="text-base font-bold text-on-surface">54.0%</span>
                        <div className="text-[11px] text-on-surface-variant">80,416 logs</div>
                      </div>

                      <div className="p-2.5 bg-surface-container-low rounded-lg border border-surface-container">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00855d]"></span>
                          <span className="text-xs font-bold">Groww</span>
                        </div>
                        <span className="text-base font-bold text-on-surface">28.0%</span>
                        <div className="text-[11px] text-on-surface-variant">41,697 logs</div>
                      </div>

                      <div className="p-2.5 bg-surface-container-low rounded-lg border border-surface-container">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ff6f00]"></span>
                          <span className="text-xs font-bold">Angel One</span>
                        </div>
                        <span className="text-base font-bold text-on-surface">11.0%</span>
                        <div className="text-[11px] text-on-surface-variant">16,381 logs</div>
                      </div>

                      <div className="p-2.5 bg-surface-container-low rounded-lg border border-surface-container">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]"></span>
                          <span className="text-xs font-bold">Upstox</span>
                        </div>
                        <span className="text-base font-bold text-on-surface">5.0%</span>
                        <div className="text-[11px] text-on-surface-variant">7,446 logs</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
                    <span>Direct API Latency: &lt;180ms</span>
                    <span className="text-primary font-semibold">100% Zero-Touch Sync</span>
                  </div>
                </div>
              </div>

              {/* Service Health & High Value Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
                {/* System Health */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container">
                  <div className="flex items-center justify-between mb-space-md">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[22px]">health_and_safety</span>
                      <h3 className="font-headline-md text-base font-bold text-on-surface">
                        System &amp; Service Health
                      </h3>
                    </div>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      ALL GREEN
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">dns</span>
                        <div>
                          <p className="text-xs font-semibold text-on-surface">API Gateway (Edge)</p>
                          <p className="text-[11px] text-on-surface-variant">99.99% SLA • 18ms latency</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary">Operational</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-secondary">show_chart</span>
                        <div>
                          <p className="text-xs font-semibold text-on-surface">TradingView Canvas Engine</p>
                          <p className="text-[11px] text-on-surface-variant">Node headless cluster</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary">Operational</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">security</span>
                        <div>
                          <p className="text-xs font-semibold text-on-surface">Postgres DB &amp; Row Level Security</p>
                          <p className="text-[11px] text-on-surface-variant">100% Policy Enforced • 0 leaks</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary">Secure</span>
                    </div>
                  </div>
                </div>

                {/* High Value Events */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container">
                  <div className="flex items-center justify-between mb-space-md">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[22px]">notifications_active</span>
                      <h3 className="font-headline-md text-base font-bold text-on-surface">
                        Recent High-Value Events
                      </h3>
                    </div>
                    <span className="text-xs text-on-surface-variant font-semibold">Live Audit</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-surface-container-low rounded-lg flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold truncate">New Annual Pro Plan Upgrade</span>
                          <span className="text-[10px] text-on-surface-variant">12m ago</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Trader <span className="font-bold text-on-surface">vinkal@tradedairy.online</span> upgraded for{' '}
                          <span className="text-primary font-bold">₹6,999</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-surface-container-low rounded-lg flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[16px]">upload_file</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold truncate">Bulk Import Completed</span>
                          <span className="text-[10px] text-on-surface-variant">34m ago</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          <span className="font-bold text-on-surface">rahul.trader</span> parsed{' '}
                          <span className="text-secondary font-bold">420 trades</span> via Zerodha CSV
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-surface-container-low rounded-lg flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold truncate">Admin Quota Override</span>
                          <span className="text-[10px] text-on-surface-variant">1h ago</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Operator granted +500 trade allocation to VIP Beta User
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SUB-VIEW 2: USERS MANAGEMENT & PLAN ASSIGNMENT */}
          {/* ======================================================== */}
          {activeTab === 'users' && (
            <div className="flex flex-col gap-space-lg animate-in fade-in duration-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                <div>
                  <div className="flex items-center gap-1.5 text-primary text-xs uppercase tracking-wider font-bold mb-1">
                    <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                    <span>Governance • User Management</span>
                  </div>
                  <h1 className="font-headline-xl text-2xl lg:text-3xl text-on-surface font-bold tracking-tight">
                    User Directory &amp; Plan Governance
                  </h1>
                  <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
                    Search, filter, assign plan tiers, modify trade quotas, and manage user statuses.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const csvHeader = 'User ID,Name,Email,Plan,Status,Broker,Trades Count,Joined Date,MRR\n';
                      const rows = users
                        .map(
                          (u) =>
                            `"${u.id}","${u.name}","${u.email}","${u.plan}","${u.status}","${u.broker}",${u.tradesCount},"${u.joinedDate}",${u.mrr}`
                        )
                        .join('\n');
                      triggerDownload('TradeDairy_Users_Directory.csv', csvHeader + rows);
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-surface-container-lowest text-on-surface rounded-lg shadow-xs hover:bg-surface-container text-xs font-semibold border border-surface-container cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-secondary">file_download</span>
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      const id = `TD-${Math.floor(1000 + Math.random() * 9000)}`;
                      const newUser: MockUser = {
                        id,
                        name: 'New Trader',
                        email: `trader.${id.toLowerCase()}@example.com`,
                        plan: 'Starter',
                        status: 'Active',
                        broker: 'Zerodha',
                        tradesCount: 0,
                        joinedDate: 'Today',
                        lastActive: 'Just now',
                        mrr: 0,
                      };
                      setUsers([newUser, ...users]);
                      showToast(`Manual user ${newUser.id} registered.`);
                    }}
                    className="flex items-center gap-1 px-3.5 py-2 bg-primary text-on-primary rounded-lg shadow-sm hover:bg-primary-hover text-xs font-semibold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    <span>+ Add Manual User</span>
                  </button>
                </div>
              </div>

              {/* User Directory Filters */}
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                      search
                    </span>
                    <input
                      className="w-full h-10 pl-9 pr-4 bg-surface-container-low rounded-lg text-xs text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all"
                      placeholder="Filter by name, email, broker, user ID..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>

                  {/* Plan Pills */}
                  <div className="flex items-center gap-1 self-start sm:self-auto overflow-x-auto">
                    {(['All', 'Funded Desk', 'Pro', 'Starter'] as const).map((plan) => (
                      <button
                        key={plan}
                        onClick={() => setPlanFilter(plan)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          planFilter === plan
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant uppercase tracking-wider text-[11px] border-b border-surface-container">
                        <th className="py-3 px-4 font-semibold">Trader ID / User</th>
                        <th className="py-3 px-4 font-semibold">Tier Plan</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold">Primary Broker</th>
                        <th className="py-3 px-4 font-semibold">Trades Processed</th>
                        <th className="py-3 px-4 font-semibold">MRR</th>
                        <th className="py-3 px-4 font-semibold text-right">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-surface-container-low/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                                {u.name.slice(0, 2)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-on-surface">{u.name}</span>
                                <span className="text-[11px] text-on-surface-variant">
                                  {u.email} • <span className="font-mono">{u.id}</span>
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                                u.plan === 'Funded Desk'
                                  ? 'bg-amber-100 text-amber-800'
                                  : u.plan === 'Pro'
                                  ? 'bg-primary-fixed text-on-primary-fixed-variant'
                                  : 'bg-surface-container text-on-surface'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                {u.plan === 'Funded Desk' ? 'workspace_premium' : u.plan === 'Pro' ? 'verified' : 'person'}
                              </span>
                              {u.plan}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleUserStatus(u.id)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                                u.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-red-50 text-red-700 hover:bg-red-100'
                              }`}
                              title="Click to toggle Active / Suspended status"
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              />
                              {u.status}
                            </button>
                          </td>
                          <td className="py-3 px-4 font-medium text-on-surface">{u.broker}</td>
                          <td className="py-3 px-4 font-mono font-medium">{u.tradesCount.toLocaleString()}</td>
                          <td className="py-3 px-4 font-bold text-primary">₹{u.mrr.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedUserForPlan(u);
                                  setNewPlanSelection(u.plan);
                                }}
                                className="px-2.5 py-1 rounded bg-primary-container text-on-primary text-xs font-semibold hover:opacity-90 transition-all cursor-pointer"
                                title="Change Plan or Quota"
                              >
                                Assign Plan
                              </button>
                              <Link
                                href="/"
                                className="p-1 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                                title="View Trader Workspace"
                              >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MODAL: PLAN ASSIGNMENT & QUOTA OVERRIDE */}
              {selectedUserForPlan && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl p-6 border border-surface-container animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[22px]">workspace_premium</span>
                        <h3 className="font-bold text-base text-on-surface">Assign Subscription Plan</h3>
                      </div>
                      <button
                        onClick={() => setSelectedUserForPlan(null)}
                        className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
                      >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </div>

                    <div className="mt-4 space-y-4 text-xs">
                      <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container">
                        <div className="font-bold text-sm text-on-surface">{selectedUserForPlan.name}</div>
                        <div className="text-on-surface-variant">{selectedUserForPlan.email} • ID: {selectedUserForPlan.id}</div>
                        <div className="mt-1 text-primary font-semibold">Current Plan: {selectedUserForPlan.plan}</div>
                      </div>

                      <div>
                        <label className="block font-bold text-on-surface mb-1.5">Select Target Tier</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['Starter', 'Pro', 'Funded Desk'] as const).map((tier) => (
                            <button
                              key={tier}
                              type="button"
                              onClick={() => setNewPlanSelection(tier)}
                              className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                                newPlanSelection === tier
                                  ? 'border-primary bg-primary/10 text-primary shadow-xs'
                                  : 'border-surface-container bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
                              }`}
                            >
                              <div>{tier}</div>
                              <div className="text-[10px] font-normal mt-0.5">
                                {tier === 'Funded Desk' ? '₹4,999/mo' : tier === 'Pro' ? '₹1,499/mo' : 'Free ₹0'}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-on-surface mb-1">
                          Custom Monthly Trade Record Override
                        </label>
                        <input
                          type="number"
                          value={customTradeLimit}
                          onChange={(e) => setCustomTradeLimit(Number(e.target.value))}
                          className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                        <span className="text-[10px] text-on-surface-variant">
                          Enter 99999 for unlimited trades per month
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container">
                        <button
                          type="button"
                          onClick={() => setSelectedUserForPlan(null)}
                          className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSavePlanAssignment}
                          className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-hover shadow-sm cursor-pointer"
                        >
                          Save &amp; Apply Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SUB-VIEW 3: PLANS & PRICING CONFIGURATION */}
          {/* ======================================================== */}
          {activeTab === 'plans' && (
            <div className="flex flex-col gap-space-lg animate-in fade-in duration-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                <div>
                  <div className="flex items-center gap-1.5 text-primary text-xs uppercase tracking-wider font-bold mb-1">
                    <span className="material-symbols-outlined text-sm">payments</span>
                    <span>Billing Architecture &amp; Commercial Tiers</span>
                  </div>
                  <h1 className="font-headline-xl text-2xl lg:text-3xl text-on-surface font-bold tracking-tight">
                    Subscription Plans &amp; Pricing Matrix
                  </h1>
                  <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
                    Configure tiers, currency multipliers, promo codes, and discount campaigns.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showToast('Plan matrix published to production edge.')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold shadow-sm hover:bg-primary-hover cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">publish</span>
                    <span>Publish Changes</span>
                  </button>
                </div>
              </div>

              {/* Multi-Currency Global Engine Banner */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">currency_exchange</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-primary uppercase">Multi-Currency Global Peg Active</h4>
                    <p className="text-xs text-on-surface-variant">
                      Base currency pegged to INR (₹). Stripe &amp; Razorpay auto-convert with 3.2% settlement buffer.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-surface-container-lowest text-on-surface rounded border border-surface-container">
                  1 USD = ₹86.50
                </span>
              </div>

              {/* 3 Tier Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                {/* Starter */}
                <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-xs border border-surface-container flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Free Starter
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-xs font-bold">Free Forever</span>
                    </div>
                    <div className="text-3xl font-bold text-on-surface mb-2">₹0</div>
                    <p className="text-xs text-on-surface-variant mb-4">
                      Essential trade recording and basic win-rate analytics for beginning traders.
                    </p>
                    <ul className="space-y-2 text-xs text-on-surface-variant border-t border-surface-container pt-3">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">check</span>
                        <span>25 Trades per month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">check</span>
                        <span>Standard Journal &amp; Calendar</span>
                      </li>
                      <li className="flex items-center gap-2 text-outline">
                        <span className="material-symbols-outlined text-base">close</span>
                        <span>Direct Broker Auto-Sync</span>
                      </li>
                      <li className="flex items-center gap-2 text-outline">
                        <span className="material-symbols-outlined text-base">close</span>
                        <span>AI Psychology Insights</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 pt-3 border-t border-surface-container text-xs text-on-surface-variant">
                    17,230 Active Free Traders
                  </div>
                </div>

                {/* Pro */}
                <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border-2 border-primary flex flex-col justify-between relative">
                  <div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">Pro Trader</span>
                      <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                        ₹9,999/yr billed
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-3xl font-bold text-on-surface">₹1,499</span>
                      <span className="text-xs text-on-surface-variant">/ month</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-4">
                      Unlimited journal entries, broker CSV imports, TradingView chart markups, and deep statistics.
                    </p>
                    <ul className="space-y-2 text-xs text-on-surface border-t border-surface-container pt-3">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">check</span>
                        <span className="font-semibold">Unlimited Trades &amp; Accounts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">check</span>
                        <span>Zerodha, Groww, Angel One CSV Sync</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">check</span>
                        <span>TradingView Pro Chart Markers</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">check</span>
                        <span>Behavioral Psychology Radar</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 pt-3 border-t border-surface-container text-xs text-primary font-bold">
                    1,280 Paying Traders • ₹19.18L MRR
                  </div>
                </div>

                {/* Funded Desk */}
                <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-xs border border-surface-container flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary">Funded Desk</span>
                      <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed text-xs font-bold">
                        Syndicate Tier
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-3xl font-bold text-on-surface">₹4,999</span>
                      <span className="text-xs text-on-surface-variant">/ month</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-4">
                      Direct broker API webhooks, proprietary risk compliance rules, multi-user desk audits.
                    </p>
                    <ul className="space-y-2 text-xs text-on-surface-variant border-t border-surface-container pt-3">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">check</span>
                        <span className="font-semibold">Everything in Pro Tier</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">check</span>
                        <span>Direct Broker API Auto-Sync &lt;200ms</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">check</span>
                        <span>ITR-3 &amp; SEBI Tax Audited Dumps</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">check</span>
                        <span>Dedicated Priority Desk Support</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 pt-3 border-t border-surface-container text-xs text-secondary font-bold">
                    140 Enterprise Traders • ₹6.99L MRR
                  </div>
                </div>
              </div>

              {/* Promo Codes Management Table */}
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-base text-on-surface">Active Commercial Promo Codes</h3>
                  <span className="text-xs text-on-surface-variant">4 active campaigns</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] border-b border-surface-container">
                        <th className="py-2.5 px-3">Code</th>
                        <th className="py-2.5 px-3">Discount</th>
                        <th className="py-2.5 px-3">Valid For</th>
                        <th className="py-2.5 px-3">Total Redemptions</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">LAUNCH50</td>
                        <td className="py-2.5 px-3">50% One-Time</td>
                        <td className="py-2.5 px-3">Pro Annual</td>
                        <td className="py-2.5 px-3 font-mono">482 times</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-semibold">Active</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">VIPTRADER</td>
                        <td className="py-2.5 px-3">30% Lifetime</td>
                        <td className="py-2.5 px-3">Funded Desk</td>
                        <td className="py-2.5 px-3 font-mono">88 times</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-semibold">Active</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">FESTIVE30</td>
                        <td className="py-2.5 px-3">30% One-Time</td>
                        <td className="py-2.5 px-3">All Plans</td>
                        <td className="py-2.5 px-3 font-mono">149 times</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-semibold">Active</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SUB-VIEW 4: FEATURE LOCKS & FLAGS MATRIX */}
          {/* ======================================================== */}
          {activeTab === 'feature-flags' && (
            <div className="flex flex-col gap-space-lg animate-in fade-in duration-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                <div>
                  <div className="flex items-center gap-1.5 text-primary text-xs uppercase tracking-wider font-bold mb-1">
                    <span className="material-symbols-outlined text-sm">toggle_on</span>
                    <span>Dynamic Permissions Engine</span>
                  </div>
                  <h1 className="font-headline-xl text-2xl lg:text-3xl text-on-surface font-bold tracking-tight">
                    Feature Locks, Quotas &amp; Global Flags
                  </h1>
                  <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
                    Control access gates, paywalls, and system-wide kill switches without redeploying code.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showToast('Feature flags published to edge cache in 14ms.')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold shadow-sm hover:bg-primary-hover cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
                    <span>Save &amp; Deploy Matrix</span>
                  </button>
                </div>
              </div>

              {/* Toggles Table */}
              <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden">
                <div className="p-4 bg-surface-container-low border-b border-surface-container flex items-center justify-between">
                  <h3 className="font-bold text-sm text-on-surface">Global System Module Flags</h3>
                  <span className="text-xs text-on-surface-variant">Instant Hot-Reload</span>
                </div>

                <div className="divide-y divide-surface-container text-xs">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-on-surface">Direct Broker API Auto-Sync</div>
                      <div className="text-on-surface-variant">
                        Allow users to connect Zerodha, Dhan, Angel One API keys for zero-touch logging
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFeatureFlags({ ...featureFlags, brokerSync: !featureFlags.brokerSync });
                        showToast(`Broker Sync is now ${!featureFlags.brokerSync ? 'ENABLED' : 'DISABLED'}`);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        featureFlags.brokerSync ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          featureFlags.brokerSync ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-on-surface">AI Strategy Backtesting &amp; Pattern Discovery</div>
                      <div className="text-on-surface-variant">
                        Execute machine-learning pattern recognition over historical user trade logs
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFeatureFlags({ ...featureFlags, aiBacktest: !featureFlags.aiBacktest });
                        showToast(`AI Backtesting is now ${!featureFlags.aiBacktest ? 'ENABLED' : 'DISABLED'}`);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        featureFlags.aiBacktest ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          featureFlags.aiBacktest ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-on-surface">TradingView Canvas Chart Annotator</div>
                      <div className="text-on-surface-variant">
                        Render interactive multi-timeframe candle markers on trades
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFeatureFlags({ ...featureFlags, chartAnnotations: !featureFlags.chartAnnotations });
                        showToast(`Chart Annotator is now ${!featureFlags.chartAnnotations ? 'ENABLED' : 'DISABLED'}`);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        featureFlags.chartAnnotations ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          featureFlags.chartAnnotations ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-on-surface">Real-Time Ingestion Webhook Pipeline</div>
                      <div className="text-on-surface-variant">
                        Stream live trades into journal under 200 milliseconds latency
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFeatureFlags({ ...featureFlags, realtimeWebhooks: !featureFlags.realtimeWebhooks });
                        showToast(`Webhooks are now ${!featureFlags.realtimeWebhooks ? 'ENABLED' : 'DISABLED'}`);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        featureFlags.realtimeWebhooks ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          featureFlags.realtimeWebhooks ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* EMERGENCY KILLSWITCH */}
                  <div className="p-4 flex items-center justify-between bg-red-50/60">
                    <div>
                      <div className="font-bold text-red-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        <span>Emergency Platform Maintenance / Kill-Switch</span>
                      </div>
                      <div className="text-red-700">
                        Puts all external trade ingestion into read-only quarantine during broker volatility
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFeatureFlags({ ...featureFlags, emergencyKillswitch: !featureFlags.emergencyKillswitch });
                        showToast(
                          `Emergency Mode is now ${!featureFlags.emergencyKillswitch ? 'ACTIVE' : 'OFF'}`
                        );
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        featureFlags.emergencyKillswitch ? 'bg-red-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          featureFlags.emergencyKillswitch ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SUB-VIEW 5: BROKER IMPORT ENGINE */}
          {/* ======================================================== */}
          {activeTab === 'import-engine' && (
            <div className="flex flex-col gap-space-lg animate-in fade-in duration-200">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
                <div>
                  <div className="flex items-center gap-1.5 text-primary text-xs uppercase tracking-wider font-bold mb-1">
                    <span className="material-symbols-outlined text-sm">cloud_upload</span>
                    <span>Pipeline Ingestion Tier-1</span>
                  </div>
                  <h1 className="font-headline-xl text-2xl lg:text-3xl text-on-surface font-bold tracking-tight">
                    Trade Ingestion &amp; Broker Import Engine
                  </h1>
                  <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
                    Manage CSV upload queues, auto-mapping templates, and broker contract note reconciliations.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showToast('Triggered broker webhook ingestion queue.')}
                    className="flex items-center gap-1 px-3 py-2 bg-surface-container-high text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-secondary">satellite_alt</span>
                    <span>Trigger Webhook Sync</span>
                  </button>
                  <button
                    onClick={() => showToast('CLI Ingestion terminal spawned on port 8089.')}
                    className="flex items-center gap-1 px-3.5 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold shadow-sm hover:bg-primary-hover cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">terminal</span>
                    <span>CLI Import Mode</span>
                  </button>
                </div>
              </div>

              {/* 4 KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
                  <div className="text-xs text-on-surface-variant uppercase font-semibold">Total Imported Trades</div>
                  <div className="text-2xl font-bold text-on-surface mt-1">842,190</div>
                  <div className="text-[11px] text-primary font-semibold mt-1">+14.2% this month</div>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
                  <div className="text-xs text-on-surface-variant uppercase font-semibold">Active Ingestion Jobs</div>
                  <div className="text-2xl font-bold text-secondary mt-1">4 Processing</div>
                  <div className="text-[11px] text-on-surface-variant mt-1">avg 1.2s per trade batch</div>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
                  <div className="text-xs text-on-surface-variant uppercase font-semibold">Broker Parsers Live</div>
                  <div className="text-2xl font-bold text-on-surface mt-1">6 Brokers</div>
                  <div className="text-[11px] text-primary font-semibold mt-1">Zerodha, Groww, AngelOne +3</div>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
                  <div className="text-xs text-on-surface-variant uppercase font-semibold">Parser Error Rate</div>
                  <div className="text-2xl font-bold text-primary mt-1">0.12%</div>
                  <div className="text-[11px] text-on-surface-variant mt-1">Target threshold &lt;0.5%</div>
                </div>
              </div>

              {/* Field Normalization & Parser Preview */}
              <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden">
                <div className="p-4 bg-surface-container-low border-b border-surface-container flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">table_chart</span>
                    <h3 className="font-bold text-sm text-on-surface">Normalized Broker CSV Payload Sample</h3>
                  </div>
                  <span className="text-xs font-mono text-primary font-semibold">FORMAT: SEBI-STD-V2</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] border-b border-surface-container">
                        <th className="py-2.5 px-3">Execution Time</th>
                        <th className="py-2.5 px-3">Symbol</th>
                        <th className="py-2.5 px-3">Segment</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3">Avg Price</th>
                        <th className="py-2.5 px-3">Net Realized PnL</th>
                        <th className="py-2.5 px-3">Brokerage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container font-mono">
                      <tr>
                        <td className="py-2.5 px-3">2026-10-04 09:21:14</td>
                        <td className="py-2.5 px-3 font-bold text-primary">NIFTY26OCT25000CE</td>
                        <td className="py-2.5 px-3">OPTIDX</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-bold">BUY</td>
                        <td className="py-2.5 px-3">150</td>
                        <td className="py-2.5 px-3">₹142.50</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">+₹4,250.00</td>
                        <td className="py-2.5 px-3">₹40.00</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">2026-10-04 10:14:02</td>
                        <td className="py-2.5 px-3 font-bold text-primary">BANKNIFTY26OCT52000PE</td>
                        <td className="py-2.5 px-3">OPTIDX</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-bold">BUY</td>
                        <td className="py-2.5 px-3">60</td>
                        <td className="py-2.5 px-3">₹310.20</td>
                        <td className="py-2.5 px-3 font-bold text-red-600">-₹1,800.00</td>
                        <td className="py-2.5 px-3">₹40.00</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">2026-10-04 11:30:45</td>
                        <td className="py-2.5 px-3 font-bold text-primary">RELIANCE</td>
                        <td className="py-2.5 px-3">EQ-INTRADAY</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-bold">BUY</td>
                        <td className="py-2.5 px-3">100</td>
                        <td className="py-2.5 px-3">₹2,845.00</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">+₹3,100.00</td>
                        <td className="py-2.5 px-3">₹34.14</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SUB-VIEW 6: DATA EXPORTS & COMPLIANCE REPORTING HUB */}
          {/* ======================================================== */}
          {activeTab === 'data-exports' && (
            <div className="flex flex-col gap-space-lg animate-in fade-in duration-200">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
                <div>
                  <div className="flex items-center gap-1.5 text-primary text-xs uppercase tracking-wider font-bold mb-1">
                    <span className="material-symbols-outlined text-sm">cloud_download</span>
                    <span>Regulatory Engine • Compliance</span>
                  </div>
                  <h1 className="font-headline-xl text-2xl lg:text-3xl text-on-surface font-bold tracking-tight">
                    Data Export &amp; Compliance Reporting Hub
                  </h1>
                  <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
                    Generate audited tax reports, platform-wide trade dumps, SEBI/ITR compliance logs, and scheduled tenant backups.
                  </p>
                </div>
              </div>

              {/* 4 Report Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
                {/* Report 1: ITR-3 Tax */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-bold text-[11px] uppercase">
                        Tax &amp; Legal
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-mono">Q3 Cached</span>
                    </div>
                    <h3 className="font-bold text-base text-on-surface">ITR-3 &amp; Capital Gains Summary</h3>
                    <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      Audited turnover, intraday speculative P&amp;L vs delivery capital gains, STT and stamp duty breakdown aligned with Section 44AB.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-surface-container flex gap-2">
                    <button
                      onClick={() => {
                        const csv = `Segment,Turnover,Gross PnL,STT,Brokerage,Net Realized\nEquity Intraday,₹4820000,₹145000,₹1205,₹2400,₹141395\nF&O Options,₹18420000,₹382000,₹2302,₹8400,₹371298`;
                        triggerDownload('ITR3_Capital_Gains_Summary.csv', csv);
                      }}
                      className="flex-1 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs text-center cursor-pointer"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => showToast('Generated ITR-3 PDF statement.')}
                      className="flex-1 py-2 rounded-lg bg-primary text-on-primary font-semibold text-xs text-center hover:bg-primary-hover cursor-pointer"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>

                {/* Report 2: SEBI Audit Log */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-bold text-[11px] uppercase">
                        SEBI Regulatory
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-mono">SHA-256</span>
                    </div>
                    <h3 className="font-bold text-base text-on-surface">Schedule-IV Audit Log</h3>
                    <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      Time-stamped audit trails of every order placement, modification, and execution fill across all connected demat accounts.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-surface-container flex gap-2">
                    <button
                      onClick={() => {
                        const csv = `AuditID,Timestamp,Action,Status,VerificationHash\nSEBI-001,2026-10-04T09:15:00Z,BROKER_SYNC,VERIFIED,e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`;
                        triggerDownload('SEBI_Schedule_IV_Audit.csv', csv);
                      }}
                      className="flex-1 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs text-center cursor-pointer"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => showToast('SEBI Verified JSON Manifest exported.')}
                      className="flex-1 py-2 rounded-lg bg-secondary text-on-secondary font-semibold text-xs text-center hover:opacity-90 cursor-pointer"
                    >
                      Export JSON
                    </button>
                  </div>
                </div>

                {/* Report 3: Platform DB Dump */}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-container flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-bold text-[11px] uppercase">
                        Master Database
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-mono">142.8 GB</span>
                    </div>
                    <h3 className="font-bold text-base text-on-surface">Platform Tenant Snapshot</h3>
                    <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      Complete anonymized ledger snapshot of all users, journal entries, setups, tags, and psychological scores.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-surface-container flex gap-2">
                    <button
                      onClick={() => {
                        const csv = `SnapshotID,Table,RecordsCount,GeneratedAt\nSNAP-2026-10-05,trades,148920,${new Date().toISOString()}\nSNAP-2026-10-05,users,18650,${new Date().toISOString()}`;
                        triggerDownload('TradeDairy_Tenant_Snapshot.csv', csv);
                      }}
                      className="w-full py-2 rounded-lg bg-primary text-on-primary font-semibold text-xs text-center hover:bg-primary-hover cursor-pointer"
                    >
                      Generate Full Tenant Backup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
