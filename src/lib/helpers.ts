import type { Language, Product, ProductVariant, SiteSettings } from '@/types/catalog';
import { formatNumber, formatPrice, l } from './i18n';

export type StockState = 'in_stock' | 'low_stock' | 'out_of_stock';

export function getStockState(product: Product): StockState {
  if (!product.inStock || product.stockPacks <= 0) {
    return 'out_of_stock';
  }
  if (product.stockPacks <= product.lowStockThreshold) {
    return 'low_stock';
  }
  return 'in_stock';
}

export function formatPhoneHref(phone: string): string {
  const cleaned = phone.replace(/[^+\d]/g, '');
  return `tel:${cleaned}`;
}

export function buildTelegramUrl(
  settings: Pick<SiteSettings, 'telegramUsername'> | null | undefined,
  message?: string
): string {
  const username = (settings?.telegramUsername || 'toza_optom_uz').replace(/^@/, '');
  if (!message) {
    return `https://t.me/${username}`;
  }
  return `https://t.me/${username}?text=${encodeURIComponent(message)}`;
}

export function buildProductTelegramMessage(
  product: Product,
  lang: Language,
  requestedPacks?: number,
  selectedVariant?: ProductVariant | null
): string {
  const name = l(lang, product.nameUz, product.nameRu);
  const packType = l(lang, product.packTypeUz, product.packTypeRu);
  const unitName = l(lang, product.unitNameUz, product.unitNameRu);
  const variantName = selectedVariant ? l(lang, selectedVariant.nameUz, selectedVariant.nameRu) : null;

  if (lang === 'ru') {
    const lines = [
      `Здравствуйте! Интересует товар из каталога:`,
      `• Товар: ${name} (${product.sku})`,
    ];
    if (variantName) {
      lines.push(`• Вид / Аромат: ${variantName}`);
    }
    lines.push(
      `• Цена за 1 ${unitName}: ${formatPrice(product.unitPrice, 'ru')}`,
      `• Цена за 1 ${packType} (${product.packQuantity} ${unitName}): ${formatPrice(product.packPrice, 'ru')}`,
      `• На складе указано: ${formatNumber(product.stockPacks)} ${packType}`
    );
    if (requestedPacks && requestedPacks > 0) {
      const totalUnits = requestedPacks * product.packQuantity;
      const totalSum = requestedPacks * product.packPrice;
      lines.push(
        `• Интересующий объём: ${formatNumber(requestedPacks)} ${packType} (${formatNumber(totalUnits)} ${unitName}) ≈ ${formatPrice(totalSum, 'ru')}`
      );
    }
    return lines.join('\n');
  }

  const lines = [
    `Assalomu alaykum! Katalogdagi mahsulot bo‘yicha ma’lumot olmoqchi edim:`,
    `• Mahsulot: ${name} (${product.sku})`,
  ];
  if (variantName) {
    lines.push(`• Turi / Hidi: ${variantName}`);
  }
  lines.push(
    `• 1 ${unitName} narxi: ${formatPrice(product.unitPrice, 'uz')}`,
    `• 1 ${packType} (${product.packQuantity} ${unitName}) narxi: ${formatPrice(product.packPrice, 'uz')}`,
    `• Omborda ko‘rsatilgan: ${formatNumber(product.stockPacks)} ${packType}`
  );
  if (requestedPacks && requestedPacks > 0) {
    const totalUnits = requestedPacks * product.packQuantity;
    const totalSum = requestedPacks * product.packPrice;
    lines.push(
      `• Qiziqayotgan miqdor: ${formatNumber(requestedPacks)} ${packType} (${formatNumber(totalUnits)} ${unitName}) ≈ ${formatPrice(totalSum, 'uz')}`
    );
  }
  return lines.join('\n');
}

