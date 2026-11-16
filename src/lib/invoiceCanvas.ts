import type { CartItem } from '@/context/CartContext';
import type { SiteSettings, Language } from '@/types/catalog';
import { formatNumber, formatPrice, l } from './i18n';

export interface InvoiceOptions {
  orderNumber: string;
  orderDate: string;
  customerName?: string;
  customerPhone?: string;
  note?: string;
}

export function generateInvoiceImage(
  items: CartItem[],
  settings: Omit<SiteSettings, 'adminPin'>,
  lang: Language = 'uz',
  options: InvoiceOptions
): Promise<string> {
  return new Promise((resolve) => {
    const scale = 2; // High-DPI crisp rendering
    const width = 1000;
    
    // Dynamic height based on number of items
    const rowHeight = 44;
    const headerHeight = 240;
    const tableHeaderHeight = 44;
    const tableRowsHeight = items.length * rowHeight;
    const summaryHeight = 220;
    const totalHeight = headerHeight + tableHeaderHeight + tableRowsHeight + summaryHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = totalHeight * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    ctx.scale(scale, scale);

    // 1. Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, totalHeight);

    // Decorative top accent bar
    ctx.fillStyle = '#0B57D0';
    ctx.fillRect(0, 0, width, 8);

    // 2. Header Box
    ctx.fillStyle = '#F8FAFD';
    ctx.fillRect(24, 24, width - 48, 140);
    ctx.strokeStyle = '#E0E2EC';
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 24, width - 48, 140);

    // Company Brand & Title
    ctx.fillStyle = '#0B57D0';
    ctx.font = 'bold 26px sans-serif';
    const companyTitle = settings.companyNameUz || 'E-CATALOG';
    ctx.fillText(companyTitle.toUpperCase(), 48, 64);

    ctx.fillStyle = '#444746';
    ctx.font = '14px sans-serif';
    ctx.fillText(
      lang === 'uz' ? 'Elektron Ulgurji Savdo Katalogi' : 'Электронный оптовый каталог',
      48,
      88
    );

    ctx.fillStyle = '#747775';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Tel: ${settings.phonePrimary || ''}  |  Telegram: @${(settings.telegramUsername || '').replace(/^@/, '')}`, 48, 110);
    if (settings.addressUz) {
      ctx.fillText(`Manzil: ${settings.addressUz.slice(0, 65)}...`, 48, 130);
    }

    // Right Header: Order Info
    ctx.textAlign = 'right';
    ctx.fillStyle = '#1F1F1F';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(
      lang === 'uz' ? `BUYURTMA ${options.orderNumber}` : `ЗАКАЗ ${options.orderNumber}`,
      width - 48,
      64
    );

    ctx.fillStyle = '#444746';
    ctx.font = '13px sans-serif';
    ctx.fillText(options.orderDate, width - 48, 88);

    if (options.customerPhone) {
      ctx.fillStyle = '#0B57D0';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`Mijoz: ${options.customerPhone}`, width - 48, 110);
    }
    if (options.customerName) {
      ctx.fillStyle = '#444746';
      ctx.font = '12px sans-serif';
      ctx.fillText(options.customerName, width - 48, 130);
    }

    ctx.textAlign = 'left';

    // 3. Table Header
    const tableTop = 184;
    ctx.fillStyle = '#0B57D0';
    ctx.fillRect(24, tableTop, width - 48, tableHeaderHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('№', 40, tableTop + 27);
    ctx.fillText(lang === 'uz' ? 'Mahsulot nomi' : 'Наименование товара', 80, tableTop + 27);
    ctx.fillText(lang === 'uz' ? 'Turi / Hidi' : 'Вид / Аромат', 440, tableTop + 27);
    ctx.fillText(lang === 'uz' ? 'Qadoq soni' : 'Кол-во', 630, tableTop + 27);
    ctx.fillText(lang === 'uz' ? 'Qadoq narxi' : 'Цена за блок', 730, tableTop + 27);
    ctx.textAlign = 'right';
    ctx.fillText(lang === 'uz' ? 'Jami summa' : 'Сумма', width - 40, tableTop + 27);
    ctx.textAlign = 'left';

    // 4. Table Rows
    let currentY = tableTop + tableHeaderHeight;
    let totalPacks = 0;
    let grandTotal = 0;

    items.forEach((item, index) => {
      const p = item.product;
      const isEven = index % 2 === 0;
      ctx.fillStyle = isEven ? '#FFFFFF' : '#F8FAFD';
      ctx.fillRect(24, currentY, width - 48, rowHeight);

      ctx.strokeStyle = '#E0E2EC';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(24, currentY, width - 48, rowHeight);

      // Index
      ctx.fillStyle = '#747775';
      ctx.font = '12px sans-serif';
      ctx.fillText(String(index + 1), 40, currentY + 26);

      // Name & SKU
      ctx.fillStyle = '#1F1F1F';
      ctx.font = 'bold 12px sans-serif';
      const pName = l(lang, p.nameUz, p.nameRu);
      const truncatedName = pName.length > 42 ? `${pName.slice(0, 40)}...` : pName;
      ctx.fillText(truncatedName, 80, currentY + 26);

      // Variant / Scent
      const vName = item.variantNameUz
        ? l(lang, item.variantNameUz, item.variantNameRu || item.variantNameUz)
        : '—';
      ctx.fillStyle = item.variantNameUz ? '#0B57D0' : '#747775';
      ctx.font = item.variantNameUz ? 'bold 12px sans-serif' : '12px sans-serif';
      ctx.fillText(vName, 440, currentY + 26);

      // Quantity
      const packType = l(lang, p.packTypeUz, p.packTypeRu);
      ctx.fillStyle = '#1F1F1F';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`${item.packsCount} ${packType}`, 630, currentY + 26);

      // Price
      ctx.fillStyle = '#444746';
      ctx.font = '12px sans-serif';
      ctx.fillText(formatPrice(p.packPrice, lang), 730, currentY + 26);

      // Total Row Sum
      const rowSum = item.packsCount * p.packPrice;
      totalPacks += item.packsCount;
      grandTotal += rowSum;

      ctx.textAlign = 'right';
      ctx.fillStyle = '#0B57D0';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(formatPrice(rowSum, lang), width - 40, currentY + 26);
      ctx.textAlign = 'left';

      currentY += rowHeight;
    });

    // 5. Summary Section
    currentY += 20;

    // Grand Total Banner
    ctx.fillStyle = '#EBF4FF';
    ctx.fillRect(24, currentY, width - 48, 80);
    ctx.strokeStyle = '#0B57D0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(24, currentY, width - 48, 80);

    ctx.fillStyle = '#1F1F1F';
    ctx.font = '14px sans-serif';
    ctx.fillText(
      lang === 'uz'
        ? `Jami mahsulotlar: ${items.length} xil   •   Jami hajm: ${formatNumber(totalPacks)} qadoq`
        : `Всего товаров: ${items.length} поз.   •   Общий объём: ${formatNumber(totalPacks)} упак.`,
      48,
      currentY + 46
    );

    ctx.textAlign = 'right';
    ctx.fillStyle = '#444746';
    ctx.font = '12px sans-serif';
    ctx.fillText(lang === 'uz' ? "JAMI TO'LANADIGAN SUMMA:" : 'ИТОГО К ОПЛАТЕ:', width - 48, currentY + 36);

    ctx.fillStyle = '#0B57D0';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(formatPrice(grandTotal, lang), width - 48, currentY + 64);
    ctx.textAlign = 'left';

    // 6. Note / Footer
    currentY += 104;
    ctx.fillStyle = '#747775';
    ctx.font = '11px sans-serif';
    ctx.fillText(
      lang === 'uz'
        ? '* Ushbu buyurtma cheki elektron katalog orqali shakllantirildi. To‘lov va yetkazib berish shartlari menejer bilan kelishiladi.'
        : '* Данный чек сформирован через электронный каталог. Условия оплаты и доставки согласовываются с менеджером.',
      24,
      currentY
    );

    ctx.fillText(
      `E-Catalog Wholesale • ${new Date().toLocaleDateString()} • www.e-catalog.uz`,
      24,
      currentY + 18
    );

    resolve(canvas.toDataURL('image/png'));
  });
}

export function formatOrderTelegramText(
  items: CartItem[],
  settings: Omit<SiteSettings, 'adminPin'>,
  lang: Language = 'uz',
  options: InvoiceOptions
): string {
  const totalPacks = items.reduce((sum, i) => sum + i.packsCount, 0);
  const totalUnits = items.reduce(
    (sum, i) => sum + i.packsCount * i.product.packQuantity,
    0
  );
  const totalSum = items.reduce(
    (sum, i) => sum + i.packsCount * i.product.packPrice,
    0
  );

  const orderTitle = lang === 'uz' ? `🛒 YANGI ULGURJI BUYURTMA` : `🛒 НОВЫЙ ОПТОВЫЙ ЗАКАЗ`;
  const invoiceNum = options.orderNumber;
  const dateStr = options.orderDate;

  const headerLines = [
    `${orderTitle} #${invoiceNum}`,
    `📅 ${lang === 'uz' ? 'Sana' : 'Дата'}: ${dateStr}`,
  ];

  if (options.customerPhone) {
    headerLines.push(`👤 ${lang === 'uz' ? 'Mijoz telefoni' : 'Телефон клиента'}: ${options.customerPhone}`);
  }
  if (options.customerName) {
    headerLines.push(`🏷 ${lang === 'uz' ? 'Mijoz ismi' : 'Имя клиента'}: ${options.customerName}`);
  }
  if (options.note) {
    headerLines.push(`💬 ${lang === 'uz' ? 'Izoh' : 'Примечание'}: ${options.note}`);
  }

  const itemsLines = items.map((item, idx) => {
    const p = item.product;
    const pName = l(lang, p.nameUz, p.nameRu);
    const packType = l(lang, p.packTypeUz, p.packTypeRu);
    const unitName = l(lang, p.unitNameUz, p.unitNameRu);
    const rowSum = item.packsCount * p.packPrice;
    const vName = item.variantNameUz
      ? l(lang, item.variantNameUz, item.variantNameRu || item.variantNameUz)
      : null;

    let res = `${idx + 1}. ${pName} (${p.sku})\n`;
    if (vName) {
      res += `   🔹 ${lang === 'uz' ? 'Turi/Hidi' : 'Вид/Аромат'}: ${vName}\n`;
    }
    res += `   📦 ${lang === 'uz' ? 'Soni' : 'Кол-во'}: ${formatNumber(item.packsCount)} ${packType} (${formatNumber(item.packsCount * p.packQuantity)} ${unitName})\n`;
    res += `   💰 ${lang === 'uz' ? 'Narxi' : 'Цена'}: ${formatPrice(p.packPrice, lang)} / ${packType}\n`;
    res += `   💵 ${lang === 'uz' ? 'Jami' : 'Итого'}: ${formatPrice(rowSum, lang)}`;
    return res;
  });

  const footerLines = [
    `──────────────────────────`,
    `📊 ${lang === 'uz' ? 'Jami hajm' : 'Общий объём'}: ${formatNumber(totalPacks)} ${lang === 'uz' ? 'qadoq' : 'упак.'} (${formatNumber(totalUnits)} ${lang === 'uz' ? 'dona' : 'шт'})`,
    `💰 ${lang === 'uz' ? 'UMUMIY SUMMA' : 'ОБЩАЯ СУММА'}: ${formatPrice(totalSum, lang)}`,
    `──────────────────────────`,
    lang === 'uz'
      ? `📍 Iltimos, ushbu buyurtmani qabul qilib, yetkazib berish va to‘lov shartlarini aniqlashtirib bersangiz!`
      : `📍 Пожалуйста, примите заказ и подтвердите условия доставки и оплаты!`,
  ];

  return [headerLines.join('\n'), `\n📦 ${lang === 'uz' ? 'MAHSULOTLAR RO‘YXATI' : 'СПИСОК ТОВАРОВ'}:\n──────────────────────────`, itemsLines.join('\n\n'), footerLines.join('\n')].join('\n');
}
