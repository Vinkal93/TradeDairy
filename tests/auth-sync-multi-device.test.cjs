const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs/promises');
const path = require('path');

// Test the live cloud sync API on the running dev server or directly
const BASE_URL = 'http://localhost:3000';
const SYNC_DIR = path.join(process.cwd(), 'data', 'user_sync');

test('E2E Auth & Sync: Stable UID, Multi-Device Sync, and Onboarding Persistence', async (t) => {
  const testEmail = `testtrader_${Date.now()}@example.com`;
  const testUid = `firebase_uid_${Date.now()}_abc123`;
  const testPhoto = 'data:image/svg+xml;utf8,<svg><rect width="100" height="100" fill="green"/></svg>';

  // Cleanup helper
  const cleanup = async () => {
    try {
      await fetch(
        `${BASE_URL}/api/user/sync?email=${encodeURIComponent(testEmail)}&uid=${encodeURIComponent(testUid)}`,
        { method: 'DELETE' }
      );
    } catch {}
  };

  t.after(cleanup);

  // 1. Initial State for New User (Device 1)
  await t.test('1. New user initial state on Device 1 has onboardingStep=1 and isOnboarded=false', async () => {
    const postRes = await fetch(`${BASE_URL}/api/user/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        uid: testUid,
        user: {
          uid: testUid,
          email: testEmail,
          fullName: 'New Trader Alias',
          isOnboarded: false,
          onboardingStep: 1,
        },
        accounts: [],
        trades: [],
        journals: {},
      }),
    });

    assert.equal(postRes.status, 200);
    const postData = await postRes.json();
    assert.equal(postData.success, true);
    assert.equal(postData.uid, testUid);

    // Verify GET by UID
    const getResByUid = await fetch(`${BASE_URL}/api/user/sync?uid=${encodeURIComponent(testUid)}`);
    assert.equal(getResByUid.status, 200);
    const getDataByUid = await getResByUid.json();
    assert.equal(getDataByUid.exists, true);
    assert.equal(getDataByUid.email, testEmail);
    assert.equal(getDataByUid.uid, testUid);
    assert.equal(getDataByUid.user.isOnboarded, false);
    assert.equal(getDataByUid.user.onboardingStep, 1);
  });

  // 2. Incomplete Onboarding Progress: Step 2 & 3 Saved
  await t.test('2. Incomplete onboarding step progress is saved to cloud against UID', async () => {
    // Advance to Step 2 (Student Name)
    await fetch(`${BASE_URL}/api/user/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        uid: testUid,
        user: {
          fullName: 'Vinkal Prajapati',
          onboardingStep: 2,
        },
      }),
    });

    // Advance to Step 3 (Profile Photo Upload)
    await fetch(`${BASE_URL}/api/user/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        uid: testUid,
        user: {
          profilePhoto: testPhoto,
          avatar: testPhoto,
          onboardingStep: 3,
        },
      }),
    });

    // Verify retrieval: user left onboarding incomplete at step 3
    const getRes = await fetch(`${BASE_URL}/api/user/sync?uid=${encodeURIComponent(testUid)}`);
    const data = await getRes.json();
    assert.equal(data.user.fullName, 'Vinkal Prajapati');
    assert.equal(data.user.profilePhoto, testPhoto);
    assert.equal(data.user.onboardingStep, 3);
    assert.equal(data.user.isOnboarded, false);
  });

  // 3. Complete Onboarding: Step 4 (Discovery) & Step 5 (Launch)
  await t.test('3. Onboarding complete sets isOnboarded=true and permanently stores discovery source', async () => {
    await fetch(`${BASE_URL}/api/user/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        uid: testUid,
        user: {
          discoverySource: 'YouTube (Trading Tutorials)',
          isOnboarded: true,
          onboardingStep: 5,
        },
      }),
    });

    // Verify returning user state
    const getRes = await fetch(`${BASE_URL}/api/user/sync?email=${encodeURIComponent(testEmail)}`);
    const data = await getRes.json();
    assert.equal(data.user.isOnboarded, true);
    assert.equal(data.user.onboardingStep, 5);
    assert.equal(data.user.discoverySource, 'YouTube (Trading Tutorials)');
    assert.equal(data.uid, testUid);
  });

  // 4. Cross-Device Synchronization: Device 1 adds trades/accounts, Device 2 logs in
  await t.test('4. Cross-device sync: Device 2 logs in with same UID and receives all data', async () => {
    const testTrade = {
      id: `TD-${Date.now()}-trade1`,
      accountId: 'acc_main',
      accountName: 'Zerodha Pro',
      date: '2026-10-05',
      instrument: 'NIFTY 25000 CE',
      segment: 'OPTIONS',
      side: 'BUY',
      quantity: 50,
      entryPrice: 120,
      exitPrice: 165,
      grossPnl: 2250,
      charges: 54.2,
      netPnl: 2195.8,
      status: 'CLOSED',
      createdAt: new Date().toISOString(),
    };

    const testAccount = {
      id: 'acc_main',
      broker: 'Zerodha',
      accountName: 'Zerodha Pro',
      capital: 200000,
      currency: 'INR',
      isActive: true,
    };

    // Device 1 records trade and account
    await fetch(`${BASE_URL}/api/user/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        uid: testUid,
        accounts: [testAccount],
        trades: [testTrade],
      }),
    });

    // Device 2 logs in using UID only (e.g. mobile browser or new laptop)
    const device2Res = await fetch(`${BASE_URL}/api/user/sync?uid=${encodeURIComponent(testUid)}`);
    assert.equal(device2Res.status, 200);
    const device2Data = await device2Res.json();

    assert.equal(device2Data.exists, true);
    assert.equal(device2Data.email, testEmail);
    assert.equal(device2Data.uid, testUid);
    assert.equal(device2Data.user.fullName, 'Vinkal Prajapati');
    assert.equal(device2Data.user.profilePhoto, testPhoto);
    assert.equal(device2Data.user.isOnboarded, true);
    assert.equal(device2Data.accounts.length, 1);
    assert.equal(device2Data.accounts[0].accountName, 'Zerodha Pro');
    assert.equal(device2Data.trades.length, 1);
    assert.equal(device2Data.trades[0].instrument, 'NIFTY 25000 CE');
    assert.equal(device2Data.trades[0].netPnl, 2195.8);
  });

  // 5. No Duplicate Profiles Created
  await t.test('5. Verify only 1 profile exists on disk for the account', async () => {
    const safeFile = path.join(SYNC_DIR, testEmail.replace(/[^a-z0-9_.-]/g, '_') + '.json');
    const exists = await fs.access(safeFile).then(() => true).catch(() => false);
    assert.equal(exists, true);

    const fileContent = JSON.parse(await fs.readFile(safeFile, 'utf-8'));
    assert.equal(fileContent.email, testEmail);
    assert.equal(fileContent.uid, testUid);
    assert.equal(fileContent.user.fullName, 'Vinkal Prajapati');
  });

  // 6. Backward Compatibility Test for existing database records
  await t.test('6. Backward compatibility: Existing record without UID links UID on login', async () => {
    const legacyEmail = `legacy_${Date.now()}@example.com`;
    const legacyUid = `uid_legacy_${Date.now()}`;
    const legacyFile = path.join(SYNC_DIR, legacyEmail.replace(/[^a-z0-9_.-]/g, '_') + '.json');

    // Create legacy record without UID
    await fs.writeFile(
      legacyFile,
      JSON.stringify(
        {
          email: legacyEmail,
          user: { fullName: 'Legacy Trader', isOnboarded: true, onboardingStep: 5 },
          accounts: [],
          trades: [],
          journals: {},
          updatedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    // Query with legacy email + newly authenticated UID
    const res = await fetch(
      `${BASE_URL}/api/user/sync?email=${encodeURIComponent(legacyEmail)}&uid=${encodeURIComponent(legacyUid)}`
    );
    const data = await res.json();
    assert.equal(data.exists, true);
    assert.equal(data.email, legacyEmail);
    assert.equal(data.uid, legacyUid);
    assert.equal(data.user.fullName, 'Legacy Trader');

    // Clean up legacy test file and map entry via API
    await fetch(
      `${BASE_URL}/api/user/sync?email=${encodeURIComponent(legacyEmail)}&uid=${encodeURIComponent(legacyUid)}`,
      { method: 'DELETE' }
    ).catch(() => {});
  });
});
