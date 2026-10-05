import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Trade, TradingAccount, DailyJournal, UserProfile } from '@/types';

export interface CloudUserData {
  email: string;
  uid?: string;
  user?: Partial<UserProfile>;
  accounts: TradingAccount[];
  trades: Trade[];
  journals: Record<string, DailyJournal>;
  updatedAt: string;
}

// Global server memory store preserved across hot-reloads and API calls
const globalStore = globalThis as unknown as {
  __tdUserCloudSync?: Map<string, CloudUserData>;
  __tdUidMap?: Map<string, string>; // uid -> email mapping
};

if (!globalStore.__tdUserCloudSync) {
  globalStore.__tdUserCloudSync = new Map<string, CloudUserData>();
}
if (!globalStore.__tdUidMap) {
  globalStore.__tdUidMap = new Map<string, string>();
}

const userSyncStore = globalStore.__tdUserCloudSync;
const uidEmailMap = globalStore.__tdUidMap;

// Directory for persistent storage
const SYNC_DIR = path.join(process.cwd(), 'data', 'user_sync');
const UID_MAP_PATH = path.join(SYNC_DIR, '_uid_map.json');

function getSafeEmailFilePath(email: string): string {
  const safeFilename = email.toLowerCase().replace(/[^a-z0-9_.-]/g, '_') + '.json';
  return path.join(SYNC_DIR, safeFilename);
}

// Helper to load UID -> Email map from disk
async function loadUidMap(): Promise<Map<string, string>> {
  if (uidEmailMap.size > 0) return uidEmailMap;
  try {
    const raw = await fs.readFile(UID_MAP_PATH, 'utf-8');
    const obj = JSON.parse(raw);
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string') uidEmailMap.set(k, v);
    }
  } catch {}
  return uidEmailMap;
}

// Helper to persist UID -> Email map to disk
async function saveUidMap(map: Map<string, string>): Promise<void> {
  try {
    await fs.mkdir(SYNC_DIR, { recursive: true });
    const obj = Object.fromEntries(map.entries());
    await fs.writeFile(UID_MAP_PATH, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to save uid map to disk:', err);
  }
}

// Resolve email from either UID or Email
async function resolveEmail(email?: string | null, uid?: string | null): Promise<string | null> {
  if (email && email.trim()) {
    return email.trim().toLowerCase();
  }
  if (uid && uid.trim()) {
    const map = await loadUidMap();
    const mapped = map.get(uid.trim());
    if (mapped) return mapped;
  }
  return null;
}

// Helper to load user data by email and/or uid
async function loadUserData(rawEmail?: string | null, rawUid?: string | null): Promise<CloudUserData | null> {
  const email = await resolveEmail(rawEmail, rawUid);
  if (!email) return null;

  // 1. Check in-memory cache
  const cached = userSyncStore.get(email);
  if (cached) {
    if (rawUid && !cached.uid) {
      cached.uid = rawUid.trim();
      cached.user = { ...(cached.user || {}), uid: rawUid.trim() };
      const map = await loadUidMap();
      map.set(rawUid.trim(), email);
      saveUidMap(map).catch(() => {});
    }
    return cached;
  }

  // 2. Check disk file
  try {
    const filePath = getSafeEmailFilePath(email);
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content) as CloudUserData;

    if (rawUid && (!parsed.uid || parsed.uid !== rawUid.trim())) {
      parsed.uid = rawUid.trim();
      parsed.user = { ...(parsed.user || {}), uid: rawUid.trim() };
      const map = await loadUidMap();
      map.set(rawUid.trim(), email);
      saveUidMap(map).catch(() => {});
      fs.writeFile(filePath, JSON.stringify(parsed, null, 2), 'utf-8').catch(() => {});
    }

    userSyncStore.set(email, parsed);
    return parsed;
  } catch {
    return null;
  }
}

// Helper to save user data to memory and disk
async function saveUserData(data: CloudUserData): Promise<void> {
  userSyncStore.set(data.email, data);
  if (data.uid) {
    const map = await loadUidMap();
    map.set(data.uid, data.email);
    saveUidMap(map).catch(() => {});
  }
  try {
    await fs.mkdir(SYNC_DIR, { recursive: true });
    const filePath = getSafeEmailFilePath(data.email);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to persist user sync data to disk:', err);
  }
}

// 1. GET: Fetch user's synchronized data by email and/or UID for cross-device access
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawEmail = searchParams.get('email');
  const rawUid = searchParams.get('uid');

  if ((!rawEmail || !rawEmail.trim()) && (!rawUid || !rawUid.trim())) {
    return NextResponse.json({ error: 'Email or UID parameter required' }, { status: 400 });
  }

  const userData = await loadUserData(rawEmail, rawUid);

  if (!userData) {
    return NextResponse.json(
      {
        exists: false,
        message: 'No cloud record found yet for this user. Local data will initialize on save.',
      },
      { status: 200 }
    );
  }

  const effectiveUid = userData.uid || rawUid?.trim() || userData.user?.uid;

  return NextResponse.json(
    {
      exists: true,
      uid: effectiveUid,
      email: userData.email,
      user: {
        ...(userData.user || {}),
        uid: effectiveUid,
      },
      accounts: userData.accounts,
      trades: userData.trades,
      journals: userData.journals,
      updatedAt: userData.updatedAt,
    },
    { status: 200 }
  );
}

// 2. POST: Save user's data to cloud store with stable Auth UID mapping
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email: rawEmail, uid: rawUid, user, accounts, trades, journals } = body;

    const email = await resolveEmail(rawEmail, rawUid);

    if (!email) {
      return NextResponse.json({ error: 'Email or mapped UID required for cloud sync' }, { status: 400 });
    }

    const existing = await loadUserData(email, rawUid);
    const updatedAt = new Date().toISOString();
    const effectiveUid = rawUid?.trim() || user?.uid || existing?.uid;

    const mergedUser: Partial<UserProfile> = {
      ...(existing?.user || {}),
      ...(user || {}),
      email,
      ...(effectiveUid ? { uid: effectiveUid } : {}),
    };

    const dataToSave: CloudUserData = {
      email,
      uid: effectiveUid,
      user: mergedUser,
      accounts: Array.isArray(accounts) ? accounts : (existing?.accounts || []),
      trades: Array.isArray(trades) ? trades : (existing?.trades || []),
      journals: journals && typeof journals === 'object' ? { ...(existing?.journals || {}), ...journals } : (existing?.journals || {}),
      updatedAt,
    };

    await saveUserData(dataToSave);

    return NextResponse.json(
      {
        success: true,
        message: 'Data synchronized across all devices successfully.',
        uid: effectiveUid,
        email,
        updatedAt,
        tradesCount: dataToSave.trades.length,
        accountsCount: dataToSave.accounts.length,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Error in cloud sync API:', err);
    return NextResponse.json({ error: 'Server error during cloud sync' }, { status: 500 });
  }
}

// 3. DELETE: Wipe cloud sync data for an account (used during account erasure or tests)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawEmail = searchParams.get('email');
    const rawUid = searchParams.get('uid');

    if (!rawEmail && !rawUid) {
      return NextResponse.json({ error: 'Email or UID required' }, { status: 400 });
    }

    const email = await resolveEmail(rawEmail, rawUid);
    if (email) {
      userSyncStore.delete(email);
      try {
        const filePath = getSafeEmailFilePath(email);
        await fs.unlink(filePath).catch(() => {});
      } catch {}
    }

    if (rawUid && rawUid.trim()) {
      const cleanUid = rawUid.trim();
      uidEmailMap.delete(cleanUid);
      const map = await loadUidMap();
      map.delete(cleanUid);
      await saveUidMap(map);
    }

    return NextResponse.json({ success: true, message: 'Account data cleared.' }, { status: 200 });
  } catch (err: any) {
    console.error('Error in cloud sync DELETE:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
