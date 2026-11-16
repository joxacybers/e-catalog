import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/db';
import { isSessionValid } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const isAuth = await isSessionValid();
    const settings = getSettings();

    // If not authenticated, strip adminPin
    if (!isAuth) {
      const { adminPin: _, ...publicSettings } = settings;
      return NextResponse.json({ settings: publicSettings });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isAuth = await isSessionValid();
    if (!isAuth) {
      return NextResponse.json({ error: 'Ruxsat berilmagan (Unauthorized)' }, { status: 401 });
    }

    const body = await req.json();
    const settings = saveSettings(body);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

