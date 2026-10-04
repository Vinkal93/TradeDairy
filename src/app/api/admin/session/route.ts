import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { ADMIN_COOKIE, adminConfigured, createAdminSession } from '../../../../lib/adminAuth';

const attempts = new Map<string, { count: number; until: number }>();
export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (!adminConfigured()) return NextResponse.json({ error: 'Admin access is not configured on this server.' }, { status: 503 });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
  const previous = attempts.get(ip), state = previous && previous.until > Date.now() ? previous : { count: 0, until: Date.now() + 10 * 60 * 1000 };
  if (state.count >= 5) return NextResponse.json({ error: 'Too many attempts. Try again in ten minutes.' }, { status: 429 });
  try {
    const body = await request.json();
    if (typeof body.email !== 'string' || typeof body.password !== 'string' || body.password.length > 1024) throw new Error('Invalid credentials');
    const digest = createHash('sha256').update(body.password).digest();
    const valid = timingSafeEqual(digest, Buffer.from(process.env.ADMIN_PASSWORD_HASH!, 'hex')) && body.email.trim().toLowerCase() === process.env.ADMIN_EMAIL!.trim().toLowerCase();
    if (!valid) { state.count++; attempts.set(ip, state); return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 }); }
    attempts.delete(ip);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, createAdminSession(), { httpOnly: true, sameSite: 'strict', secure: new URL(request.url).protocol === 'https:', path: '/', maxAge: 8 * 60 * 60 });
    return response;
  } catch { state.count++; attempts.set(ip, state); return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
}
export async function DELETE(request: NextRequest) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  const response = NextResponse.json({ ok: true }); response.cookies.delete(ADMIN_COOKIE); return response;
}
