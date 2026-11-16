'use client';

import React, { useState } from 'react';
import type { Category, Product } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { l } from '@/lib/i18n';
import { CategoryIcon } from '../CategoryIcon';
import { M3Icon } from '../m3/MaterialWebLoader';
import { ConfirmDialog } from './ConfirmDialog';

const ICON_OPTIONS = ['layers', 'droplets', 'grid', 'sparkles', 'wind', 'package'];

export function AdminCategoriesTab({
  categories,
  products,
  onUpdated,
}: {
  categories: Category[];
  products: Product[];
  onUpdated: () => Promise<void>;
}) {
  const { lang, t } = useLanguage();
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const startCreate = () => {
    setErrorMsg(null);
    setEditing({
      nameUz: '',
      nameRu: '',
      descriptionUz: '',
      descriptionRu: '',
      icon: 'package',
      sortOrder: categories.length + 1,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.nameUz?.trim()) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error('Failed');
      await onUpdated();
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/categories?id=${encodeURIComponent(deletingCategory.id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(
          data.error === 'Category has products'
            ? lang === 'uz'
              ? 'Bu kategoriyada mahsulotlar mavjud — avval ularni boshqa bo‘limga o‘tkazing.'
              : 'В этой категории есть товары — сначала переместите их.'
            : 'Delete failed'
        );
        return;
      }
      setDeletingCategory(null);
      await onUpdated();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1f1f1f]">
          {t.admin.tabCategories} ({categories.length})
        </h2>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
        >
          <M3Icon name="add" className="text-[18px]" />
          <span>{t.admin.addCategory}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-2xl bg-rose-100 px-4 py-3 text-sm font-medium text-rose-900">
          {errorMsg}
        </div>
      )}

      {editing && (
        <form
          onSubmit={handleSave}
          className="rounded-[24px] border border-[#0b57d0]/30 bg-white p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#e0e2ec] pb-3">
            <h3 className="font-semibold text-[#1f1f1f]">
              {editing.id ? t.admin.editCategory : t.admin.addCategory}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#444746] hover:bg-[#edf2fa] cursor-pointer"
            >
              <M3Icon name="close" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Bo‘lim nomi (O‘zbekcha) *
              </label>
              <input
                type="text"
                required
                value={editing.nameUz || ''}
                onChange={(e) => setEditing({ ...editing, nameUz: e.target.value })}
                className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Название раздела (Русский) *
              </label>
              <input
                type="text"
                required
                value={editing.nameRu || ''}
                onChange={(e) => setEditing({ ...editing, nameRu: e.target.value })}
                className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Qisqa tavsif (UZ)
              </label>
              <input
                type="text"
                value={editing.descriptionUz || ''}
                onChange={(e) => setEditing({ ...editing, descriptionUz: e.target.value })}
                className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Краткое описание (RU)
              </label>
              <input
                type="text"
                value={editing.descriptionRu || ''}
                onChange={(e) => setEditing({ ...editing, descriptionRu: e.target.value })}
                className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">Ikonka</label>
              <select
                value={editing.icon || 'package'}
                onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
              >
                {ICON_OPTIONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#444746]">
                Tartib raqami
              </label>
              <input
                type="number"
                value={editing.sortOrder ?? 1}
                onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) || 1 })}
                className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const count = products.filter((p) => p.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="flex flex-col justify-between rounded-[24px] border border-[#c4c7c5]/60 bg-white p-5"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d3e3fd] text-[#041e49]">
                    <CategoryIcon icon={cat.icon} className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[#f3f6fc] px-2.5 py-0.5 text-xs font-medium text-[#444746]">
                    #{cat.sortOrder} • {count} {lang === 'uz' ? 'tovar' : 'тов.'}
                  </span>
                </div>
                <h3 className="font-semibold text-[#1f1f1f]">{l(lang, cat.nameUz, cat.nameRu)}</h3>
                <p className="mt-1 text-xs text-[#444746]">
                  {l(lang, cat.descriptionUz, cat.descriptionRu)}
                </p>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-[#e0e2ec] pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setEditing(structuredClone(cat));
                  }}
                  className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-[#c2e7ff] text-[#001d35] hover:bg-[#b0dcf5] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <M3Icon name="edit" className="text-[15px]" />
                  <span>Tahrirlash</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setDeletingCategory(cat);
                  }}
                  className="rounded-full p-2 text-rose-700 hover:bg-rose-50 cursor-pointer"
                  title={lang === 'uz' ? "O'chirish" : "Удалить"}
                >
                  <M3Icon name="delete" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={deletingCategory !== null}
        title={lang === 'uz' ? 'Kategoriyani o‘chirish' : 'Удаление категории'}
        message={
          deletingCategory
            ? lang === 'uz'
              ? `Haqiqatan ham "${l(lang, deletingCategory.nameUz, deletingCategory.nameRu)}" kategoriyasini o‘chirmoqchimisiz?`
              : `Вы действительно хотите удалить категорию «${l(lang, deletingCategory.nameUz, deletingCategory.nameRu)}»?`
            : ''
        }
        confirmText={lang === 'uz' ? 'O‘chirish' : 'Удалить'}
        cancelText={lang === 'uz' ? 'Bekor qilish' : 'Отмена'}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
}
