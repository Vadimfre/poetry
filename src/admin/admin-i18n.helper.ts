import { buildI18n, primaryFromI18n } from "../i18n/build-i18n";
import { AppLocale } from "../i18n/locale.types";

export type I18nFieldsInput = Partial<
  Record<AppLocale, Record<string, string | null | undefined>>
>;

export function mergeI18nInput(
  existing: Record<string, Record<string, string>> | null | undefined,
  input?: I18nFieldsInput,
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {
    ...(existing ?? {}),
  };
  if (!input) return out;

  for (const [locale, fields] of Object.entries(input)) {
    if (!fields) continue;
    const bag = { ...(out[locale] ?? {}) };
    for (const [key, value] of Object.entries(fields)) {
      if (value === null || value === "") {
        delete bag[key];
      } else if (value !== undefined) {
        bag[key] = value;
      }
    }
    if (Object.keys(bag).length === 0) {
      delete out[locale];
    } else {
      out[locale] = bag;
    }
  }
  return out;
}

export function buildI18nFromInput(
  input: I18nFieldsInput,
  legacy?: Record<string, string | null | undefined>,
): Record<string, Record<string, string>> {
  const merged: I18nFieldsInput = { ...input };
  if (legacy && Object.keys(legacy).length > 0) {
    merged.be = { ...merged.be, ...legacy };
  }
  return buildI18n(merged);
}

export function scalarFromI18n(
  i18n: Record<string, Record<string, string>>,
  field: string,
  fallback = "",
): string {
  return primaryFromI18n(i18n, field, fallback);
}
