'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CatalogData } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, l } from '@/lib/i18n';
import { getStockState } from '@/lib/helpers';
import { M3Icon } from '../m3/MaterialWebLoader';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminSettingsTab } from './AdminSettingsTab';

type AdminTab = 'quick' | 'products' | 'categories' | 'settings';

export function AdminClient({
  initialData,
  initialAuth = false,
}: {
  initialData: CatalogData;
  initialAuth?: boolean;
}) {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const [data, setData] = useState<CatalogData>(initialData);
  const [unlocked, setUnlocked] = useState(initialAuth);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('quick');

  const refreshData = async () => {
    const [catRes, setRes] = await Promise.all([
      fetch('/api/catalog', { cache: 'no-store' }),
      fetch('/api/settings', { cache: 'no-store' }),
    ]);
    if (catRes.ok && setRes.ok) {
      const catJson = await catRes.json();
      const setJson = await setRes.json();
      setData({
        categories: catJson.categories,
        products: catJson.products,
        settings: setJson.settings,
      });
      router.refresh();
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    setLoggingIn(true);
    setPinError(false);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.success) {
        setUnlocked(true);
        setPinError(false);
        setPinInput('');
        await refreshData();
      } else {
        setPinError(true);
      }
    } catch {
      setPinError(true);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUnlocked(false);
      setPinInput('');
      router.refresh();
    }
  };

  // Stats calculation
  const stats = React.useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    for (const p of data.products) {
      const state = getStockState(p);
      if (state === 'in_stock') inStock += 1;
      else if (state === 'low_stock') lowStock += 1;
      else outOfStock += 1;
    }
    return { total: data.products.length, inStock, lowStock, outOfStock };
  }, [data.products]);

  // Login Screen (Enterprise & Clean)
  if (!unlocked) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm rounded-[32px] border border-[#c4c7c5]/60 bg-white p-7 sm:p-8 shadow-xl">
          <form onSubmit={handleUnlock} className="space-y-6 text-center">
            {/* Shield Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#d3e3fd] text-[#041e49] shadow-xs">
              <M3Icon name="lock" className="text-[32px]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f6fc] px-3 py-1 text-[11px] font-semibold text-[#444746] mb-2 border border-[#e0e2ec]">
                <M3Icon name="shield" className="text-[14px] text-[#0b57d0]" />
                <span>{l(lang, data.settings.companyNameUz, data.settings.companyNameRu) || 'E-Catalog'}</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#1f1f1f]">
                {t.admin.pinTitle}
              </h1>
              <p className="mt-1 text-xs text-[#444746] leading-relaxed">
                {t.admin.pinSubtitle}
              </p>
            </div>

            <div className="space-y-2 text-left">
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="••••••••"
                  autoFocus
                  required
                  className="w-full rounded-2xl border border-[#c4c7c5] bg-[#f8fafd] px-4 py-3 text-center text-lg font-mono tracking-widest text-[#1f1f1f] focus:border-[#0b57d0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0b57d0]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-[#747775] hover:bg-[#edf2fa] cursor-pointer"
                  title={showPin ? 'Yashirish' : 'Ko‘rsatish'}
                >
                  <M3Icon name={showPin ? 'visibility_off' : 'visibility'} className="text-[18px]" />
                </button>
              </div>

              {pinError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-800 text-center animate-in fade-in">
                  {t.admin.pinError}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loggingIn || !pinInput.trim()}
              className="w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] active:scale-98 text-sm font-semibold transition-all disabled:opacity-40 cursor-pointer shadow-2xs"
            >
              {loggingIn ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <M3Icon name="login" className="text-[18px]" />
                  <span>{t.admin.pinSubmit}</span>
                </>
              )}
            </button>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#747775] hover:text-[#0b57d0] transition-colors"
              >
                <M3Icon name="arrow_back" className="text-[16px]" />
                <span>{t.product.backToCatalog}</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; iconName: string; count?: number }[] = [
    { id: 'quick', label: t.admin.tabQuick, iconName: 'speed', count: stats.total },
    { id: 'products', label: t.admin.tabProducts, iconName: 'inventory_2', count: stats.total },
    { id: 'categories', label: t.admin.tabCategories, iconName: 'category', count: data.categories.length },
    { id: 'settings', label: t.admin.tabSettings, iconName: 'settings' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 space-y-5 pb-24 sm:pb-12">
      {/* Dedicated Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[24px] bg-[#edf2fa] p-4 sm:px-6 sm:py-5 border border-[#e0e2ec]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0b57d0] text-white shadow-xs">
            <M3Icon name="admin_panel_settings" className="text-[26px]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1f1f1f]">
                {t.admin.title}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Faol
              </span>
            </div>
            <p className="text-xs text-[#444746] mt-0.5">
              {l(lang, data.settings.companyNameUz, data.settings.companyNameRu)} • {t.admin.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-3.5 sm:px-4 rounded-full bg-white border border-[#c4c7c5] text-[#1f1f1f] hover:bg-[#f3f6fc] active:scale-95 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <M3Icon name="open_in_new" className="text-[16px] text-[#0b57d0]" />
            <span>{t.admin.backToSite}</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-3.5 sm:px-4 rounded-full bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 active:scale-95 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <M3Icon name="logout" className="text-[16px]" />
            <span>{t.admin.logout}</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="rounded-[18px] bg-white border border-[#c4c7c5]/60 p-3 sm:p-4">
          <div className="text-[11px] text-[#444746] font-medium">{t.admin.statTotal}</div>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-[#1f1f1f]">{stats.total}</div>
        </div>
        <div className="rounded-[18px] bg-white border border-[#c4c7c5]/60 p-3 sm:p-4">
          <div className="text-[11px] text-emerald-800 font-medium">{t.admin.statInStock}</div>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-emerald-700">{stats.inStock}</div>
        </div>
        <div className="rounded-[18px] bg-white border border-[#c4c7c5]/60 p-3 sm:p-4">
          <div className="text-[11px] text-amber-800 font-medium">{t.admin.statLowStock}</div>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-amber-700">{stats.lowStock}</div>
        </div>
        <div className="rounded-[18px] bg-white border border-[#c4c7c5]/60 p-3 sm:p-4">
          <div className="text-[11px] text-rose-800 font-medium">{t.admin.statOutOfStock}</div>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-rose-700">{stats.outOfStock}</div>
        </div>
      </div>

      {/* M3 Segmented Navigation Tabs */}
      <div className="overflow-x-auto no-scrollbar pb-1">
        <div className="inline-flex min-w-full sm:min-w-0 rounded-full border border-[#c4c7c5]/60 bg-white p-1 shadow-2xs gap-1">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-98 ${
                  active
                    ? 'bg-[#c2e7ff] text-[#001d35] shadow-xs'
                    : 'text-[#444746] hover:bg-[#edf2fa] hover:text-[#1f1f1f]'
                }`}
              >
                <M3Icon name={tab.iconName} className="text-[18px]" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      active ? 'bg-white/80 text-[#001d35]' : 'bg-[#f3f6fc] text-[#747775]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-opacity duration-150">
        {activeTab === 'quick' && (
          <AdminDashboardTab
            products={data.products}
            categories={data.categories}
            onUpdated={refreshData}
          />
        )}
        {activeTab === 'products' && (
          <AdminProductsTab
            products={data.products}
            categories={data.categories}
            onUpdated={refreshData}
          />
        )}
        {activeTab === 'categories' && (
          <AdminCategoriesTab
            categories={data.categories}
            products={data.products}
            onUpdated={refreshData}
          />
        )}
        {activeTab === 'settings' && (
          <AdminSettingsTab settings={data.settings} onUpdated={refreshData} />
        )}
      </div>
    </div>
  );
}
