import { NextRequest, NextResponse } from 'next/server';
import { bulkUpdateStockAndPrices, type QuickUpdateItem } from '@/lib/db';
import { isSessionValid } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const isAuth = await isSessionValid();
    if (!isAuth) {
      return NextResponse.json({ error: 'Ruxsat berilmagan (Unauthorized)' }, { status: 401 });
    }

    const body = await req.json();
    const updates: QuickUpdateItem[] = Array.isArray(body?.updates)
      ? body.updates
      : body?.id
        ? [body]
        : [];

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const updatedProducts = bulkUpdateStockAndPrices(updates);
    return NextResponse.json({ updatedProducts, count: updatedProducts.length });
  } catch (error) {
    console.error('POST /api/products/quick-update error:', error);
    return NextResponse.json({ error: 'Failed to quick-update products' }, { status: 500 });
  }
}

