'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { formatNumber, formatPrice } from '@/lib/i18n';
import { M3Icon } from './m3/MaterialWebLoader';

export function FloatingCartButton() {
  const { lang } = useLanguage();
  const { items, totalPacksCount, totalSum, openCart } = useCart();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || items.length === 0) return null;

  // If on admin or product detail (which has its own floating bar), we tuck it to the bottom-right or adjust position
  const isProductDetail = pathname.startsWith('/product/');
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return null;

  return createPortal(
    <div
      className={`no-print fixed z-40 transition-all duration-300 ${
        isProductDetail
          ? 'bottom-20 right-4 sm:bottom-20 sm:right-6'
          : 'bottom-20 right-4 sm:bottom-6 sm:right-6'
      }`}
    >
      <button
        type="button"
        onClick={openCart}
        className="group flex items-center gap-2.5 rounded-full bg-[#0b57d0] pl-3.5 pr-4 py-2.5 text-white shadow-lg hover:bg-[#0842a0] hover:shadow-xl active:scale-95 transition-all cursor-pointer border border-white/20 animate-in slide-in-from-bottom-4 duration-200"
        aria-label="Savatni ochish"
      >
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
          <M3Icon name="shopping_cart" className="text-[20px]" />
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-[#0b57d0]">
            {items.length}
          </span>
        </div>

        <div className="text-left leading-tight">
          <div className="text-[11px] font-medium text-white/90">
            {formatNumber(totalPacksCount)} {lang === 'uz' ? 'qadoq' : 'упак.'}
          </div>
          <div className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">
            {formatPrice(totalSum, lang)}
          </div>
        </div>

        <M3Icon
          name="arrow_forward"
          className="text-[16px] text-white/80 transition-transform group-hover:translate-x-0.5"
        />
      </button>
    </div>,
    document.body
  );
}
