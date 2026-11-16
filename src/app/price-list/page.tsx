import { getCatalogData } from '@/lib/db';
import { PriceListClient } from '@/components/PriceListClient';

export const dynamic = 'force-dynamic';

export default function PriceListPage() {
  const data = getCatalogData();
  const { adminPin: _pin, ...publicSettings } = data.settings;

  return (
    <PriceListClient
      categories={data.categories}
      products={data.products}
      settings={publicSettings}
    />
  );
}

