'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Category, Product, SiteSettings } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, formatPrice, l } from '@/lib/i18n';
import { getStockState } from '@/lib/helpers';
import { M3Icon } from './m3/MaterialWebLoader';

function escapeCsvCell(value: string | number): string {
  const str = String(value ?? '');
  if (/[",;\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function PriceListClient({
  categories,
  products,
  settings,
}: {
  categories: Category[];
  products: Product[];
  settings: Omit<SiteSettings, 'adminPin'>;
}) {
  const { lang, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
      if (onlyInStock && (!p.inStock || p.stockPacks <= 0)) return false;
      if (!q) return true;
      return (
        p.nameUz.toLowerCase().includes(q) ||
        p.nameRu.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    });
  }, [products, selectedCategory, onlyInStock, searchQuery]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, p) => {
        if (p.inStock && p.stockPacks > 0) {
          acc.packs += p.stockPacks;
          acc.units += p.stockPacks * p.packQuantity;
        }
        return acc;
      },
      { packs: 0, units: 0 }
    );
  }, [filtered]);

  const handleExportCsv = () => {
    const headers =
      lang === 'ru'
        ? [
            '№',
            'Артикул',
            'Раздел',
            'Наименование',
            'Основные параметры',
            'В упаковке',
            'На складе (упак)',
            'На складе (ед)',
            'Цена за 1 ед (сум)',
            'Цена за упаковку (сум)',
          ]
        : [
            '№',
            'Artikul',
            'Bo‘lim',
            'Mahsulot nomi',
            'Asosiy xususiyati',
            'Qadoqda',
            'Omborda (qadoq)',
            'Omborda (dona)',
            '1 dona narxi (so‘m)',
            '1 blok/korobka narxi (so‘m)',
          ];

    const rows = filtered.map((p, idx) => {
      const cat = categoryMap.get(p.categoryId);
      const unitName = l(lang, p.unitNameUz, p.unitNameRu);
      const packType = l(lang, p.packTypeUz, p.packTypeRu);
      const specsSummary = p.specs
        .slice(0, 3)
        .map((s) => `${l(lang, s.labelUz, s.labelRu)}: ${l(lang, s.valueUz, s.valueRu)}`)
        .join('; ');

      const stockPacks = p.inStock ? p.stockPacks : 0;
      const stockUnits = stockPacks * p.packQuantity;

      return [
        idx + 1,
        p.sku,
        cat ? l(lang, cat.nameUz, cat.nameRu) : '',
        l(lang, p.nameUz, p.nameRu),
        specsSummary,
        `1 ${packType} = ${p.packQuantity} ${unitName}`,
        `${stockPacks} ${packType}`,
        `${stockUnits} ${unitName}`,
        p.unitPrice,
        p.packPrice,
      ];
    });

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((row) => row.map(escapeCsvCell).join(';'))
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `price-list-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="print-full mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">
      {/* Print-only company header */}
      <div className="hidden print:block mb-4 border-b border-slate-300 pb-3">
        <div className="text-xl font-bold">
          {l(lang, settings.companyNameUz, settings.companyNameRu)}
        </div>
        <div className="text-sm text-slate-600">
          {settings.phonePrimary} | @{settings.telegramUsername.replace(/^@/, '')} |{' '}
          {l(lang, settings.addressUz, settings.addressRu)}
        </div>
      </div>

      {/* Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-[20px] sm:rounded-[24px] bg-[#edf2fa] p-4 sm:px-6 sm:py-5">
        <div>
          <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-[#1f1f1f]">
            {t.priceList.title}
          </h1>
          <p className="mt-1 text-xs text-[#444746] sm:text-sm">
            {t.priceList.totalTypes} <strong className="text-[#1f1f1f]">{filtered.length}</strong> •{' '}
            {t.priceList.totalStockPacks}{' '}
            <strong className="text-[#0b57d0]">{formatNumber(totals.packs)}</strong> •{' '}
            {t.priceList.totalStockUnits}{' '}
            <strong className="text-[#1f1f1f]">{formatNumber(totals.units)}</strong>
          </p>
        </div>

        <div className="no-print flex items-center gap-2 pt-1 sm:pt-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 h-10 px-4 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] active:scale-95 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <M3Icon name="download" className="text-[17px] sm:text-[18px]" />
            <span>{t.priceList.exportCsv}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 h-10 px-4 rounded-full border border-[#c4c7c5] bg-white text-[#1f1f1f] hover:bg-[#f3f6fc] active:scale-95 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <M3Icon name="print" className="text-[17px] sm:text-[18px]" />
            <span>{t.priceList.printPdf}</span>
          </button>
        </div>
      </div>

      {/* M3 Filter Chips & Search */}
      <div className="no-print space-y-3">
        <div className="overflow-x-auto pb-1">
          <md-chip-set>
            <md-filter-chip
              label={t.catalog.allCategories}
              selected={selectedCategory === 'all'}
              onClick={(e) => {
                e.preventDefault();
                setSelectedCategory('all');
              }}
            />
            {categories.map((cat) => (
              <md-filter-chip
                key={cat.id}
                label={l(lang, cat.nameUz, cat.nameRu)}
                selected={selectedCategory === cat.id}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedCategory(cat.id);
                }}
              />
            ))}
          </md-chip-set>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <M3Icon
              name="search"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444746]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.nav.searchPlaceholder}
              className="h-10 w-full rounded-full bg-white border border-[#c4c7c5]/60 pl-10 pr-4 text-sm text-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-[#0b57d0]"
            />
          </div>

          <md-filter-chip
            label={t.catalog.onlyInStock}
            selected={onlyInStock}
            onClick={(e) => {
              e.preventDefault();
              setOnlyInStock((prev) => !prev);
            }}
          />
        </div>
      </div>

      {/* Mobile Card List (Instant touch-friendly overview) */}
      <div className="space-y-2.5 md:hidden no-print">
        {filtered.map((product, index) => {
          const name = l(lang, product.nameUz, product.nameRu);
          const unitName = l(lang, product.unitNameUz, product.unitNameRu);
          const packType = l(lang, product.packTypeUz, product.packTypeRu);
          const cat = categoryMap.get(product.categoryId);
          const stockState = getStockState(product);

          return (
            <div
              key={product.id}
              className="rounded-[18px] border border-[#c4c7c5]/60 bg-white p-3 space-y-2.5 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#747775]">
                    <span className="font-mono bg-[#f3f6fc] px-1.5 py-0.5 rounded border border-[#e0e2ec]">
                      #{index + 1} • {product.sku}
                    </span>
                    {cat && <span className="truncate">{l(lang, cat.nameUz, cat.nameRu)}</span>}
                  </div>
                  <Link
                    href={`/product/${product.slug}`}
                    prefetch={true}
                    className="mt-1 block font-semibold text-xs sm:text-sm text-[#1f1f1f] hover:text-[#0b57d0] leading-snug line-clamp-2"
                  >
                    {name}
                  </Link>
                </div>

                {stockState === 'in_stock' && (
                  <span className="shrink-0 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {formatNumber(product.stockPacks)} {packType}
                  </span>
                )}
                {stockState === 'low_stock' && (
                  <span className="shrink-0 text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {formatNumber(product.stockPacks)} {packType}
                  </span>
                )}
                {stockState === 'out_of_stock' && (
                  <span className="shrink-0 text-[10px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                    {t.product.outOfStock}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#f3f6fc] px-2.5 py-1.5 text-xs">
                <div>
                  <span className="text-[#444746] text-[10px]">1 {unitName}:</span>{' '}
                  <strong className="text-[#1f1f1f] font-semibold">
                    {formatPrice(product.unitPrice, lang)}
                  </strong>
                </div>
                <div>
                  <span className="text-[#444746] text-[10px]">1 {packType}:</span>{' '}
                  <strong className="text-[#0b57d0] font-bold">
                    {formatPrice(product.packPrice, lang)}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* M3 Data Table for Desktop & Print */}
      <div className="hidden md:block overflow-hidden rounded-[24px] border border-[#c4c7c5]/60 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-[#e0e2ec] bg-[#f3f6fc] text-xs font-medium text-[#444746]">
              <tr>
                <th className="px-4 py-3.5 w-12">{t.priceList.colIndex}</th>
                <th className="px-4 py-3.5">{t.priceList.colSku}</th>
                <th className="px-4 py-3.5">{t.priceList.colName}</th>
                <th className="px-4 py-3.5">{t.priceList.colSpec}</th>
                <th className="px-4 py-3.5">{t.priceList.colPack}</th>
                <th className="px-4 py-3.5">{t.priceList.colStock}</th>
                <th className="px-4 py-3.5 text-right">{t.priceList.colUnitPrice}</th>
                <th className="px-4 py-3.5 text-right">{t.priceList.colPackPrice}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e2ec]/70">
              {filtered.map((product, index) => {
                const name = l(lang, product.nameUz, product.nameRu);
                const unitName = l(lang, product.unitNameUz, product.unitNameRu);
                const packType = l(lang, product.packTypeUz, product.packTypeRu);
                const cat = categoryMap.get(product.categoryId);
                const stockState = getStockState(product);
                const totalUnits = product.stockPacks * product.packQuantity;

                return (
                  <tr key={product.id} className="hover:bg-[#f8fafd]">
                    <td className="px-4 py-3 text-xs text-[#747775]">{index + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs font-medium text-[#444746]">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/product/${product.slug}`}
                        prefetch={true}
                        className="font-medium text-[#1f1f1f] hover:text-[#0b57d0]"
                      >
                        {name}
                      </Link>
                      {cat && (
                        <div className="text-[11px] text-[#747775]">
                          {l(lang, cat.nameUz, cat.nameRu)}
                        </div>
                      )}
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
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900">
                          {formatNumber(product.stockPacks)} {packType} ({formatNumber(totalUnits)})
                        </span>
                      )}
                      {stockState === 'low_stock' && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                          {formatNumber(product.stockPacks)} {packType} ({formatNumber(totalUnits)})
                        </span>
                      )}
                      {stockState === 'out_of_stock' && (
                        <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-900">
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
