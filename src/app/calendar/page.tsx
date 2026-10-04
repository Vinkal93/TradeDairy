'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTrades } from '../../context/TradeContext';
import { formatCurrency, formatPercent, formatDate } from '../../lib/utils';
import { Trade } from '../../types';
import { localDate } from '../../lib/dates';

export default function CalendarPage() {
  const { user, trades } = useTrades();

  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [viewMode, setViewMode] = useState<'calendar' | 'heatmap'>('calendar');
  const [selectedDayModal, setSelectedDayModal] = useState<string | null>(null);

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Group trades by date
  const tradesByDate = useMemo(() => {
    const map: Record<string, { trades: Trade[]; netPnl: number; wins: number; losses: number }> = {};

    trades.forEach((t) => {
      if (!map[t.date]) {
        map[t.date] = { trades: [], netPnl: 0, wins: 0, losses: 0 };
      }
      map[t.date].trades.push(t);
      map[t.date].netPnl += t.netPnl;
      if (t.netPnl > 0) map[t.date].wins++;
      else if (t.netPnl < 0) map[t.date].losses++;
    });

    return map;
  }, [trades]);

  // Monthly stats
  const monthKeyPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthDaysData = useMemo(() => {
    return Object.entries(tradesByDate).filter(([date]) => date.startsWith(monthKeyPrefix));
  }, [tradesByDate, monthKeyPrefix]);

  const monthlyPnl = useMemo(() => {
    return monthDaysData.reduce((sum, [, d]) => sum + d.netPnl, 0);
  }, [monthDaysData]);

  const profitableDays = monthDaysData.filter(([, d]) => d.netPnl > 0).length;
  const lossDays = monthDaysData.filter(([, d]) => d.netPnl < 0).length;
  const totalDays = monthDaysData.length || 1;
  const winRateDays = Math.round((profitableDays / totalDays) * 100);

  // Best day of month
  const bestDay = useMemo(() => {
    let best = { date: '', pnl: -Infinity, count: 0 };
    monthDaysData.forEach(([date, d]) => {
      if (d.netPnl > best.pnl) {
        best = { date, pnl: d.netPnl, count: d.trades.length };
      }
    });
    return best.pnl !== -Infinity ? best : { date: 'None', pnl: 0, count: 0 };
  }, [monthDaysData]);

  // Calendar days grid generator
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const numDays = lastDayOfMonth.getDate();

    // Monday as first day of week: (firstDay.getDay() + 6) % 7
    const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

    const daysArray: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const dNum = prevMonthLastDay - i;
      const prevM = currentMonth === 0 ? 12 : currentMonth;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      daysArray.push({ dateStr: dStr, dayNum: dNum, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= numDays; d++) {
      const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      daysArray.push({ dateStr: dStr, dayNum: d, isCurrentMonth: true });
    }

    // Remaining days to complete grid rows
    const totalSlots = Math.ceil(daysArray.length / 7) * 7;
    let nextMonthDay = 1;
    while (daysArray.length < totalSlots) {
      const nextM = currentMonth === 11 ? 1 : currentMonth + 2;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(nextMonthDay).padStart(2, '0')}`;
      daysArray.push({ dateStr: dStr, dayNum: nextMonthDay, isCurrentMonth: false });
      nextMonthDay++;
    }

    return daysArray;
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const selectedDayTrades = selectedDayModal ? tradesByDate[selectedDayModal]?.trades || [] : [];

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top Bar / Breadcrumb & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm border border-surface-container/60">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs text-on-surface-variant">
            <span className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
              Trading Analytics
            </span>
            <span className="text-xs">/</span>
            <span className="text-xs">Calendar &amp; Heatmap</span>
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface tracking-tight font-bold">
            Trading Calendar &amp; P&amp;L Heatmap
          </h1>
          <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
            Visualize your daily consistency, winning streaks, and monthly performance distribution.
          </p>
        </div>

        {/* Navigation & Controls */}
        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Month Selector */}
          <div className="flex items-center bg-surface-container-low rounded-lg p-1 text-on-surface border border-surface-container">
            <button
              onClick={handlePrevMonth}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant cursor-pointer"
              title="Previous Month"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="px-space-md font-headline-sm text-sm font-bold select-none min-w-[140px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant cursor-pointer"
              title="Next Month"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {/* Segmented View Toggle */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-surface-container">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-xs transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-xs transition-all cursor-pointer ${
                viewMode === 'heatmap'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Streak Heatmap
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metric Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-space-md">
        {/* Net Monthly P&L */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs text-on-surface-variant">Net Monthly P&amp;L</span>
            <span className="p-1 rounded bg-surface-container-low text-primary">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
            </span>
          </div>
          <div className="mt-2 flex flex-col">
            <span
              className={`font-data-metric-lg text-xl sm:text-2xl font-bold tracking-tight ${
                monthlyPnl >= 0 ? 'text-primary' : 'text-error'
              }`}
            >
              {formatCurrency(monthlyPnl, user.baseCurrency, true)}
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">
              Across {monthDaysData.length} active sessions
            </span>
          </div>
        </div>

        {/* Profitable Days */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs text-on-surface-variant">Profitable Days</span>
            <span className="font-label-sm text-[11px] px-1.5 py-0.5 rounded bg-surface-container-low text-primary font-bold">
              {winRateDays}% Rate
            </span>
          </div>
          <div className="mt-2 flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="font-data-metric-lg text-xl sm:text-2xl text-on-surface font-bold">
                {profitableDays}
              </span>
              <span className="font-body-sm text-xs text-on-surface-variant">/ {monthDaysData.length} traded</span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${winRateDays}%` }}></div>
            </div>
          </div>
        </div>

        {/* Loss Days */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs text-on-surface-variant">Loss Days</span>
            <span className="font-label-sm text-[11px] px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-bold">
              {100 - winRateDays}% Rate
            </span>
          </div>
          <div className="mt-2 flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="font-data-metric-lg text-xl sm:text-2xl text-error font-bold">{lossDays}</span>
              <span className="font-body-sm text-xs text-on-surface-variant">/ {monthDaysData.length} traded</span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-error h-full rounded-full" style={{ width: `${100 - winRateDays}%` }}></div>
            </div>
          </div>
        </div>

        {/* Best Day */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs text-on-surface-variant">Best Day</span>
            <span className="p-1 rounded bg-surface-container-low text-primary">
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </span>
          </div>
          <div className="mt-2 flex flex-col">
            <span className="font-data-metric-md text-xl font-bold text-primary">
              {formatCurrency(bestDay.pnl, user.baseCurrency, true)}
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">
              {bestDay.date !== 'None' ? `${formatDate(bestDay.date)} • ${bestDay.count} Trades` : 'No data'}
            </span>
          </div>
        </div>

        {/* Max Daily Loss */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs text-on-surface-variant">Max Controlled Loss</span>
            <span className="p-1 rounded bg-surface-container-low text-error">
              <span className="material-symbols-outlined text-[16px]">shield</span>
            </span>
          </div>
          <div className="mt-2 flex flex-col">
            <span className="font-data-metric-md text-xl font-bold text-error">
              -₹1,500
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">
              Below Max Risk Rule
            </span>
          </div>
        </div>
      </div>

      {/* Main Calendar Matrix or Streak View */}
      {viewMode === 'calendar' ? (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 p-space-md sm:p-space-lg overflow-x-auto">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 gap-2 min-w-[700px] mb-2 text-center font-label-md text-xs font-bold text-on-surface-variant">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-2 min-w-[700px]">
            {calendarDays.map((d, index) => {
              const dayData = tradesByDate[d.dateStr];
              const hasTrades = !!dayData;
              const isProfit = dayData && dayData.netPnl > 0;
              const isLoss = dayData && dayData.netPnl < 0;

              return (
                <div
                  key={index}
                  onClick={() => hasTrades && setSelectedDayModal(d.dateStr)}
                  className={`min-h-[105px] rounded-xl p-2.5 flex flex-col justify-between transition-all border ${
                    !d.isCurrentMonth
                      ? 'bg-surface-container-low/30 border-surface-container/40 opacity-40'
                      : hasTrades
                      ? isProfit
                        ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500 hover:shadow-md cursor-pointer'
                        : isLoss
                        ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500 hover:shadow-md cursor-pointer'
                        : 'bg-surface-container-low border-surface-container hover:shadow-md cursor-pointer'
                      : 'bg-surface-container-low/40 border-surface-container/60 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        d.isCurrentMonth ? 'text-on-surface' : 'text-outline'
                      }`}
                    >
                      {d.dayNum}
                    </span>

                    {hasTrades && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                        {dayData.trades.length}T
                      </span>
                    )}
                  </div>

                  {hasTrades ? (
                    <div className="flex flex-col gap-0.5 mt-2">
                      <span
                        className={`font-bold text-sm tabular-nums ${
                          isProfit ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {formatCurrency(dayData.netPnl, user.baseCurrency, true)}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        {dayData.wins}W {dayData.losses}L
                      </span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-outline text-center py-2">No Trades</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Continuous Streak Heatmap View */
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 p-space-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-base text-on-surface font-bold">Annual Consistency Heatmap</h2>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <span>Less</span>
              <span className="w-3.5 h-3.5 rounded bg-surface-container-low"></span>
              <span className="w-3.5 h-3.5 rounded bg-emerald-200"></span>
              <span className="w-3.5 h-3.5 rounded bg-emerald-400"></span>
              <span className="w-3.5 h-3.5 rounded bg-emerald-600"></span>
              <span>More</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 py-4">
            {Array.from({ length: 60 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (59 - i));
              const dStr = localDate(d);
              const data = tradesByDate[dStr];

              let bg = 'bg-surface-container-low/70';
              if (data) {
                if (data.netPnl > 2000) bg = 'bg-emerald-600';
                else if (data.netPnl > 500) bg = 'bg-emerald-400';
                else if (data.netPnl > 0) bg = 'bg-emerald-200';
                else if (data.netPnl < -1000) bg = 'bg-rose-500';
                else bg = 'bg-rose-300';
              }

              return (
                <div
                  key={i}
                  title={`${dStr}: ${data ? formatCurrency(data.netPnl, user.baseCurrency, true) : 'No trades'}`}
                  onClick={() => data && setSelectedDayModal(dStr)}
                  className={`w-6 h-6 rounded-md ${bg} cursor-pointer transition-transform hover:scale-125`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Day Trades Modal */}
      {selectedDayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div>
                <h3 className="font-headline-sm text-base text-on-surface font-bold">
                  {formatDate(selectedDayModal)}
                </h3>
                <span
                  className={`text-xs font-bold ${
                    (tradesByDate[selectedDayModal]?.netPnl || 0) >= 0 ? 'text-primary' : 'text-error'
                  }`}
                >
                  Net P&amp;L: {formatCurrency(tradesByDate[selectedDayModal]?.netPnl || 0, user.baseCurrency, true)}
                </span>
              </div>
              <button
                onClick={() => setSelectedDayModal(null)}
                className="p-1 rounded-lg text-outline hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {selectedDayTrades.map((t) => (
                <Link
                  key={t.id}
                  href={`/trades/${t.id}`}
                  className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container flex items-center justify-between transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-on-surface">{t.instrument}</span>
                    <span className="text-[11px] text-on-surface-variant">
                      {t.entryTime} • {t.setup} • {t.side}
                    </span>
                  </div>
                  <span
                    className={`font-bold text-xs ${
                      t.netPnl >= 0 ? 'text-primary' : 'text-error'
                    }`}
                  >
                    {formatCurrency(t.netPnl, user.baseCurrency, true)}
                  </span>
                </Link>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDayModal(null)}
                className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface text-xs font-bold hover:bg-surface-container"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
