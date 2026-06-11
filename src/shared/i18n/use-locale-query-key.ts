"use client";

import { useMemo } from "react";
import { useI18n } from "./context";

/** Include active locale in React Query keys so data refetches on language change */
export function useLocaleQueryKey(base: readonly unknown[]) {
  const { locale } = useI18n();
  return useMemo(
    () => [...base, locale] as const,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- locale + each key segment
    [locale, ...base],
  );
}
