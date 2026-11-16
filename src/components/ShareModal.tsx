'use client';

import React, { useState, useEffect } from 'react';
import type { Product } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, formatPrice, l } from '@/lib/i18n';
import { M3Icon } from './m3/MaterialWebLoader';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ShareModal({ isOpen, onClose, product }: ShareModalProps) {
  const { lang, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setCopiedText(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const productName = l(lang, product.nameUz, product.nameRu);
  const description = l(lang, product.descriptionUz, product.descriptionRu);
  const unitName = l(lang, product.unitNameUz, product.unitNameRu);
  const packType = l(lang, product.packTypeUz, product.packTypeRu);
  const productUrl = `${origin || ''}/product/${product.slug}`;

  const shareText =
    lang === 'uz'
      ? `🔹 ${productName}\n\n📝 Tavsifi: ${description}\n\n💰 1 ${unitName} narxi: ${formatPrice(product.unitPrice, 'uz')}\n📦 1 ${packType} (${product.packQuantity} ${unitName}): ${formatPrice(product.packPrice, 'uz')}\n📍 Omborda bor: ${formatNumber(product.stockPacks)} ${packType}\n\n🔗 Batafsil ko‘rish va buyurtma berish:`
      : `🔹 ${productName}\n\n📝 Описание: ${description}\n\n💰 Цена за 1 ${unitName}: ${formatPrice(product.unitPrice, 'ru')}\n📦 1 ${packType} (${product.packQuantity} ${unitName}): ${formatPrice(product.packPrice, 'ru')}\n📍 На складе: ${formatNumber(product.stockPacks)} ${packType}\n\n🔗 Посмотреть и заказать:`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(productUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = productUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleCopyFullText = async () => {
    const fullText = `${shareText}\n${productUrl}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = fullText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: productUrl,
        });
        onClose();
        return;
      } catch {
        // User cancelled or unsupported
      }
    }
    // Fallback to copy link
    handleCopy();
  };

  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    productUrl
  )}&text=${encodeURIComponent(shareText)}`;

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText}\n\n${productUrl}`
  )}`;

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    productUrl
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-t-[28px] sm:rounded-[28px] bg-white p-5 sm:p-6 shadow-2xl border-t sm:border border-[#e0e2ec] max-h-[92vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-12 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-250 ease-out"
        role="dialog"
        aria-modal="true"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Swipe / Drag Handle Pill */}
        <div className="mx-auto -mt-2 mb-3 h-1.5 w-12 rounded-full bg-[#c4c7c5]/70 sm:hidden" />
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e0e2ec]">
          <div>
            <h3 className="text-lg font-semibold text-[#1f1f1f]">
              {t.product.shareTitle}
            </h3>
            <p className="text-xs text-[#444746] mt-0.5">
              {t.product.shareSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#444746] hover:bg-[#f3f6fc] transition-colors cursor-pointer"
            aria-label="Yopish"
          >
            <M3Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Product preview card */}
        <div className="mt-4 flex items-center gap-3.5 rounded-2xl bg-[#f8fafd] p-3 border border-[#e0e2ec]/80">
          <img
            src={product.images[0]}
            alt={productName}
            className="h-14 w-14 rounded-xl bg-white p-1 object-contain shrink-0 border border-[#e0e2ec]/60"
          />
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[10px] font-medium text-[#747775] bg-white px-1.5 py-0.5 rounded border border-[#e0e2ec]">
              {product.sku}
            </span>
            <div className="mt-1 font-medium text-sm text-[#1f1f1f] truncate">
              {productName}
            </div>
            <div className="mt-0.5 text-xs text-[#0b57d0] font-semibold">
              {formatPrice(product.packPrice, lang)}{' '}
              <span className="text-[11px] font-normal text-[#444746]">
                / 1 {packType}
              </span>
            </div>
          </div>
        </div>

        {/* Share buttons / app list */}
        <div className="mt-5">
          <div className="text-xs font-semibold text-[#444746] uppercase tracking-wider mb-3">
            {lang === 'uz' ? 'Ilovani tanlang' : 'Выберите приложение'}
          </div>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 text-center">
            {/* Telegram */}
            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="group flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-[#f3f6fc] transition-colors cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-sm transition-transform group-hover:scale-105">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .31z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-[#1f1f1f]">Telegram</span>
            </a>

            {/* WhatsApp */}
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="group flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-[#f3f6fc] transition-colors cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition-transform group-hover:scale-105">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2M12.05 20.16C10.57 20.16 9.12 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.05 20.16M16.57 14.33C16.32 14.21 15.11 13.61 14.88 13.53C14.66 13.44 14.5 13.4 14.33 13.65C14.17 13.9 13.71 14.44 13.57 14.6C13.43 14.77 13.29 14.79 13.04 14.66C12.79 14.54 11.99 14.28 11.04 13.43C10.3 12.77 9.8 11.96 9.66 11.71C9.51 11.46 9.64 11.33 9.77 11.2C9.88 11.09 10.02 10.91 10.15 10.77C10.27 10.62 10.31 10.52 10.39 10.35C10.48 10.19 10.43 10.04 10.37 9.92C10.31 9.8 9.82 8.59 9.61 8.1C9.41 7.62 9.21 7.69 9.06 7.68C8.92 7.67 8.75 7.67 8.59 7.67C8.42 7.67 8.15 7.73 7.92 7.98C7.7 8.23 7.06 8.83 7.06 10.05C7.06 11.27 7.95 12.45 8.07 12.61C8.2 12.78 9.81 15.26 12.28 16.32C12.87 16.57 13.33 16.72 13.69 16.84C14.28 17.03 14.82 17 15.25 16.94C15.73 16.87 16.72 16.34 16.93 15.75C17.13 15.17 17.13 14.67 17.07 14.56C17.01 14.46 16.82 14.4 16.57 14.33Z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-[#1f1f1f]">WhatsApp</span>
            </a>

            {/* Facebook */}
            <a
              href={facebookShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="group flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-[#f3f6fc] transition-colors cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm transition-transform group-hover:scale-105">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-[#1f1f1f]">Facebook</span>
            </a>

            {/* Native / Other Apps */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="group flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-[#f3f6fc] transition-colors cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0b57d0] text-white shadow-sm transition-transform group-hover:scale-105">
                <M3Icon name="share" className="text-[24px]" />
              </div>
              <span className="text-xs font-medium text-[#1f1f1f]">
                {t.product.shareMore}
              </span>
            </button>
          </div>
        </div>

        {/* Copy Link Row */}
        <div className="mt-5 pt-4 border-t border-[#e0e2ec]">
          <div className="text-xs font-semibold text-[#444746] mb-2">
            {lang === 'uz' ? 'To‘g‘ridan-to‘g‘ri havola' : 'Прямая ссылка'}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 flex items-center rounded-full bg-[#f3f6fc] px-3.5 py-2 border border-[#c4c7c5]/60">
              <M3Icon name="link" className="text-[#444746] text-[18px] mr-2 shrink-0" />
              <input
                type="text"
                readOnly
                value={productUrl}
                className="w-full bg-transparent text-xs text-[#1f1f1f] outline-none select-all font-mono"
              />
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#c2e7ff] text-[#001d35] hover:bg-[#b0dcf5]'
              }`}
            >
              <M3Icon
                name={copied ? 'check' : 'content_copy'}
                className="text-[16px]"
              />
              <span>{copied ? t.product.shareCopied : t.product.shareCopy}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2.5">
            <button
              type="button"
              onClick={handleCopyFullText}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                copiedText
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-400 font-semibold'
                  : 'bg-[#f8fafd] text-[#444746] border-[#c4c7c5]/70 hover:bg-[#edf2fa] hover:text-[#1f1f1f]'
              }`}
            >
              <M3Icon name={copiedText ? 'check' : 'description'} className="text-[16px]" />
              <span>
                {copiedText
                  ? (lang === 'uz' ? 'Tavsif va narx nusxalandi!' : 'Описание и цены скопированы!')
                  : (lang === 'uz' ? 'To‘liq matnni nusxalash (tavsif + narx)' : 'Скопировать текст (описание + цены)')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
