'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { SiteSettings } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { formatNumber, formatPrice, l } from '@/lib/i18n';
import { buildTelegramUrl } from '@/lib/helpers';
import { M3Icon } from './m3/MaterialWebLoader';
import { generateInvoiceImage, formatOrderTelegramText } from '@/lib/invoiceCanvas';

export function OrderCartModal({
  settings,
}: {
  settings: Omit<SiteSettings, 'adminPin'>;
}) {
  const { lang, t } = useLanguage();
  const {
    items,
    updatePacks,
    removeItem,
    clearCart,
    totalPacksCount,
    totalUnitsCount,
    totalSum,
    isCartOpen,
    closeCart,
  } = useCart();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'image'>('table');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Generate unique order number for current session
  const orderNumber = useMemo(() => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${randomSuffix}`;
  }, [isCartOpen]);

  const orderDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [isCartOpen]);

  // Generate canvas invoice image when cart changes or tab switched
  useEffect(() => {
    if (!isCartOpen || items.length === 0) return;
    setIsGeneratingImg(true);
    generateInvoiceImage(items, settings, lang, {
      orderNumber,
      orderDate,
      customerName,
      customerPhone,
      note,
    })
      .then((url) => {
        setImageUrl(url);
        setIsGeneratingImg(false);
      })
      .catch(() => setIsGeneratingImg(false));
  }, [isCartOpen, items, lang, orderNumber, orderDate, customerName, customerPhone, note, settings]);

  if (!isCartOpen || !mounted) return null;

  const orderTelegramMessage = formatOrderTelegramText(items, settings, lang, {
    orderNumber,
    orderDate,
    customerName,
    customerPhone,
    note,
  });

  const telegramOrderHref = buildTelegramUrl(settings, orderTelegramMessage);

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `buyurtma-${orderNumber}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSendToTelegram = () => {
    window.open(telegramOrderHref, '_blank', 'noopener,noreferrer');
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeCart}
    >
      <div
        className="relative w-full max-w-3xl rounded-t-[28px] sm:rounded-[28px] bg-white shadow-2xl border-t sm:border border-[#e0e2ec] max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-12 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-250 ease-out"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-[#c4c7c5]/70 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#e0e2ec] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#c2e7ff] text-[#001d35]">
              <M3Icon name="shopping_cart" className="text-[22px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#1f1f1f]">
                  {lang === 'uz' ? 'Buyurtma savati' : 'Корзина заказа'}
                </h2>
                {items.length > 0 && (
                  <span className="rounded-full bg-[#0b57d0] px-2 py-0.5 text-xs font-bold text-white">
                    {items.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#444746]">
                {items.length > 0
                  ? lang === 'uz'
                    ? `Jami: ${formatNumber(totalPacksCount)} qadoq • ${formatPrice(totalSum, lang)}`
                    : `Итого: ${formatNumber(totalPacksCount)} упак. • ${formatPrice(totalSum, lang)}`
                  : lang === 'uz'
                  ? 'Savatingiz bo‘sh'
                  : 'Ваша корзина пуста'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-full text-xs font-semibold text-rose-700 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
                title={lang === 'uz' ? 'Savatni tozalash' : 'Очистить корзину'}
              >
                <M3Icon name="delete_sweep" className="text-[18px]" />
                <span className="hidden sm:inline">{lang === 'uz' ? 'Tozalash' : 'Очистить'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={closeCart}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#444746] hover:bg-[#f3f6fc] transition-colors cursor-pointer"
              aria-label="Yopish"
            >
              <M3Icon name="close" className="text-[20px]" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center my-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f6fc] text-[#444746] mb-4">
              <M3Icon name="production_quantity_limits" className="text-[32px]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1f1f1f]">
              {lang === 'uz' ? 'Savatingiz hozircha bo‘sh' : 'Корзина пуста'}
            </h3>
            <p className="mt-1 max-w-sm text-xs sm:text-sm text-[#444746] leading-relaxed">
              {lang === 'uz'
                ? 'Katalogdagi mahsulot kartochkalarida joylashgan [+] tugmasi orqali kerakli mahsulot va hidlarni savatga yig‘ing.'
                : 'Добавляйте нужные товары с помощью кнопки [+] на карточках каталога.'}
            </p>
            <button
              type="button"
              onClick={closeCart}
              className="mt-5 inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <M3Icon name="inventory_2" className="text-[18px]" />
              <span>{lang === 'uz' ? 'Katalogni ko‘rish' : 'Смотреть каталог'}</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 space-y-4">
            {/* View Mode Tabs: [📋 Jadval] & [🖼️ Tayyor Surat (Chek)] */}
            <div className="flex items-center justify-center">
              <div className="inline-flex rounded-full bg-[#f3f6fc] p-1 border border-[#e0e2ec]">
                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'table'
                      ? 'bg-white text-[#0b57d0] shadow-2xs'
                      : 'text-[#444746] hover:text-[#1f1f1f]'
                  }`}
                >
                  <M3Icon name="table_chart" className="text-[16px]" />
                  <span>{lang === 'uz' ? 'Jadval ro‘yxati' : 'Таблица товаров'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('image')}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'image'
                      ? 'bg-white text-[#0b57d0] shadow-2xs'
                      : 'text-[#444746] hover:text-[#1f1f1f]'
                  }`}
                >
                  <M3Icon name="image" className="text-[16px]" />
                  <span>{lang === 'uz' ? 'Tayyor Surat (Chek)' : 'Готовый чек (Фото)'}</span>
                </button>
              </div>
            </div>

            {activeTab === 'table' ? (
              <div className="space-y-4">
                {/* Products Table (Desktop & Tablet) */}
                <div className="overflow-x-auto rounded-2xl border border-[#e0e2ec]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f8fafd] border-b border-[#e0e2ec] text-[#444746] font-semibold">
                        <th className="py-2.5 px-3">№</th>
                        <th className="py-2.5 px-3">{lang === 'uz' ? 'Mahsulot' : 'Товар'}</th>
                        <th className="py-2.5 px-3">{lang === 'uz' ? 'Turi/Hidi' : 'Вид/Аромат'}</th>
                        <th className="py-2.5 px-3">{lang === 'uz' ? 'Qadoq soni' : 'Кол-во'}</th>
                        <th className="py-2.5 px-3">{lang === 'uz' ? 'Qadoq narxi' : 'Цена за блок'}</th>
                        <th className="py-2.5 px-3 text-right">{lang === 'uz' ? 'Jami summa' : 'Сумма'}</th>
                        <th className="py-2.5 px-2 text-center w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e0e2ec]">
                      {items.map((item, idx) => {
                        const p = item.product;
                        const pName = l(lang, p.nameUz, p.nameRu);
                        const packType = l(lang, p.packTypeUz, p.packTypeRu);
                        const unitName = l(lang, p.unitNameUz, p.unitNameRu);
                        const rowSum = item.packsCount * p.packPrice;
                        const vName = item.variantNameUz
                          ? l(lang, item.variantNameUz, item.variantNameRu || item.variantNameUz)
                          : null;

                        return (
                          <tr key={item.key} className="hover:bg-[#f8fafd]/80 transition-colors">
                            <td className="py-3 px-3 text-[#747775] font-mono">{idx + 1}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={p.images[0]}
                                  alt={pName}
                                  className="h-9 w-9 rounded-lg object-contain bg-[#f3f6fc] p-0.5 border border-[#e0e2ec] shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-semibold text-[#1f1f1f] truncate max-w-[200px]">
                                    {pName}
                                  </div>
                                  <div className="text-[10px] text-[#747775] font-mono">
                                    {p.sku} • 1 {packType} = {p.packQuantity} {unitName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              {vName ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f6fc] px-2.5 py-0.5 text-[11px] font-medium text-[#0b57d0] border border-[#e0e2ec]">
                                  {item.colorHex && (
                                    <span
                                      className="h-2.5 w-2.5 rounded-full border border-black/10 shrink-0"
                                      style={{ backgroundColor: item.colorHex }}
                                    />
                                  )}
                                  <span className="truncate max-w-[100px]">{vName}</span>
                                </span>
                              ) : (
                                <span className="text-[#747775]">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <div className="inline-flex items-center rounded-full border border-[#c4c7c5] bg-white p-0.5 shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => updatePacks(item.key, -1)}
                                  className="flex h-6 w-6 items-center justify-center rounded-full text-[#444746] hover:bg-[#edf2fa] hover:text-[#1f1f1f] active:scale-90 transition-all cursor-pointer"
                                  title="Kamaytirish"
                                >
                                  <M3Icon name="remove" className="text-[14px]" />
                                </button>
                                <span className="px-2 font-bold text-xs text-[#1f1f1f] min-w-[28px] text-center">
                                  {item.packsCount}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updatePacks(item.key, 1)}
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] active:scale-90 transition-all cursor-pointer"
                                  title="Ko'paytirish"
                                >
                                  <M3Icon name="add" className="text-[14px]" />
                                </button>
                              </div>
                              <span className="ml-1.5 text-[11px] text-[#747775]">{packType}</span>
                            </td>
                            <td className="py-3 px-3 font-medium text-[#444746] whitespace-nowrap">
                              {formatPrice(p.packPrice, lang)}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-[#0b57d0] whitespace-nowrap">
                              {formatPrice(rowSum, lang)}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeItem(item.key)}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-[#747775] hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                                title="O'chirish"
                              >
                                <M3Icon name="delete" className="text-[16px]" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Optional Customer Inputs */}
                <div className="rounded-2xl bg-[#f8fafd] p-4 border border-[#e0e2ec] space-y-3">
                  <div className="text-xs font-semibold text-[#1f1f1f]">
                    {lang === 'uz' ? 'Buyurtmachi ma’lumotlari (ixtiyoriy):' : 'Данные покупателя (необязательно):'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="tel"
                      placeholder={lang === 'uz' ? 'Telefon raqamingiz (+998 ...)' : 'Ваш телефон (+998 ...)'}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-xl border border-[#c4c7c5] bg-white px-3 py-2 text-xs text-[#1f1f1f] focus:outline-none focus:border-[#0b57d0]"
                    />
                    <input
                      type="text"
                      placeholder={lang === 'uz' ? 'Ismingiz yoki do‘kon nomi' : 'Имя или название магазина'}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-[#c4c7c5] bg-white px-3 py-2 text-xs text-[#1f1f1f] focus:outline-none focus:border-[#0b57d0]"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder={lang === 'uz' ? 'Buyurtma uchun qo‘shimcha izoh (masalan: yetkazib berish manzili)' : 'Примечание к заказу'}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-xl border border-[#c4c7c5] bg-white px-3 py-2 text-xs text-[#1f1f1f] focus:outline-none focus:border-[#0b57d0]"
                  />
                </div>
              </div>
            ) : (
              /* Image / Ready Receipt Tab */
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#e0e2ec] bg-[#f8fafd] p-2 flex flex-col items-center justify-center min-h-[300px]">
                  {isGeneratingImg ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-[#444746]">
                      <span className="h-6 w-6 border-2 border-[#0b57d0] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">{lang === 'uz' ? 'Chek surati tayyorlanmoqda...' : 'Создание чека...'}</span>
                    </div>
                  ) : imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Buyurtma cheki"
                      className="w-full max-h-[460px] object-contain rounded-xl shadow-xs border border-[#e0e2ec]"
                    />
                  ) : (
                    <div className="text-xs text-[#747775] py-8">
                      {lang === 'uz' ? 'Surat yaratilmadi' : 'Ошибка создания фото'}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <p className="text-[11px] text-[#747775]">
                    {lang === 'uz'
                      ? 'Ushbu suratda barcha mahsulotlar, qadoqlar, narxlar va jami hisob aks ettirilgan.'
                      : 'На фото указаны все товары, упаковки, цены и итоговый счёт.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    disabled={!imageUrl}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#f3f6fc] text-[#0b57d0] hover:bg-[#d3e3fd] border border-[#c4c7c5]/60 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <M3Icon name="download" className="text-[16px]" />
                    <span>{lang === 'uz' ? 'Suratni yuklab olish (PNG)' : 'Скачать фото (PNG)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer / Summary & Actions */}
        {items.length > 0 && (
          <div
            className="p-4 sm:p-5 border-t border-[#e0e2ec] bg-[#f8fafd] shrink-0 space-y-3"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
          >
            {/* Grand Total Bar */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-[#444746]">
                  {lang === 'uz' ? 'Jami hisob:' : 'Итоговый счёт:'}
                </div>
                <div className="text-xs text-[#747775]">
                  {items.length} {lang === 'uz' ? 'xil mahsulot' : 'поз.'} • {formatNumber(totalPacksCount)} {lang === 'uz' ? 'qadoq' : 'упак.'} ({formatNumber(totalUnitsCount)} {lang === 'uz' ? 'dona' : 'шт'})
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-black text-[#0b57d0]">
                  {formatPrice(totalSum, lang)}
                </div>
              </div>
            </div>

            {/* Action Buttons: Telegramda buyurtma yuborish + Suratni yuklab olish */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                onClick={handleSendToTelegram}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] active:scale-95 text-xs sm:text-sm font-semibold transition-all shadow-md cursor-pointer"
              >
                <M3Icon name="send" className="text-[18px]" />
                <span>
                  {lang === 'uz' ? 'Telegram botga o‘tish va yuborish' : 'Перейти в Telegram и отправить'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={!imageUrl}
                className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full bg-white text-[#1f1f1f] hover:bg-[#edf2fa] hover:text-[#0b57d0] border border-[#c4c7c5] active:scale-95 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer shrink-0"
              >
                <M3Icon name="image" className="text-[18px]" />
                <span>{lang === 'uz' ? 'Tayyor suratni olish' : 'Получить чек (фото)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
