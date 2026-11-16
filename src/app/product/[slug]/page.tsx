import { notFound } from 'next/navigation';
import { getCatalogData } from '@/lib/db';
import { ProductDetailClient } from '@/components/ProductDetailClient';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getCatalogData();
  const product = data.products.find(
    (p) => p.slug === slug || p.id === slug
  );

  if (!product) {
    notFound();
  }

  const category = data.categories.find((c) => c.id === product.categoryId);
  const similarProducts = data.products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const { adminPin: _pin, ...publicSettings } = data.settings;

  return (
    <ProductDetailClient
      product={product}
      category={category}
      similarProducts={similarProducts}
      settings={publicSettings}
    />
  );
}

