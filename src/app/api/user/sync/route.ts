import { NextRequest, NextResponse } from 'next/server';
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

// 1. GET: Fetch user's synchronized data for cross-device access
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawEmail = searchParams.get('email');

  if (!rawEmail || !rawEmail.trim()) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  const email = rawEmail.trim().toLowerCase();
  const userData = userSyncStore.get(email);

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

    userSyncStore.set(email, dataToSave);

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
