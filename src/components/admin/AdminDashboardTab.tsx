'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Category, Product } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, l } from '@/lib/i18n';
import { getStockState } from '@/lib/helpers';
import { M3Icon } from '../m3/MaterialWebLoader';

interface DraftRow {
  unitPrice: number;
  packPrice: number;
  stockPacks: number;
  inStock: boolean;
}

export function AdminDashboardTab({
  products,
  categories,
  onUpdated,
}: {
  products: Product[];
  categories: Category[];
  onUpdated: () => Promise<void>;
}) {
  const { lang, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [autoPackCalc, setAutoPackCalc] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setDrafts({});
  }, [products]);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const stats = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    for (const p of products) {
      const state = getStockState(p);
      if (state === 'in_stock') inStock += 1;
      else if (state === 'low_stock') lowStock += 1;
      else outOfStock += 1;
    }
    return { total: products.length, inStock, lowStock, outOfStock };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (catFilter !== 'all' && p.categoryId !== catFilter) return false;
      if (!q) return true;
      return (
        p.nameUz.toLowerCase().includes(q) ||
        p.nameRu.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    });
  }, [products, catFilter, search]);

  const getRow = (p: Product): DraftRow =>
    drafts[p.id] ?? {
      unitPrice: p.unitPrice,
      packPrice: p.packPrice,
      stockPacks: p.stockPacks,
      inStock: p.inStock,
    };

  const updateRow = (p: Product, patch: Partial<DraftRow>) => {
    const current = getRow(p);
    const next: DraftRow = { ...current, ...patch };
    if (patch.unitPrice !== undefined && autoPackCalc) {
      next.packPrice = Math.max(0, patch.unitPrice) * p.packQuantity;
    }
    if (patch.stockPacks !== undefined) {
      if (patch.stockPacks <= 0) {
        next.stockPacks = 0;
        next.inStock = false;
      } else if (current.stockPacks === 0 && patch.stockPacks > 0) {
        next.inStock = true;
      }
    }
    setDrafts((prev) => ({ ...prev, [p.id]: next }));
  };

  const dirtyIds = Object.keys(drafts);

  const handleSaveAll = async (targetIds?: string[]) => {
    const ids = targetIds ?? dirtyIds;
    if (ids.length === 0) return;
    setSaving(true);
    setMessage(null);
    try {
      const updates = ids.map((id) => ({
        id,
        ...drafts[id],
      }));
      const res = await fetch('/api/products/quick-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) throw new Error('Update failed');
      await onUpdated();
      setMessage(t.admin.savedSuccess);
      setTimeout(() => setMessage(null), 3500);
    } catch {
      setMessage('Error saving updates');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* M3 Tonal Stat Chips */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center justify-between rounded-[20px] bg-white border border-[#c4c7c5]/60 p-4">
          <div>
            <div className="text-xs font-medium text-[#444746]">{t.admin.statTotal}</div>
            <div className="mt-1 text-2xl font-semibold text-[#1f1f1f]">{stats.total}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d3e3fd] text-[#041e49]">
            <M3Icon name="inventory_2" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-[20px] bg-emerald-50 border border-emerald-200/70 p-4">
          <div>
            <div className="text-xs font-medium text-emerald-900">{t.admin.statInStock}</div>
            <div className="mt-1 text-2xl font-semibold text-emerald-950">{stats.inStock}</div>
          </div>
          <M3Icon name="check_circle" className="text-emerald-700 text-[28px]" />
        </div>

        <div className="flex items-center justify-between rounded-[20px] bg-amber-50 border border-amber-200/70 p-4">
          <div>
            <div className="text-xs font-medium text-amber-900">{t.admin.statLowStock}</div>
            <div className="mt-1 text-2xl font-semibold text-amber-950">{stats.lowStock}</div>
          </div>
          <M3Icon name="warning" className="text-amber-700 text-[28px]" />
        </div>

        <div className="flex items-center justify-between rounded-[20px] bg-rose-50 border border-rose-200/70 p-4">
          <div>
            <div className="text-xs font-medium text-rose-900">{t.admin.statOutOfStock}</div>
            <div className="mt-1 text-2xl font-semibold text-rose-950">{stats.outOfStock}</div>
          </div>
          <M3Icon name="cancel" className="text-rose-700 text-[28px]" />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#c4c7c5]/60 bg-white p-3.5">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <M3Icon
              name="search"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444746]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.nav.searchPlaceholder}
              className="h-10 w-full rounded-full bg-[#f3f6fc] pl-10 pr-4 text-sm text-[#1f1f1f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0b57d0]"
            />
          </div>

          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="h-9 rounded-full border border-[#c4c7c5] bg-white px-3.5 text-xs font-medium text-[#1f1f1f] focus:border-[#0b57d0] focus:outline-none"
          >
            <option value="all">{t.catalog.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {l(lang, c.nameUz, c.nameRu)}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-[#444746] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoPackCalc}
              onChange={(e) => setAutoPackCalc(e.target.checked)}
              className="h-4 w-4 rounded border-[#747775] text-[#0b57d0]"
            />
            <span>{t.admin.autoPackCalc}</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          {message && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-900">
              <M3Icon name="check" className="text-[16px]" />
              {message}
            </span>
          )}
          <button
            type="button"
            disabled={dirtyIds.length === 0 || saving}
            onClick={() => handleSaveAll()}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
          >
            <M3Icon name="save" className="text-[18px]" />
            <span>
              {saving
                ? t.admin.saving
                : `${t.admin.saveAll}${dirtyIds.length > 0 ? ` (${dirtyIds.length})` : ''}`}
            </span>
          </button>
        </div>
      </div>

      {/* Quick Stock & Price Table */}
      <div className="overflow-hidden rounded-[24px] border border-[#c4c7c5]/60 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[#e0e2ec] bg-[#f3f6fc] text-xs font-medium text-[#444746]">
              <tr>
                <th className="px-4 py-3">{t.priceList.colSku}</th>
                <th className="px-4 py-3">{t.priceList.colName}</th>
                <th className="px-4 py-3">{t.priceList.colUnitPrice}</th>
                <th className="px-4 py-3">{t.priceList.colPackPrice}</th>
                <th className="px-4 py-3">{t.priceList.colStock}</th>
                <th className="px-4 py-3 text-center">{t.product.inStock}</th>
                <th className="px-4 py-3 text-right">{t.admin.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e2ec]/70">
              {filteredProducts.map((p) => {
                const row = getRow(p);
                const isDirty = Boolean(drafts[p.id]);
                const cat = categoryMap.get(p.categoryId);
                const packType = l(lang, p.packTypeUz, p.packTypeRu);
                const unitName = l(lang, p.unitNameUz, p.unitNameRu);

                return (
                  <tr
                    key={p.id}
                    className={isDirty ? 'bg-[#edf2fa]' : 'hover:bg-[#f8fafd]'}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium text-[#444746]">
                      {p.sku}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1f1f1f]">
                        {l(lang, p.nameUz, p.nameRu)}
                      </div>
                      <div className="text-[11px] text-[#747775]">
                        {cat ? l(lang, cat.nameUz, cat.nameRu) : ''} • 1 {packType} ={' '}
                        {p.packQuantity} {unitName}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={row.unitPrice}
                        onChange={(e) =>
                          updateRow(p, { unitPrice: Math.max(0, Number(e.target.value) || 0) })
                        }
                        className="w-32 rounded-xl border border-[#c4c7c5] bg-white px-3 py-1.5 text-sm font-medium text-[#1f1f1f] focus:border-[#0b57d0] focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={row.packPrice}
                        onChange={(e) =>
                          updateRow(p, { packPrice: Math.max(0, Number(e.target.value) || 0) })
                        }
                        className="w-36 rounded-xl border border-[#c4c7c5] bg-white px-3 py-1.5 text-sm font-semibold text-[#0b57d0] focus:border-[#0b57d0] focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={row.stockPacks}
                          onChange={(e) =>
                            updateRow(p, { stockPacks: Math.max(0, Number(e.target.value) || 0) })
                          }
                          className="w-24 rounded-xl border border-[#c4c7c5] bg-white px-3 py-1.5 text-sm font-semibold text-[#1f1f1f] focus:border-[#0b57d0] focus:outline-none"
                        />
                        <span className="text-xs text-[#444746]">
                          {packType} ({formatNumber(row.stockPacks * p.packQuantity)})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={row.inStock}
                        onChange={(e) => updateRow(p, { inStock: e.target.checked })}
                        className="h-4 w-4 rounded border-[#747775] text-[#0b57d0] cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={!isDirty || saving}
                        onClick={() => handleSaveAll([p.id])}
                        className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-[#c2e7ff] text-[#001d35] hover:bg-[#b0dcf5] text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                      >
                        <M3Icon name="save" className="text-[15px]" />
                        <span>{lang === 'uz' ? 'Saqlash' : 'Сохр.'}</span>
                      </button>
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
