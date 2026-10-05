'use client';

import React, { useState, useEffect } from 'react';
import { detectEnvironment, AppEnvInfo } from '../../lib/environment';
import { CHANGELOG_RELEASES, ReleaseNote } from '../../config/version';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  const [envInfo, setEnvInfo] = useState<AppEnvInfo | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'added' | 'improved' | 'fixed'>('all');
  const [selectedVersion, setSelectedVersion] = useState<string>('v1.3.0');

  useEffect(() => {
    setEnvInfo(detectEnvironment());
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !envInfo) return null;

  const isPreviewOrDev = envInfo.isPreview || envInfo.isDevelopment;
  const activeRelease: ReleaseNote =
    CHANGELOG_RELEASES.find((r) => r.version === selectedVersion) || CHANGELOG_RELEASES[0];

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm p-3 sm:p-5 flex items-center justify-center animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="changelog-title"
        className="w-full max-w-2xl max-h-[92dvh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col my-auto animate-in zoom-in-95 duration-150"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 sm:px-7 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80">
              <span className="material-symbols-outlined text-[20px]">update</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="changelog-title" className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  What&apos;s New in TradeDairy
                </h2>
                {isPreviewOrDev ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-50 text-amber-700 border border-amber-200">
                    {envInfo.env}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Production
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Release notes, features, and platform updates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* PREVIEW VS PRODUCTION COMPARISON CARD (PREVIEW/DEV ONLY) */}
          {isPreviewOrDev && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-brand-600">compare_arrows</span>
                  <span>Environment Comparison</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Build: #{envInfo.commitSha} • Branch: {envInfo.branch}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Current Production */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Production
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>LIVE</span>
                    </span>
                  </div>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {envInfo.productionVersion}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Deployed at <code className="text-emerald-700 font-semibold">www.tradedairy.online</code> on branch <strong>main</strong>
                  </p>
                </div>

                {/* Current Preview */}
                <div className="p-3.5 rounded-xl bg-white border-2 border-amber-300 shadow-xs space-y-1.5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Preview / Staging
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>TESTING</span>
                    </span>
                  </div>
                  <div className="text-lg font-black text-amber-900 font-mono">
                    {envInfo.previewVersion}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Active testing on <code className="text-amber-800 font-semibold">pre.tradedairy.online</code> on branch <strong>develop</strong>
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-center justify-between">
                <span>
                  Testing changes in <strong>{envInfo.previewVersion}</strong> before merging into Production.
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedVersion(envInfo.previewVersion)}
                  className="font-bold underline text-amber-900 hover:text-amber-950 text-xs cursor-pointer ml-2"
                >
                  View Diff ↓
                </button>
              </div>
            </div>
          )}

          {/* Release Version Selector Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Release Versions:</span>
              <span className="text-[11px] text-slate-400">Select to inspect details</span>
            </div>
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
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{rel.version}</span>
                    {isPreviewBadge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-md uppercase font-black ${
                        isSelected ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Preview
                      </span>
                    )}
                    {isProdBadge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-md uppercase font-black ${
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

          {/* Active Release Details */}
          <div className="space-y-4 pt-1">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {activeRelease.title}
                </h3>
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  {activeRelease.releaseDate}
                </span>
              </div>
              {activeRelease.tagline && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
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
                  className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                    filterType === tab
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Change Items List */}
            <div className="space-y-4">
              {/* Added */}
              {(filterType === 'all' || filterType === 'added') && activeRelease.added?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                      Added
                    </span>
                    <span>New Capabilities</span>
                  </div>
                  <ul className="space-y-1.5 pl-2">
                    {activeRelease.added.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-600 font-bold text-sm shrink-0 leading-none mt-0.5">
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
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase">
                      Improved
                    </span>
                    <span>Enhancements &amp; UX</span>
                  </div>
                  <ul className="space-y-1.5 pl-2">
                    {activeRelease.improved.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                        <span className="text-indigo-600 font-bold text-sm shrink-0 leading-none mt-0.5">
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
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                      Fixed
                    </span>
                    <span>Bug Fixes &amp; Stability</span>
                  </div>
                  <ul className="space-y-1.5 pl-2">
                    {activeRelease.fixed.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-600 font-bold text-sm shrink-0 leading-none mt-0.5">
                          ✓
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Known Issues (Optional) */}
              {activeRelease.knownIssues && activeRelease.knownIssues.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Known Issues (In Progress)
                  </span>
                  <ul className="space-y-1">
                    {activeRelease.knownIssues.map((issue, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-slate-400">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Internal Notes - PREVIEW & DEV ONLY (Never exposed to production users) */}
              {isPreviewOrDev && activeRelease.internalNotes && activeRelease.internalNotes.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-purple-700">bug_report</span>
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Preview / Internal QA Notes (Hidden in Production)
                    </span>
                  </div>
                  <ul className="space-y-1 pl-1">
                    {activeRelease.internalNotes.map((note, idx) => (
                      <li key={idx} className="text-xs text-purple-800 flex items-start gap-1.5">
                        <span className="text-purple-500">→</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          <span>TradeDairy Automated Release Tracking</span>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary py-1.5 px-4 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
