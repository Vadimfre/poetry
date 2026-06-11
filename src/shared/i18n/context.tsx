"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { queryClient } from "@/src/shared/config/query-client";
import { getNestedValue, interpolate } from "./get-nested";
import { readLocaleCookie, setCookie } from "./cookie";
import { translations } from "./locales";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Locale,
  type TranslationParams,
} from "./types";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslationParams) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readInitialLocale(): Locale {
  const cookie = readLocaleCookie();
  if (cookie === "be" || cookie === "ru") return cookie;
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(readInitialLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    setCookie(LOCALE_COOKIE, next);
    document.documentElement.lang = next;
    void queryClient.invalidateQueries();
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
    }
  }, [locale, mounted]);

  const t = useCallback(
    (key: string, params?: TranslationParams) => {
      const dict = translations[locale];
      const value =
        getNestedValue(dict, key) ??
        getNestedValue(translations.be, key) ??
        getNestedValue(translations.ru, key);
      return interpolate(value ?? key, params);
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

/** Plural helper for Slavic languages (be, ru) and English */
export function usePlural() {
  const { locale, t } = useI18n();

  return (
    count: number,
    keys: { one: string; few: string; many: string },
  ) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return t(keys.one);
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return t(keys.few);
    }
    return t(keys.many);
  };
}
