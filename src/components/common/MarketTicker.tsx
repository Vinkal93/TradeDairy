'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTrades } from '../../context/TradeContext';

export interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percent: number;
  category: 'Index' | 'Stock';
}

const INITIAL_TICKER_DATA: TickerItem[] = [
  { symbol: 'NIFTY 50', name: 'Nifty 50 Index', price: 24852.15, change: 128.45, percent: 0.52, category: 'Index' },
  { symbol: 'BANKNIFTY', name: 'Nifty Bank', price: 53460.50, change: 315.80, percent: 0.59, category: 'Index' },
  { symbol: 'FINNIFTY', name: 'Nifty Financial Services', price: 24930.20, change: 88.50, percent: 0.36, category: 'Index' },
  { symbol: 'MIDCPNIFTY', name: 'Nifty Midcap Select', price: 13115.40, change: -42.20, percent: -0.32, category: 'Index' },
  { symbol: 'SENSEX', name: 'BSE Sensex 30', price: 81720.60, change: 395.20, percent: 0.49, category: 'Index' },
  { symbol: 'INDIA VIX', name: 'Volatility Index', price: 13.42, change: -0.31, percent: -2.26, category: 'Index' },
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2982.40, change: 19.50, percent: 0.66, category: 'Stock' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1684.10, change: 14.20, percent: 0.85, category: 'Stock' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 1248.50, change: 11.20, percent: 0.91, category: 'Stock' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4208.00, change: -14.50, percent: -0.34, category: 'Stock' },
  { symbol: 'INFY', name: 'Infosys Ltd.', price: 1898.30, change: 22.40, percent: 1.19, category: 'Stock' },
  { symbol: 'SBIN', name: 'State Bank of India', price: 826.80, change: 8.40, percent: 1.03, category: 'Stock' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', price: 1562.40, change: 15.80, percent: 1.02, category: 'Stock' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', price: 984.10, change: -5.20, percent: -0.53, category: 'Stock' },
  { symbol: 'ITC', name: 'ITC Ltd.', price: 513.20, change: 2.80, percent: 0.55, category: 'Stock' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.', price: 3688.50, change: 38.00, percent: 1.04, category: 'Stock' },
];

export function MarketTicker() {
  const [items, setItems] = useState<TickerItem[]>(INITIAL_TICKER_DATA);
  const [lastUpdatedKey, setLastUpdatedKey] = useState<string | null>(null);
  const { openRecordTradeModal } = useTrades();

  // Subtle live tick simulation (every 3.5s update a random quote slightly)
  useEffect(() => {
    const timer = setInterval(() => {
      setItems((prev) => {
        const next = [...prev];
        const randomIndex = Math.floor(Math.random() * next.length);
        const item = { ...next[randomIndex] };

        // Realistic tiny delta (-0.08% to +0.08%)
        const deltaPct = (Math.random() - 0.48) * 0.0016;
        const priceDelta = item.price * deltaPct;
        const newPrice = Math.max(1, +(item.price + priceDelta).toFixed(2));
        const newChange = +(item.change + priceDelta).toFixed(2);
        const newPercent = +(item.percent + deltaPct * 100).toFixed(2);

        item.price = newPrice;
        item.change = newChange;
        item.percent = newPercent;
        next[randomIndex] = item;

        setLastUpdatedKey(item.symbol);
        return next;
      });
    }, 3200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      aria-label="Live Indian Market Ticker"
      className="w-full bg-[#0b1219] text-white border-b border-surface-container/20 text-xs py-1.5 px-2 select-none overflow-hidden flex items-center relative z-30"
    >
      {/* Live Badge indicator */}
      <div className="shrink-0 flex items-center gap-1.5 pl-2 pr-3 border-r border-slate-700/60 z-10 bg-[#0b1219] shadow-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-extrabold tracking-wider text-[10px] text-emerald-400 uppercase font-mono">
          NSE LIVE
        </span>
      </div>

      {/* Marquee Track (Smooth Infinite Horizontal Scroll) */}
      <div className="overflow-hidden whitespace-nowrap flex-1 relative group">
        <div className="inline-flex gap-6 sm:gap-8 items-center animate-[marquee_50s_linear_infinite] group-hover:[animation-play-state:paused] will-change-transform">
          {/* Render array twice for continuous seamless infinite loop */}
          {[...items, ...items].map((item, index) => {
            const isPositive = item.change >= 0;
            const isRecent = lastUpdatedKey === item.symbol;

            return (
              <button
                key={`${item.symbol}-${index}`}
                type="button"
                tabIndex={-1}
                onClick={() => openRecordTradeModal()}
                title={`Click to record trade for ${item.symbol}`}
                className="inline-flex items-center gap-2 py-0.5 px-2 rounded hover:bg-slate-800/80 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-200 text-xs tracking-tight">
                    {item.symbol}
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                    {item.category === 'Index' ? 'IDX' : 'EQ'}
                  </span>
                </div>

                {/* Price */}
                <span
                  className={`font-mono text-xs font-semibold tabular-nums transition-colors duration-300 ${
                    isRecent ? (isPositive ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold') : 'text-slate-100'
                  }`}
                >
                  ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>

                {/* Change & Percent */}
                <span
                  className={`inline-flex items-center text-[11px] font-mono font-medium tabular-nums ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  <span className="text-[10px] mr-0.5">
                    {isPositive ? '▲' : '▼'}
                  </span>
                  {isPositive ? '+' : ''}
                  {item.change.toFixed(2)} ({isPositive ? '+' : ''}
                  {item.percent.toFixed(2)}%)
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
