import { NextResponse } from 'next/server';
import { getCatalogData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = getCatalogData();
    return NextResponse.json({
      categories: data.categories,
      products: data.products,
      settings: {
        ...data.settings,
        adminPin: '',
      },
    });
  } catch (error) {
    console.error('GET /api/catalog error:', error);
    return NextResponse.json({ error: 'Failed to load catalog' }, { status: 500 });
  }
}

