'use client';

import React, { useEffect, useState } from 'react';
import { BrandLogo } from './BrandLogo';

interface LoadingWorkspaceProps {
  isReady?: boolean;
  onFinish?: () => void;
}

export function LoadingWorkspace({ isReady = false, onFinish }: LoadingWorkspaceProps) {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing TradeDairy Terminal...');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98 && !isReady) {
          return 98; // hold near finish until isReady triggers
        }
        if (prev >= 100) {
          clearInterval(interval);
          if (onFinish) onFinish();
          return 100;
        }
        // Accelerate if isReady is true
        const increment = isReady ? 12 : Math.floor(Math.random() * 8) + 4;
        const next = Math.min(100, prev + increment);

        if (next < 35) {
          setStatusText('Connecting to Local & Cloud Trading Engine...');
        } else if (next < 65) {
          setStatusText('Loading Demat Portfolios & Verified Trades...');
        } else if (next < 90) {
          setStatusText('Syncing Daily Risk Shield & Journal Notes...');
        } else {
          setStatusText('Workspace Ready! Entering Dashboard...');
        }

        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [isReady, onFinish]);

  // When isReady flips to true, quickly push progress to 100
  useEffect(() => {
    if (isReady && progress < 90) {
      setProgress(90);
    }
  }, [isReady, progress]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[150] bg-background flex flex-col items-center justify-center p-6 select-none transition-opacity duration-300"
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Brand Logo with pulse effect */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl animate-pulse"></div>
          <div className="relative transform hover:scale-105 transition-transform duration-300">
            <BrandLogo showText={true} className="h-10 w-10" />
          </div>
        </div>

        {/* Progress Card */}
        <div className="w-full bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-surface-container/80 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface">Loading Workspace</span>
            <span className="text-xs font-bold text-primary tabular-nums tracking-wide">
              {progress}%
            </span>
          </div>

          {/* Progress Slider Bar */}
          <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden relative">
            <div
              className="h-full bg-primary rounded-full transition-all duration-100 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer light sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
            </div>
          </div>

          {/* Status Message */}
          <div className="flex items-center gap-2 pt-1 text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            <p className="text-[11px] sm:text-xs font-medium truncate">{statusText}</p>
          </div>
        </div>

        {/* Safe fallback hint */}
        <p className="text-[10px] text-outline text-center">
          TradeDairy Precision Terminal • Zero-Knowledge Local Architecture
        </p>
      </div>
    </div>
  );
}
