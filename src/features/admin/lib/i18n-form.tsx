"use client";

import type { ContentLocale } from "@/src/shared/types/admin.types";
import styles from "@/app/admin/admin.module.css";

const LOCALE_LABELS: Record<ContentLocale, string> = {
  be: "Беларуская",
  ru: "Русский",
  en: "English",
};

interface LocaleTabsProps {
  active: ContentLocale;
  onChange: (locale: ContentLocale) => void;
  filled?: Partial<Record<ContentLocale, boolean>>;
}

export function LocaleTabs({ active, onChange, filled }: LocaleTabsProps) {
  const locales: ContentLocale[] = ["be", "ru"];

  return (
    <div className={styles.localeTabs}>
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          className={`${styles.localeTab} ${active === loc ? styles.localeTabActive : ""}`}
          onClick={() => onChange(loc)}
        >
          {LOCALE_LABELS[loc]}
          {filled?.[loc] && <span className={styles.localeDot} />}
        </button>
      ))}
    </div>
  );
}

export function emptyPoemLocaleFields() {
  return { title: "", content: "", description: "" };
}

export function poemI18nFromRecord(
  i18n: Record<string, Record<string, string>> | undefined,
  poem?: { title: string; content: string; description: string | null },
) {
  const locales: ContentLocale[] = ["be", "ru"];
  const out = {} as Record<
    ContentLocale,
    { title: string; content: string; description: string }
  >;

  for (const loc of locales) {
    const bag = i18n?.[loc];
    out[loc] = {
      title: bag?.title ?? (loc === "be" ? poem?.title ?? "" : ""),
      content: bag?.content ?? (loc === "be" ? poem?.content ?? "" : ""),
      description:
        bag?.description ??
        (loc === "be" ? poem?.description ?? "" : ""),
    };
  }
  return out;
}

export function categoryI18nFromRecord(
  i18n: Record<string, Record<string, string>> | undefined,
  category?: { name: string; description: string | null },
) {
  const locales: ContentLocale[] = ["be", "ru"];
  const out = {} as Record<
    ContentLocale,
    { name: string; description: string }
  >;

  for (const loc of locales) {
    const bag = i18n?.[loc];
    out[loc] = {
      name: bag?.name ?? (loc === "be" ? category?.name ?? "" : ""),
      description:
        bag?.description ??
        (loc === "be" ? category?.description ?? "" : ""),
    };
  }
  return out;
}

export function authorI18nFromRecord(
  i18n: Record<string, Record<string, string>> | undefined,
  author?: { name: string; bio: string | null },
) {
  const locales: ContentLocale[] = ["be", "ru"];
  const out = {} as Record<ContentLocale, { name: string; bio: string }>;

  for (const loc of locales) {
    const bag = i18n?.[loc];
    out[loc] = {
      name: bag?.name ?? (loc === "be" ? author?.name ?? "" : ""),
      bio: bag?.bio ?? (loc === "be" ? author?.bio ?? "" : ""),
    };
  }
  return out;
}

export function buildI18nPayload(
  locales: Record<ContentLocale, Record<string, string>>,
  fields: string[],
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const [loc, bag] of Object.entries(locales) as [
    ContentLocale,
    Record<string, string>,
  ][]) {
    const entry: Record<string, string> = {};
    for (const field of fields) {
      const value = bag[field]?.trim();
      if (value) entry[field] = value;
    }
    if (Object.keys(entry).length > 0) out[loc] = entry;
  }
  return out;
}
