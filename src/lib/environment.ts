import {
  PRODUCTION_VERSION,
  PREVIEW_VERSION,
  DEFAULT_BUILD_COMMIT,
  BUILD_DATE,
} from '../config/version';

export type AppEnvironment = 'production' | 'preview' | 'development';

export interface AppEnvInfo {
  env: AppEnvironment;
  isProduction: boolean;
  isPreview: boolean;
  isDevelopment: boolean;
  branch: string;
  version: string;
  productionVersion: string;
  previewVersion: string;
  commitSha: string;
  buildDate: string;
  badgeText: string;
  isBadgeVisible: boolean;
}

export function detectEnvironment(overrideHostname?: string): AppEnvInfo {
  let hostname = '';
  if (overrideHostname !== undefined) {
    hostname = overrideHostname.toLowerCase();
  } else if (typeof window !== 'undefined') {
    hostname = window.location.hostname.toLowerCase();
  }

  // 1. Hostname detection (Vercel Custom Domains & Local Dev)
  const isPreDomain = hostname === 'pre.tradedairy.online' || hostname.startsWith('pre.');
  const isProdDomain =
    hostname === 'www.tradedairy.online' ||
    hostname === 'tradedairy.online';
  const isLocalHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.endsWith('.local');

  // 2. Vercel build/runtime environment variables
  const vercelEnv = (
    process.env.NEXT_PUBLIC_VERCEL_ENV ||
    process.env.VERCEL_ENV ||
    ''
  ).toLowerCase();

  const gitBranch = (
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.NEXT_PUBLIC_GIT_BRANCH ||
    ''
  ).toLowerCase();

  const commitSha = (
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_GIT_COMMIT_SHA ||
    DEFAULT_BUILD_COMMIT
  ).substring(0, 7);

  // 3. Resolve Environment hierarchy
  let env: AppEnvironment = 'development';
  let branch = gitBranch || 'develop';

  if (isProdDomain) {
    env = 'production';
    branch = 'main';
  } else if (isPreDomain) {
    env = 'preview';
    branch = 'develop';
  } else if (vercelEnv === 'production' || gitBranch === 'main') {
    env = 'production';
    branch = 'main';
  } else if (
    vercelEnv === 'preview' ||
    (gitBranch && gitBranch !== 'main') ||
    hostname.includes('vercel.app')
  ) {
    env = 'preview';
    branch = gitBranch || 'develop';
  } else if (isLocalHost || process.env.NODE_ENV === 'development') {
    env = 'development';
    branch = gitBranch || 'develop';
  }

  const isProduction = env === 'production';
  const isPreview = env === 'preview';
  const isDevelopment = env === 'development';

  const version = isProduction ? PRODUCTION_VERSION : PREVIEW_VERSION;
  // STRICT REQUIREMENT: Never show the preview/development badge on Production
  const isBadgeVisible = !isProduction;

  const badgeText = isPreview
    ? `PREVIEW • ${version}`
    : isDevelopment
    ? `DEVELOPMENT • ${version}`
    : '';

  return {
    env,
    isProduction,
    isPreview,
    isDevelopment,
    branch,
    version,
    productionVersion: PRODUCTION_VERSION,
    previewVersion: PREVIEW_VERSION,
    commitSha,
    buildDate: BUILD_DATE,
    badgeText,
    isBadgeVisible,
  };
}
