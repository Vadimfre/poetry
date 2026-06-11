export type AppLocale = 'be' | 'ru';

export const DEFAULT_LOCALE: AppLocale = 'be';

export const SUPPORTED_LOCALES: AppLocale[] = ['be', 'ru'];

export type I18nBag = Partial<
  Record<AppLocale, Record<string, string | null | undefined>>
>;
