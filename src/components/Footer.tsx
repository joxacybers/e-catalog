'use client';

import Link from 'next/link';
import type { SiteSettings } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { l } from '@/lib/i18n';
import { buildTelegramUrl, formatPhoneHref } from '@/lib/helpers';
import { M3Icon } from './m3/MaterialWebLoader';

export function Footer({ settings }: { settings: Omit<SiteSettings, 'adminPin'> }) {
  const { lang, t } = useLanguage();
  const companyName = l(lang, settings.companyNameUz, settings.companyNameRu) || t.brandFallback;

  return (
    <footer className="no-print hidden sm:block mt-12 border-t border-[#e0e2ec] bg-[#edf2fa]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
            <p className="text-xs text-[#444746] leading-relaxed flex items-center gap-1.5 flex-wrap">
              <span>{t.footer.disclaimer}</span>
              <Link
                href="/admin"
                className="text-[#c4c7c5] hover:text-[#0b57d0] transition-colors p-0.5 inline-flex items-center"
                title="Boshqaruv tizimi"
              >
                <M3Icon name="lock" className="text-[13px]" />
              </Link>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 pt-2 md:pt-0 pr-2 sm:pr-4 lg:pr-6">
            <a
              href={formatPhoneHref(settings.phonePrimary)}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full border border-[#c4c7c5]/80 bg-white text-[#1f1f1f] hover:bg-[#f3f6fc] active:scale-95 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <M3Icon name="call" className="text-[#0b57d0] text-[18px]" />
              <span>{settings.phonePrimary}</span>
            </a>
            <a
              href={buildTelegramUrl(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-[#c2e7ff] text-[#001d35] hover:bg-[#b0dcf5] active:scale-95 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer shrink-0"
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
