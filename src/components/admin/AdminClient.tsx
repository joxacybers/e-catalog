'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CatalogData } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { M3Icon } from '../m3/MaterialWebLoader';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminSettingsTab } from './AdminSettingsTab';

type AdminTab = 'quick' | 'products' | 'categories' | 'settings';

const SESSION_KEY = 'wholesale_admin_unlocked';

export function AdminClient({ initialData }: { initialData: CatalogData }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [data, setData] = useState<CatalogData>(initialData);
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('quick');

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === '1') {
        setUnlocked(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

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

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === (data.settings.adminPin || '1234')) {
      setUnlocked(true);
      setPinError(false);
      try {
        window.sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // Ignore storage errors
      }
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setUnlocked(false);
    setPinInput('');
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <form
          onSubmit={handleUnlock}
          className="rounded-[28px] border border-[#c4c7c5]/60 bg-white p-8 text-center space-y-5"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d3e3fd] text-[#041e49]">
            <M3Icon name="lock" className="text-[28px]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#1f1f1f]">{t.admin.pinTitle}</h1>
            <p className="mt-1.5 text-xs text-[#444746]">{t.admin.pinSubtitle}</p>
          </div>
          <div>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              placeholder={t.admin.pinPlaceholder}
              autoFocus
              className="w-full rounded-2xl border border-[#c4c7c5] bg-[#f3f6fc] px-4 py-3 text-center text-lg font-mono tracking-widest focus:border-[#0b57d0] focus:bg-white focus:outline-none"
            />
            {pinError && (
              <p className="mt-2 text-xs font-medium text-rose-700">{t.admin.pinError}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <M3Icon name="login" className="text-[18px]" />
            <span>{t.admin.pinSubmit}</span>
          </button>
        </form>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; iconName: string }[] = [
    { id: 'quick', label: t.admin.tabQuick, iconName: 'speed' },
    { id: 'products', label: t.admin.tabProducts, iconName: 'inventory_2' },
    { id: 'categories', label: t.admin.tabCategories, iconName: 'category' },
    { id: 'settings', label: t.admin.tabSettings, iconName: 'settings' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-[#edf2fa] px-5 py-4 sm:px-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#1f1f1f] sm:text-2xl">
            {t.admin.title}
          </h1>
          <p className="mt-1 text-xs text-[#444746] sm:text-sm">{t.admin.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#c4c7c5] bg-white text-[#1f1f1f] hover:bg-[#f3f6fc] text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
        >
          <M3Icon name="logout" className="text-[18px]" />
          <span>{t.admin.logout}</span>
        </button>
      </div>

      {/* M3 Navigation Tabs */}
      <div className="flex flex-wrap gap-2 rounded-full border border-[#c4c7c5]/60 bg-white p-1.5">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex flex-1 min-w-[150px] items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
                active
                  ? 'bg-[#c2e7ff] text-[#001d35]'
                  : 'text-[#444746] hover:bg-[#edf2fa] hover:text-[#1f1f1f]'
              }`}
            >
              <M3Icon name={tab.iconName} className="text-[18px]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
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
  );
}
