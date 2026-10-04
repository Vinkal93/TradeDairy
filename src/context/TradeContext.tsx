'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Trade,
  TradingAccount,
  DailyJournal,
  UserProfile,
  AnalyticsSummary,
} from '../types';
import { INITIAL_USER, INITIAL_ACCOUNTS, INITIAL_TRADES, INITIAL_JOURNAL } from '../lib/seedData';
import { onFirebaseAuthStateChange, logoutFirebase } from '../lib/firebase';
import { matchesTimeframe } from '../lib/dates';
import { csvCell, parseCSV } from '../lib/csv';

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
  addAccount: (account: Omit<TradingAccount, 'id'>) => void;
  updateAccount: (id: string, updated: Partial<TradingAccount>) => void;
  deleteAccount: (id: string) => void;

  // Journal Actions
  getJournalForDate: (date: string) => DailyJournal | undefined;
  saveJournal: (journal: DailyJournal) => void;

  // Profile & Auth Actions
  updateUser: (profile: Partial<UserProfile>) => void;
  login: (name: string, email: string) => void;
  logout: () => Promise<void>;
  resetDemoData: () => void;
  eraseAllData: () => void;
  
  // Loading state
  isLoaded: boolean;

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
};

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [accounts, setAccounts] = useState<TradingAccount[]>(INITIAL_ACCOUNTS);
  const [trades, setTrades] = useState<Trade[]>(INITIAL_TRADES);
  const [journals, setJournals] = useState<Record<string, DailyJournal>>({
    [INITIAL_JOURNAL.date]: INITIAL_JOURNAL,
  });
  const [selectedTimeframe, setTimeframe] = useState<TimeframeFilter>('All Time');
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on initial client mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      const storedTrades = localStorage.getItem(STORAGE_KEYS.TRADES);
      const storedJournals = localStorage.getItem(STORAGE_KEYS.JOURNALS);

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
      if (storedTrades) setTrades(JSON.parse(storedTrades));
      if (storedJournals) setJournals(JSON.parse(storedJournals));
    } catch (err) {
      console.error('Failed to load TradeDairy data from localStorage', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setUser((prev) => ({
          ...prev,
          fullName: firebaseUser.displayName || prev.fullName || firebaseUser.email?.split('@')[0] || 'Active Trader',
          email: firebaseUser.email || prev.email,
          avatar: firebaseUser.photoURL || prev.avatar,
          isLoggedIn: true,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
      localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(journals));
    } catch (err) {
      console.error('Failed to save TradeDairy data to localStorage', err);
    }
  }, [user, accounts, trades, journals, isLoaded]);

  // Filter trades based on timeframe and account selection
  const filteredTrades = useMemo(() => {
    let result = [...trades];

    // Filter by account
    if (selectedAccount !== 'ALL') {
      result = result.filter(t => t.accountId === selectedAccount);
    }

    // Filter by timeframe
    result = result.filter(t => matchesTimeframe(t.date, selectedTimeframe));

    return result;
  }, [trades, selectedAccount, selectedTimeframe]);

  // Compute live analytics from filtered trades
  const analytics: AnalyticsSummary = useMemo(() => {
    const closedTrades = filteredTrades.filter(t => t.status === 'CLOSED');
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

    closedTrades.forEach(t => {
      const pnl = t.netPnl;
      netRealizedPnl += pnl;
      totalCharges += t.charges || 0;

      if (t.grossPnl > 0) {
        winningTrades++;
        totalGrossProfit += t.grossPnl;
        if (pnl > largestWin) largestWin = pnl;
      } else if (t.grossPnl < 0) {
        losingTrades++;
        totalGrossLoss += t.grossPnl;
        if (pnl < largestLoss) largestLoss = pnl;
      } else {
        breakevenTrades++;
      }

      // Track by day
      if (!dayPnlMap[t.date]) {
        dayPnlMap[t.date] = { pnl: 0, count: 0 };
      }
      dayPnlMap[t.date].pnl += pnl;
      dayPnlMap[t.date].count += 1;
    });

    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const absGrossLoss = Math.abs(totalGrossLoss);
    const profitFactor = absGrossLoss > 0 ? totalGrossProfit / absGrossLoss : totalGrossProfit > 0 ? 2.5 : 0;
    const avgWin = winningTrades > 0 ? totalGrossProfit / winningTrades : 0;
    const avgLoss = losingTrades > 0 ? absGrossLoss / losingTrades : 0;
    const lossRate = totalTrades > 0 ? (losingTrades / totalTrades) * 100 : 0;
    const expectancy = (winRate / 100) * avgWin - (lossRate / 100) * avgLoss;

    // Best & Worst Days
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
      maxDrawdown: Math.abs(worstDay.pnl),
      expectancy: Math.round(expectancy),
      bestDay,
      worstDay,
      profitableDaysCount,
      lossDaysCount,
      totalDaysTraded,
    };
  }, [filteredTrades]);

  // Compute Intraday Equity Progression
  const intradayEquityCurve = useMemo(() => {
    let runningCumulative = 0;
    // Sort chronological
    const sorted = [...filteredTrades].sort((a, b) => {
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

  // Setup performance statistics
  const setupStats = useMemo(() => {
    const map: Record<string, { count: number; wins: number; pnl: number }> = {};
    filteredTrades.forEach(t => {
      const s = t.setup || 'General';
      if (!map[s]) map[s] = { count: 0, wins: 0, pnl: 0 };
      map[s].count++;
      if (t.netPnl > 0) map[s].wins++;
      map[s].pnl += t.netPnl;
    });

    return Object.entries(map).map(([setup, data]) => ({
      setup,
      count: data.count,
      winRate: Math.round((data.wins / data.count) * 100),
      netPnl: data.pnl,
    })).sort((a, b) => b.count - a.count);
  }, [filteredTrades]);

  // Emotion performance statistics
  const emotionStats = useMemo(() => {
    const map: Record<string, { count: number; wins: number; pnl: number }> = {};
    filteredTrades.forEach(t => {
      const e = t.emotion || 'Calm';
      if (!map[e]) map[e] = { count: 0, wins: 0, pnl: 0 };
      map[e].count++;
      if (t.netPnl > 0) map[e].wins++;
      map[e].pnl += t.netPnl;
    });

    return Object.entries(map).map(([emotion, data]) => ({
      emotion,
      count: data.count,
      winRate: Math.round((data.wins / data.count) * 100),
      netPnl: data.pnl,
    })).sort((a, b) => b.count - a.count);
  }, [filteredTrades]);

  // Trade CRUD Operations
  const addTrade = (tradeData: Omit<Trade, 'id' | 'createdAt'>): Trade => {
    const dateFormatted = tradeData.date.replace(/-/g, '');
    const randomSuffix = crypto.randomUUID();
    const newId = `TD-${dateFormatted}-${randomSuffix}`;

    const newTrade: Trade = {
      ...tradeData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setTrades(prev => [newTrade, ...prev]);
    return newTrade;
  };

  const updateTrade = (id: string, updated: Partial<Trade>) => {
    setTrades(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
  };

  const getTradeById = (id: string) => {
    return trades.find(t => t.id === id);
  };

  // Account CRUD Operations
  const addAccount = (accountData: Omit<TradingAccount, 'id'>) => {
    const newAcc: TradingAccount = {
      ...accountData,
      id: `acc_${Date.now()}`,
    };
    setAccounts(prev => [...prev, newAcc]);
  };

  const updateAccount = (id: string, updated: Partial<TradingAccount>) => {
    setAccounts(prev => prev.map(a => (a.id === id ? { ...a, ...updated } : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    setSelectedAccount(prev => prev === id ? 'ALL' : prev);
  };

  // Journal Operations
  const getJournalForDate = (date: string) => {
    return journals[date];
  };

  const saveJournal = (journal: DailyJournal) => {
    setJournals(prev => ({
      ...prev,
      [journal.date]: journal,
    }));
  };

  // User & Auth Operations
  const updateUser = (profile: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...profile }));
  };

  const login = (name: string, email: string) => {
    setUser(prev => ({
      ...prev,
      fullName: name || prev.fullName,
      email: email,
      isLoggedIn: true,
      isOnboarded: true,
    }));
  };

  const logout = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      console.error('Firebase signout error', e);
    }
    setUser(prev => ({ ...prev, isLoggedIn: false, isOnboarded: false }));
    try {
      localStorage.removeItem('tradedairy_super_admin_session');
    } catch {}
  };

  const resetDemoData = () => {
    setUser({ ...INITIAL_USER, isLoggedIn: true, isOnboarded: true });
    setAccounts(INITIAL_ACCOUNTS);
    setTrades(INITIAL_TRADES);
    setJournals({ [INITIAL_JOURNAL.date]: INITIAL_JOURNAL });
    setTimeframe('All Time');
    setSelectedAccount('ALL');
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  };

  const eraseAllData = () => {
    setTrades([]);
    setJournals({});
    setUser(prev => ({ ...prev, isLoggedIn: false, isOnboarded: false }));
    try {
      localStorage.removeItem(STORAGE_KEYS.TRADES);
      localStorage.removeItem(STORAGE_KEYS.JOURNALS);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.error('Error erasing panel data', e);
    }
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
      'Setup',
      'Emotion',
      'Account',
      'Notes',
    ];

    const rows = trades.map(t => [
      t.id,
      t.date,
      t.entryTime,
      t.exitTime || '',
      t.instrument,
      t.assetClass,
      t.side,
      t.quantity,
      t.entryPrice,
      t.exitPrice || '',
      t.stopLoss || '',
      t.target || '',
      t.grossPnl,
      t.charges,
      t.netPnl,
      t.roi,
      t.setup,
      t.emotion || '',
      t.accountName || t.accountId,
      t.notes || '',
    ]);

    return [headers.join(','), ...rows.map(r => r.map(csvCell).join(','))].join('\n');
  };

  const importTradesCSV = (csvString: string): number => {
    try {
      const lines = parseCSV(csvString);
      if (lines.length < 2) return 0;
      if (lines[0][0]?.trim() !== 'ID' || lines[0][4]?.trim() !== 'Instrument') return 0;
      let importedCount = 0;

      const newTradesList: Trade[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i];
        if (cols.length >= 20) {
          const instrument = cols[4];
          const side = (cols[6] === 'SELL' ? 'SELL' : 'BUY') as 'BUY' | 'SELL';
          const qty = Number(cols[7]);
          const entry = Number(cols[8]);
          const exit = cols[9].trim() ? Number(cols[9]) : undefined;
          const charges = Number(cols[13]);
          const account = accounts.find(a => a.accountName === cols[18] || a.id === cols[18]) || accounts.find(a => a.isActive);
          if (!instrument.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(cols[1]) || !['BUY', 'SELL'].includes(cols[6]) ||
              !['Options', 'Futures', 'Equity', 'Forex', 'Crypto', 'Commodities'].includes(cols[5]) ||
              ![qty, entry, charges].every(Number.isFinite) || qty <= 0 || entry <= 0 || charges < 0 ||
              (exit !== undefined && (!Number.isFinite(exit) || exit <= 0)) || !account) continue;

          const gross = exit === undefined ? 0 : side === 'BUY' ? (exit - entry) * qty : (entry - exit) * qty;
          const net = exit === undefined ? 0 : gross - charges;
          const roi = ((net / (entry * qty)) * 100);

          newTradesList.push({
            id: `TD-IMP-${Date.now()}-${i}`,
            date: cols[1],
            entryTime: cols[2] || '10:00 AM',
            exitTime: exit === undefined ? undefined : cols[3] || undefined,
            instrument,
            assetClass: (cols[5] as any) || 'Options',
            side,
            status: exit === undefined ? 'OPEN' : 'CLOSED',
            quantity: qty,
            entryPrice: entry,
            exitPrice: exit,
            stopLoss: Number(cols[10]) || undefined,
            target: Number(cols[11]) || undefined,
            grossPnl: gross,
            charges,
            netPnl: net,
            roi: Number(roi.toFixed(2)),
            setup: cols[16] || 'Breakout',
            emotion: (cols[17] as any) || 'Calm',
            accountId: account.id,
            accountName: account.accountName,
            notes: cols[19] || 'Imported via CSV',
            rulesFollowed: true,
            createdAt: new Date().toISOString(),
          });
          importedCount++;
        }
      }

      if (newTradesList.length > 0) {
        setTrades(prev => [...newTradesList, ...prev]);
      }
      return importedCount;
    } catch (e) {
      console.error('Error importing CSV', e);
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
        resetDemoData,
        eraseAllData,
        isLoaded,
        exportTradesCSV,
        importTradesCSV,
      }}
    >
      {isLoaded ? children : <div role="status" className="min-h-screen flex items-center justify-center text-on-surface-variant">Loading your trading workspace…</div>}
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
