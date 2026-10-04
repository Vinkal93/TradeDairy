'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Trade,
  TradingAccount,
  DailyJournal,
  UserProfile,
  AnalyticsSummary,
  DeviceSession,
  DEFAULT_INDEX_LOT_SIZES,
} from '../types';
import {
  INITIAL_USER as DEMO_USER,
  INITIAL_ACCOUNTS as DEMO_ACCOUNTS,
  INITIAL_TRADES as DEMO_TRADES,
  INITIAL_JOURNAL as DEMO_JOURNAL,
} from '../lib/seedData';
import { onFirebaseAuthStateChange, logoutFirebase } from '../lib/firebase';
import { matchesTimeframe } from '../lib/dates';
import { csvCell, parseCSV } from '../lib/csv';
import { LoadingWorkspace } from '../components/common/LoadingWorkspace';

export type TimeframeFilter = 'Today' | 'This Week' | 'This Month' | 'This Year' | 'All Time';

interface TradeContextType {
  user: UserProfile;
  accounts: TradingAccount[];
  trades: Trade[];
  journals: Record<string, DailyJournal>;
  selectedTimeframe: TimeframeFilter;
  setTimeframe: (tf: TimeframeFilter) => void;
  selectedAccount: string;
  setSelectedAccount: (accId: string) => void;

  // Computed values
  filteredTrades: Trade[];
  analytics: AnalyticsSummary;
  intradayEquityCurve: { time: string; pnl: number; cumulative: number }[];
  setupStats: { setup: string; count: number; winRate: number; netPnl: number }[];
  emotionStats: { emotion: string; count: number; winRate: number; netPnl: number }[];

  // CRUD Actions
  addTrade: (trade: Omit<Trade, 'id' | 'createdAt'>) => Trade;
  updateTrade: (id: string, updated: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  getTradeById: (id: string) => Trade | undefined;

  // Account Actions
  addAccount: (account: Omit<TradingAccount, 'id'>) => TradingAccount;
  updateAccount: (id: string, updated: Partial<TradingAccount>) => void;
  deleteAccount: (id: string) => void;

  // Journal Actions
  getJournalForDate: (date: string) => DailyJournal | undefined;
  saveJournal: (journal: DailyJournal) => void;

  // Profile & Auth Actions
  updateUser: (profile: Partial<UserProfile>) => void;
  login: (name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateIndexLotSize: (indexSymbol: string, lotSize: number) => void;
  resetDemoData: () => void;
  eraseAllData: () => void;

  // Device Sessions & Realtime Ecosystem
  deviceSessions: DeviceSession[];
  revokeSession: (sessionId: string) => void;
  logoutAllOtherSessions: () => void;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline';
  lastCloudSync: string | null;

  // Loading state
  isLoaded: boolean;
  storageError: string;

  // Import/Export
  exportTradesCSV: () => string;
  importTradesCSV: (csvString: string) => number;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'tradedairy_user',
  ACCOUNTS: 'tradedairy_accounts',
  TRADES: 'tradedairy_trades',
  JOURNALS: 'tradedairy_journals',
  SESSIONS: 'tradedairy_sessions',
};

const EMPTY_USER: UserProfile = {
  id: 'local-user',
  fullName: 'Trader',
  email: '',
  tradingAlias: '',
  experience: 'beginner',
  primaryMarket: 'Indian Markets (NSE / BSE)',
  baseCurrency: 'INR',
  activeStyles: [],
  dailyMaxLoss: 0,
  dailyMaxTrades: 0,
  defaultRiskPerTrade: 0,
  avatar: '',
  isLoggedIn: false,
  isOnboarded: false,
  plan: 'Free',
  indexLotSizes: DEFAULT_INDEX_LOT_SIZES,
};

// Helper: Namespace storage per logged-in user email/id
function getUserKey(baseKey: string, email?: string): string {
  if (!email) return baseKey;
  const clean = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${baseKey}_${clean}`;
}

// Helper: Detect current device info
function detectDevice(): DeviceSession {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Desktop';
  let deviceName = 'Desktop Workstation';
  let browser = 'Chrome';
  let os = 'Windows 11';
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';

  if (/iPhone/i.test(userAgent)) {
    deviceName = 'Apple iPhone';
    deviceType = 'mobile';
    os = 'iOS 17';
    browser = 'Mobile Safari';
  } else if (/iPad/i.test(userAgent)) {
    deviceName = 'Apple iPad';
    deviceType = 'tablet';
    os = 'iPadOS';
    browser = 'Safari';
  } else if (/Android/i.test(userAgent)) {
    deviceName = /Mobile/i.test(userAgent) ? 'Android Smartphone' : 'Android Tablet';
    deviceType = /Mobile/i.test(userAgent) ? 'mobile' : 'tablet';
    os = 'Android 14';
    browser = 'Chrome Mobile';
  } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
    deviceName = 'Apple Mac';
    os = 'macOS';
    browser = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent) ? 'Safari' : 'Chrome';
  } else if (/Windows/i.test(userAgent)) {
    deviceName = 'Windows PC';
    os = 'Windows 11';
    browser = /Edg/i.test(userAgent) ? 'Edge' : 'Chrome';
  }

  return {
    id: 'current_device_session',
    deviceName: `${deviceName} (${browser})`,
    browser,
    os,
    deviceType,
    ip: '192.168.1.104',
    location: 'Current Device • Local Network',
    isCurrent: true,
    lastActive: 'Active Now',
    createdAt: new Date().toISOString(),
  };
}

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(EMPTY_USER);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [journals, setJournals] = useState<Record<string, DailyJournal>>({});
  const [selectedTimeframe, setTimeframe] = useState<TimeframeFilter>('All Time');
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [deviceSessions, setDeviceSessions] = useState<DeviceSession[]>([]);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastCloudSync, setLastCloudSync] = useState<string | null>(null);
  const lastSyncTimestampRef = useRef<string | null>(null);

  // Realtime Broadcast Channel across browser tabs / devices
  const broadcastSync = useCallback((actionType: string) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('tradedairy_sync_channel');
        channel.postMessage({ type: actionType, timestamp: Date.now() });
        channel.close();
      }
    } catch {}
  }, []);

  // Cross-device Cloud Synchronization
  const fetchCloudSync = useCallback(async (email?: string) => {
    if (!email || !email.trim()) return;
    try {
      setCloudSyncStatus('syncing');
      const res = await fetch(`/api/user/sync?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      if (!res.ok) {
        setCloudSyncStatus('offline');
        return;
      }
      const data = await res.json();
      if (data.exists) {
        if (!lastSyncTimestampRef.current || data.updatedAt !== lastSyncTimestampRef.current) {
          lastSyncTimestampRef.current = data.updatedAt;
          if (Array.isArray(data.trades)) {
            setTrades(data.trades);
            localStorage.setItem(getUserKey(STORAGE_KEYS.TRADES, email), JSON.stringify(data.trades));
          }
          if (Array.isArray(data.accounts)) {
            setAccounts(data.accounts);
            localStorage.setItem(getUserKey(STORAGE_KEYS.ACCOUNTS, email), JSON.stringify(data.accounts));
          }
          if (data.journals && typeof data.journals === 'object') {
            setJournals(data.journals);
            localStorage.setItem(getUserKey(STORAGE_KEYS.JOURNALS, email), JSON.stringify(data.journals));
          }
          if (data.user && typeof data.user === 'object') {
            setUser((prev) => ({
              ...prev,
              ...data.user,
              isLoggedIn: true,
              isOnboarded: true,
            }));
          }
        }
        setLastCloudSync(new Date().toLocaleTimeString());
        setCloudSyncStatus('synced');
      } else {
        setCloudSyncStatus('synced');
      }
    } catch (err) {
      console.warn('Cloud sync fetch offline fallback', err);
      setCloudSyncStatus('offline');
    }
  }, []);

  const pushCloudSync = useCallback(
    async (
      email: string,
      payload: {
        user?: Partial<UserProfile>;
        accounts?: TradingAccount[];
        trades?: Trade[];
        journals?: Record<string, DailyJournal>;
      }
    ) => {
      if (!email || !email.trim()) return;
      try {
        setCloudSyncStatus('syncing');
        const res = await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            user: payload.user || user,
            accounts: payload.accounts || accounts,
            trades: payload.trades || trades,
            journals: payload.journals || journals,
          }),
        });
        if (res.ok) {
          const resData = await res.json();
          lastSyncTimestampRef.current = resData.updatedAt;
          setLastCloudSync(new Date().toLocaleTimeString());
          setCloudSyncStatus('synced');
        } else {
          setCloudSyncStatus('offline');
        }
      } catch (err) {
        console.warn('Cloud sync push offline fallback', err);
        setCloudSyncStatus('offline');
      }
    },
    [user, accounts, trades, journals]
  );

  const persist = useCallback(
    (key: string, value: unknown) => {
      try {
        // Save to global key
        localStorage.setItem(key, JSON.stringify(value));
        // Also save to user-specific scoped key if user is logged in
        if (user.email) {
          localStorage.setItem(getUserKey(key, user.email), JSON.stringify(value));
          // Push update to cross-device cloud
          const updatePayload: Record<string, unknown> = {};
          if (key === STORAGE_KEYS.TRADES) updatePayload.trades = value;
          if (key === STORAGE_KEYS.ACCOUNTS) updatePayload.accounts = value;
          if (key === STORAGE_KEYS.JOURNALS) updatePayload.journals = value;
          if (key === STORAGE_KEYS.USER) updatePayload.user = value;
          pushCloudSync(user.email, updatePayload);
        }
        broadcastSync('PERSIST_CHANGE');
      } catch (error) {
        setStorageError(
          'Your changes could not be saved. Browser storage may be full or disabled. Export a backup before closing this tab.'
        );
        throw error;
      }
    },
    [user.email, broadcastSync, pushCloudSync]
  );

  // Load user-scoped dataset
  const loadScopedData = useCallback((userEmail?: string) => {
    try {
      if (userEmail) {
        fetchCloudSync(userEmail);
      }
      const uKey = getUserKey(STORAGE_KEYS.USER, userEmail);
      const aKey = getUserKey(STORAGE_KEYS.ACCOUNTS, userEmail);
      const tKey = getUserKey(STORAGE_KEYS.TRADES, userEmail);
      const jKey = getUserKey(STORAGE_KEYS.JOURNALS, userEmail);
      const sKey = getUserKey(STORAGE_KEYS.SESSIONS, userEmail);

      const storedUser = localStorage.getItem(uKey) || localStorage.getItem(STORAGE_KEYS.USER);
      const storedAccounts = localStorage.getItem(aKey) || localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      const storedTrades = localStorage.getItem(tKey) || localStorage.getItem(STORAGE_KEYS.TRADES);
      const storedJournals = localStorage.getItem(jKey) || localStorage.getItem(STORAGE_KEYS.JOURNALS);
      const storedSessions = localStorage.getItem(sKey) || localStorage.getItem(STORAGE_KEYS.SESSIONS);

      const loadedUser: UserProfile = storedUser ? JSON.parse(storedUser) : EMPTY_USER;
      const loadedAccounts: TradingAccount[] = storedAccounts ? JSON.parse(storedAccounts) : [];
      const loadedTrades: Trade[] = storedTrades ? JSON.parse(storedTrades) : [];
      const loadedJournals: Record<string, DailyJournal> = storedJournals ? JSON.parse(storedJournals) : {};

      // Device sessions
      const current = detectDevice();
      let sessions: DeviceSession[] = storedSessions ? JSON.parse(storedSessions) : [];
      if (!sessions.some((s) => s.isCurrent)) {
        sessions = [
          current,
          {
            id: 'sess_mobile_backup',
            deviceName: 'iPhone 15 Pro (Safari Mobile)',
            browser: 'Safari',
            os: 'iOS 17',
            deviceType: 'mobile',
            ip: '103.21.244.12',
            location: 'Mumbai, India',
            isCurrent: false,
            lastActive: '12 minutes ago',
            createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          },
        ];
      }
      setDeviceSessions(sessions);

      // Clean sample records if pristine
      if (!localStorage.getItem('tradedairy_real_data_v1')) {
        const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
        const realTrades = loadedTrades.filter((t) => !DEMO_TRADES.some((d) => same(t, d)));
        const usedAccounts = new Set(realTrades.map((t) => t.accountId));
        const realAccounts = loadedAccounts.filter(
          (a) => usedAccounts.has(a.id) || !DEMO_ACCOUNTS.some((d) => same(a, d))
        );
        if (same(loadedJournals[DEMO_JOURNAL.date], DEMO_JOURNAL))
          delete loadedJournals[DEMO_JOURNAL.date];
        setTrades(realTrades);
        setAccounts(realAccounts);
        localStorage.setItem('tradedairy_real_data_v1', '1');
      } else {
        setAccounts(loadedAccounts);
        setTrades(loadedTrades);
      }

      setUser(
        loadedUser.id === DEMO_USER.id && !loadedUser.isLoggedIn
          ? EMPTY_USER
          : { ...EMPTY_USER, ...loadedUser }
      );
      setJournals(loadedJournals);
    } catch (err) {
      console.error('Failed to load TradeDairy data from localStorage', err);
      setStorageError(
        'Saved workspace could not be loaded. Stored data has not been overwritten. Check browser storage.'
      );
    }
  }, []);

  // Initial client mount
  useEffect(() => {
    loadScopedData();
    setIsLoaded(true);
  }, [loadScopedData]);

  // Realtime cross-tab sync listener
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel('tradedairy_sync_channel');
    channel.onmessage = (event) => {
      if (event.data?.type === 'PERSIST_CHANGE') {
        loadScopedData(user.email);
      }
    };
    return () => channel.close();
  }, [user.email, loadScopedData]);

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        setUser((prev) => ({
          ...prev,
          fullName:
            firebaseUser.displayName ||
            prev.fullName ||
            email.split('@')[0] ||
            'Active Trader',
          email,
          avatar: firebaseUser.photoURL || prev.avatar,
          isLoggedIn: true,
          isOnboarded: true,
        }));
        // Load this user's data
        loadScopedData(email);
        fetchCloudSync(email);
      }
    });
    return () => unsubscribe();
  }, [loadScopedData, fetchCloudSync]);

  // Realtime cross-device sync interval & window focus revalidation
  useEffect(() => {
    if (!isLoaded || !user.isLoggedIn || !user.email) return;

    fetchCloudSync(user.email);

    const onFocus = () => {
      fetchCloudSync(user.email);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCloudSync(user.email);
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    const pollTimer = setInterval(() => {
      fetchCloudSync(user.email);
    }, 10000);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(pollTimer);
    };
  }, [isLoaded, user.isLoggedIn, user.email, fetchCloudSync]);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded || storageError) return;
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
      localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(journals));
      if (user.email) {
        localStorage.setItem(getUserKey(STORAGE_KEYS.USER, user.email), JSON.stringify(user));
        localStorage.setItem(getUserKey(STORAGE_KEYS.ACCOUNTS, user.email), JSON.stringify(accounts));
        localStorage.setItem(getUserKey(STORAGE_KEYS.TRADES, user.email), JSON.stringify(trades));
        localStorage.setItem(getUserKey(STORAGE_KEYS.JOURNALS, user.email), JSON.stringify(journals));
      }
    } catch (err) {
      console.error('Failed to save TradeDairy data to localStorage', err);
      setStorageError('Browser storage is full or disabled. Export a backup before closing this tab.');
    }
  }, [user, accounts, trades, journals, isLoaded, storageError]);

  // Filter Trades by Account and Timeframe
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      const matchesAcc = selectedAccount === 'ALL' || t.accountId === selectedAccount;
      const matchesTime = matchesTimeframe(t.date, selectedTimeframe);
      return matchesAcc && matchesTime;
    });
  }, [trades, selectedAccount, selectedTimeframe]);

  // Analytics Calculation
  const analytics: AnalyticsSummary = useMemo(() => {
    const closedTrades = filteredTrades.filter((t) => t.status === 'CLOSED');
    const totalTrades = closedTrades.length;

    let winningTrades = 0;
    let losingTrades = 0;
    let breakevenTrades = 0;
    let totalGrossProfit = 0;
    let totalGrossLoss = 0;
    let totalCharges = 0;
    let netRealizedPnl = 0;
    let largestWin = 0;
    let largestLoss = 0;

    const dayPnlMap: Record<string, { pnl: number; count: number }> = {};

    closedTrades.forEach((t) => {
      const pnl = t.netPnl;
      netRealizedPnl += pnl;
      totalCharges += t.charges || 0;

      if (pnl > 0) {
        winningTrades++;
        totalGrossProfit += pnl;
        if (pnl > largestWin) largestWin = pnl;
      } else if (pnl < 0) {
        losingTrades++;
        totalGrossLoss += pnl;
        if (pnl < largestLoss) largestLoss = pnl;
      } else {
        breakevenTrades++;
      }

      if (!dayPnlMap[t.date]) {
        dayPnlMap[t.date] = { pnl: 0, count: 0 };
      }
      dayPnlMap[t.date].pnl += pnl;
      dayPnlMap[t.date].count += 1;
    });

    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const absGrossLoss = Math.abs(totalGrossLoss);
    const profitFactor =
      absGrossLoss > 0 ? totalGrossProfit / absGrossLoss : totalGrossProfit > 0 ? Infinity : 0;
    const avgWin = winningTrades > 0 ? totalGrossProfit / winningTrades : 0;
    const avgLoss = losingTrades > 0 ? absGrossLoss / losingTrades : 0;
    const lossRate = totalTrades > 0 ? (losingTrades / totalTrades) * 100 : 0;
    const expectancy = (winRate / 100) * avgWin - (lossRate / 100) * avgLoss;

    let bestDay = { date: '', pnl: -Infinity, tradesCount: 0 };
    let worstDay = { date: '', pnl: Infinity, tradesCount: 0 };
    let profitableDaysCount = 0;
    let lossDaysCount = 0;
    const totalDaysTraded = Object.keys(dayPnlMap).length;

    Object.entries(dayPnlMap).forEach(([date, data]) => {
      if (data.pnl > bestDay.pnl) {
        bestDay = { date, pnl: data.pnl, tradesCount: data.count };
      }
      if (data.pnl < worstDay.pnl) {
        worstDay = { date, pnl: data.pnl, tradesCount: data.count };
      }
      if (data.pnl > 0) profitableDaysCount++;
      else if (data.pnl < 0) lossDaysCount++;
    });

    if (bestDay.pnl === -Infinity) bestDay = { date: 'None', pnl: 0, tradesCount: 0 };
    if (worstDay.pnl === Infinity) worstDay = { date: 'None', pnl: 0, tradesCount: 0 };

    let equity = 0,
      peak = 0,
      maxDrawdown = 0;
    [...closedTrades]
      .sort((a, b) =>
        `${a.date} ${a.exitTime || a.entryTime}`.localeCompare(
          `${b.date} ${b.exitTime || b.entryTime}`
        )
      )
      .forEach((t) => {
        equity += t.netPnl;
        peak = Math.max(peak, equity);
        maxDrawdown = Math.max(maxDrawdown, peak - equity);
      });

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      breakevenTrades,
      winRate: Number(winRate.toFixed(1)),
      totalGrossProfit,
      totalGrossLoss,
      totalCharges,
      netRealizedPnl,
      profitFactor: Number(profitFactor.toFixed(2)),
      avgWin: Math.round(avgWin),
      avgLoss: Math.round(avgLoss),
      largestWin,
      largestLoss,
      maxDrawdown,
      expectancy: Math.round(expectancy),
      bestDay,
      worstDay,
      profitableDaysCount,
      lossDaysCount,
      totalDaysTraded,
    };
  }, [filteredTrades]);

  // Equity Curve Progression
  const intradayEquityCurve = useMemo(() => {
    let runningCumulative = 0;
    const sorted = filteredTrades
      .filter((t) => t.status === 'CLOSED')
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return (a.entryTime || '').localeCompare(b.entryTime || '');
      });

    return sorted.map((t, idx) => {
      runningCumulative += t.netPnl;
      return {
        time: t.exitTime || t.entryTime || `T${idx + 1}`,
        pnl: t.netPnl,
        cumulative: runningCumulative,
      };
    });
  }, [filteredTrades]);

  // Setup performance stats
  const setupStats = useMemo(() => {
    const map: Record<string, { count: number; wins: number; pnl: number }> = {};
    filteredTrades.forEach((t) => {
      if (t.status !== 'CLOSED') return;
      const s = t.setup || 'General';
      if (!map[s]) map[s] = { count: 0, wins: 0, pnl: 0 };
      map[s].count++;
      if (t.netPnl > 0) map[s].wins++;
      map[s].pnl += t.netPnl;
    });

    return Object.entries(map)
      .map(([setup, data]) => ({
        setup,
        count: data.count,
        winRate: Math.round((data.wins / data.count) * 100),
        netPnl: data.pnl,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredTrades]);

  // Emotion performance stats
  const emotionStats = useMemo(() => {
    const map: Record<string, { count: number; wins: number; pnl: number }> = {};
    filteredTrades.forEach((t) => {
      const e = t.emotion || 'Calm';
      if (!map[e]) map[e] = { count: 0, wins: 0, pnl: 0 };
      map[e].count++;
      if (t.netPnl > 0) map[e].wins++;
      map[e].pnl += t.netPnl;
    });

    return Object.entries(map)
      .map(([emotion, data]) => ({
        emotion,
        count: data.count,
        winRate: Math.round((data.wins / data.count) * 100),
        netPnl: data.pnl,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredTrades]);

  // Trade CRUD Operations
  const addTrade = (tradeData: Omit<Trade, 'id' | 'createdAt'>): Trade => {
    const dateFormatted = tradeData.date.replace(/-/g, '');
    const randomSuffix = crypto.randomUUID();
    const newId = `TD-${dateFormatted}-${randomSuffix.slice(0, 8)}`;

    const newTrade: Trade = {
      ...tradeData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    persist(STORAGE_KEYS.TRADES, [newTrade, ...trades]);
    setTrades((prev) => [newTrade, ...prev]);
    return newTrade;
  };

  const updateTrade = (id: string, updated: Partial<Trade>) => {
    persist(
      STORAGE_KEYS.TRADES,
      trades.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
    setTrades((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTrade = (id: string) => {
    persist(
      STORAGE_KEYS.TRADES,
      trades.filter((t) => t.id !== id)
    );
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const getTradeById = (id: string) => {
    return trades.find((t) => t.id === id);
  };

  // Account CRUD Operations
  const addAccount = (accountData: Omit<TradingAccount, 'id'>): TradingAccount => {
    const newAcc: TradingAccount = {
      ...accountData,
      id: `acc_${crypto.randomUUID().slice(0, 8)}`,
    };
    persist(STORAGE_KEYS.ACCOUNTS, [...accounts, newAcc]);
    setAccounts((prev) => [...prev, newAcc]);
    return newAcc;
  };

  const updateAccount = (id: string, updated: Partial<TradingAccount>) => {
    persist(
      STORAGE_KEYS.ACCOUNTS,
      accounts.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
  };

  const deleteAccount = (id: string) => {
    if (trades.some((t) => t.accountId === id)) {
      throw new Error('Archive accounts with existing trades to preserve history.');
    }
    persist(
      STORAGE_KEYS.ACCOUNTS,
      accounts.filter((a) => a.id !== id)
    );
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setSelectedAccount((prev) => (prev === id ? 'ALL' : prev));
  };

  // Journal Operations
  const getJournalForDate = (date: string) => {
    return journals[date];
  };

  const saveJournal = (journal: DailyJournal) => {
    persist(STORAGE_KEYS.JOURNALS, { ...journals, [journal.date]: journal });
    setJournals((prev) => ({
      ...prev,
      [journal.date]: journal,
    }));
  };

  // User & Auth Operations
  const updateUser = (profile: Partial<UserProfile>) => {
    persist(STORAGE_KEYS.USER, { ...user, ...profile });
    setUser((prev) => ({ ...prev, ...profile }));
  };

  const login = async (name: string, email: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    const updatedUser: UserProfile = {
      ...user,
      fullName: name || user.fullName || 'Active Trader',
      email: cleanEmail,
      isLoggedIn: true,
      isOnboarded: true,
    };
    setUser(updatedUser);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      localStorage.setItem(getUserKey(STORAGE_KEYS.USER, cleanEmail), JSON.stringify(updatedUser));
    } catch {}

    // Record device session
    const currentDevice = detectDevice();
    setDeviceSessions((prev) => [currentDevice, ...prev.filter((s) => !s.isCurrent)]);

    // Await cloud sync so all trades and accounts from other devices are loaded BEFORE returning!
    await fetchCloudSync(cleanEmail);
    loadScopedData(cleanEmail);
    broadcastSync('PERSIST_CHANGE');
  };

  const updateIndexLotSize = (indexSymbol: string, lotSize: number) => {
    if (!indexSymbol || lotSize <= 0) return;
    const currentLotSizes = user.indexLotSizes || DEFAULT_INDEX_LOT_SIZES;
    const updated = {
      ...currentLotSizes,
      [indexSymbol.toUpperCase()]: lotSize,
    };
    updateUser({ indexLotSizes: updated });
  };

  const logout = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      console.error('Firebase signout error', e);
    }
    const emptyUser = { ...EMPTY_USER, isLoggedIn: false, isOnboarded: false };
    setUser(emptyUser);
    setTrades([]);
    setAccounts([]);
    setJournals({});
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TRADES);
      localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
      localStorage.removeItem(STORAGE_KEYS.JOURNALS);
      localStorage.removeItem('tradedairy_super_admin_session');
    } catch {}
    broadcastSync('PERSIST_CHANGE');
  };

  const resetDemoData = () => {
    const demo = { ...DEMO_USER, isLoggedIn: true, isOnboarded: true };
    setUser(demo);
    setAccounts(DEMO_ACCOUNTS);
    setTrades(DEMO_TRADES);
    setJournals({ [DEMO_JOURNAL.date]: DEMO_JOURNAL });
    persist(STORAGE_KEYS.USER, demo);
    persist(STORAGE_KEYS.TRADES, DEMO_TRADES);
    persist(STORAGE_KEYS.ACCOUNTS, DEMO_ACCOUNTS);
    persist(STORAGE_KEYS.JOURNALS, { [DEMO_JOURNAL.date]: DEMO_JOURNAL });
  };

  const eraseAllData = () => {
    persist(STORAGE_KEYS.TRADES, []);
    persist(STORAGE_KEYS.JOURNALS, {});
    setTrades([]);
    setJournals({});
    if (user.email) {
      pushCloudSync(user.email, { trades: [], journals: {} });
    }
  };

  // Device Sessions Management
  const revokeSession = (sessionId: string) => {
    setDeviceSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const logoutAllOtherSessions = () => {
    setDeviceSessions((prev) => prev.filter((s) => s.isCurrent));
  };

  // CSV Export & Import
  const exportTradesCSV = (): string => {
    const headers = [
      'ID',
      'Date',
      'Entry Time',
      'Exit Time',
      'Instrument',
      'Asset Class',
      'Side',
      'Quantity',
      'Entry Price',
      'Exit Price',
      'Stop Loss',
      'Target',
      'Gross P&L',
      'Charges',
      'Net P&L',
      'ROI %',
      'R:R Ratio',
      'Setup',
      'Market Condition',
      'Emotion',
      'Rules Followed',
      'Account ID',
      'Account Name',
      'Notes',
    ];

    const rows = trades.map((t) => [
      csvCell(t.id),
      csvCell(t.date),
      csvCell(t.entryTime || ''),
      csvCell(t.exitTime || ''),
      csvCell(t.instrument),
      csvCell(t.assetClass),
      csvCell(t.side),
      csvCell(t.quantity),
      csvCell(t.entryPrice),
      csvCell(t.exitPrice !== undefined ? t.exitPrice : ''),
      csvCell(t.stopLoss !== undefined ? t.stopLoss : ''),
      csvCell(t.target !== undefined ? t.target : ''),
      csvCell(t.grossPnl),
      csvCell(t.charges),
      csvCell(t.netPnl),
      csvCell(t.roi),
      csvCell(t.rrRatio !== undefined ? t.rrRatio : ''),
      csvCell(t.setup || ''),
      csvCell(t.marketCondition || ''),
      csvCell(t.emotion || ''),
      csvCell(t.rulesFollowed ? 'Yes' : 'No'),
      csvCell(t.accountId),
      csvCell(t.accountName || ''),
      csvCell(t.notes || ''),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  const importTradesCSV = (csvString: string): number => {
    try {
      const parsedRows = parseCSV(csvString);
      if (parsedRows.length < 2) return 0;

      const headers = parsedRows[0].map((h) => h.toLowerCase().trim());
      const getIdx = (name: string) => headers.findIndex((h) => h.includes(name));

      const idIdx = getIdx('id');
      const dateIdx = getIdx('date');
      const instIdx = getIdx('instrument');
      const sideIdx = getIdx('side');
      const qtyIdx = getIdx('quantity');
      const entryIdx = getIdx('entry price');
      const exitIdx = getIdx('exit price');
      const pnlIdx = getIdx('net p&l');
      const accIdx = getIdx('account');

      let importedCount = 0;
      const newTradesList: Trade[] = [];

      for (let i = 1; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        if (!row || row.length < 5) continue;

        const instrument = instIdx !== -1 ? row[instIdx] : row[4] || '';
        const date = dateIdx !== -1 ? row[dateIdx] : row[1] || '';
        const side = (sideIdx !== -1 ? row[sideIdx] : row[6] || 'BUY').toUpperCase();
        const quantity = parseFloat(qtyIdx !== -1 ? row[qtyIdx] : row[7] || '1');
        const entryPrice = parseFloat(entryIdx !== -1 ? row[entryIdx] : row[8] || '0');
        const exitPriceStr = exitIdx !== -1 ? row[exitIdx] : row[9];
        const exitPrice = exitPriceStr ? parseFloat(exitPriceStr) : undefined;
        const netPnl = parseFloat(pnlIdx !== -1 ? row[pnlIdx] : row[14] || '0');

        if (!instrument || !date || isNaN(quantity) || isNaN(entryPrice)) continue;

        const targetAccount = accounts[0] || DEMO_ACCOUNTS[0];
        const newTrade: Trade = {
          id: idIdx !== -1 && row[idIdx] ? row[idIdx] : `TD-${Date.now()}-${i}`,
          instrument: instrument.toUpperCase(),
          assetClass: 'Equity',
          side: side === 'SELL' ? 'SELL' : 'BUY',
          status: exitPrice !== undefined ? 'CLOSED' : 'OPEN',
          date,
          entryTime: '09:30 AM',
          exitTime: exitPrice !== undefined ? '03:15 PM' : undefined,
          quantity,
          entryPrice,
          exitPrice,
          grossPnl: netPnl,
          charges: 0,
          netPnl,
          roi: entryPrice > 0 && exitPrice ? ((exitPrice - entryPrice) / entryPrice) * 100 : 0,
          setup: 'Imported',
          rulesFollowed: true,
          accountId: accIdx !== -1 && row[accIdx] ? row[accIdx] : targetAccount.id,
          accountName: targetAccount.accountName,
          createdAt: new Date().toISOString(),
        };

        newTradesList.push(newTrade);
        importedCount++;
      }

      if (newTradesList.length > 0) {
        persist(STORAGE_KEYS.TRADES, [...newTradesList, ...trades]);
        setTrades((prev) => [...newTradesList, ...prev]);
      }
      return importedCount;
    } catch (e) {
      console.error('CSV import parsing error', e);
      return 0;
    }
  };

  return (
    <TradeContext.Provider
      value={{
        user,
        accounts,
        trades,
        journals,
        selectedTimeframe,
        setTimeframe,
        selectedAccount,
        setSelectedAccount,
        filteredTrades,
        analytics,
        intradayEquityCurve,
        setupStats,
        emotionStats,
        addTrade,
        updateTrade,
        deleteTrade,
        getTradeById,
        addAccount,
        updateAccount,
        deleteAccount,
        getJournalForDate,
        saveJournal,
        updateUser,
        login,
        logout,
        updateIndexLotSize,
        resetDemoData,
        eraseAllData,
        deviceSessions,
        revokeSession,
        logoutAllOtherSessions,
        cloudSyncStatus,
        lastCloudSync,
        isLoaded,
        storageError,
        exportTradesCSV,
        importTradesCSV,
      }}
    >
      {isLoaded ? children : <LoadingWorkspace isReady={isLoaded} />}
    </TradeContext.Provider>
  );
};

export const useTrades = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error('useTrades must be used within a TradeProvider');
  }
  return context;
};
