import { Suspense } from 'react';
import { getCatalogData } from '@/lib/db';
import { HomeClient } from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const data = getCatalogData();
  const { adminPin: _pin, ...publicSettings } = data.settings;

  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 text-[#444746]">Loading...</div>}>
      <HomeClient
        categories={data.categories}
        products={data.products}
        settings={publicSettings}
      />
    </Suspense>
  );
}
