const test = require('node:test');
const assert = require('node:assert/strict');

test('Version + Environment + Changelog System', async (t) => {
  // Test 1: Version format and semantic versioning
  const {
    PRODUCTION_VERSION,
    PREVIEW_VERSION,
    DEFAULT_BUILD_COMMIT,
    BUILD_DATE,
    CHANGELOG_RELEASES,
  } = require('../src/config/version.ts');

  await t.test('1. Central version source exports valid semantic versions', () => {
    const semverRegex = /^v\d+\.\d+\.\d+$/;

    assert.match(PRODUCTION_VERSION, semverRegex, 'PRODUCTION_VERSION should follow vX.Y.Z semantic format');
    assert.match(PREVIEW_VERSION, semverRegex, 'PREVIEW_VERSION should follow vX.Y.Z semantic format');
    assert.equal(PRODUCTION_VERSION, 'v1.2.0');
    assert.equal(PREVIEW_VERSION, 'v1.3.0');
    assert.ok(DEFAULT_BUILD_COMMIT && DEFAULT_BUILD_COMMIT.length >= 7, 'Build commit identifier must be present');
    assert.ok(BUILD_DATE, 'Build date must be defined');
  });

  // Test 2: Environment detection logic function
  function testDetectEnvironment(overrideHostname, envVars = {}) {
    const hostname = (overrideHostname || '').toLowerCase();
    const isPreDomain = hostname === 'pre.tradedairy.online' || hostname.startsWith('pre.');
    const isProdDomain =
      hostname === 'www.tradedairy.online' || hostname === 'tradedairy.online';
    const isLocalHost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.endsWith('.local');

    const vercelEnv = (envVars.VERCEL_ENV || '').toLowerCase();
    const gitBranch = (envVars.GIT_BRANCH || envVars.VERCEL_GIT_COMMIT_REF || '').toLowerCase();
    const commitSha = (envVars.VERCEL_GIT_COMMIT_SHA || DEFAULT_BUILD_COMMIT).substring(0, 7);

    let env = 'development';
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
    } else if (isLocalHost) {
      env = 'development';
      branch = gitBranch || 'develop';
    }

    const isProduction = env === 'production';
    const isPreview = env === 'preview';
    const isDevelopment = env === 'development';
    const version = isProduction ? PRODUCTION_VERSION : PREVIEW_VERSION;
    const isBadgeVisible = !isProduction; // STRICT: never show in production

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

  await t.test('2. Environment detection correctly resolves production, preview, and development', () => {
    // Production: www.tradedairy.online
    const prodEnv = testDetectEnvironment('www.tradedairy.online');
    assert.equal(prodEnv.env, 'production');
    assert.equal(prodEnv.isProduction, true);
    assert.equal(prodEnv.isPreview, false);
    assert.equal(prodEnv.branch, 'main');
    assert.equal(prodEnv.version, 'v1.2.0');
    assert.equal(prodEnv.isBadgeVisible, false, 'Badge MUST be strictly hidden on Production');

    // Production apex: tradedairy.online
    const prodApexEnv = testDetectEnvironment('tradedairy.online');
    assert.equal(prodApexEnv.env, 'production');
    assert.equal(prodApexEnv.isBadgeVisible, false);

    // Production via Vercel branch main
    const prodBranchEnv = testDetectEnvironment('', { VERCEL_GIT_COMMIT_REF: 'main' });
    assert.equal(prodBranchEnv.env, 'production');
    assert.equal(prodBranchEnv.isBadgeVisible, false);

    // Preview: pre.tradedairy.online
    const previewEnv = testDetectEnvironment('pre.tradedairy.online');
    assert.equal(previewEnv.env, 'preview');
    assert.equal(previewEnv.isPreview, true);
    assert.equal(previewEnv.isProduction, false);
    assert.equal(previewEnv.branch, 'develop');
    assert.equal(previewEnv.version, 'v1.3.0');
    assert.equal(previewEnv.isBadgeVisible, true, 'Badge MUST be visible on Preview');
    assert.ok(previewEnv.badgeText.includes('PREVIEW'));

    // Preview via develop branch on vercel app domain
    const previewVercelEnv = testDetectEnvironment('tradedairy-preview-git-develop-vinkal.vercel.app', {
      VERCEL_GIT_COMMIT_REF: 'develop',
      VERCEL_ENV: 'preview',
    });
    assert.equal(previewVercelEnv.env, 'preview');
    assert.equal(previewVercelEnv.isBadgeVisible, true);

    // Development: localhost
    const devEnv = testDetectEnvironment('localhost');
    assert.equal(devEnv.env, 'development');
    assert.equal(devEnv.isDevelopment, true);
    assert.equal(devEnv.isBadgeVisible, true, 'Badge MUST be visible on Development');
    assert.ok(devEnv.badgeText.includes('DEVELOPMENT'));
  });

  // Test 3: Changelog Data Integrity
  await t.test('3. Changelog contains required semantic release structures', () => {
    assert.ok(Array.isArray(CHANGELOG_RELEASES), 'CHANGELOG_RELEASES must be an array');
    assert.ok(CHANGELOG_RELEASES.length >= 3, 'Must contain at least 3 historical releases');

    const versions = CHANGELOG_RELEASES.map((r) => r.version);
    assert.ok(versions.includes(PRODUCTION_VERSION), 'Changelog must include production version v1.2.0');
    assert.ok(versions.includes(PREVIEW_VERSION), 'Changelog must include preview version v1.3.0');

    CHANGELOG_RELEASES.forEach((rel) => {
      assert.ok(rel.version, 'Release must have a version string');
      assert.ok(rel.releaseDate, `Release ${rel.version} must have a releaseDate`);
      assert.ok(Array.isArray(rel.added), `Release ${rel.version} must have added array`);
      assert.ok(Array.isArray(rel.improved), `Release ${rel.version} must have improved array`);
      assert.ok(Array.isArray(rel.fixed), `Release ${rel.version} must have fixed array`);
    });

    const previewRelease = CHANGELOG_RELEASES.find((r) => r.version === PREVIEW_VERSION);
    assert.equal(previewRelease.status, 'preview');
    assert.ok(previewRelease.added.length > 0, 'Preview release must document new additions');
  });

  // Test 4: Comparison between Preview and Production
  await t.test('4. Preview vs Production diff comparison is supported', () => {
    const prodRelease = CHANGELOG_RELEASES.find((r) => r.version === PRODUCTION_VERSION);
    const prevRelease = CHANGELOG_RELEASES.find((r) => r.version === PREVIEW_VERSION);

    assert.notEqual(prodRelease.version, prevRelease.version, 'Preview and Production must have different versions');
    assert.ok(prevRelease.added.length > 0, 'Preview release contains features being tested');
    assert.ok(prevRelease.internalNotes, 'Preview release can contain QA/internal notes');
  });
});
