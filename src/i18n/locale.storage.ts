import { AsyncLocalStorage } from 'async_hooks';
import { AppLocale, DEFAULT_LOCALE } from './locale.types';

export const localeStorage = new AsyncLocalStorage<AppLocale>();

export function getCurrentLocale(): AppLocale {
  return localeStorage.getStore() ?? DEFAULT_LOCALE;
}
