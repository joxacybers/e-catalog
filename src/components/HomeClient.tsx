'use client';

import type { Category, Product, SiteSettings } from '@/types/catalog';
import { SimpleCatalogView } from './SimpleCatalogView';

export function HomeClient(props: {
  categories: Category[];
  products: Product[];
  settings: Omit<SiteSettings, 'adminPin'>;
}) {
  return <SimpleCatalogView {...props} />;
}
