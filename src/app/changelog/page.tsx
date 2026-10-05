'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrandLogo } from '../../components/common/BrandLogo';
import { detectEnvironment, AppEnvInfo } from '../../lib/environment';
import { CHANGELOG_RELEASES, ReleaseNote } from '../../config/version';

export default function ChangelogPage() {
  const [envInfo, setEnvInfo] = useState<AppEnvInfo | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'added' | 'improved' | 'fixed'>('all');
  const [selectedVersion, setSelectedVersion] = useState<string>('v1.3.0');

  useEffect(() => {
    const env = detectEnvironment();
    setEnvInfo(env);
    if (env.isProduction) {
      setSelectedVersion(env.productionVersion);
    } else {
      setSelectedVersion(env.previewVersion);
    }
  }, []);

  const isPreviewOrDev = envInfo?.isPreview || envInfo?.isDevelopment;
  const activeRelease: ReleaseNote =
    CHANGELOG_RELEASES.find((r) => r.version === selectedVersion) || CHANGELOG_RELEASES[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-brand-500/20">
      {/* Top Header */}
      <header className="h-16 px-4 sm:px-8 max-w-5xl mx-auto w-full flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <Link href="/" prefetch={true} className="flex items-center gap-2">
          <BrandLogo className="h-8 w-auto" />
          {envInfo && !envInfo.isProduction && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase">
              {envInfo.env}
            </span>
          )}
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            TradeDairy Release History &amp; Changelog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tracking releases, automated taxes, feature additions, and platform improvements.
          </p>
        </div>

        {/* PREVIEW VS PRODUCTION COMPARISON CARD (PREVIEW/DEV ONLY) */}
        {isPreviewOrDev && envInfo && (
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card-elevated space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-brand-600">compare_arrows</span>
                <span>Branch &amp; Environment Comparison</span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                Commit: #{envInfo.commitSha} • Branch: {envInfo.branch}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Production Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Production Environment
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>LIVE</span>
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {envInfo.productionVersion}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Production deployment on branch <strong>main</strong> at{' '}
                  <code className="text-emerald-700 font-bold">www.tradedairy.online</code>.
                </p>
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border-2 border-amber-300 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Preview / Staging
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                    <span>TESTING</span>
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-900 font-mono">
                  {envInfo.previewVersion}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Preview staging on branch <strong>develop</strong> at{' '}
                  <code className="text-amber-800 font-bold">pre.tradedairy.online</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Version Selector Pills */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700">Filter Releases:</span>
          <div className="flex flex-wrap gap-2">
            {CHANGELOG_RELEASES.map((rel) => {
              const isSelected = selectedVersion === rel.version;
              const isPreviewBadge = rel.status === 'preview';
              const isProdBadge = rel.status === 'production';
              return (
                <button
                  key={rel.version}
                  type="button"
                  onClick={() => setSelectedVersion(rel.version)}
                  className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{rel.version}</span>
                  {isPreviewBadge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md uppercase font-black ${
                      isSelected ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Preview
                    </span>
                  )}
                  {isProdBadge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md uppercase font-black ${
                      isSelected ? 'bg-emerald-400 text-slate-900' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Prod
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Release Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-card-elevated space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {activeRelease.title}
              </h2>
              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                {activeRelease.releaseDate}
              </span>
            </div>
            {activeRelease.tagline && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                {activeRelease.tagline}
              </p>
            )}
          </div>

          {/* Filter Tabs (All / Added / Improved / Fixed) */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold w-fit">
            {(['all', 'added', 'improved', 'fixed'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterType(tab)}
                className={`px-3.5 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  filterType === tab
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Change Items */}
          <div className="space-y-6">
            {/* Added */}
            {(filterType === 'all' || filterType === 'added') && activeRelease.added?.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    Added
                  </span>
                  <span>New Capabilities</span>
                </div>
                <ul className="space-y-2 pl-2">
                  {activeRelease.added.map((item, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5 leading-relaxed">
                      <span className="text-emerald-600 font-bold text-base shrink-0 leading-none mt-0.5">
                        +
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improved */}
            {(filterType === 'all' || filterType === 'improved') && activeRelease.improved?.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase">
                    Improved
                  </span>
                  <span>Enhancements &amp; UX</span>
                </div>
                <ul className="space-y-2 pl-2">
                  {activeRelease.improved.map((item, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5 leading-relaxed">
                      <span className="text-indigo-600 font-bold text-base shrink-0 leading-none mt-0.5">
                        ↑
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fixed */}
            {(filterType === 'all' || filterType === 'fixed') && activeRelease.fixed?.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                    Fixed
                  </span>
                  <span>Bug Fixes &amp; Stability</span>
                </div>
                <ul className="space-y-2 pl-2">
                  {activeRelease.fixed.map((item, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5 leading-relaxed">
                      <span className="text-amber-600 font-bold text-base shrink-0 leading-none mt-0.5">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Known Issues */}
            {activeRelease.knownIssues && activeRelease.knownIssues.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Known Issues (In Progress)
                </span>
                <ul className="space-y-1 pl-1">
                  {activeRelease.knownIssues.map((issue, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-slate-400">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Internal Notes - PREVIEW ONLY */}
            {isPreviewOrDev && activeRelease.internalNotes && activeRelease.internalNotes.length > 0 && (
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-purple-700">bug_report</span>
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Preview / Internal QA Notes (Hidden in Production)
                  </span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {activeRelease.internalNotes.map((note, idx) => (
                    <li key={idx} className="text-xs text-purple-800 flex items-start gap-2">
                      <span className="text-purple-500">→</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 TradeDairy.online • Continuous Discipline &amp; Analytics
      </footer>
    </div>
  );
}
