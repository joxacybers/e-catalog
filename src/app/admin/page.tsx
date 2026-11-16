import { getCatalogData } from '@/lib/db';
import { isSessionValid } from '@/lib/auth';
import { AdminClient } from '@/components/admin/AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const isAuth = await isSessionValid();
  const rawData = getCatalogData();

  // Never leak adminPin to unauthenticated visitors
  const safeData = {
    categories: rawData.categories,
    products: rawData.products,
    settings: {
      ...rawData.settings,
      adminPin: isAuth ? rawData.settings.adminPin : '',
    },
  };

  return <AdminClient initialData={safeData} initialAuth={isAuth} />;
}
