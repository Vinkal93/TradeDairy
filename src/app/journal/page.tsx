'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { localDate } from '../../lib/dates';
import Link from 'next/link';
import { useTrades } from '../../context/TradeContext';
import { formatCurrency, formatPercent, formatDate } from '../../lib/utils';
import { EmotionalState } from '../../types';

export default function JournalPage() {
  const { user, trades, journals, saveJournal } = useTrades();

  const [currentDate, setCurrentDate] = useState(() => localDate());
  const [saveToast, setSaveToast] = useState(false);

  // Get existing or default journal for this date
  const journal = useMemo(() => {
    return (
      journals[currentDate] || {
        id: `dj_${currentDate.replace(/-/g, '')}`,
        date: currentDate,
        preMarketNotes: '',
        postMarketNotes: '',
        emotionalState: 'Calm' as EmotionalState,
        starRating: 0,
        rulesFollowed: true,
        mindsetTags: [],
        mistakeTags: [],
      }
    );
  }, [journals, currentDate]);

  const [preNotes, setPreNotes] = useState(journal.preMarketNotes || '');
  const [postNotes, setPostNotes] = useState(journal.postMarketNotes);
  const [emotion, setEmotion] = useState<EmotionalState>(journal.emotionalState);
  const [rating, setRating] = useState<number>(journal.starRating);
  const [mindsetTags, setMindsetTags] = useState<string[]>(journal.mindsetTags);
  const [mistakeTags, setMistakeTags] = useState<string[]>(journal.mistakeTags);
  useEffect(() => {
    setPreNotes(journal.preMarketNotes || '');
    setPostNotes(journal.postMarketNotes);
    setEmotion(journal.emotionalState);
    setRating(journal.starRating);
    setMindsetTags(journal.mindsetTags);
    setMistakeTags(journal.mistakeTags);
    setSaveToast(false);
  }, [journal]);

  // Trades on current date
  const dayTrades = useMemo(() => {
    return trades.filter((t) => t.date === currentDate);
  }, [trades, currentDate]);

  // Day calculations
  const dayPnl = useMemo(() => {
    return dayTrades.reduce((sum, t) => sum + t.netPnl, 0);
  }, [dayTrades]);

  const dayWins = dayTrades.filter((t) => t.netPnl > 0).length;
  const dayLosses = dayTrades.filter((t) => t.netPnl < 0).length;
  const dayWinRate = dayTrades.length > 0 ? (dayWins / dayTrades.length) * 100 : 0;

  const toggleMistakeTag = (tag: string) => {
    setMistakeTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleMindsetTag = (tag: string) => {
    setMindsetTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    saveJournal({
      id: journal.id,
      date: currentDate,
      preMarketNotes: preNotes,
      postMarketNotes: postNotes,
      emotionalState: emotion,
      starRating: rating,
      rulesFollowed: mistakeTags.length === 0,
      mindsetTags,
      mistakeTags,
      tradesCount: dayTrades.length,
      dayPnl,
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const changeDateBy = (days: number) => {
    const d = new Date(`${currentDate}T12:00:00`);
    d.setDate(d.getDate() + days);
    setCurrentDate(localDate(d));
  };

  const allMistakeOptions = [
    'FOMO Entry',
    'Moved Stop Loss',
    'Revenge Trade',
    'Overleveraged Position',
    'Early Exit on Winner',
    'Chased Market',
    'Traded Without Confluence',
  ];

  const allMindsetOptions = [
    'Calm & Composed',
    'Followed Rules',
    'Breakout Setup',
    'Accepted Risk Fully',
    'Let Winner Run',
    'Walked Away at Target',
  ];

  const emotions: { type: EmotionalState; emoji: string }[] = [
    { type: 'Calm', emoji: '😌' },
    { type: 'Confident', emoji: '😎' },
    { type: 'Fear', emoji: '😨' },
    { type: 'FOMO', emoji: '😬' },
    { type: 'Greedy', emoji: '🤑' },
    { type: 'Revenge', emoji: '😡' },
  ];

  return (
    <div className="flex flex-col w-full gap-space-lg pb-12">
      {/* Header & Session Navigation */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm border border-surface-container/60">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-xs uppercase tracking-wider font-bold">
              Trading Psychology
            </span>
            <span className="text-outline text-xs">• Routine Sync</span>
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface tracking-tight font-bold">
            Daily Trading Journal &amp; Psychology
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant">
            Evening reflection, emotional discipline tracking, and end-of-day trading session review.
          </p>
        </div>

        {/* Date Navigation Toolbar */}
        <div className="flex items-center flex-wrap gap-space-xs self-start md:self-auto bg-surface-container-lowest p-1 rounded-xl">
          <div className="flex items-center bg-surface-container-low rounded-lg p-1 border border-surface-container">
            <button
              onClick={() => changeDateBy(-1)}
              aria-label="Previous day"
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            <div className="flex items-center gap-space-xs px-3">
              <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
              <span className="font-headline-sm text-xs sm:text-sm text-on-surface whitespace-nowrap font-bold">
                {formatDate(currentDate)}
              </span>
            </div>

            <button
              onClick={() => changeDateBy(1)}
              aria-label="Next day"
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(localDate())}
            className="px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container font-label-md text-xs text-on-surface border border-surface-container transition-colors cursor-pointer font-medium"
          >
            Today
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-xs hover:bg-primary-hover shadow-sm transition-all cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>{saveToast ? 'Saved ✓' : 'Save Journal Entry'}</span>
          </button>
        </div>
      </section>

      {/* Auto-Calculated Day Performance Summary Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Day P&L */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
              Day&apos;s Net P&amp;L
            </span>
            <span className="p-1.5 rounded-lg bg-primary-fixed/50 text-primary">
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className={`font-data-metric-lg text-2xl font-bold ${
                dayPnl >= 0 ? 'text-primary' : 'text-error'
              }`}
            >
              {formatCurrency(dayPnl, user.baseCurrency, true)}
            </span>
            <span className="text-xs text-on-surface-variant">Realized</span>
          </div>
        </div>

        {/* Day Win Rate */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
              Win Rate Today
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container text-secondary">
              <span className="material-symbols-outlined text-[16px]">pie_chart</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-data-metric-lg text-2xl font-bold text-on-surface">
              {dayWinRate.toFixed(1)}%
            </span>
            <span className="text-xs text-on-surface-variant">{dayWins} Wins / {dayLosses} Losses</span>
          </div>
        </div>

        {/* Total Trades Today */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
              Session Volume
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container text-on-surface">
              <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-data-metric-lg text-2xl font-bold text-on-surface">
              {dayTrades.length} Trades
            </span>
            <span className="text-xs text-primary font-medium">Within Limit</span>
          </div>
        </div>

        {/* Discipline Rating */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
              Discipline Score
            </span>
            <span className="p-1.5 rounded-lg bg-primary-fixed/50 text-primary">
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-data-metric-lg text-2xl font-bold text-primary">
              {rating} / 5 Stars
            </span>
            <span className="text-xs text-on-surface-variant">Self Audited</span>
          </div>
        </div>
      </section>

      {/* Main Review Form & Psychological Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column (7 cols): Journal notes & Ratings */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Discipline Star Rating Card */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-base text-on-surface font-bold">
                Rate Today&apos;s Discipline &amp; Rule Adherence
              </h2>
              <span className="font-label-sm text-xs text-primary font-bold">{rating} out of 5 stars</span>
            </div>

            <div className="flex items-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-secondary transition-transform hover:scale-110 cursor-pointer"
                >
                  <span
                    className={`material-symbols-outlined text-[32px] ${
                      star <= rating ? 'text-amber-500 fill-amber-500' : 'text-surface-container-high'
                    }`}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant">
              Did you follow your daily plan, execute pre-defined stoplosses, and avoid emotional tilt?
            </p>
          </div>

          {/* Emotional State Selector */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col gap-3">
            <h2 className="font-headline-sm text-base text-on-surface font-bold">
              Dominant Emotional State of the Session
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {emotions.map((em) => (
                <button
                  key={em.type}
                  type="button"
                  onClick={() => setEmotion(em.type)}
                  className={`p-2.5 rounded-xl font-label-sm text-xs font-semibold flex flex-col items-center gap-1 transition-all border cursor-pointer ${
                    emotion === em.type
                      ? 'bg-primary text-on-primary border-primary shadow-xs scale-105'
                      : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                  }`}
                >
                  <span className="text-2xl">{em.emoji}</span>
                  <span>{em.type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pre-Market Preparation Notes */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col gap-2">
            <label className="font-headline-sm text-base text-on-surface font-bold">
              Pre-Market Preparation &amp; Watchlist
            </label>
            <p className="text-xs text-on-surface-variant">Key levels, major economic catalysts, and mental game plan.</p>
            <textarea
              rows={3}
              value={preNotes}
              onChange={(e) => setPreNotes(e.target.value)}
              placeholder="e.g. NIFTY 25,000 resistance, watching for breakout above 25,050..."
              className="w-full p-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container focus:outline-none focus:bg-surface-container-lowest resize-none"
            />
          </div>

          {/* Post-Market Reflection */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col gap-2">
            <label className="font-headline-sm text-base text-on-surface font-bold">
              Post-Market Reflection &amp; Lessons Learned
            </label>
            <p className="text-xs text-on-surface-variant">What worked well? What could be improved for tomorrow?</p>
            <textarea
              rows={4}
              value={postNotes}
              onChange={(e) => setPostNotes(e.target.value)}
              placeholder="Reflect on your executions, emotions, and takeaways..."
              className="w-full p-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container focus:outline-none focus:bg-surface-container-lowest resize-none"
            />
          </div>
        </div>

        {/* Right Column (5 cols): Tags & Trades Recap */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Behavioral Mistake Tracker */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[20px]">warning</span>
              <h2 className="font-headline-sm text-base text-on-surface font-bold">
                Behavioral Errors Tracked
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant">Toggle any mental mistakes made today to build self-awareness:</p>

            <div className="flex flex-wrap gap-2 pt-1">
              {allMistakeOptions.map((tag) => {
                const selected = mistakeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleMistakeTag(tag)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-label-md transition-all cursor-pointer border ${
                      selected
                        ? 'bg-error-container text-on-error-container border-error/40 font-bold shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    <span>{selected ? '✓ ' : '+ '}</span>
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Positive Mindset & Edge Tags */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">recommend</span>
              <h2 className="font-headline-sm text-base text-on-surface font-bold">
                Mindset Strengths &amp; Execution Wins
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {allMindsetOptions.map((tag) => {
                const selected = mindsetTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleMindsetTag(tag)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-label-md transition-all cursor-pointer border ${
                      selected
                        ? 'bg-primary-fixed text-on-primary-fixed border-primary/40 font-bold shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    <span>{selected ? '✓ ' : '+ '}</span>
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day's Trades List */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-base text-on-surface font-bold">
                Trades Executed Today ({dayTrades.length})
              </h2>
              <Link href="/add-trade" className="text-primary text-xs font-bold hover:underline">
                + Add Trade
              </Link>
            </div>

            {dayTrades.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-4 text-center">
                No trades logged for {formatDate(currentDate)}.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {dayTrades.map((t) => (
                  <Link
                    key={t.id}
                    href={`/trades/${t.id}`}
                    className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container border border-surface-container flex items-center justify-between transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-on-surface">{t.instrument}</span>
                      <span className="text-[11px] text-on-surface-variant">
                        {t.entryTime} • {t.setup}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
