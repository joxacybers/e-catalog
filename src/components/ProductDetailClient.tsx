'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import type { Category, Product, SiteSettings } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, formatPrice, interpolate, l } from '@/lib/i18n';
import {
  buildProductTelegramMessage,
  buildTelegramUrl,
  formatPhoneHref,
  getStockState,
} from '@/lib/helpers';
import { M3Icon } from './m3/MaterialWebLoader';
import { ProductCard } from './ProductCard';
import { ShareModal } from './ShareModal';

export function ProductDetailClient({
  product,
  category,
  similarProducts,
  settings,
}: {
  product: Product;
  category?: Category;
  similarProducts: Product[];
  settings: Omit<SiteSettings, 'adminPin'>;
}) {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const name = l(lang, product.nameUz, product.nameRu);
  const description = l(lang, product.descriptionUz, product.descriptionRu);
  const unitName = l(lang, product.unitNameUz, product.unitNameRu);
  const packType = l(lang, product.packTypeUz, product.packTypeRu);
  const stockState = getStockState(product);
  const totalUnitsInStock = product.stockPacks * product.packQuantity;

  const directTelegramHref = buildTelegramUrl(
    settings,
    buildProductTelegramMessage(product, lang)
  );

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 space-y-6 sm:space-y-8 pb-28 sm:pb-24 w-full min-w-0 max-w-full overflow-hidden">
      {/* Back Button */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push('/catalog')}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs sm:text-sm font-semibold text-[#0b57d0] hover:bg-[#edf2fa] active:scale-95 transition-all cursor-pointer"
        >
          <M3Icon name="arrow_back" className="text-[18px]" />
          <span>{t.product.backToCatalog}</span>
        </button>

        <span className="font-mono text-xs text-[#444746] bg-[#f3f6fc] px-2.5 py-1 rounded-full border border-[#e0e2ec]">
          {t.product.skuLabel} <strong className="text-[#1f1f1f]">{product.sku}</strong>
        </span>
      </div>

      {/* Single Clean M3 Surface Card */}
      <div className="rounded-[24px] sm:rounded-[28px] border border-[#c4c7c5]/60 bg-white p-4 sm:p-8 shadow-2xs w-full min-w-0 max-w-full overflow-hidden">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-12">
          {/* Left: Product Image */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex aspect-[4/3] items-center justify-center rounded-[18px] sm:rounded-[20px] bg-[#f3f6fc] p-4 sm:p-6">
              <img
                src={product.images[activeImageIdx] || product.images[0]}
                alt={name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl border p-1 cursor-pointer transition-all active:scale-95 ${
                      activeImageIdx === idx
                        ? 'border-[#0b57d0] bg-[#edf2fa] shadow-2xs'
                        : 'border-[#c4c7c5]'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info, Stock, Prices, Specs & Actions */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <md-assist-chip
                  label={l(lang, category.nameUz, category.nameRu)}
                  onClick={() =>
                    router.push(`/catalog?category=${encodeURIComponent(category.id)}`)
                  }
                />
              )}
              <span className="rounded-lg bg-[#f3f6fc] px-2.5 py-1 font-mono text-xs text-[#444746]">
                {product.sku}
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#1f1f1f]">
                {name}
              </h1>
              {description && (
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#444746]">{description}</p>
              )}
            </div>

            {/* M3 Stock Banner */}
            <div>
              {stockState === 'in_stock' && (
                <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-100/90 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-emerald-950">
                  <M3Icon name="check_circle" className="text-emerald-700 text-[18px]" />
                  <span>
                    {t.product.stockLeft}{' '}
                    <strong>
                      {formatNumber(product.stockPacks)} {packType}
                    </strong>{' '}
                    ({t.product.totalUnitsWord} {formatNumber(totalUnitsInStock)} {unitName})
                  </span>
                </div>
              )}

              {stockState === 'low_stock' && (
                <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-100/90 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-amber-950">
                  <M3Icon name="warning" className="text-amber-700 text-[18px]" />
                  <span>
                    {t.product.lowStock}:{' '}
                    <strong>
                      {formatNumber(product.stockPacks)} {packType}
                    </strong>{' '}
                    ({formatNumber(totalUnitsInStock)} {unitName})
                  </span>
                </div>
              )}

              {stockState === 'out_of_stock' && (
                <div className="inline-flex items-center gap-2 rounded-2xl bg-rose-100/90 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-rose-950">
                  <M3Icon name="cancel" className="text-rose-700 text-[18px]" />
                  <span>{t.product.outOfStock}</span>
                </div>
              )}
            </div>

            {/* Side-by-side M3 Tonal Price Cards */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              <div className="rounded-[16px] sm:rounded-[20px] bg-[#f3f6fc] p-3 sm:p-4">
                <div className="text-[11px] sm:text-xs font-medium text-[#444746]">
                  {interpolate(t.product.unitPriceLabel, { unit: unitName })}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-lg sm:text-2xl font-bold text-[#1f1f1f]">
                    {formatPrice(product.unitPrice, lang)}
                  </span>
                  {product.oldUnitPrice && product.oldUnitPrice > product.unitPrice && (
                    <span className="text-xs sm:text-sm text-[#747775] line-through">
                      {formatPrice(product.oldUnitPrice, lang)}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-[16px] sm:rounded-[20px] bg-[#d3e3fd]/60 p-3 sm:p-4">
                <div className="text-[11px] sm:text-xs font-semibold text-[#041e49]">
                  {interpolate(t.product.packPriceLabel, {
                    pack: packType,
                    qty: product.packQuantity,
                    unit: unitName,
                  })}
                </div>
                <div className="mt-1 text-lg sm:text-2xl font-bold text-[#0b57d0]">
                  {formatPrice(product.packPrice, lang)}
                </div>
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex flex-wrap gap-2.5 sm:gap-3 pt-1">
              <a
                href={directTelegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] active:scale-95 text-sm font-semibold transition-all shadow-2xs cursor-pointer"
              >
                <M3Icon name="send" className="text-[18px]" />
                <span>{t.product.askTelegram}</span>
              </a>

              <a
                href={formatPhoneHref(settings.phonePrimary)}
                className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-[#c2e7ff] text-[#001d35] hover:bg-[#b0dcf5] active:scale-95 text-sm font-semibold transition-all shadow-2xs cursor-pointer"
              >
                <M3Icon name="call" className="text-[18px]" />
                <span>{t.product.callNow}: {settings.phonePrimary}</span>
              </a>

              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-[#f3f6fc] text-[#1f1f1f] hover:bg-[#e0e2ec] hover:text-[#0b57d0] active:scale-95 text-sm font-semibold transition-all shadow-2xs cursor-pointer border border-[#c4c7c5]/60 shrink-0"
              >
                <M3Icon name="share" className="text-[18px]" />
                <span>{t.product.shareBtn}</span>
              </button>
            </div>

            {/* Clean M3 Specs List with <md-divider> */}
            <div className="pt-2">
              <h2 className="mb-2 text-sm font-semibold text-[#1f1f1f]">
                {t.product.specsTitle}
              </h2>
              <div className="rounded-[20px] bg-[#f8fafd] px-4 py-1">
                <div className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-[#444746]">{t.product.packLabel}</span>
                  <span className="font-medium text-[#1f1f1f]">
                    1 {packType} = {product.packQuantity} {unitName}
                  </span>
                </div>
                {product.specs.map((spec, idx) => (
                  <React.Fragment key={idx}>
                    <md-divider />
                    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
                      <span className="text-[#444746]">
                        {l(lang, spec.labelUz, spec.labelRu)}
                      </span>
                      <span className="text-right font-medium text-[#1f1f1f]">
                        {l(lang, spec.valueUz, spec.valueRu)}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[#1f1f1f]">
            {t.product.similarTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {similarProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                category={category}
                settings={settings}
              />
            ))}
          </div>
        </section>
      )}

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        product={product}
        settings={settings}
      />

      {/* Sticky Floating Action Bar (Pinned to viewport bottom on both mobile and PC) */}
      {mounted &&
        createPortal(
          <div
            className="no-print fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#c4c7c5]/60 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] transition-all duration-200"
            style={{
              paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)',
            }}
          >
            <div className="mx-auto max-w-6xl px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 sm:gap-4">
              {/* Product preview & price info */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={name}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-contain bg-[#f3f6fc] p-1 border border-[#e0e2ec] shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-[#1f1f1f] truncate max-w-[130px] xs:max-w-[200px] sm:max-w-xs md:max-w-md">
                    {name}
                  </div>
                  <div className="flex items-baseline gap-1.5 text-xs">
                    <span className="font-bold text-[#0b57d0]">
                      {formatPrice(product.packPrice, lang)}
                    </span>
                    <span className="text-[11px] text-[#747775] truncate hidden sm:inline">
                      / 1 {packType} ({product.packQuantity} {unitName})
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Telegramdan so'rash, Telefon, Ulashish */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                {/* Telegram ask / order button */}
                <a
                  href={directTelegramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-11 px-3.5 sm:px-5 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] active:scale-95 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
                >
                  <M3Icon name="send" className="text-[16px] sm:text-[18px]" />
                  <span className="truncate">{t.product.askTelegram}</span>
                </a>

                {/* Call phone button */}
                <a
                  href={formatPhoneHref(settings.phonePrimary)}
                  className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-11 px-3 sm:px-4 rounded-full bg-[#c2e7ff] text-[#001d35] hover:bg-[#b0dcf5] active:scale-95 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer shrink-0"
                  title={`${t.product.callNow}: ${settings.phonePrimary}`}
                  aria-label={t.product.callNow}
                >
                  <M3Icon name="call" className="text-[17px] sm:text-[18px]" />
                  <span className="hidden md:inline font-mono">{settings.phonePrimary}</span>
                </a>

                {/* Share button */}
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-11 px-3 sm:px-4 rounded-full bg-[#f3f6fc] text-[#1f1f1f] hover:bg-[#e0e2ec] hover:text-[#0b57d0] border border-[#c4c7c5]/70 active:scale-95 text-xs sm:text-sm font-semibold transition-all shadow-2xs shrink-0 cursor-pointer"
                  title={t.product.shareBtn}
                  aria-label={t.product.shareBtn}
                >
                  <M3Icon name="share" className="text-[17px] sm:text-[18px]" />
                  <span className="hidden lg:inline">{t.product.shareBtn}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
