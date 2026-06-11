import { LOCALE_COOKIE, type Locale } from "./types";

const VALID_LOCALES: Locale[] = ["be", "ru"];

export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function setCookie(name: string, value: string, maxAgeDays = 365) {
  if (typeof document === "undefined") return;
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function readLocaleCookie(): Locale | undefined {
  const stored = getCookie(LOCALE_COOKIE);
  if (stored && VALID_LOCALES.includes(stored as Locale)) {
    return stored as Locale;
  }
  return undefined;
}
