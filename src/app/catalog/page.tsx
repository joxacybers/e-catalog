import { Suspense } from 'react';
import { getCatalogData } from '@/lib/db';
import { CatalogClient } from '@/components/CatalogClient';

export const dynamic = 'force-dynamic';

export default function CatalogPage() {
  const data = getCatalogData();
  const { adminPin: _pin, ...publicSettings } = data.settings;

  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 text-slate-500">Loading...</div>}>
      <CatalogClient
        categories={data.categories}
        products={data.products}
        settings={publicSettings}
      />
    </Suspense>
  );
}

