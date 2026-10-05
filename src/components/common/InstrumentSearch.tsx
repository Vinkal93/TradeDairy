'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { searchInstruments, InstrumentItem } from '../../lib/instruments';
import { ChargeSegment, TradeSide } from '../../types';

interface InstrumentSearchProps {
  value: string;
  onChange: (
    instrument: string,
    details?: {
      segment?: ChargeSegment;
      side?: TradeSide;
      strikePrice?: number;
      optionType?: 'CE' | 'PE';
    }
  ) => void;
  currentSide?: TradeSide;
  onSideChange?: (side: TradeSide) => void;
  placeholder?: string;
  required?: boolean;
}

const COMMON_INDEX_STRIKES: Record<string, number[]> = {
  NIFTY: [22800, 22900, 23000, 23100, 23200, 23500, 24000],
  BANKNIFTY: [50500, 50800, 51000, 51200, 51500, 52000],
  FINNIFTY: [23000, 23200, 23400, 23600, 23800],
  MIDCPNIFTY: [12000, 12100, 12200, 12300, 12400],
  SENSEX: [75000, 75500, 76000, 76500, 77000],
};

export function InstrumentSearch({
  value,
  onChange,
  currentSide = 'BUY',
  onSideChange,
  placeholder = 'Type e.g. NIFTY 23000, BANKNIFTY, RELIANCE...',
  required = true,
}: InstrumentSearchProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [side, setSide] = useState<TradeSide>(currentSide);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    setSide(currentSide);
  }, [currentSide]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse typed query for Index / Stock and Strike Price
  const parsedData = useMemo(() => {
    const clean = query.trim().toUpperCase();
    if (!clean) {
      return {
        baseSymbol: 'NIFTY',
        hasStrike: false,
        strike: null,
        matches: searchInstruments(''),
      };
    }

    // Match patterns like "NIFTY 23000", "BANKNIFTY 51000", "23000", "NIFTY23000CE"
    const numberMatch = clean.match(/(\d{4,6})/);
    const strike = numberMatch ? parseInt(numberMatch[1], 10) : null;

    // Detect base symbol
    let baseSymbol = 'NIFTY';
    if (clean.includes('BANK') || clean.includes('BNF')) baseSymbol = 'BANKNIFTY';
    else if (clean.includes('FIN') || clean.includes('FN')) baseSymbol = 'FINNIFTY';
    else if (clean.includes('MID') || clean.includes('MCN')) baseSymbol = 'MIDCPNIFTY';
    else if (clean.includes('SENSEX')) baseSymbol = 'SENSEX';
    else {
      // Check if user is typing a stock name
      const stockPart = clean.replace(/[\d\sCEPE]+/g, '').trim();
      if (stockPart.length >= 2) {
        baseSymbol = stockPart;
      }
    }

    const matches = searchInstruments(clean.replace(/\d+/g, '').trim() || clean);

    return {
      baseSymbol,
      hasStrike: Boolean(strike),
      strike,
      matches,
    };
  }, [query]);

  const handleSelectOption = (
    baseSymbol: string,
    strike: number,
    optionType: 'CE' | 'PE',
    chosenSide: TradeSide
  ) => {
    const formatted = `${baseSymbol} ${strike} ${optionType}`;
    setQuery(formatted);
    setIsOpen(false);
    if (onSideChange) onSideChange(chosenSide);
    onChange(formatted, {
      segment: 'options',
      side: chosenSide,
      strikePrice: strike,
      optionType,
    });
  };

  const handleSelectStock = (item: InstrumentItem) => {
    setQuery(item.symbol);
    setIsOpen(false);
    onChange(item.symbol, {
      segment: item.category === 'Index' ? 'options' : 'equity-intraday',
      side,
    });
  };

  const handleSideToggle = (newSide: TradeSide) => {
    setSide(newSide);
    if (onSideChange) onSideChange(newSide);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] pointer-events-none">
          search
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          required={required}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              if (isOpen) {
                e.stopPropagation();
                e.preventDefault();
                setIsOpen(false);
              }
            } else if (e.key === 'Tab') {
              // Immediately close dropdown so Tab key cleanly advances to the next form input
              setIsOpen(false);
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full h-10 pl-9 pr-20 rounded-xl border border-surface-container bg-white px-3 py-2 text-xs sm:text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none font-medium transition-all"
        />

        {/* Quick Side Badge in Input */}
        <div className="absolute right-2 flex items-center gap-1">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => handleSideToggle(side === 'BUY' ? 'SELL' : 'BUY')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
              side === 'BUY'
                ? 'bg-primary/15 text-primary hover:bg-primary/25'
                : 'bg-error-container/40 text-error hover:bg-error-container/60'
            }`}
            title="Click to toggle BUY / SELL"
          >
            {side}
          </button>
          {query && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                setQuery('');
                onChange('');
                inputRef.current?.focus();
              }}
              className="text-outline hover:text-on-surface p-0.5 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-surface-container/90 z-[100] max-h-[380px] overflow-y-auto divide-y divide-surface-container/60 animate-in fade-in duration-100">
          {/* Header Action Bar: Buy vs Sell Switch */}
          <div className="p-2.5 bg-surface-container-low/70 flex items-center justify-between text-xs sticky top-0 z-10 backdrop-blur-md">
            <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-primary">filter_alt</span>
              <span>Select Instrument or Option:</span>
            </span>

            {/* Quick BUY / SELL picker */}
            <div className="flex rounded-lg bg-surface-container p-0.5 text-[11px] font-bold">
              <button
                type="button"
                tabIndex={-1}
                onClick={() => handleSideToggle('BUY')}
                className={`px-2.5 py-0.5 rounded-md transition-colors ${
                  side === 'BUY'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => handleSideToggle('SELL')}
                className={`px-2.5 py-0.5 rounded-md transition-colors ${
                  side === 'SELL'
                    ? 'bg-error text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                SELL
              </button>
            </div>
          </div>

          {/* SECTION 1: IF USER TYPED A STRIKE (e.g. "NIFTY 23000" or "23000") */}
          {parsedData.hasStrike && parsedData.strike && (
            <div className="p-3 bg-primary-fixed/20 border-b border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">
                  Detected Strike: {parsedData.baseSymbol} {parsedData.strike}
                </span>
                <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">
                  Options Direct Selection
                </span>
              </div>

              {/* CE & PE Instant Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() =>
                    handleSelectOption(parsedData.baseSymbol, parsedData.strike!, 'CE', side)
                  }
                  className="py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{parsedData.baseSymbol} {parsedData.strike} CE</span>
                  </div>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 bg-emerald-200/60 rounded font-mono">
                    Call • {side}
                  </span>
                </button>

                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() =>
                    handleSelectOption(parsedData.baseSymbol, parsedData.strike!, 'PE', side)
                  }
                  className="py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>{parsedData.baseSymbol} {parsedData.strike} PE</span>
                  </div>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 bg-rose-200/60 rounded font-mono">
                    Put • {side}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: POPULAR STRIKES FOR THE BASE INDEX */}
          {COMMON_INDEX_STRIKES[parsedData.baseSymbol] && (
            <div className="p-3 space-y-2">
              <span className="text-[11px] font-bold text-outline uppercase tracking-wider block">
                Popular {parsedData.baseSymbol} Strikes (Direct CE / PE)
              </span>

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                {COMMON_INDEX_STRIKES[parsedData.baseSymbol].map((strike) => (
                  <div
                    key={strike}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-surface-container-low/70 hover:bg-surface-container-low text-xs transition-colors"
                  >
                    <span className="font-semibold text-on-surface">
                      {parsedData.baseSymbol} {strike}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() =>
                          handleSelectOption(parsedData.baseSymbol, strike, 'CE', side)
                        }
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors cursor-pointer shadow-xs"
                      >
                        {strike} CE
                      </button>

                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() =>
                          handleSelectOption(parsedData.baseSymbol, strike, 'PE', side)
                        }
                        className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] transition-colors cursor-pointer shadow-xs"
                      >
                        {strike} PE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: MATCHING INDICES & STOCKS */}
          <div className="p-2 space-y-1">
            <span className="text-[11px] font-bold text-outline uppercase tracking-wider px-2 py-1 block">
              Equities &amp; Indices
            </span>

            {parsedData.matches.slice(0, 10).map((item) => (
              <button
                key={item.symbol}
                type="button"
                tabIndex={-1}
                onClick={() => handleSelectStock(item)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low text-left text-xs transition-colors cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface group-hover:text-primary transition-colors">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-outline">
                      {item.category || item.exchange}
                    </span>
                  </div>
                  <p className="text-[11px] text-outline mt-0.5 truncate max-w-xs">{item.name}</p>
                </div>

                <span className="text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Select →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
