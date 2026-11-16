'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SiteSettings } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { buildTelegramUrl } from '@/lib/helpers';
import { M3Icon } from './m3/MaterialWebLoader';

export function MobileBottomNav({
  settings,
}: {
  settings: Omit<SiteSettings, 'adminPin'>;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();

  // If on admin or product detail with its own fixed dock, we adjust or show
  const isProductDetail = pathname.startsWith('/product/');

  // If on product detail page, we don't show the generic bottom nav so it doesn't collide with the product action bar
  if (isProductDetail) return null;

  const isCatalogActive = pathname === '/' || pathname.startsWith('/catalog');
  const isPriceListActive = pathname.startsWith('/price-list');
  const isContactActive = pathname.startsWith('/contact');

  const telegramHref = buildTelegramUrl(settings);

  return (
    <nav
      aria-label="Mobil menyu"
      className="no-print fixed bottom-0 left-0 right-0 z-40 block sm:hidden bg-white/95 backdrop-blur-md border-t border-[#e0e2ec] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      <div className="grid grid-cols-4 items-center px-2 py-1.5 text-center">
        {/* Katalog */}
        <Link
          href="/"
          prefetch={true}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all duration-150 active:scale-95 ${
            isCatalogActive
              ? 'text-[#041e49]'
              : 'text-[#444746] hover:text-[#1f1f1f]'
          }`}
        >
          <div
            className={`flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200 ${
              isCatalogActive
                ? 'bg-[#c2e7ff] text-[#001d35]'
                : 'bg-transparent text-[#444746]'
            }`}
          >
            <M3Icon name="inventory_2" className="text-[20px]" />
          </div>
          <span className={`text-[10px] ${isCatalogActive ? 'font-bold' : 'font-medium'}`}>
            {t.nav.catalog}
          </span>
        </Link>

        {/* Prays-list */}
        <Link
          href="/price-list"
          prefetch={true}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all duration-150 active:scale-95 ${
            isPriceListActive
              ? 'text-[#041e49]'
              : 'text-[#444746] hover:text-[#1f1f1f]'
          }`}
        >
          <div
            className={`flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200 ${
              isPriceListActive
                ? 'bg-[#c2e7ff] text-[#001d35]'
                : 'bg-transparent text-[#444746]'
            }`}
          >
            <M3Icon name="table_chart" className="text-[20px]" />
          </div>
          <span className={`text-[10px] ${isPriceListActive ? 'font-bold' : 'font-medium'}`}>
            {t.nav.priceList}
          </span>
        </Link>

        {/* Aloqa */}
        <Link
          href="/contact"
          prefetch={true}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all duration-150 active:scale-95 ${
            isContactActive
              ? 'text-[#041e49]'
              : 'text-[#444746] hover:text-[#1f1f1f]'
          }`}
        >
          <div
            className={`flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200 ${
              isContactActive
                ? 'bg-[#c2e7ff] text-[#001d35]'
                : 'bg-transparent text-[#444746]'
            }`}
          >
            <M3Icon name="call" className="text-[20px]" />
          </div>
          <span className={`text-[10px] ${isContactActive ? 'font-bold' : 'font-medium'}`}>
            {t.nav.contact}
          </span>
        </Link>

        {/* Telegram */}
        <a
          href={telegramHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-[#0b57d0] transition-all duration-150 active:scale-95"
        >
          <div className="flex h-8 w-12 items-center justify-center rounded-full bg-[#e8f0fe] text-[#0b57d0]">
            <M3Icon name="send" className="text-[19px]" />
          </div>
          <span className="text-[10px] font-semibold">Telegram</span>
        </a>
      </div>
    </nav>
  );
}
