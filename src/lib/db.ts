import fs from 'node:fs';
import path from 'node:path';
import type { CatalogData, Category, Product, SiteSettings } from '@/types/catalog';
import { SEED_CATALOG_DATA } from './seed-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'catalog.json');

function ensureDataFile(): CatalogData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const initial = structuredClone(SEED_CATALOG_DATA);
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  const raw = fs.readFileSync(DATA_FILE, 'utf-8').trim();
  if (!raw) {
    const initial = structuredClone(SEED_CATALOG_DATA);
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  return JSON.parse(raw) as CatalogData;
}

function writeDataFile(data: CatalogData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DATA_FILE);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[‘’'`"]/g, '')
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `item-${Date.now()}`;
}

export function getCatalogData(): CatalogData {
  const data = ensureDataFile();
  data.categories.sort((a, b) => a.sortOrder - b.sortOrder);
  return data;
}

export function getCategories(): Category[] {
  return getCatalogData().categories;
}

export function getProducts(): Product[] {
  return getCatalogData().products;
}

export function getProductByIdOrSlug(idOrSlug: string): Product | undefined {
  const products = getProducts();
  return products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

export function saveProduct(input: Partial<Product> & { nameUz: string; categoryId: string }): Product {
  const data = getCatalogData();
  const now = new Date().toISOString();

  const existingIndex = input.id ? data.products.findIndex((p) => p.id === input.id) : -1;

  if (existingIndex >= 0) {
    const existing = data.products[existingIndex];
    const stockPacks = Math.max(0, Number(input.stockPacks ?? existing.stockPacks));
    const updated: Product = {
      ...existing,
      ...input,
      id: existing.id,
      slug: input.slug?.trim() || existing.slug,
      unitPrice: Math.max(0, Number(input.unitPrice ?? existing.unitPrice)),
      packPrice: Math.max(0, Number(input.packPrice ?? existing.packPrice)),
      packQuantity: Math.max(1, Number(input.packQuantity ?? existing.packQuantity)),
      stockPacks,
      inStock: stockPacks === 0 ? false : Boolean(input.inStock ?? existing.inStock),
      lowStockThreshold: Math.max(0, Number(input.lowStockThreshold ?? existing.lowStockThreshold)),
      updatedAt: now,
    };
    data.products[existingIndex] = updated;
    writeDataFile(data);
    return updated;
  }

  const id = input.id?.trim() || `prod-${Date.now()}`;
  const baseSlug = slugify(input.slug || input.nameUz);
  const slugExists = data.products.some((p) => p.slug === baseSlug);
  const slug = slugExists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

  const packQuantity = Math.max(1, Number(input.packQuantity ?? 24));
  const unitPrice = Math.max(0, Number(input.unitPrice ?? 0));
  const packPrice = Math.max(0, Number(input.packPrice ?? unitPrice * packQuantity));
  const stockPacks = Math.max(0, Number(input.stockPacks ?? 0));

  const created: Product = {
    id,
    slug,
    sku: input.sku?.trim() || `SKU-${Date.now().toString().slice(-4)}`,
    categoryId: input.categoryId,
    nameUz: input.nameUz.trim(),
    nameRu: (input.nameRu || input.nameUz).trim(),
    descriptionUz: input.descriptionUz?.trim() || '',
    descriptionRu: input.descriptionRu?.trim() || input.descriptionUz?.trim() || '',
    unitPrice,
    oldUnitPrice: input.oldUnitPrice ? Number(input.oldUnitPrice) : undefined,
    packPrice,
    packQuantity,
    unitNameUz: input.unitNameUz?.trim() || 'dona',
    unitNameRu: input.unitNameRu?.trim() || 'шт',
    packTypeUz: input.packTypeUz?.trim() || 'korobka',
    packTypeRu: input.packTypeRu?.trim() || 'коробка',
    inStock: stockPacks === 0 ? false : Boolean(input.inStock ?? true),
    stockPacks,
    lowStockThreshold: Math.max(0, Number(input.lowStockThreshold ?? 20)),
    isNew: Boolean(input.isNew ?? false),
    isFeatured: Boolean(input.isFeatured ?? false),
    isSpecialOffer: Boolean(input.isSpecialOffer ?? false),
    images:
      Array.isArray(input.images) && input.images.length > 0
        ? input.images
        : SEED_CATALOG_DATA.products[0].images,
    specs: Array.isArray(input.specs) ? input.specs : [],
    updatedAt: now,
  };

  data.products.unshift(created);
  writeDataFile(data);
  return created;
}

export function deleteProduct(id: string): boolean {
  const data = getCatalogData();
  const next = data.products.filter((p) => p.id !== id);
  if (next.length === data.products.length) return false;
  data.products = next;
  writeDataFile(data);
  return true;
}

export interface QuickUpdateItem {
  id: string;
  unitPrice?: number;
  packPrice?: number;
  stockPacks?: number;
  inStock?: boolean;
}

export function bulkUpdateStockAndPrices(updates: QuickUpdateItem[]): Product[] {
  const data = getCatalogData();
  const now = new Date().toISOString();
  const updatedProducts: Product[] = [];

  for (const item of updates) {
    const idx = data.products.findIndex((p) => p.id === item.id);
    if (idx === -1) continue;

    const current = data.products[idx];
    const nextStockPacks =
      item.stockPacks !== undefined ? Math.max(0, Number(item.stockPacks)) : current.stockPacks;
    const nextInStock =
      item.inStock !== undefined
        ? nextStockPacks === 0 && item.inStock === false
          ? false
          : item.inStock
        : nextStockPacks > 0;

    const nextProduct: Product = {
      ...current,
      unitPrice: item.unitPrice !== undefined ? Math.max(0, Number(item.unitPrice)) : current.unitPrice,
      packPrice: item.packPrice !== undefined ? Math.max(0, Number(item.packPrice)) : current.packPrice,
      stockPacks: nextStockPacks,
      inStock: nextStockPacks === 0 ? false : nextInStock,
      updatedAt: now,
    };

    data.products[idx] = nextProduct;
    updatedProducts.push(nextProduct);
  }

  writeDataFile(data);
  return updatedProducts;
}

export function saveCategory(input: Partial<Category> & { nameUz: string }): Category {
  const data = getCatalogData();
  const existingIndex = input.id ? data.categories.findIndex((c) => c.id === input.id) : -1;

  if (existingIndex >= 0) {
    const existing = data.categories[existingIndex];
    const updated: Category = {
      ...existing,
      ...input,
      id: existing.id,
      slug: input.slug?.trim() || existing.slug,
      sortOrder: Number(input.sortOrder ?? existing.sortOrder),
    };
    data.categories[existingIndex] = updated;
    writeDataFile(data);
    return updated;
  }

  const id = input.id?.trim() || `cat-${Date.now()}`;
  const slug = input.slug?.trim() || slugify(input.nameUz);
  const created: Category = {
    id,
    slug,
    nameUz: input.nameUz.trim(),
    nameRu: (input.nameRu || input.nameUz).trim(),
    descriptionUz: input.descriptionUz?.trim() || '',
    descriptionRu: input.descriptionRu?.trim() || input.descriptionUz?.trim() || '',
    icon: input.icon?.trim() || 'package',
    sortOrder: Number(input.sortOrder ?? data.categories.length + 1),
  };

  data.categories.push(created);
  writeDataFile(data);
  return created;
}

export function deleteCategory(id: string): { ok: boolean; error?: string } {
  const data = getCatalogData();
  const hasProducts = data.products.some((p) => p.categoryId === id);
  if (hasProducts) {
    return { ok: false, error: 'Category has products' };
  }
  const next = data.categories.filter((c) => c.id !== id);
  if (next.length === data.categories.length) {
    return { ok: false, error: 'Category not found' };
  }
  data.categories = next;
  writeDataFile(data);
  return { ok: true };
}

export function getSettings(): SiteSettings {
  return getCatalogData().settings;
}

export function saveSettings(input: Partial<SiteSettings>): SiteSettings {
  const data = getCatalogData();
  const updated: SiteSettings = {
    ...data.settings,
    ...input,
  };
  data.settings = updated;
  writeDataFile(data);
  return updated;
}

