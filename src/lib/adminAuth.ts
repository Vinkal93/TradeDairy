import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'tradedairy_admin';
export function adminConfigured() {
  return !!process.env.ADMIN_EMAIL && /^[a-f0-9]{64}$/i.test(process.env.ADMIN_PASSWORD_HASH || '') && (process.env.ADMIN_SESSION_SECRET?.length || 0) >= 32;
}
function signature(payload: string) { return createHmac('sha256', process.env.ADMIN_SESSION_SECRET!).update(payload).digest('hex'); }
export function createAdminSession() { const expiry = String(Date.now() + 8 * 60 * 60 * 1000); return `${expiry}.${signature(expiry)}`; }
export function isAdminSession() {
  if (!adminConfigured()) return false;
  const token = cookies().get(ADMIN_COOKIE)?.value || '', [expiry, mac] = token.split('.');
  if (!/^\d+$/.test(expiry || '') || !/^[a-f0-9]{64}$/.test(mac || '') || Number(expiry) <= Date.now()) return false;
  return timingSafeEqual(Buffer.from(mac, 'hex'), Buffer.from(signature(expiry), 'hex'));
}
