'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Category, Product, SiteSettings } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, formatPrice, interpolate, l } from '@/lib/i18n';
import {
  buildProductTelegramMessage,
  buildTelegramUrl,
  getStockState,
} from '@/lib/helpers';
import { M3Icon } from './m3/MaterialWebLoader';
import { ShareModal } from './ShareModal';

export function ProductCard({
  product,
  category,
  settings,
}: {
  product: Product;
  category?: Category;
  settings: Omit<SiteSettings, 'adminPin'>;
}) {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const name = l(lang, product.nameUz, product.nameRu);
  const unitName = l(lang, product.unitNameUz, product.unitNameRu);
  const packType = l(lang, product.packTypeUz, product.packTypeRu);
  const stockState = getStockState(product);
  const totalUnitsInStock = product.stockPacks * product.packQuantity;

  const telegramHref = buildTelegramUrl(
    settings,
    buildProductTelegramMessage(product, lang)
  );

  const specsLine = product.specs
    .slice(0, 3)
    .map((s) => l(lang, s.valueUz, s.valueRu))
    .join(' • ');

  return (
    <div className="group flex flex-col w-full min-w-0 max-w-full overflow-hidden rounded-[20px] sm:rounded-[24px] border border-[#c4c7c5]/60 bg-white p-3 sm:p-3.5 transition-all duration-200 hover:shadow-md">
      {/* Top M3 Tonal Image Container */}
      <Link
        href={`/product/${product.slug}`}
        prefetch={true}
        className="relative block aspect-[4/3] w-full min-w-0 overflow-hidden rounded-[16px] sm:rounded-[18px] bg-[#f3f6fc] p-2.5 sm:p-3"
      >
        <img
          src={product.images[0]}
          alt={name}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        <span className="absolute left-2.5 top-2.5 max-w-[45%] truncate rounded-full bg-white/95 backdrop-blur-xs px-2 sm:px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] font-medium text-[#444746] ring-1 ring-[#c4c7c5]/60">
          {product.sku}
        </span>

        {stockState === 'in_stock' && (
          <span className="absolute right-2.5 top-2.5 max-w-[50%] truncate inline-flex items-center gap-1 rounded-full bg-emerald-100/95 backdrop-blur-xs px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-900">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
            <span className="truncate">{formatNumber(product.stockPacks)} {packType}</span>
          </span>
        )}
        {stockState === 'low_stock' && (
          <span className="absolute right-2.5 top-2.5 max-w-[50%] truncate inline-flex items-center gap-1 rounded-full bg-amber-100/95 backdrop-blur-xs px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-900">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0" />
            <span className="truncate">{formatNumber(product.stockPacks)} {packType}</span>
          </span>
        )}
        {stockState === 'out_of_stock' && (
          <span className="absolute right-2.5 top-2.5 max-w-[50%] truncate inline-flex items-center gap-1 rounded-full bg-rose-100/95 backdrop-blur-xs px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-rose-900">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 shrink-0" />
            <span className="truncate">{t.product.outOfStock}</span>
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShareOpen(true);
          }}
          className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#444746] hover:bg-white hover:text-[#0b57d0] active:scale-90 shadow-sm backdrop-blur-xs transition-all cursor-pointer"
          title={t.product.shareBtn}
          aria-label={t.product.shareBtn}
        >
          <M3Icon name="share" className="text-[16px]" />
        </button>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col w-full min-w-0 px-0.5 sm:px-1 pt-2.5 sm:pt-3">
        {category && (
          <div className="mb-0.5 sm:mb-1 text-[11px] font-medium text-[#0b57d0] truncate">
            {l(lang, category.nameUz, category.nameRu)}
          </div>
        )}

        <Link
          href={`/product/${product.slug}`}
          prefetch={true}
          className="line-clamp-2 text-sm sm:text-base font-semibold leading-snug text-[#1f1f1f] hover:text-[#0b57d0] transition-colors break-words"
        >
          {name}
        </Link>

        {specsLine && (
          <p className="mt-1 line-clamp-1 text-[11px] sm:text-xs text-[#444746] truncate">{specsLine}</p>
        )}

        {/* Packaging & Exact Stock Line */}
        <div className="mt-2 text-[11px] sm:text-xs text-[#444746] flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span>1 {packType} = <strong className="text-[#1f1f1f]">{product.packQuantity} {unitName}</strong></span>
          <span className="text-[#747775]">•</span>
          {stockState === 'out_of_stock' ? (
            <span className="font-medium text-rose-700">{t.product.outOfStock}</span>
          ) : (
            <span className="truncate">
              {t.product.stockLeft}{' '}
              <strong className="text-emerald-800">
                {formatNumber(product.stockPacks)} {packType}
              </strong>
            </span>
          )}
        </div>

        {/* M3 Tonal Price Box */}
        <div className="mt-2.5 sm:mt-3 rounded-[14px] sm:rounded-[16px] bg-[#f3f6fc] p-2.5 sm:p-3 w-full min-w-0 space-y-1.5">
          <div className="flex items-baseline justify-between gap-1.5 text-[11px] sm:text-xs min-w-0">
            <span className="text-[#444746] truncate min-w-0 flex-1">
              {interpolate(t.product.unitPriceLabel, { unit: unitName })}:
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#1f1f1f] shrink-0 whitespace-nowrap">
              {formatPrice(product.unitPrice, lang)}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-1.5 text-[11px] sm:text-xs min-w-0">
            <span className="text-[#444746] truncate min-w-0 flex-1">
              1 {packType} ({product.packQuantity} {unitName}):
            </span>
            <span className="text-sm sm:text-base font-bold text-[#0b57d0] shrink-0 whitespace-nowrap">
              {formatPrice(product.packPrice, lang)}
            </span>
          </div>
        </div>

        {/* Material Design 3 Action Buttons */}
        <div className="mt-3 flex items-center gap-1.5 pt-1 w-full min-w-0">
          <button
            type="button"
            onClick={() => router.push(`/product/${product.slug}`)}
            className="flex-1 min-w-0 inline-flex items-center justify-center h-9 sm:h-10 px-2 sm:px-3 rounded-full bg-[#c2e7ff] text-[#001d35] hover:bg-[#b0dcf5] active:scale-95 text-xs font-semibold transition-all cursor-pointer shadow-2xs truncate"
          >
            {t.product.detailsBtn}
          </button>

          <a
            href={telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 h-9 sm:h-10 px-3 sm:px-3.5 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] active:scale-95 text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <M3Icon name="send" className="text-[14px] sm:text-[15px]" />
            <span>Telegram</span>
          </a>

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="inline-flex items-center justify-center h-9 sm:h-10 w-9 sm:w-10 rounded-full bg-[#f3f6fc] text-[#444746] hover:bg-[#d3e3fd] hover:text-[#0b57d0] active:scale-95 transition-all cursor-pointer shadow-2xs shrink-0 border border-[#e0e2ec]/80"
            title={t.product.shareBtn}
            aria-label={t.product.shareBtn}
          >
            <M3Icon name="share" className="text-[16px] sm:text-[17px]" />
          </button>
        </div>

        <ShareModal
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          product={product}
        />
      </div>
    </div>
  );
}
