import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Trade, TradingAccount, DailyJournal, UserProfile } from '@/types';

interface CloudUserData {
  email: string;
  user?: Partial<UserProfile>;
  accounts: TradingAccount[];
  trades: Trade[];
  journals: Record<string, DailyJournal>;
  updatedAt: string;
}

// Global server memory store preserved across API calls and hot-reloads
const globalStore = globalThis as unknown as {
  __tdUserCloudSync?: Map<string, CloudUserData>;
};

if (!globalStore.__tdUserCloudSync) {
  globalStore.__tdUserCloudSync = new Map<string, CloudUserData>();
}

const userSyncStore = globalStore.__tdUserCloudSync;

// Directory for persistent storage
const SYNC_DIR = path.join(process.cwd(), 'data', 'user_sync');

function getSafeFilePath(email: string): string {
  const safeFilename = email.toLowerCase().replace(/[^a-z0-9_.-]/g, '_') + '.json';
  return path.join(SYNC_DIR, safeFilename);
}

// Helper to load user data from memory or disk
async function loadUserData(email: string): Promise<CloudUserData | null> {
  const cached = userSyncStore.get(email);
  if (cached) return cached;

  try {
    const filePath = getSafeFilePath(email);
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content) as CloudUserData;
    userSyncStore.set(email, parsed);
    return parsed;
  } catch {
    return null;
  }
}

// Helper to save user data to memory and disk
async function saveUserData(data: CloudUserData): Promise<void> {
  userSyncStore.set(data.email, data);
  try {
    await fs.mkdir(SYNC_DIR, { recursive: true });
    const filePath = getSafeFilePath(data.email);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to persist user sync data to disk:', err);
  }
}

// 1. GET: Fetch user's synchronized data for cross-device access
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawEmail = searchParams.get('email');

  if (!rawEmail || !rawEmail.trim()) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  const email = rawEmail.trim().toLowerCase();
  const userData = await loadUserData(email);

  if (!userData) {
    return NextResponse.json(
      {
        exists: false,
        message: 'No cloud record found yet for this user. Local data will initialize on save.',
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      exists: true,
      email: userData.email,
      user: userData.user,
      accounts: userData.accounts,
      trades: userData.trades,
      journals: userData.journals,
      updatedAt: userData.updatedAt,
    },
    { status: 200 }
  );
}

// 2. POST: Save user's data to cloud store for cross-device synchronization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email: rawEmail, user, accounts, trades, journals } = body;

    if (!rawEmail || !rawEmail.trim()) {
      return NextResponse.json({ error: 'Email required for cloud sync' }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    const updatedAt = new Date().toISOString();

    const dataToSave: CloudUserData = {
      email,
      user: user || {},
      accounts: Array.isArray(accounts) ? accounts : [],
      trades: Array.isArray(trades) ? trades : [],
      journals: journals && typeof journals === 'object' ? journals : {},
      updatedAt,
    };

    await saveUserData(dataToSave);

    return NextResponse.json(
      {
        success: true,
        message: 'Data synchronized across all devices successfully.',
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
