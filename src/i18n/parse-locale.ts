import { Request } from 'express';
import { AppLocale, DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locale.types';

function normalizeLocale(value: unknown): AppLocale | null {
  if (typeof value !== 'string') return null;
  const code = value.trim().toLowerCase().split(/[-_]/)[0];
  if (SUPPORTED_LOCALES.includes(code as AppLocale)) {
    return code as AppLocale;
  }
  return null;
}

function parseAcceptLanguage(header: string | undefined): AppLocale | null {
  if (!header) return null;
  const parts = header.split(',').map((part) => {
    const [lang, qPart] = part.trim().split(';q=');
    const q = qPart ? parseFloat(qPart) : 1;
    return { lang: normalizeLocale(lang), q };
  });
  parts.sort((a, b) => b.q - a.q);
  for (const { lang } of parts) {
    if (lang) return lang;
  }
  return null;
}

export function parseLocaleFromRequest(req: Request): AppLocale {
  const fromHeader =
    normalizeLocale(req.headers['x-locale']) ??
    normalizeLocale(req.query?.lang);
  if (fromHeader) return fromHeader;

  const fromAccept = parseAcceptLanguage(req.headers['accept-language']);
  if (fromAccept) return fromAccept;

  return DEFAULT_LOCALE;
}
