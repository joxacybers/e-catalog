'use client';

import React, { useState } from 'react';
import type { Category, Product, ProductSpec } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, formatPrice, l } from '@/lib/i18n';
import {
  getPresetIllustration,
  ILLUSTRATION_PRESETS,
  type IllustrationKind,
} from '@/lib/illustrations';
import { M3Icon } from '../m3/MaterialWebLoader';
import { ConfirmDialog } from './ConfirmDialog';

const emptyProductForm = (defaultCatId: string): Partial<Product> => ({
  sku: '',
  categoryId: defaultCatId,
  nameUz: '',
  nameRu: '',
  descriptionUz: '',
  descriptionRu: '',
  unitPrice: 5000,
  oldUnitPrice: undefined,
  packQuantity: 24,
  packPrice: 120000,
  unitNameUz: 'pochka',
  unitNameRu: 'пачка',
  packTypeUz: 'blok',
  packTypeRu: 'блок',
  stockPacks: 100,
  lowStockThreshold: 20,
  inStock: true,
  isNew: true,
  isFeatured: false,
  isSpecialOffer: false,
  images: [getPresetIllustration('paper-napkin-pack', '#0284c7', '#e0f2fe', 'OPTOM')],
  specs: [
    { labelUz: 'Pochkadagi soni', labelRu: 'Количество в пачке', valueUz: '100 dona', valueRu: '100 шт' },
  ],
});

export function AdminProductsTab({
  products,
  categories,
  onUpdated,
}: {
  products: Product[];
  categories: Category[];
  onUpdated: () => Promise<void>;
}) {
  const { lang, t } = useLanguage();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [presetKind, setPresetKind] = useState<IllustrationKind>('paper-napkin-pack');
  const [presetBadge, setPresetBadge] = useState('OPTOM');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const startCreate = () => {
    setEditing(emptyProductForm(categories[0]?.id || ''));
    setCustomImageUrl('');
  };

  const startEdit = (product: Product) => {
    setEditing(structuredClone(product));
    setCustomImageUrl(
      product.images[0]?.startsWith('data:image/svg+xml') ? '' : product.images[0] || ''
    );
  };

  const applyPreset = (kind: IllustrationKind, badge: string) => {
    setPresetKind(kind);
    setPresetBadge(badge);
    const preset = ILLUSTRATION_PRESETS.find((p) => p.id === kind) || ILLUSTRATION_PRESETS[0];
    const svgUrl = getPresetIllustration(
      kind,
      preset.defaultColor,
      preset.defaultBg,
      badge || 'OPTOM'
    );
    setEditing((prev) => (prev ? { ...prev, images: [svgUrl] } : prev));
    setCustomImageUrl('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.nameUz?.trim() || !editing.categoryId) return;

    setSaving(true);
    try {
      const payload: Partial<Product> = {
        ...editing,
        images: customImageUrl.trim()
          ? [customImageUrl.trim()]
          : editing.images && editing.images.length > 0
            ? editing.images
            : [getPresetIllustration(presetKind, '#0284c7', '#e0f2fe', presetBadge)],
      };

      const isEdit = Boolean(editing.id);
      const url = isEdit ? `/api/products/${editing.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      await onUpdated();
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingProduct(null);
        await onUpdated();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const updateSpec = (idx: number, patch: Partial<ProductSpec>) => {
    if (!editing) return;
    const specs = [...(editing.specs || [])];
    specs[idx] = { ...specs[idx], ...patch };
    setEditing({ ...editing, specs });
  };

  const addSpecRow = () => {
    if (!editing) return;
    setEditing({
      ...editing,
      specs: [
        ...(editing.specs || []),
        { labelUz: '', labelRu: '', valueUz: '', valueRu: '' },
      ],
    });
  };

  const removeSpecRow = (idx: number) => {
    if (!editing) return;
    setEditing({
      ...editing,
      specs: (editing.specs || []).filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1f1f1f]">
          {t.admin.tabProducts} ({products.length})
        </h2>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
        >
          <M3Icon name="add" className="text-[18px]" />
          <span>{t.admin.addProduct}</span>
        </button>
      </div>

      {/* M3 Form Panel */}
      {editing && (
        <form
          onSubmit={handleSave}
          className="rounded-[24px] border border-[#0b57d0]/30 bg-white p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-[#e0e2ec] pb-3">
            <h3 className="text-base font-semibold text-[#1f1f1f]">
              {editing.id ? t.admin.editProduct : t.admin.addProduct}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#444746] hover:bg-[#edf2fa] cursor-pointer"
            >
              <M3Icon name="close" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Artikul (SKU) *
              </label>
              <input
                type="text"
                required
                value={editing.sku || ''}
                onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
                placeholder="QS-105"
                className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm font-mono focus:border-[#0b57d0] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Kategoriya *
              </label>
              <select
                required
                value={editing.categoryId || ''}
                onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}
                className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm focus:border-[#0b57d0] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameUz} / {c.nameRu}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Mahsulot nomi (O‘zbekcha) *
              </label>
              <input
                type="text"
                required
                value={editing.nameUz || ''}
                onChange={(e) => setEditing({ ...editing, nameUz: e.target.value })}
                className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm focus:border-[#0b57d0] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Название товара (Русский) *
              </label>
              <input
                type="text"
                required
                value={editing.nameRu || ''}
                onChange={(e) => setEditing({ ...editing, nameRu: e.target.value })}
                className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm focus:border-[#0b57d0] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Tavsif (O‘zbekcha)
              </label>
              <textarea
                rows={3}
                value={editing.descriptionUz || ''}
                onChange={(e) => setEditing({ ...editing, descriptionUz: e.target.value })}
                className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm focus:border-[#0b57d0] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Описание (Русский)
              </label>
              <textarea
                rows={3}
                value={editing.descriptionRu || ''}
                onChange={(e) => setEditing({ ...editing, descriptionRu: e.target.value })}
                className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm focus:border-[#0b57d0] focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing, Packaging & Warehouse Stock */}
          <div className="grid gap-4 rounded-[20px] bg-[#f3f6fc] p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                1 dona/pochka narxi (so‘m)
              </label>
              <input
                type="number"
                min={0}
                value={editing.unitPrice ?? 0}
                onChange={(e) => {
                  const unitPrice = Math.max(0, Number(e.target.value) || 0);
                  const qty = editing.packQuantity || 1;
                  setEditing({
                    ...editing,
                    unitPrice,
                    packPrice: unitPrice * qty,
                  });
                }}
                className="w-full rounded-xl border border-[#c4c7c5] bg-white px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Qadoqdagi soni (dona)
              </label>
              <input
                type="number"
                min={1}
                value={editing.packQuantity ?? 24}
                onChange={(e) => {
                  const packQuantity = Math.max(1, Number(e.target.value) || 1);
                  setEditing({
                    ...editing,
                    packQuantity,
                    packPrice: (editing.unitPrice || 0) * packQuantity,
                  });
                }}
                className="w-full rounded-xl border border-[#c4c7c5] bg-white px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                1 blok/korobka narxi (so‘m)
              </label>
              <input
                type="number"
                min={0}
                value={editing.packPrice ?? 0}
                onChange={(e) =>
                  setEditing({ ...editing, packPrice: Math.max(0, Number(e.target.value) || 0) })
                }
                className="w-full rounded-xl border border-[#c4c7c5] bg-white px-3 py-2 text-sm font-semibold text-[#0b57d0]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Omborda bor (blok/korobka)
              </label>
              <input
                type="number"
                min={0}
                value={editing.stockPacks ?? 0}
                onChange={(e) => {
                  const stockPacks = Math.max(0, Number(e.target.value) || 0);
                  setEditing({
                    ...editing,
                    stockPacks,
                    inStock: stockPacks > 0,
                  });
                }}
                className="w-full rounded-xl border border-[#c4c7c5] bg-white px-3 py-2 text-sm font-semibold text-emerald-700"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Birlik nomi (UZ)
              </label>
              <input
                type="text"
                value={editing.unitNameUz || ''}
                onChange={(e) => setEditing({ ...editing, unitNameUz: e.target.value })}
                className="w-full rounded-xl border border-[#c4c7c5] bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Единица (RU)
              </label>
              <input
                type="text"
                value={editing.unitNameRu || ''}
                onChange={(e) => setEditing({ ...editing, unitNameRu: e.target.value })}
                className="w-full rounded-xl border border-[#c4c7c5] bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Qadoq turi (UZ)
              </label>
              <input
                type="text"
                value={editing.packTypeUz || ''}
                onChange={(e) => setEditing({ ...editing, packTypeUz: e.target.value })}
                className="w-full rounded-xl border border-[#c4c7c5] bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Тип упаковки (RU)
              </label>
              <input
                type="text"
                value={editing.packTypeRu || ''}
                onChange={(e) => setEditing({ ...editing, packTypeRu: e.target.value })}
                className="w-full rounded-xl border border-[#c4c7c5] bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="inline-flex items-center gap-2 text-sm text-[#1f1f1f] cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(editing.inStock)}
                onChange={(e) => setEditing({ ...editing, inStock: e.target.checked })}
                className="h-4 w-4 rounded text-[#0b57d0]"
              />
              <span>{t.product.inStock}</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-[#1f1f1f] cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(editing.isNew)}
                onChange={(e) => setEditing({ ...editing, isNew: e.target.checked })}
                className="h-4 w-4 rounded text-[#0b57d0]"
              />
              <span>{t.product.badgeNew}</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-[#1f1f1f] cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(editing.isSpecialOffer)}
                onChange={(e) => setEditing({ ...editing, isSpecialOffer: e.target.checked })}
                className="h-4 w-4 rounded text-[#0b57d0]"
              />
              <span>{t.product.badgeSale}</span>
            </label>
          </div>

          {/* Image / Illustration Picker */}
          <div className="grid gap-4 rounded-[20px] border border-[#c4c7c5]/60 p-4 md:grid-cols-12 md:items-center">
            <div className="md:col-span-3 flex justify-center">
              <img
                src={customImageUrl.trim() || editing.images?.[0]}
                alt="Preview"
                className="h-28 w-36 rounded-2xl bg-[#f3f6fc] object-contain p-2"
              />
            </div>
            <div className="md:col-span-9 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#444746]">
                    Tayyor rasm shabloni
                  </label>
                  <select
                    value={presetKind}
                    onChange={(e) =>
                      applyPreset(e.target.value as IllustrationKind, presetBadge)
                    }
                    className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
                  >
                    {ILLUSTRATION_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {l(lang, p.labelUz, p.labelRu)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#444746]">
                    Rasm ustidagi qisqa yozuv
                  </label>
                  <input
                    type="text"
                    value={presetBadge}
                    onChange={(e) => applyPreset(presetKind, e.target.value)}
                    className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#444746]">
                  Yoki rasm havolasi (URL) — ixtiyoriy
                </label>
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://example.com/product.jpg"
                  className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Technical Specs Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#444746]">
                {t.product.specsTitle}
              </label>
              <button
                type="button"
                onClick={addSpecRow}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-[#c2e7ff] text-[#001d35] hover:bg-[#b0dcf5] text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <M3Icon name="add" className="text-[16px]" />
                <span>Xususiyat qo‘shish</span>
              </button>
            </div>

            <div className="space-y-2">
              {(editing.specs || []).map((spec, idx) => (
                <div key={idx} className="grid gap-2 sm:grid-cols-9 sm:items-center">
                  <input
                    type="text"
                    placeholder="Nomi (UZ)"
                    value={spec.labelUz}
                    onChange={(e) => updateSpec(idx, { labelUz: e.target.value })}
                    className="sm:col-span-2 rounded-xl border border-[#c4c7c5] px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Название (RU)"
                    value={spec.labelRu}
                    onChange={(e) => updateSpec(idx, { labelRu: e.target.value })}
                    className="sm:col-span-2 rounded-xl border border-[#c4c7c5] px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Qiymati (UZ)"
                    value={spec.valueUz}
                    onChange={(e) => updateSpec(idx, { valueUz: e.target.value })}
                    className="sm:col-span-2 rounded-xl border border-[#c4c7c5] px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Значение (RU)"
                    value={spec.valueRu}
                    onChange={(e) => updateSpec(idx, { valueRu: e.target.value })}
                    className="sm:col-span-2 rounded-xl border border-[#c4c7c5] px-2.5 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecRow(idx)}
                    className="inline-flex items-center justify-center rounded-full p-1.5 text-rose-700 hover:bg-rose-50 cursor-pointer"
                  >
                    <M3Icon name="delete" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#e0e2ec] pt-4">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="inline-flex items-center justify-center h-10 px-5 rounded-full border border-[#c4c7c5] bg-white text-[#1f1f1f] hover:bg-[#f3f6fc] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] text-xs sm:text-sm font-semibold transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
            >
              <M3Icon name="save" className="text-[18px]" />
              <span>{saving ? t.admin.saving : 'Saqlash'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Products Table */}
      <div className="overflow-hidden rounded-[24px] border border-[#c4c7c5]/60 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="border-b border-[#e0e2ec] bg-[#f3f6fc] text-xs font-medium text-[#444746]">
              <tr>
                <th className="px-4 py-3">{t.priceList.colName}</th>
                <th className="px-4 py-3">{t.priceList.colPack}</th>
                <th className="px-4 py-3">{t.priceList.colStock}</th>
                <th className="px-4 py-3 text-right">{t.priceList.colUnitPrice}</th>
                <th className="px-4 py-3 text-right">{t.admin.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e2ec]/70">
              {products.map((p) => {
                const cat = categoryMap.get(p.categoryId);
                return (
                  <tr key={p.id} className="hover:bg-[#f8fafd]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt=""
                          className="h-11 w-11 rounded-xl bg-[#f3f6fc] object-contain p-1 shrink-0"
                        />
                        <div>
                          <div className="font-medium text-[#1f1f1f]">
                            {l(lang, p.nameUz, p.nameRu)}
                          </div>
                          <div className="text-xs text-[#747775]">
                            <span className="font-mono">{p.sku}</span> •{' '}
                            {cat ? l(lang, cat.nameUz, cat.nameRu) : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#444746]">
                      1 {l(lang, p.packTypeUz, p.packTypeRu)} = {p.packQuantity}{' '}
                      {l(lang, p.unitNameUz, p.unitNameRu)}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium">
                      {p.inStock ? (
                        <span className="text-emerald-800">
                          {formatNumber(p.stockPacks)} {l(lang, p.packTypeUz, p.packTypeRu)}
                        </span>
                      ) : (
                        <span className="text-rose-700">{t.product.outOfStock}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#1f1f1f]">
                      {formatPrice(p.unitPrice, lang)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="rounded-full p-2 text-[#444746] hover:bg-[#edf2fa] hover:text-[#0b57d0] cursor-pointer"
                        >
                          <M3Icon name="edit" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProduct(p)}
                          className="rounded-full p-2 text-rose-700 hover:bg-rose-50 cursor-pointer"
                          title={lang === 'uz' ? "O'chirish" : "Удалить"}
                        >
                          <M3Icon name="delete" />
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

      <ConfirmDialog
        isOpen={deletingProduct !== null}
        title={lang === 'uz' ? 'Mahsulotni o‘chirish' : 'Удаление товара'}
        message={
          deletingProduct
            ? lang === 'uz'
              ? `Haqiqatan ham "${l(lang, deletingProduct.nameUz, deletingProduct.nameRu)}" mahsulotini o‘chirmoqchimisiz?`
              : `Вы действительно хотите удалить товар «${l(lang, deletingProduct.nameUz, deletingProduct.nameRu)}»?`
            : ''
        }
        confirmText={lang === 'uz' ? 'O‘chirish' : 'Удалить'}
        cancelText={lang === 'uz' ? 'Bekor qilish' : 'Отмена'}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
}
