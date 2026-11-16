import { getCatalogData } from '@/lib/db';
import { ContactClient } from '@/components/ContactClient';

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  const data = getCatalogData();
  const { adminPin: _pin, ...publicSettings } = data.settings;

  return <ContactClient settings={publicSettings} />;
}

