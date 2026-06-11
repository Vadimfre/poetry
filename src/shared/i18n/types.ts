export type Locale = "be" | "ru";

export const LOCALES: { value: Locale; label: string; short: string }[] = [
  { value: "be", label: "Беларуская", short: "BE" },
  { value: "ru", label: "Русский", short: "RU" },
];

export const DEFAULT_LOCALE: Locale = "be";
export const LOCALE_COOKIE = "poetry_locale";

export type TranslationParams = Record<string, string | number>;
