'use client';

import type { SiteSettings } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { l } from '@/lib/i18n';
import { buildTelegramUrl, formatPhoneHref } from '@/lib/helpers';
import { M3Icon } from './m3/MaterialWebLoader';

export function Footer({ settings }: { settings: Omit<SiteSettings, 'adminPin'> }) {
  const { lang, t } = useLanguage();
  const companyName = l(lang, settings.companyNameUz, settings.companyNameRu) || t.brandFallback;

  return (
    <footer className="no-print mt-10 sm:mt-12 border-t border-[#e0e2ec] bg-[#edf2fa] pb-24 sm:pb-8">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-[#1f1f1f]">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={companyName}
                  className="h-6 w-6 object-contain rounded"
                />
              ) : (
                <M3Icon name="inventory_2" className="text-[#0b57d0]" />
              )}
              <span>{companyName}</span>
            </div>
            <p className="text-xs text-[#444746] leading-relaxed">
              {l(lang, settings.addressUz, settings.addressRu)} •{' '}
              {l(lang, settings.workingHoursUz, settings.workingHoursRu)}
            </p>
            <p className="text-xs text-[#444746] leading-relaxed">{t.footer.disclaimer}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 pt-2 sm:pt-0">
            <a
              href={formatPhoneHref(settings.phonePrimary)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full border border-[#c4c7c5] bg-white text-[#1f1f1f] hover:bg-[#f3f6fc] active:scale-95 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <M3Icon name="call" className="text-[#0b57d0] text-[18px]" />
              <span>{settings.phonePrimary}</span>
            </a>
            <a
              href={buildTelegramUrl(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-[#c2e7ff] text-[#001d35] hover:bg-[#b0dcf5] active:scale-95 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <M3Icon name="send" className="text-[18px]" />
              <span className="truncate max-w-[180px]">@{settings.telegramUsername.replace(/^@/, '')}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
