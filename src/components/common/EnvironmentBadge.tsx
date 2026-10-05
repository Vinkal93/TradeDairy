'use client';

import React, { useState, useEffect } from 'react';
import { detectEnvironment, AppEnvInfo } from '../../lib/environment';

interface EnvironmentBadgeProps {
  onOpenChangelog?: () => void;
  className?: string;
}

export function EnvironmentBadge({ onOpenChangelog, className = '' }: EnvironmentBadgeProps) {
  const [envInfo, setEnvInfo] = useState<AppEnvInfo | null>(null);

  useEffect(() => {
    setEnvInfo(detectEnvironment());
  }, []);

  // Return null on server or before mount, or if in Production
  if (!envInfo || !envInfo.isBadgeVisible) {
    return null;
  }

  const isPreview = envInfo.isPreview;

  return (
    <button
      type="button"
      onClick={onOpenChangelog}
      title={`TradeDairy ${envInfo.badgeText} • Build ${envInfo.commitSha} • Click to compare Preview vs Production`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs border ${
        isPreview
          ? 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-300'
          : 'bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/20 border-indigo-300'
      } ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isPreview ? 'bg-amber-500' : 'bg-indigo-500'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isPreview ? 'bg-amber-600' : 'bg-indigo-600'
          }`}
        />
      </span>
      <span>{envInfo.badgeText}</span>
      <span className="text-[9px] uppercase font-mono opacity-70">
        #{envInfo.commitSha}
      </span>
    </button>
  );
}
