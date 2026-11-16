import { getCatalogData } from '@/lib/db';
import { AdminClient } from '@/components/admin/AdminClient';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const data = getCatalogData();
  return <AdminClient initialData={data} />;
}

