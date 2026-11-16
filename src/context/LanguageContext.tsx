'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Language } from '@/types/catalog';
import { translations } from '@/lib/i18n';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (typeof translations)['uz'] | (typeof translations)['ru'];
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'uz',
  setLang: () => {},
  t: translations.uz,
});

const STORAGE_KEY = 'wholesale_catalog_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('uz');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'uz' || saved === 'ru') {
        setLangState(saved);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const setLang = (nextLang: Language) => {
    setLangState(nextLang);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLang);
    } catch {
      // Ignore storage access errors
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

