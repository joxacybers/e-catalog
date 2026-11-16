'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Category, Product, SiteSettings } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, formatPrice, l } from '@/lib/i18n';
import {
  buildProductTelegramMessage,
  buildTelegramUrl,
  getStockState,
} from '@/lib/helpers';
import { M3Icon } from './m3/MaterialWebLoader';
import { ProductCard } from './ProductCard';
import { ShareModal } from './ShareModal';

type SortOption = 'stock_desc' | 'price_asc' | 'price_desc' | 'newest';
type ViewMode = 'grid' | 'table';

export function SimpleCatalogView({
  categories,
  products,
  settings,
}: {
  categories: Category[];
  products: Product[];
  settings: Omit<SiteSettings, 'adminPin'>;
}) {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('q') || ''
  );
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'stock_desc'
  );
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const catParam = searchParams.get('category');
    const qParam = searchParams.get('q');
    const sortParam = searchParams.get('sort') as SortOption | null;
    if (catParam) setSelectedCategory(catParam);
    if (qParam !== null) setSearchQuery(qParam);
    if (sortParam) setSortBy(sortParam);
  }, [searchParams]);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const inStockCount = useMemo(
    () => products.filter((p) => p.inStock && p.stockPacks > 0).length,
    [products]
  );

  const totalPacks = useMemo(
    () =>
      products
        .filter((p) => p.inStock && p.stockPacks > 0)
        .reduce((sum, p) => sum + p.stockPacks, 0),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const list = products.filter((p) => {
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }
      if (onlyInStock && (!p.inStock || p.stockPacks <= 0)) {
        return false;
      }
      if (!query) return true;

      const haystack = [
        p.nameUz,
        p.nameRu,
        p.sku,
        p.descriptionUz,
        p.descriptionRu,
        ...p.specs.flatMap((s) => [s.labelUz, s.labelRu, s.valueUz, s.valueRu]),
        ...(p.variants || []).flatMap((v) => [v.nameUz, v.nameRu, v.sku || '']),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });

    list.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.unitPrice - b.unitPrice;
        case 'price_desc':
          return b.unitPrice - a.unitPrice;
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.updatedAt.localeCompare(a.updatedAt);
        case 'stock_desc':
        default:
          return (b.inStock ? b.stockPacks : -1) - (a.inStock ? a.stockPacks : -1);
      }
    });

    return list;
  }, [products, selectedCategory, searchQuery, onlyInStock, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setOnlyInStock(false);
    setSortBy('stock_desc');
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-5 space-y-3.5 sm:space-y-4 w-full min-w-0 max-w-full">
      {/* Search Input - Clean & Prominent */}
      <div className="relative w-full">
        <M3Icon
          name="search"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#444746] text-[20px]"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.nav.searchPlaceholder}
          className="h-11 sm:h-12 w-full rounded-full bg-white border border-[#c4c7c5]/70 pl-11 pr-10 text-xs sm:text-sm text-[#1f1f1f] placeholder:text-[#747775] shadow-2xs focus:bg-white focus:border-[#0b57d0] focus:ring-2 focus:ring-[#0b57d0]/20 focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-[#747775] hover:bg-[#edf2fa] active:scale-90 transition-all cursor-pointer"
          >
            <M3Icon name="close" className="text-[18px]" />
          </button>
        )}
      </div>

      {/* M3 Category Filter Chips with Smooth Edge-to-Edge Scroll on Mobile */}
      <div className="overflow-x-auto no-scrollbar w-full min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 pb-0.5">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer border ${
              selectedCategory === 'all'
                ? 'bg-[#c2e7ff] text-[#001d35] border-[#7fcfff] shadow-2xs'
                : 'bg-white text-[#444746] border-[#c4c7c5]/60 hover:bg-[#f3f6fc]'
            }`}
          >
            {t.catalog.allCategories} ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#c2e7ff] text-[#001d35] border-[#7fcfff] shadow-2xs'
                    : 'bg-white text-[#444746] border-[#c4c7c5]/60 hover:bg-[#f3f6fc]'
                }`}
              >
                {l(lang, cat.nameUz, cat.nameRu)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Controls Row: Filters + Sort + View Mode Switcher */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {/* Left: Quick In-Stock Toggle + Sort Dropdown */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* In-Stock Toggle Pill */}
          <button
            type="button"
            onClick={() => setOnlyInStock((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer border ${
              onlyInStock
                ? 'bg-[#d3e3fd] text-[#041e49] border-[#0b57d0]'
                : 'bg-white text-[#444746] border-[#c4c7c5]/60 hover:bg-[#f3f6fc]'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full transition-colors ${
                onlyInStock ? 'bg-[#0b57d0]' : 'bg-[#c4c7c5]'
              }`}
            />
            <span>{t.catalog.onlyInStock}</span>
          </button>

          {/* Sort Select Pill */}
          <div className="relative inline-flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-8 pl-2.5 pr-6 rounded-full bg-white border border-[#c4c7c5]/60 text-xs font-semibold text-[#1f1f1f] focus:outline-none focus:border-[#0b57d0] appearance-none cursor-pointer"
            >
              <option value="stock_desc">{t.catalog.sortStockDesc}</option>
              <option value="price_asc">{t.catalog.sortPriceAsc}</option>
              <option value="price_desc">{t.catalog.sortPriceDesc}</option>
              <option value="newest">{t.catalog.sortNewest}</option>
            </select>
            <M3Icon
              name="expand_more"
              className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[16px] text-[#444746]"
            />
          </div>
        </div>

        {/* Right: Found Count & View Mode Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-xs text-[#747775]">
            <strong className="text-[#1f1f1f] font-semibold">{filteredProducts.length}</strong>{' '}
            {t.catalog.foundCount}
          </span>

          <div className="inline-flex rounded-full border border-[#c4c7c5]/70 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer active:scale-90 ${
                viewMode === 'grid'
                  ? 'bg-[#c2e7ff] text-[#001d35]'
                  : 'text-[#444746] hover:bg-[#edf2fa]'
              }`}
              title={t.catalog.viewGrid}
            >
              <M3Icon name="grid_view" className="text-[16px]" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer active:scale-90 ${
                viewMode === 'table'
                  ? 'bg-[#c2e7ff] text-[#001d35]'
                  : 'text-[#444746] hover:bg-[#edf2fa]'
              }`}
              title={t.catalog.viewTable}
            >
              <M3Icon name="view_list" className="text-[16px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State or Products */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-[24px] border border-[#c4c7c5]/60 bg-white p-12 text-center space-y-3">
          <M3Icon name="inventory" className="text-[40px] text-[#747775]" />
          <p className="text-lg font-medium text-[#1f1f1f]">{t.catalog.emptyTitle}</p>
          <p className="text-sm text-[#444746]">{t.catalog.emptyDesc}</p>
          <div>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#c2e7ff] text-[#001d35] hover:bg-[#b0dcf5] text-xs sm:text-sm font-medium transition-colors cursor-pointer shadow-2xs"
            >
              <M3Icon name="refresh" className="text-[18px]" />
              <span>{t.catalog.resetFilters}</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full min-w-0 items-stretch">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              category={categoryMap.get(product.categoryId)}
              settings={settings}
            />
          ))}
        </div>
      ) : (
        <div className="w-full min-w-0">
          {/* Mobile List View (Optimized for one-hand touch browsing) */}
          <div className="space-y-3 md:hidden w-full min-w-0">
            {filteredProducts.map((product) => {
              const name = l(lang, product.nameUz, product.nameRu);
              const unitName = l(lang, product.unitNameUz, product.unitNameRu);
              const packType = l(lang, product.packTypeUz, product.packTypeRu);
              const stockState = getStockState(product);

              return (
                <div
                  key={product.id}
                  className="rounded-[20px] border border-[#c4c7c5]/60 bg-white p-3.5 shadow-2xs space-y-3 transition-shadow hover:shadow-xs w-full min-w-0 max-w-full overflow-hidden"
                >
                  <div className="flex items-start gap-3 w-full min-w-0">
                    <img
                      src={product.images[0]}
                      alt={name}
                      className="h-16 w-16 rounded-2xl bg-[#f3f6fc] object-contain p-1.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] text-[#747775] bg-[#f3f6fc] px-1.5 py-0.5 rounded border border-[#e0e2ec]">
                          {product.sku}
                        </span>
                        {stockState === 'in_stock' && (
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                            {formatNumber(product.stockPacks)} {packType}
                          </span>
                        )}
                        {stockState === 'low_stock' && (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                            {formatNumber(product.stockPacks)} {packType}
                          </span>
                        )}
                        {stockState === 'out_of_stock' && (
                          <span className="text-[10px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                            {t.product.outOfStock}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/product/${product.slug}`}
                        prefetch={true}
                        className="mt-1 block font-semibold text-sm text-[#1f1f1f] hover:text-[#0b57d0] leading-snug line-clamp-2 break-words"
                      >
                        {name}
                      </Link>

                      <div className="mt-1 text-[11px] text-[#444746] truncate">
                        1 {packType} = {product.packQuantity} {unitName}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Price Row */}
                  <div className="flex items-center justify-between rounded-xl bg-[#f3f6fc] px-3 py-2 text-xs w-full min-w-0 gap-2">
                    <div className="min-w-0 truncate">
                      <span className="text-[#444746] text-[11px]">1 {unitName}:</span>{' '}
                      <strong className="text-[#1f1f1f] font-semibold">
                        {formatPrice(product.unitPrice, lang)}
                      </strong>
                    </div>
                    <div className="shrink-0 whitespace-nowrap">
                      <span className="text-[#444746] text-[11px]">1 {packType}:</span>{' '}
                      <strong className="text-[#0b57d0] font-bold">
                        {formatPrice(product.packPrice, lang)}
                      </strong>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-0.5 w-full min-w-0">
                    <button
                      type="button"
                      onClick={() => router.push(`/product/${product.slug}`)}
                      className="flex-1 min-w-0 inline-flex items-center justify-center h-9 px-2.5 rounded-full bg-[#c2e7ff] text-[#001d35] hover:bg-[#b0dcf5] active:scale-95 text-xs font-semibold transition-all cursor-pointer shadow-2xs truncate"
                    >
                      {t.product.detailsBtn}
                    </button>
                    <a
                      href={buildTelegramUrl(
                        settings,
                        buildProductTelegramMessage(product, lang)
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] active:scale-95 text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0"
                    >
                      <M3Icon name="send" className="text-[14px]" />
                      <span>Telegram</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSharingProduct(product)}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#f3f6fc] text-[#444746] hover:bg-[#d3e3fd] hover:text-[#0b57d0] active:scale-95 transition-all cursor-pointer shadow-2xs shrink-0 border border-[#e0e2ec]/80"
                      title={t.product.shareBtn}
                      aria-label={t.product.shareBtn}
                    >
                      <M3Icon name="share" className="text-[16px]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Full Table View */}
          <div className="hidden md:block overflow-hidden rounded-[24px] border border-[#c4c7c5]/60 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1020px] text-left text-sm">
                <thead className="border-b border-[#e0e2ec] bg-[#f3f6fc] text-xs font-medium text-[#444746]">
                  <tr>
                    <th className="px-4 py-3.5">{t.priceList.colName}</th>
                    <th className="px-4 py-3.5">{t.priceList.colSpec}</th>
                    <th className="px-4 py-3.5">{t.priceList.colPack}</th>
                    <th className="px-4 py-3.5">{t.priceList.colStock}</th>
                    <th className="px-4 py-3.5 text-right">{t.priceList.colUnitPrice}</th>
                    <th className="px-4 py-3.5 text-right">{t.priceList.colPackPrice}</th>
                    <th className="pl-4 pr-7 py-3.5 text-right w-[240px] min-w-[240px]">{t.admin.colAction}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e2ec]/70">
                  {filteredProducts.map((product) => {
                    const name = l(lang, product.nameUz, product.nameRu);
                    const unitName = l(lang, product.unitNameUz, product.unitNameRu);
                    const packType = l(lang, product.packTypeUz, product.packTypeRu);
                    const stockState = getStockState(product);
                    const totalUnits = product.stockPacks * product.packQuantity;

                    return (
                      <tr key={product.id} className="hover:bg-[#f8fafd] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0]}
                              alt={name}
                              className="h-11 w-11 rounded-xl bg-[#f3f6fc] object-contain p-1 shrink-0"
                            />
                            <div>
                              <Link
                                href={`/product/${product.slug}`}
                                prefetch={true}
                                className="font-medium text-[#1f1f1f] hover:text-[#0b57d0]"
                              >
                                {name}
                              </Link>
                              <div className="font-mono text-[11px] text-[#747775]">
                                {product.sku}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#444746]">
                          {product.specs
                            .slice(0, 2)
                            .map((s) => l(lang, s.valueUz, s.valueRu))
                            .join(' • ')}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#1f1f1f] whitespace-nowrap">
                          1 {packType} = {product.packQuantity} {unitName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {stockState === 'in_stock' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900">
                              {formatNumber(product.stockPacks)} {packType} ({formatNumber(totalUnits)})
                            </span>
                          )}
                          {stockState === 'low_stock' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                              {formatNumber(product.stockPacks)} {packType}
                            </span>
                          )}
                          {stockState === 'out_of_stock' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-900">
                              {t.product.outOfStock}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-[#1f1f1f] whitespace-nowrap">
                          {formatPrice(product.unitPrice, lang)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#0b57d0] whitespace-nowrap">
                          {formatPrice(product.packPrice, lang)}
                        </td>
                        <td className="pl-4 pr-7 py-3 text-right whitespace-nowrap w-[240px] min-w-[240px]">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => router.push(`/product/${product.slug}`)}
                              className="inline-flex items-center justify-center h-8 px-3.5 rounded-full bg-[#c2e7ff] text-[#001d35] hover:bg-[#b0dcf5] active:scale-95 text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0"
                            >
                              {t.product.detailsBtn}
                            </button>
                            <a
                              href={buildTelegramUrl(
                                settings,
                                buildProductTelegramMessage(product, lang)
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 h-8 px-3 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] active:scale-95 text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0"
                              title="Telegram"
                            >
                              <M3Icon name="send" className="text-[13px]" />
                              <span>TG</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => setSharingProduct(product)}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#f3f6fc] text-[#444746] hover:bg-[#d3e3fd] hover:text-[#0b57d0] active:scale-95 transition-all cursor-pointer shadow-2xs shrink-0 border border-[#e0e2ec]/80"
                              title={t.product.shareBtn}
                              aria-label={t.product.shareBtn}
                            >
                              <M3Icon name="share" className="text-[15px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ShareModal
        isOpen={Boolean(sharingProduct)}
        onClose={() => setSharingProduct(null)}
        product={sharingProduct}
      />
    </div>
  );
}

