import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { getSettings } from './db';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'wholesale-e-catalog-secure-key-2026';

function generateSessionToken(pin: string): string {
  return crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`admin-${pin}`)
    .digest('hex');
}

export function checkPin(pin: string): boolean {
  const currentPin = getSettings().adminPin || '1234';
  return pin.trim() === currentPin.trim();
}

export function createSessionToken(): string {
  const currentPin = getSettings().adminPin || '1234';
  return generateSessionToken(currentPin);
}

export async function isSessionValid(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;

  const validToken = createSessionToken();
  return token === validToken;
}

export { SESSION_COOKIE_NAME };
