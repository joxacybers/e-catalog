import { NextRequest, NextResponse } from 'next/server';
import { checkPin, createSessionToken, isSessionValid, SESSION_COOKIE_NAME } from '@/lib/auth';
import { saveSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const isAuth = await isSessionValid();
    if (!isAuth) {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const currentPin = String(body.currentPin || '').trim();
    const newPin = String(body.newPin || '').trim();

    if (!checkPin(currentPin)) {
      return NextResponse.json(
        { error: 'Joriy PIN-kod noto‘g‘ri' },
        { status: 400 }
      );
    }

    if (!newPin || newPin.length < 4) {
      return NextResponse.json(
        { error: 'Yangi PIN-kod kamida 4 ta belgidan iborat bo‘lishi kerak' },
        { status: 400 }
      );
    }

    saveSettings({ adminPin: newPin });

    // Refresh session cookie with new token
    const newToken = createSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('POST /api/auth/change-pin error:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
