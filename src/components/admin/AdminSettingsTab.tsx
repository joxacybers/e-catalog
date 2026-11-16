'use client';

import React, { useState } from 'react';
import type { SiteSettings } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { M3Icon } from '../m3/MaterialWebLoader';

export function AdminSettingsTab({
  settings,
  onUpdated,
}: {
  settings: SiteSettings;
  onUpdated: () => Promise<void>;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Security / PIN change state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(null);

    if (newPin !== confirmPin) {
      setPinError('Yangi PIN-kodlar bir-biriga mos kelmadi');
      return;
    }

    setPinLoading(true);
    try {
      const res = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin, newPin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPinError(data.error || 'Xatolik yuz berdi');
        return;
      }
      setPinSuccess(t.admin.pinChangedSuccess);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } finally {
      setPinLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      await onUpdated();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-[24px] border border-[#c4c7c5]/60 bg-white p-6 space-y-6"
      >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e0e2ec] pb-4">
        <h2 className="text-lg font-semibold text-[#1f1f1f]">{t.admin.tabSettings}</h2>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-900">
              <M3Icon name="check" className="text-[16px]" />
              {t.admin.savedSuccess}
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] text-xs sm:text-sm font-semibold transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
          >
            <M3Icon name="save" className="text-[18px]" />
            <span>{saving ? t.admin.saving : t.admin.saveSettings}</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            Kompaniya / Katalog nomi (UZ)
          </label>
          <input
            type="text"
            value={form.companyNameUz}
            onChange={(e) => setForm({ ...form, companyNameUz: e.target.value })}
            className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            Название компании / каталога (RU)
          </label>
          <input
            type="text"
            value={form.companyNameRu}
            onChange={(e) => setForm({ ...form, companyNameRu: e.target.value })}
            className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            Tashkilot logotipi (Rasm URL yoki SVG havolasi) — ixtiyoriy
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={form.logoUrl || ''}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              placeholder="https://... yoki /logo.svg (bo'sh qolsa standart E-Catalog belgisi chiqadi)"
              className="flex-1 rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
            />
            {form.logoUrl && (
              <div className="h-10 w-10 flex items-center justify-center rounded-xl border border-[#c4c7c5] bg-white p-1 shrink-0 overflow-hidden">
                <img src={form.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            Qisqa shior / izoh (UZ)
          </label>
          <input
            type="text"
            value={form.subtitleUz}
            onChange={(e) => setForm({ ...form, subtitleUz: e.target.value })}
            className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            Краткий подзаголовок (RU)
          </label>
          <input
            type="text"
            value={form.subtitleRu}
            onChange={(e) => setForm({ ...form, subtitleRu: e.target.value })}
            className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            Asosiy telefon
          </label>
          <input
            type="text"
            value={form.phonePrimary}
            onChange={(e) => setForm({ ...form, phonePrimary: e.target.value })}
            className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            Qo‘shimcha telefon
          </label>
          <input
            type="text"
            value={form.phoneSecondary}
            onChange={(e) => setForm({ ...form, phoneSecondary: e.target.value })}
            className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            Telegram username (@ belgisiz)
          </label>
          <input
            type="text"
            value={form.telegramUsername}
            onChange={(e) => setForm({ ...form, telegramUsername: e.target.value })}
            className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            Telegram kanal username (@ belgisiz)
          </label>
          <input
            type="text"
            value={form.telegramChannel}
            onChange={(e) => setForm({ ...form, telegramChannel: e.target.value })}
            className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            Ombor manzili (UZ)
          </label>
          <input
            type="text"
            value={form.addressUz}
            onChange={(e) => setForm({ ...form, addressUz: e.target.value })}
            className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            Адрес склада (RU)
          </label>
          <input
            type="text"
            value={form.addressRu}
            onChange={(e) => setForm({ ...form, addressRu: e.target.value })}
            className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            Ish vaqti (UZ)
          </label>
          <input
            type="text"
            value={form.workingHoursUz}
            onChange={(e) => setForm({ ...form, workingHoursUz: e.target.value })}
            className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            Режим работы (RU)
          </label>
          <input
            type="text"
            value={form.workingHoursRu}
            onChange={(e) => setForm({ ...form, workingHoursRu: e.target.value })}
            className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            Hamkorlik eslatmasi (UZ)
          </label>
          <textarea
            rows={3}
            value={form.minOrderNoteUz}
            onChange={(e) => setForm({ ...form, minOrderNoteUz: e.target.value })}
            className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            Примечание для партнёров (RU)
          </label>
          <textarea
            rows={3}
            value={form.minOrderNoteRu}
            onChange={(e) => setForm({ ...form, minOrderNoteRu: e.target.value })}
            className="w-full rounded-xl border border-[#c4c7c5] px-3 py-2 text-sm"
          />
        </div>
      </div>
    </form>

    {/* Dedicated Security & PIN Change Form */}
    <form
      onSubmit={handleChangePin}
      className="rounded-[24px] border border-[#c4c7c5]/60 bg-white p-6 space-y-5"
    >
      <div className="flex items-center gap-3 border-b border-[#e0e2ec] pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d3e3fd] text-[#041e49]">
          <M3Icon name="security" className="text-[20px]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#1f1f1f]">
            {t.admin.securityTitle}
          </h3>
          <p className="text-xs text-[#444746]">
            {t.admin.securitySubtitle}
          </p>
        </div>
      </div>

      {pinError && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs font-semibold text-rose-800">
          {pinError}
        </div>
      )}

      {pinSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-800">
          {pinSuccess}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            {t.admin.currentPin}
          </label>
          <input
            type="password"
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value)}
            placeholder="••••"
            required
            className="w-full rounded-xl border border-[#c4c7c5] bg-[#f8fafd] px-3 py-2 text-sm font-mono tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0b57d0]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            {t.admin.newPin}
          </label>
          <input
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="••••"
            required
            className="w-full rounded-xl border border-[#c4c7c5] bg-[#f8fafd] px-3 py-2 text-sm font-mono tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0b57d0]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#444746]">
            {t.admin.confirmNewPin}
          </label>
          <input
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            placeholder="••••"
            required
            className="w-full rounded-xl border border-[#c4c7c5] bg-[#f8fafd] px-3 py-2 text-sm font-mono tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0b57d0]"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={pinLoading || !currentPin || !newPin || !confirmPin}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#041e49] text-white hover:bg-[#0842a0] text-xs sm:text-sm font-semibold transition-all disabled:opacity-40 cursor-pointer shadow-2xs"
        >
          <M3Icon name="lock_reset" className="text-[18px]" />
          <span>{pinLoading ? t.admin.saving : t.admin.changePin}</span>
        </button>
      </div>
    </form>
  </div>
  );
}
