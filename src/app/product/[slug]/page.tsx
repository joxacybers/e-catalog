import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCatalogData } from '@/lib/db';
import { formatNumber, formatPrice } from '@/lib/i18n';
import { ProductDetailClient } from '@/components/ProductDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = getCatalogData();
  const product = data.products.find(
    (p) => p.slug === slug || p.id === slug
  );

  if (!product) {
    return {
      title: 'Mahsulot topilmadi — E-Catalog',
    };
  }

  const title = `${product.nameUz} — ${formatPrice(product.unitPrice, 'uz')} / dona`;
  const description = `${product.descriptionUz} • Qadoqda: 1 ${product.packTypeUz} = ${product.packQuantity} ${product.unitNameUz} (${formatPrice(product.packPrice, 'uz')}) • Omborda: ${formatNumber(product.stockPacks)} ${product.packTypeUz}`;
  const image = product.images[0] || '/images/products/dmst-1000.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: image,
          width: 1080,
          height: 1350,
          alt: product.nameUz,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

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

