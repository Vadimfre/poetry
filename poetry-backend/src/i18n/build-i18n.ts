import { AppLocale } from './locale.types';

/** Build i18n JSON for Prisma create/update from per-locale field maps */
export function buildI18n(
  locales: Partial<Record<AppLocale, Record<string, string | null | undefined>>>,
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const [locale, fields] of Object.entries(locales)) {
    if (!fields) continue;
    const bag: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value != null && value !== '') {
        bag[key] = value;
      }
    }
    if (Object.keys(bag).length > 0) {
      out[locale] = bag;
    }
  }
  return out;
}

/** Sync scalar columns from default locale (be) for search/sort */
export function primaryFromI18n(
  i18n: ReturnType<typeof buildI18n>,
  field: string,
  fallback = '',
): string {
  return i18n.be?.[field] ?? i18n.ru?.[field] ?? i18n.en?.[field] ?? fallback;
}
