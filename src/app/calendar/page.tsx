'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTrades } from '../../context/TradeContext';
import { localDate } from '../../lib/dates';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Trade } from '../../types';

interface DaySummary {
  date: string;
  dayNumber: number;
  trades: Trade[];
  closedTrades: Trade[];
  openTrades: Trade[];
  netPnl: number;
  grossPnl: number;
  charges: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number;
  topSetup: string;
  topEmotion: string;
  isBestDay: boolean;
  isMaxDdDay: boolean;
}

export default function CalendarPage() {
  const {
    accounts,
    trades,
    journals,
    user,
    selectedAccount,
    setSelectedAccount,
    openRecordTradeModal,
  } = useTrades();

  // Current selected month
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Selected date for the right inspection panel (defaults to today)
  const todayStr = localDate();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // View toggle: 'calendar' vs 'heatmap'
  const [viewMode, setViewMode] = useState<'calendar' | 'heatmap'>('calendar');

  // Month navigation helpers
  const changeMonth = (delta: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1)
    );
  };

  const jumpToCurrentMonth = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(todayStr);
  };

  const monthKey = localDate(currentMonth).slice(0, 7); // 'YYYY-MM'
  const yearNumber = currentMonth.getFullYear();
  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Filter trades by selected account
  const visibleTrades = useMemo(() => {
    return trades.filter(
      (t) => selectedAccount === 'ALL' || t.accountId === selectedAccount
    );
  }, [trades, selectedAccount]);

  // Account currency resolution
  const accountObj = accounts.find((a) => a.id === selectedAccount);
  const currency = accountObj?.currency || user.baseCurrency || 'INR';

  // Monthly trades
  const monthlyTrades = useMemo(() => {
    return visibleTrades.filter((t) => t.date.startsWith(monthKey));
  }, [visibleTrades, monthKey]);

  // Aggregate monthly daily performance
  const daysInMonthCount = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const dailyMap = useMemo(() => {
    const map = new Map<string, DaySummary>();

    // Pre-populate all days of current month
    for (let i = 1; i <= daysInMonthCount; i++) {
      const dayStr = String(i).padStart(2, '0');
      const date = `${monthKey}-${dayStr}`;
      map.set(date, {
        date,
        dayNumber: i,
        trades: [],
        closedTrades: [],
        openTrades: [],
        netPnl: 0,
        grossPnl: 0,
        charges: 0,
        wins: 0,
        losses: 0,
        breakeven: 0,
        winRate: 0,
        topSetup: '',
        topEmotion: '',
        isBestDay: false,
        isMaxDdDay: false,
      });
    }

    // Populate with actual trades
    monthlyTrades.forEach((t) => {
      let entry = map.get(t.date);
      if (!entry) {
        entry = {
          date: t.date,
          dayNumber: parseInt(t.date.split('-')[2], 10) || 1,
          trades: [],
          closedTrades: [],
          openTrades: [],
          netPnl: 0,
          grossPnl: 0,
          charges: 0,
          wins: 0,
          losses: 0,
          breakeven: 0,
          winRate: 0,
          topSetup: '',
          topEmotion: '',
          isBestDay: false,
          isMaxDdDay: false,
        };
        map.set(t.date, entry);
      }

      entry.trades.push(t);
      if (t.status === 'CLOSED') {
        entry.closedTrades.push(t);
        entry.netPnl += t.netPnl;
        entry.grossPnl += t.grossPnl;
        entry.charges += t.charges;

        if (t.netPnl > 0) entry.wins++;
        else if (t.netPnl < 0) entry.losses++;
        else entry.breakeven++;
      } else {
        entry.openTrades.push(t);
      }

      if (!entry.topSetup && t.setup && t.setup !== 'Unspecified') {
        entry.topSetup = t.setup;
      }
      if (!entry.topEmotion && t.emotion) {
        entry.topEmotion = t.emotion;
      }
    });

    // Compute win rates and journal emotions
    map.forEach((entry) => {
      const closedCount = entry.closedTrades.length;
      entry.winRate = closedCount > 0 ? Math.round((entry.wins / closedCount) * 100) : 0;
      const j = journals[entry.date];
      if (j?.emotionalState) {
        entry.topEmotion = j.emotionalState;
      }
    });

    // Identify Best Day and Max Drawdown Day
    let bestDayEntry: DaySummary | null = null;
    let maxDdEntry: DaySummary | null = null;

    map.forEach((entry) => {
      if (entry.closedTrades.length > 0) {
        if (!bestDayEntry || entry.netPnl > bestDayEntry.netPnl) {
          bestDayEntry = entry;
        }
        if (!maxDdEntry || entry.netPnl < maxDdEntry.netPnl) {
          maxDdEntry = entry;
        }
      }
    });

    if (bestDayEntry && (bestDayEntry as DaySummary).netPnl > 0) {
      (bestDayEntry as DaySummary).isBestDay = true;
    }
    if (maxDdEntry && (maxDdEntry as DaySummary).netPnl < 0) {
      (maxDdEntry as DaySummary).isMaxDdDay = true;
    }

    return map;
  }, [daysInMonthCount, monthKey, monthlyTrades, journals]);

  // Quick Metric Highlights
  const monthlyMetrics = useMemo<{
    totalNetPnl: number;
    profitableDays: number;
    lossDays: number;
    tradedDays: number;
    winDayRate: number;
    lossDayRate: number;
    bestDay: DaySummary | null;
    maxDdDay: DaySummary | null;
  }>(() => {
    let totalNetPnl = 0;
    let profitableDays = 0;
    let lossDays = 0;
    let tradedDays = 0;
    let bestDay: DaySummary | null = null;
    let maxDdDay: DaySummary | null = null;

    for (const d of Array.from(dailyMap.values())) {
      if (d.trades.length > 0) {
        tradedDays++;
        totalNetPnl += d.netPnl;
        if (d.netPnl > 0) profitableDays++;
        else if (d.netPnl < 0) lossDays++;

        if (!bestDay || d.netPnl > bestDay.netPnl) {
          bestDay = d;
        }
        if (!maxDdDay || d.netPnl < maxDdDay.netPnl) {
          maxDdDay = d;
        }
      }
    }

    const winDayRate = tradedDays > 0 ? Math.round((profitableDays / tradedDays) * 100) : 0;
    const lossDayRate = tradedDays > 0 ? Math.round((lossDays / tradedDays) * 100) : 0;

    const finalBestDay: DaySummary | null = bestDay && bestDay.netPnl > 0 ? bestDay : null;
    const finalMaxDdDay: DaySummary | null = maxDdDay && maxDdDay.netPnl < 0 ? maxDdDay : null;

    return {
      totalNetPnl,
      profitableDays,
      lossDays,
      tradedDays,
      winDayRate,
      lossDayRate,
      bestDay: finalBestDay,
      maxDdDay: finalMaxDdDay,
    };
  }, [dailyMap]);

  // Calendar Grid Layout Days (Monday to Sunday)
  const calendarGrid = useMemo(() => {
    // 0 = Sunday, 1 = Monday ... 6 = Saturday
    const firstDayIndex = currentMonth.getDay();
    // Monday-first offset: 0 for Mon, 1 for Tue, ..., 6 for Sun
    const startOffset = (firstDayIndex + 6) % 7;

    const prevMonthLastDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      0
    ).getDate();

    // Trailing days from previous month
    const prevDays: { dayNumber: number; isPadding: boolean; date: string }[] = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDate - i;
      prevDays.push({
        dayNumber: dayNum,
        isPadding: true,
        date: '',
      });
    }

    // Days in current month
    const currentDays: { dayNumber: number; isPadding: boolean; date: string }[] = [];
    for (let d = 1; d <= daysInMonthCount; d++) {
      const dayStr = String(d).padStart(2, '0');
      currentDays.push({
        dayNumber: d,
        isPadding: false,
        date: `${monthKey}-${dayStr}`,
      });
    }

    // Trailing days for next month to complete row multiples of 7
    const totalFilled = prevDays.length + currentDays.length;
    const nextOffset = (7 - (totalFilled % 7)) % 7;
    const nextDays: { dayNumber: number; isPadding: boolean; date: string }[] = [];
    for (let n = 1; n <= nextOffset; n++) {
      nextDays.push({
        dayNumber: n,
        isPadding: true,
        date: '',
      });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [currentMonth, daysInMonthCount, monthKey]);

  // Annual streak data calculation
  const annualStreak = useMemo(() => {
    const yearTrades = visibleTrades.filter((t) =>
      t.date.startsWith(String(yearNumber))
    );
    const dayPnlMap = new Map<string, number>();

    yearTrades.forEach((t) => {
      if (t.status === 'CLOSED') {
        dayPnlMap.set(t.date, (dayPnlMap.get(t.date) || 0) + t.netPnl);
      }
    });

    const sortedDates = Array.from(dayPnlMap.keys()).sort();
    let currentStreak = 0;
    let longestStreak = 0;

    sortedDates.forEach((d) => {
      const pnl = dayPnlMap.get(d) || 0;
      if (pnl > 0) {
        currentStreak++;
        if (currentStreak > longestStreak) longestStreak = currentStreak;
      } else if (pnl < 0) {
        currentStreak = 0;
      }
    });

    // Create 20 mini columns for visual consistency heatmap
    const miniWeeks: { dots: ('win' | 'loss' | 'empty')[] }[] = [];
    const recentDays = sortedDates.slice(-100);

    for (let w = 0; w < 20; w++) {
      const dots: ('win' | 'loss' | 'empty')[] = [];
      for (let r = 0; r < 5; r++) {
        const idx = w * 5 + r;
        if (idx < recentDays.length) {
          const dateStr = recentDays[idx];
          const val = dayPnlMap.get(dateStr) || 0;
          dots.push(val > 0 ? 'win' : val < 0 ? 'loss' : 'empty');
        } else {
          dots.push('empty');
        }
      }
      miniWeeks.push({ dots });
    }

    return {
      longestStreak,
      miniWeeks,
    };
  }, [visibleTrades, yearNumber]);

  // Selected Day Details for Right Inspector Panel
  const selectedDayData = useMemo(() => {
    const fallbackDayNumber = parseInt(selectedDate.split('-')[2], 10) || 1;
    return (
      dailyMap.get(selectedDate) || {
        date: selectedDate,
        dayNumber: fallbackDayNumber,
        trades: visibleTrades.filter((t) => t.date === selectedDate),
        closedTrades: visibleTrades.filter(
          (t) => t.date === selectedDate && t.status === 'CLOSED'
        ),
        openTrades: visibleTrades.filter(
          (t) => t.date === selectedDate && t.status === 'OPEN'
        ),
        netPnl: visibleTrades
          .filter((t) => t.date === selectedDate && t.status === 'CLOSED')
          .reduce((sum, t) => sum + t.netPnl, 0),
        grossPnl: 0,
        charges: 0,
        wins: visibleTrades.filter(
          (t) => t.date === selectedDate && t.status === 'CLOSED' && t.netPnl > 0
        ).length,
        losses: visibleTrades.filter(
          (t) => t.date === selectedDate && t.status === 'CLOSED' && t.netPnl < 0
        ).length,
        breakeven: 0,
        winRate: 0,
        topSetup: '',
        topEmotion: '',
        isBestDay: false,
        isMaxDdDay: false,
      }
    );
  }, [dailyMap, selectedDate, visibleTrades]);

  const selectedJournal = journals[selectedDate];

  // Export Monthly Report CSV
  const handleExportReport = () => {
    const rows = [
      ['Date', 'Day', 'Trades Count', 'Wins', 'Losses', 'Charges', 'Net PnL (INR)', 'Top Setup', 'Reflection Emotion'],
    ];

    dailyMap.forEach((d) => {
      if (d.trades.length > 0) {
        rows.push([
          d.date,
          `Day ${d.dayNumber}`,
          String(d.trades.length),
          String(d.wins),
          String(d.losses),
          d.charges.toFixed(2),
          d.netPnl.toFixed(2),
          `"${(d.topSetup || 'General').replace(/"/g, '""')}"`,
          `"${(d.topEmotion || 'Neutral').replace(/"/g, '""')}"`,
        ]);
      }
    });

    // Summary row
    rows.push([]);
    rows.push([
      'TOTALS',
      `${monthlyMetrics.tradedDays} Traded Days`,
      String(monthlyTrades.length),
      String(monthlyMetrics.profitableDays),
      String(monthlyMetrics.lossDays),
      '',
      monthlyMetrics.totalNetPnl.toFixed(2),
      `Win Rate: ${monthlyMetrics.winDayRate}%`,
      '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TradeDairy-Calendar-${monthKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full gap-5 sm:gap-6">
      {/* Top Bar / Breadcrumbs, Controls & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
            <span className="uppercase tracking-wider text-primary font-bold text-[11px]">
              Trading Analytics
            </span>
            <span>/</span>
            <span>Calendar &amp; Heatmap</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
            Trading Calendar &amp; P&amp;L Heatmap
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Visualize your daily consistency, winning streaks, and monthly performance distribution.
          </p>
        </div>

        {/* Navigation & Switcher Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Account Filter Dropdown */}
          <select
            aria-label="Filter Account"
            className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-surface-container text-xs sm:text-sm text-on-surface font-medium outline-none focus:ring-1 focus:ring-primary"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            <option value="ALL">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.accountName} ({acc.broker})
              </option>
            ))}
          </select>

          {/* Month Selector */}
          <div className="flex items-center bg-surface-container-low rounded-lg p-1 text-on-surface border border-surface-container">
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant cursor-pointer"
              onClick={() => changeMonth(-1)}
              title="Previous Month"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            <button
              type="button"
              onClick={jumpToCurrentMonth}
              className="px-3 py-1 font-semibold text-xs sm:text-sm hover:text-primary transition-colors cursor-pointer select-none"
              title="Click to jump to Current Month"
            >
              {monthName}
            </button>

            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant cursor-pointer"
              onClick={() => changeMonth(1)}
              title="Next Month"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {/* Segmented View Toggle */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-surface-container">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white shadow-sm text-on-surface'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Calendar View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                viewMode === 'heatmap'
                  ? 'bg-white shadow-sm text-on-surface'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Streak Heatmap
            </button>
          </div>

          {/* Export Report CSV */}
          <button
            type="button"
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs sm:text-sm border border-surface-container transition-colors cursor-pointer"
            title="Download Monthly Performance Report"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">Report</span>
          </button>
        </div>
      </div>

      {/* Quick Metric Highlights Grid (5 Dynamic Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Net Monthly P&L */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">Net Monthly P&amp;L</span>
            <span className="p-1 rounded-lg bg-surface-container-low text-primary">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
            </span>
          </div>
          <div className="mt-3 flex flex-col">
            <span
              className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums ${
                monthlyMetrics.totalNetPnl < 0 ? 'text-error' : 'text-primary'
              }`}
            >
              {formatCurrency(monthlyMetrics.totalNetPnl, currency, true)}
            </span>
            <span className="text-[11px] sm:text-xs text-on-surface-variant mt-0.5">
              Across {monthlyTrades.length} trades recorded
            </span>
          </div>
        </div>

        {/* Profitable Days */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">Profitable Days</span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-primary border border-emerald-200/60">
              {monthlyMetrics.winDayRate}% Rate
            </span>
          </div>
          <div className="mt-3 flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-on-surface tabular-nums">
                {monthlyMetrics.profitableDays}
              </span>
              <span className="text-xs text-on-surface-variant">
                / {monthlyMetrics.tradedDays} traded
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${monthlyMetrics.winDayRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Loss Days */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">Loss Days</span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-error border border-rose-200/60">
              {monthlyMetrics.lossDayRate}% Rate
            </span>
          </div>
          <div className="mt-3 flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-error tabular-nums">
                {monthlyMetrics.lossDays}
              </span>
              <span className="text-xs text-on-surface-variant">
                / {monthlyMetrics.tradedDays} traded
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-error h-full rounded-full transition-all duration-500"
                style={{ width: `${monthlyMetrics.lossDayRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Best Day */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">Best Day</span>
            <span className="p-1 rounded-lg bg-surface-container-low text-primary">
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </span>
          </div>
          <div className="mt-3 flex flex-col">
            <span className="text-lg sm:text-xl font-bold text-primary tabular-nums">
              {monthlyMetrics.bestDay
                ? formatCurrency(monthlyMetrics.bestDay.netPnl, currency, true)
                : '—'}
            </span>
            <span className="text-[11px] sm:text-xs text-on-surface-variant mt-0.5 truncate">
              {monthlyMetrics.bestDay
                ? `${formatDate(monthlyMetrics.bestDay.date)} • ${
                    monthlyMetrics.bestDay.trades.length
                  } Trades`
                : 'No profitable day'}
            </span>
          </div>
        </div>

        {/* Max Drawdown Day */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-surface-container flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">Max Drawdown Day</span>
            <span className="p-1 rounded-lg bg-rose-50 text-error">
              <span className="material-symbols-outlined text-[16px]">warning</span>
            </span>
          </div>
          <div className="mt-3 flex flex-col">
            <span className="text-lg sm:text-xl font-bold text-error tabular-nums">
              {monthlyMetrics.maxDdDay
                ? formatCurrency(monthlyMetrics.maxDdDay.netPnl, currency, true)
                : '—'}
            </span>
            <span className="text-[11px] sm:text-xs text-on-surface-variant mt-0.5 truncate">
              {monthlyMetrics.maxDdDay
                ? `${formatDate(monthlyMetrics.maxDdDay.date)} • ${
                    monthlyMetrics.maxDdDay.trades.length
                  } Trades`
                : 'Zero loss days'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Interactive Dual Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Calendar Table (8 cols on XL) */}
        <div className="xl:col-span-8 flex flex-col gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-surface-container">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-surface-container/60">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-on-surface">
                Monthly Journal Grid
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-semibold">
                {daysInMonthCount} Days
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-surface-container-low border border-surface-container" />
                <span>No Trades</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                <span>Win</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                <span>Loss</span>
              </div>
            </div>
          </div>

          {/* Interactive Calendar Component */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[680px]">
              {/* Day Name Headers (Monday First) */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div
                    key={day}
                    className="py-1 text-xs font-bold text-on-surface-variant uppercase tracking-wider"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Cell Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarGrid.map((cell, idx) => {
                  if (cell.isPadding) {
                    return (
                      <div
                        key={`padding-${idx}`}
                        className="h-28 rounded-xl p-2.5 bg-surface-container-low/40 flex flex-col justify-between opacity-35 select-none border border-transparent"
                      >
                        <span className="text-xs font-semibold text-on-surface-variant">
                          {cell.dayNumber}
                        </span>
                      </div>
                    );
                  }

                  const dayData = dailyMap.get(cell.date);
                  const isSelected = selectedDate === cell.date;
                  const isToday = cell.date === todayStr;
                  const hasTrades = (dayData?.trades.length || 0) > 0;
                  const closedCount = dayData?.closedTrades.length || 0;
                  const netPnl = dayData?.netPnl || 0;

                  // Card styling based on win/loss
                  let cardBg = 'bg-surface-container-low/70 hover:bg-surface-container';
                  let borderStyle = 'border border-surface-container/80';

                  if (hasTrades) {
                    if (closedCount > 0) {
                      if (netPnl > 0) {
                        cardBg = 'bg-emerald-50/70 hover:bg-emerald-100/60';
                        borderStyle = 'border border-emerald-200';
                      } else if (netPnl < 0) {
                        cardBg = 'bg-rose-50/70 hover:bg-rose-100/60';
                        borderStyle = 'border border-rose-200';
                      }
                    } else {
                      cardBg = 'bg-amber-50/70 hover:bg-amber-100/60';
                      borderStyle = 'border border-amber-200';
                    }
                  }

                  if (isSelected) {
                    borderStyle = 'ring-2 ring-primary border-primary shadow-md';
                  }

                  return (
                    <div
                      key={cell.date}
                      onClick={() => setSelectedDate(cell.date)}
                      className={`calendar-card cursor-pointer h-28 rounded-xl p-2.5 transition-all flex flex-col justify-between group shadow-2xs ${cardBg} ${borderStyle}`}
                    >
                      {/* Top: Day number + Trades pill */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs sm:text-sm font-bold flex items-center gap-1 ${
                            isToday ? 'text-primary' : 'text-on-surface'
                          }`}
                        >
                          {cell.dayNumber}
                          {isToday && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-primary inline-block"
                              title="Today"
                            />
                          )}
                        </span>

                        {hasTrades ? (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/90 text-on-surface border border-surface-container/60 shadow-2xs">
                            {dayData?.trades.length}{' '}
                            {dayData?.trades.length === 1 ? 'trade' : 'trades'}
                          </span>
                        ) : (
                          idx % 7 >= 5 && (
                            <span className="text-[10px] text-outline select-none">
                              Weekend
                            </span>
                          )
                        )}
                      </div>

                      {/* Bottom: P&L + Tag */}
                      <div className="flex flex-col mt-auto">
                        {hasTrades ? (
                          <>
                            <span
                              className={`text-xs sm:text-sm font-bold tabular-nums leading-tight ${
                                closedCount === 0
                                  ? 'text-amber-800'
                                  : netPnl < 0
                                  ? 'text-error'
                                  : 'text-primary'
                              }`}
                            >
                              {closedCount === 0
                                ? 'Open Position'
                                : formatCurrency(netPnl, currency, true)}
                            </span>

                            <div className="flex items-center gap-1 mt-1 overflow-hidden">
                              {dayData?.isBestDay ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary text-white leading-none">
                                  Best Day
                                </span>
                              ) : dayData?.topSetup ? (
                                <span className="text-[10px] px-1 py-0.5 bg-white/80 text-on-surface-variant rounded border border-surface-container/40 leading-none truncate max-w-[85px]">
                                  {dayData.topSetup}
                                </span>
                              ) : dayData?.topEmotion ? (
                                <span
                                  className={`text-[10px] px-1 py-0.5 rounded leading-none ${
                                    ['FOMO', 'Revenge', 'Fear'].includes(dayData.topEmotion)
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {dayData.topEmotion}
                                </span>
                              ) : null}
                            </div>
                          </>
                        ) : (
                          <span className="text-[10px] text-outline/60 select-none">
                            —
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Consistency Heatmap Stream Container (Toggled via button or active in heatmap mode) */}
          {(viewMode === 'heatmap' || true) && (
            <div
              className={`flex-col gap-2 pt-4 border-t border-surface-container ${
                viewMode === 'heatmap' ? 'flex' : 'hidden md:flex'
              }`}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-on-surface">
                  Annual Consistency Streak Grid ({yearNumber})
                </span>
                <span className="text-on-surface-variant font-medium">
                  Longest Winning Streak:{' '}
                  <strong className="text-primary">{annualStreak.longestStreak} Days</strong>
                </span>
              </div>

              <div className="w-full p-3 bg-surface-container-low rounded-xl overflow-x-auto border border-surface-container">
                <div className="flex gap-1.5 min-w-[620px]">
                  {annualStreak.miniWeeks.map((week, wIdx) => (
                    <div key={`streak-col-${wIdx}`} className="flex flex-col gap-1.5">
                      {week.dots.map((dot, dIdx) => (
                        <div
                          key={`dot-${wIdx}-${dIdx}`}
                          className={`w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 ${
                            dot === 'win'
                              ? 'bg-primary'
                              : dot === 'loss'
                              ? 'bg-error'
                              : 'bg-surface-container-high'
                          }`}
                          title={
                            dot === 'win'
                              ? 'Profitable Day'
                              : dot === 'loss'
                              ? 'Loss Day'
                              : 'No Trades'
                          }
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Inspection Panel (4 cols on XL) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* Day Summary Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container/60">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Inspecting Day
                </span>
                <h3 className="text-base sm:text-lg font-bold text-on-surface">
                  {formatDate(selectedDate)}
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  selectedDate === todayStr
                    ? 'bg-emerald-50 text-primary border border-emerald-200/60'
                    : selectedDayData.trades.length > 0
                    ? 'bg-surface-container-low text-on-surface'
                    : 'bg-surface-container-low text-outline'
                }`}
              >
                {selectedDate === todayStr
                  ? 'Active Session'
                  : selectedDayData.trades.length > 0
                  ? 'Closed Session'
                  : 'No Trades'}
              </span>
            </div>

            {/* Metrics Overview for Day */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col">
                <span className="text-xs text-on-surface-variant font-medium">
                  Day&apos;s Net P&amp;L
                </span>
                <span
                  className={`text-base sm:text-lg font-bold mt-1 tabular-nums ${
                    selectedDayData.netPnl < 0 ? 'text-error' : 'text-primary'
                  }`}
                >
                  {selectedDayData.closedTrades.length > 0
                    ? formatCurrency(selectedDayData.netPnl, currency, true)
                    : selectedDayData.trades.length > 0
                    ? 'Open'
                    : '₹0.00'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col">
                <span className="text-xs text-on-surface-variant font-medium">Win Ratio</span>
                <span className="text-base sm:text-lg font-bold text-on-surface mt-1 tabular-nums">
                  {selectedDayData.closedTrades.length > 0
                    ? `${selectedDayData.winRate}%`
                    : '—'}
                </span>
              </div>
            </div>

            {/* Progress Mini Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                <span>
                  {selectedDayData.wins} Wins • {selectedDayData.losses} Losses
                </span>
                <span>{selectedDayData.trades.length} Total Trades</span>
              </div>
              <div className="w-full bg-rose-200 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{
                    width:
                      selectedDayData.closedTrades.length > 0
                        ? `${selectedDayData.winRate}%`
                        : '0%',
                  }}
                />
              </div>
            </div>

            {/* Day's Trades Mini List */}
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Executed Trades
                </span>
                <button
                  type="button"
                  onClick={() => openRecordTradeModal()}
                  className="text-xs text-primary font-semibold hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Add Trade</span>
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
                {selectedDayData.trades.length === 0 ? (
                  <div className="py-6 text-center text-xs text-outline bg-surface-container-low/50 rounded-xl">
                    <p>No trades recorded for this day.</p>
                    <button
                      type="button"
                      onClick={() => openRecordTradeModal()}
                      className="mt-2 text-primary font-semibold hover:underline cursor-pointer"
                    >
                      + Record Trade for this session
                    </button>
                  </div>
                ) : (
                  selectedDayData.trades.map((t) => (
                    <Link
                      key={t.id}
                      href={`/trades/${t.id}`}
                      className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between group border border-transparent hover:border-surface-container"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            t.side === 'BUY'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {t.side}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                            {t.instrument}
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            {t.entryTime || '—'} • {t.setup || 'General'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-xs sm:text-sm font-bold tabular-nums shrink-0 ml-2 ${
                          t.status === 'OPEN'
                            ? 'text-amber-700'
                            : t.netPnl < 0
                            ? 'text-error'
                            : 'text-primary'
                        }`}
                      >
                        {t.status === 'OPEN'
                          ? 'Open'
                          : formatCurrency(t.netPnl, currency, true)}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Behavioral Psychology Reflection Box */}
            <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-1.5 border border-surface-container/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-primary">
                    psychology
                  </span>
                  <span>Daily Reflection</span>
                </span>
                {selectedJournal?.emotionalState ? (
                  <span
                    className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                      ['FOMO', 'Revenge', 'Fear'].includes(selectedJournal.emotionalState)
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedJournal.emotionalState}
                  </span>
                ) : (
                  <span className="text-[11px] text-outline">No Tag</span>
                )}
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                {selectedJournal?.postMarketNotes ||
                  selectedJournal?.preMarketNotes ||
                  'No journal entry recorded for this day. Plan your session, capture your psychology, and review emotional triggers.'}
              </p>

              <Link
                className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline mt-1"
                href={`/journal?date=${selectedDate}`}
              >
                <span>
                  {selectedJournal ? 'Open Daily Journal' : 'Write Journal Entry'}
                </span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Trade Consistency Rule Insight Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white flex items-start gap-3 shadow-sm border border-surface-container">
            <span className="material-symbols-outlined text-primary text-[24px] shrink-0 mt-0.5">
              insights
            </span>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm text-on-surface font-bold">
                Trade Consistency Rule
              </span>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {monthlyMetrics.winDayRate >= 60
                  ? `Strong consistency! You achieved a ${monthlyMetrics.winDayRate}% profitable day rate this month. Keep honoring your stop loss to protect accumulated gains.`
                  : monthlyMetrics.maxDdDay
                  ? `Your largest drawdown day was kept at ${formatCurrency(
                      monthlyMetrics.maxDdDay.netPnl,
                      currency,
                      true
                    )}. Maintain tight risk rules to prevent single-day losses from compounding.`
                  : 'Maintain steady risk sizing and strictly follow your setup checklist across all market conditions.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
