'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { SiteSettings } from '@/types/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { l } from '@/lib/i18n';
import { buildTelegramUrl, formatPhoneHref } from '@/lib/helpers';
import { M3Icon } from './m3/MaterialWebLoader';

export function Navbar({ settings }: { settings: Omit<SiteSettings, 'adminPin'> }) {
  const { lang, setLang, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { href: '/', label: t.nav.catalog, matchExact: true },
    { href: '/price-list', label: t.nav.priceList },
    { href: '/contact', label: t.nav.contact },
    { href: '/admin', label: t.nav.admin },
  ];

  const companyName = l(lang, settings.companyNameUz, settings.companyNameRu) || t.brandFallback;

  return (
    <header className="no-print sticky top-0 z-40 border-b border-[#e0e2ec] bg-[#f8fafd]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            {settings.logoUrl ? (
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white border border-[#e0e2ec] p-1 shadow-xs">
                <img
                  src={settings.logoUrl}
                  alt={companyName}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d3e3fd] text-[#041e49]">
                <M3Icon name="inventory_2" className="text-[22px]" />
              </div>
            )}
            <div className="leading-tight">
              <div className="text-base font-semibold tracking-tight text-[#1f1f1f]">
                {companyName}
              </div>
              <div className="text-[11px] font-medium text-[#444746]">
                {lang === 'uz' ? 'Elektron ulgurji katalog' : 'Электронный оптовый каталог'}
              </div>
            </div>
          </Link>

          {/* M3 Search Pill (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden flex-1 max-w-md lg:flex">
            <div className="relative w-full">
              <M3Icon
                name="search"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444746] text-[20px]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.nav.searchPlaceholder}
                className="h-10 w-full rounded-full bg-[#edf2fa] pl-11 pr-4 text-sm text-[#1f1f1f] placeholder:text-[#444746] transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0b57d0]"
              />
            </div>
          </form>

          {/* Desktop Navigation Pills + Language + Quick Phone */}
          <div className="hidden md:flex items-center gap-2">
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = link.matchExact
                  ? pathname === '/' || pathname.startsWith('/catalog')
                  : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#c2e7ff] text-[#001d35]'
                        : 'text-[#444746] hover:bg-[#edf2fa] hover:text-[#1f1f1f]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* M3 Segmented Language Switcher */}
            <div className="inline-flex rounded-full border border-[#c4c7c5] bg-white p-0.5">
              <button
                type="button"
                onClick={() => setLang('uz')}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  lang === 'uz'
                    ? 'bg-[#d3e3fd] text-[#041e49]'
                    : 'text-[#444746] hover:bg-[#edf2fa]'
                }`}
              >
                O‘Z
              </button>
              <button
                type="button"
                onClick={() => setLang('ru')}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  lang === 'ru'
                    ? 'bg-[#d3e3fd] text-[#041e49]'
                    : 'text-[#444746] hover:bg-[#edf2fa]'
                }`}
              >
                РУ
              </button>
            </div>

            <div className="hidden xl:inline-flex">
              <a
                href={formatPhoneHref(settings.phonePrimary)}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#c2e7ff] text-[#001d35] hover:bg-[#b0dcf5] text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <M3Icon name="call" className="text-[16px]" />
                <span>{settings.phonePrimary}</span>
              </a>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <div className="inline-flex rounded-full border border-[#c4c7c5] bg-white p-0.5">
              <button
                type="button"
                onClick={() => setLang('uz')}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                  lang === 'uz' ? 'bg-[#d3e3fd] text-[#041e49]' : 'text-[#444746]'
                }`}
              >
                O‘Z
              </button>
              <button
                type="button"
                onClick={() => setLang('ru')}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                  lang === 'ru' ? 'bg-[#d3e3fd] text-[#041e49]' : 'text-[#444746]'
                }`}
              >
                РУ
              </button>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Menu"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf2fa] text-[#1f1f1f] active:scale-95 transition-transform cursor-pointer"
            >
              <M3Icon name={mobileMenuOpen ? 'close' : 'menu'} className="text-[22px]" />
            </button>
          </div>
        </div>

        {/* Mobile Drawer with smooth animation */}
        {mobileMenuOpen && (
          <div className="border-t border-[#e0e2ec] py-3.5 md:hidden space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <M3Icon
                  name="search"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444746]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.nav.searchPlaceholder}
                  className="h-11 w-full rounded-full bg-[#edf2fa] pl-11 pr-4 text-sm text-[#1f1f1f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0b57d0] transition-colors"
                />
              </div>
            </form>

            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = link.matchExact
                  ? pathname === '/' || pathname.startsWith('/catalog')
                  : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-98 ${
                      isActive
                        ? 'bg-[#c2e7ff] text-[#001d35]'
                        : 'text-[#444746] hover:bg-[#edf2fa] text-[#1f1f1f]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <a
                href={formatPhoneHref(settings.phonePrimary)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-full bg-[#c2e7ff] text-[#001d35] text-xs font-semibold active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                <M3Icon name="call" className="text-[16px]" />
                <span>{t.nav.callSeller}</span>
              </a>
              <a
                href={buildTelegramUrl(settings)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-full bg-[#0b57d0] text-white text-xs font-semibold active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                <M3Icon name="send" className="text-[16px]" />
                <span>{t.nav.telegram}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
