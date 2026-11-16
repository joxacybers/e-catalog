'use client';

import type { SiteSettings } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { l } from '@/lib/i18n';
import { buildTelegramUrl, formatPhoneHref } from '@/lib/helpers';
import { M3Icon } from './m3/MaterialWebLoader';

export function ContactClient({
  settings,
}: {
  settings: Omit<SiteSettings, 'adminPin'>;
}) {
  const { lang, t } = useLanguage();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <div className="rounded-[24px] bg-[#edf2fa] px-6 py-5">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1f1f1f]">
          {t.contact.title}
        </h1>
        <p className="mt-1 text-sm text-[#444746]">{t.contact.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Phones */}
        <div className="flex flex-col justify-between rounded-[24px] border border-[#c4c7c5]/60 bg-white p-6 space-y-4">
          <div className="space-y-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d3e3fd] text-[#041e49]">
              <M3Icon name="call" />
            </div>
            <h2 className="text-lg font-semibold text-[#1f1f1f]">{t.contact.phoneTitle}</h2>
            <div className="space-y-1 text-sm text-[#444746]">
              <div className="text-base font-semibold text-[#1f1f1f]">{settings.phonePrimary}</div>
              {settings.phoneSecondary && <div>{settings.phoneSecondary}</div>}
            </div>
          </div>
          <a
            href={formatPhoneHref(settings.phonePrimary)}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-[#c2e7ff] text-[#001d35] hover:bg-[#b0dcf5] text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <M3Icon name="call" className="text-[18px]" />
            <span>{t.product.callNow}</span>
          </a>
        </div>

        {/* Telegram */}
        <div className="flex flex-col justify-between rounded-[24px] border border-[#c4c7c5]/60 bg-white p-6 space-y-4">
          <div className="space-y-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c2e7ff] text-[#001d35]">
              <M3Icon name="send" />
            </div>
            <h2 className="text-lg font-semibold text-[#1f1f1f]">{t.contact.telegramTitle}</h2>
            <p className="text-sm text-[#444746]">{t.contact.telegramDesc}</p>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href={buildTelegramUrl(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-[#0b57d0] text-white hover:bg-[#0842a0] text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <M3Icon name="send" className="text-[18px]" />
              <span>@{settings.telegramUsername.replace(/^@/, '')}</span>
            </a>
            {settings.telegramChannel && (
              <a
                href={`https://t.me/${settings.telegramChannel.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full border border-[#c4c7c5] bg-white text-[#1f1f1f] hover:bg-[#f3f6fc] text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <span>{t.contact.openChannel}</span>
              </a>
            )}
          </div>
        </div>

        {/* Address & Hours */}
        <div className="rounded-[24px] border border-[#c4c7c5]/60 bg-white p-6 space-y-4">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf2fa] text-[#0b57d0]">
            <M3Icon name="warehouse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-[#1f1f1f]">{t.contact.addressTitle}</h2>
            <p className="text-sm text-[#444746]">
              {l(lang, settings.addressUz, settings.addressRu)}
            </p>
          </div>
          <md-divider />
          <div className="space-y-1">
            <div className="text-xs font-medium text-[#747775]">{t.contact.hoursTitle}</div>
            <p className="text-sm text-[#1f1f1f]">
              {l(lang, settings.workingHoursUz, settings.workingHoursRu)}
            </p>
          </div>
        </div>
      </div>

      {/* Wholesale Info Note */}
      <div className="rounded-[24px] bg-[#f3f6fc] p-6 space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1f1f1f]">
          <M3Icon name="info" className="text-[#0b57d0]" />
          <span>{t.contact.noteTitle}</span>
        </div>
        <p className="text-sm leading-relaxed text-[#444746]">
          {l(lang, settings.minOrderNoteUz, settings.minOrderNoteRu)}
        </p>
      </div>
    </div>
  );
}
