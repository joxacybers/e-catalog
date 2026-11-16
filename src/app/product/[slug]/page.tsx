import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
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

  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || '';
  const proto =
    headerList.get('x-forwarded-proto') ||
    (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || data.settings.siteUrl;
  const baseUrl = configuredUrl
    ? configuredUrl.replace(/\/+$/, '')
    : host
    ? `${proto}://${host}`
    : 'http://localhost:3000';

  const title = `${product.nameUz} — ${formatPrice(product.unitPrice, 'uz')} / dona`;
  const description = `${product.descriptionUz} • Qadoqda: 1 ${product.packTypeUz} = ${product.packQuantity} ${product.unitNameUz} (${formatPrice(product.packPrice, 'uz')}) • Omborda: ${formatNumber(product.stockPacks)} ${product.packTypeUz}`;
  const rawImage = product.images[0] || '/images/products/dmst-1000.jpg';
  const fullImageUrl =
    rawImage.startsWith('http://') || rawImage.startsWith('https://')
      ? rawImage
      : `${baseUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;

  const pageUrl = `${baseUrl}/product/${product.slug}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: data.settings.companyNameUz || 'E-Catalog',
      locale: 'uz_UZ',
      type: 'website',
      images: [
        {
          url: fullImageUrl,
          secureUrl: fullImageUrl.startsWith('https://') ? fullImageUrl : undefined,
          width: 1080,
          height: 1350,
          alt: product.nameUz,
          type: fullImageUrl.endsWith('.png')
            ? 'image/png'
            : fullImageUrl.endsWith('.webp')
            ? 'image/webp'
            : 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImageUrl],
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

