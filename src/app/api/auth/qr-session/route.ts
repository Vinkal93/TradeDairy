import { NextRequest, NextResponse } from 'next/server';

interface QrSession {
  token: string;
  pin: string;
  createdAt: number;
  expiresAt: number;
  status: 'PENDING' | 'AUTHORIZED' | 'EXPIRED';
  user?: {
    fullName: string;
    email: string;
    uid?: string;
    avatar?: string;
    device?: string;
  };
}

// Global in-memory storage preserved during hot reloads
const globalStore = globalThis as unknown as {
  __tdQrSessions?: Map<string, QrSession>;
};

if (!globalStore.__tdQrSessions) {
  globalStore.__tdQrSessions = new Map<string, QrSession>();
}

const sessions = globalStore.__tdQrSessions;

// Clean up expired sessions periodically
function cleanExpired() {
  const now = Date.now();
  for (const [token, session] of Array.from(sessions.entries())) {
    if (session.expiresAt < now) {
      sessions.delete(token);
    }
  }
}

function normalizePin(p: string): string {
  return p.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function findSessionByPin(searchPin: string): QrSession | undefined {
  const norm = normalizePin(searchPin);
  const now = Date.now();
  return Array.from(sessions.values()).find((s) => {
    if (s.expiresAt <= now) return false;
    const sNorm = normalizePin(s.pin);
    return sNorm === norm || sNorm.endsWith(norm) || norm.endsWith(sNorm);
  });
}

// 1. GET: Check status of a QR session
export async function GET(request: NextRequest) {
  cleanExpired();
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const pin = searchParams.get('pin');

  if (!token && !pin) {
    return NextResponse.json({ error: 'Missing token or pin' }, { status: 400 });
  }

  let session: QrSession | undefined;

  if (token) {
    session = sessions.get(token);
  } else if (pin) {
    session = findSessionByPin(pin);
  }

  if (!session) {
    return NextResponse.json({ status: 'EXPIRED' }, { status: 200 });
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(session.token);
    return NextResponse.json({ status: 'EXPIRED' }, { status: 200 });
  }

  return NextResponse.json(
    {
      status: session.status,
      token: session.token,
      pin: session.pin,
      user: session.user
        ? {
            ...session.user,
            name: session.user.fullName,
          }
        : undefined,
    },
    { status: 200 }
  );
}

// 2. POST: Create a new QR session for PC login
export async function POST() {
  cleanExpired();

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const token = `td_qr_${timestamp}_${randomSuffix}`;

  // Generate a friendly 6-character backup PIN (e.g. "TD-8429")
  const pinNumbers = Math.floor(1000 + Math.random() * 9000);
  const pin = `TD-${pinNumbers}`;

  const session: QrSession = {
    token,
    pin,
    createdAt: timestamp,
    expiresAt: timestamp + 5 * 60 * 1000, // 5 minutes validity
    status: 'PENDING',
  };

  sessions.set(token, session);

  return NextResponse.json(
    {
      token,
      pin,
      expiresAt: session.expiresAt,
      status: session.status,
    },
    { status: 201 }
  );
}

// 3. PUT: Phone authorizes the QR session with logged-in user credentials
export async function PUT(request: NextRequest) {
  cleanExpired();

  try {
    const body = await request.json();
    const { token, pin, user } = body;

    if ((!token && !pin) || !user || !user.email) {
      return NextResponse.json(
        { error: 'Invalid payload: user email and token or pin required' },
        { status: 400 }
      );
    }

    let session: QrSession | undefined;

    if (token) {
      session = sessions.get(token);
    } else if (pin) {
      session = findSessionByPin(pin);
    }

    if (!session) {
      return NextResponse.json(
        { error: 'QR Code session has expired or is invalid. Please refresh the PC screen.' },
        { status: 404 }
      );
    }

    if (session.expiresAt < Date.now()) {
      sessions.delete(session.token);
      return NextResponse.json(
        { error: 'QR Code session has expired. Please refresh the PC screen.' },
        { status: 410 }
      );
    }

    // Authorize session with full user identity including UID
    session.status = 'AUTHORIZED';
    session.user = {
      fullName: user.fullName || user.name || 'TradeDairy Trader',
      email: user.email,
      uid: user.uid,
      avatar: user.avatar || user.profilePhoto,
      device: user.device || 'Mobile Authorized',
    };

    return NextResponse.json(
      {
        success: true,
        message: 'PC Login authorized successfully!',
        token: session.token,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error authorizing QR session:', err);
    return NextResponse.json({ error: 'Server error authorizing session' }, { status: 500 });
  }
}
