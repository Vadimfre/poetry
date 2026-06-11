import { getCurrentLocale } from './locale.storage';
import { AppLocale, DEFAULT_LOCALE, I18nBag } from './locale.types';

function pickLocalizedField(
  i18n: I18nBag | null | undefined,
  locale: AppLocale,
  field: string,
  fallback?: string | null,
): string | null | undefined {
  const localized =
    i18n?.[locale]?.[field] ?? i18n?.[DEFAULT_LOCALE]?.[field];
  if (localized !== undefined && localized !== null && localized !== "") {
    return localized;
  }
  return fallback;
}

function localizeFields<T extends Record<string, unknown>>(
  record: T,
  locale: AppLocale,
  fields: string[],
): T {
  const i18n = record.i18n as I18nBag | null | undefined;
  const out = { ...record } as T & { i18n?: unknown };
  for (const field of fields) {
    const value = pickLocalizedField(
      i18n,
      locale,
      field,
      record[field] as string | null | undefined,
    );
    if (value !== undefined) {
      (out as Record<string, unknown>)[field] = value;
    }
  }
  delete (out as { i18n?: unknown }).i18n;
  return out;
}

export function localizeAuthor<T extends Record<string, unknown>>(
  author: T,
  locale?: AppLocale,
): T {
  return localizeFields(author, locale ?? getCurrentLocale(), ['name', 'bio']);
}

export function localizeCategory<T extends Record<string, unknown>>(
  category: T,
  locale?: AppLocale,
): T {
  return localizeFields(category, locale ?? getCurrentLocale(), [
    'name',
    'description',
  ]);
}

export function localizePoem<T extends Record<string, unknown>>(
  poem: T,
  locale?: AppLocale,
): T {
  const loc = locale ?? getCurrentLocale();
  let out = localizeFields(poem, loc, ["title", "content", "description"]);

  if (out.author && typeof out.author === "object") {
    out = {
      ...out,
      author: localizeAuthor(out.author as Record<string, unknown>, loc),
    } as T;
  }

  if (Array.isArray(out.categories)) {
    out = {
      ...out,
      categories: (out.categories as Record<string, unknown>[]).map((c) =>
        localizeCategory(c, loc),
      ),
    } as T;
  }

  return out;
}

export function localizeHoliday<T extends Record<string, unknown>>(
  holiday: T,
  locale?: AppLocale,
): T {
  const loc = locale ?? getCurrentLocale();
  let out = localizeFields(holiday, loc, ['name', 'description']);
  if (Array.isArray(out.poems)) {
    out = {
      ...out,
      poems: (out.poems as Record<string, unknown>[]).map((p) =>
        localizePoem(p, loc),
      ),
    };
  }
  return out;
}

export function localizeSeasonSlide<T extends Record<string, unknown>>(
  slide: T,
  locale?: AppLocale,
): T {
  return localizeFields(slide, locale ?? getCurrentLocale(), [
    'title',
    'subtitle',
    'altText',
  ]);
}

export function localizeZone<T extends Record<string, unknown>>(
  zone: T,
  locale?: AppLocale,
): T {
  return localizeFields(zone, locale ?? getCurrentLocale(), ['content']);
}

export function localizeItem<T extends Record<string, unknown>>(
  item: T,
  locale?: AppLocale,
): T {
  const loc = locale ?? getCurrentLocale();
  let out = localizeFields(item, loc, ['content', 'subtitle']);
  if (Array.isArray(out.itemZones)) {
    out = { ...out, itemZones: out.itemZones };
  }
  return out;
}

export function localizeQuestion<T extends Record<string, unknown>>(
  question: T,
  locale?: AppLocale,
): T {
  const loc = locale ?? getCurrentLocale();
  let out = localizeFields(question, loc, ['text']);
  if (Array.isArray(out.items)) {
    out = {
      ...out,
      items: (out.items as Record<string, unknown>[]).map((i) =>
        localizeItem(i, loc),
      ),
    };
  }
  if (Array.isArray(out.zones)) {
    out = {
      ...out,
      zones: (out.zones as Record<string, unknown>[]).map((z) =>
        localizeZone(z, loc),
      ),
    };
  }
  return out;
}

export function localizeQuiz<T extends Record<string, unknown>>(
  quiz: T,
  locale?: AppLocale,
): T {
  const loc = locale ?? getCurrentLocale();
  let out = localizeFields(quiz, loc, ['title', 'description']);
  if (Array.isArray(out.questions)) {
    out = {
      ...out,
      questions: (out.questions as Record<string, unknown>[]).map((q) =>
        localizeQuestion(q, loc),
      ),
    };
  }
  return out;
}

export function localizePoems<T extends Record<string, unknown>>(
  poems: T[],
  locale?: AppLocale,
): T[] {
  return poems.map((p) => localizePoem(p, locale));
}

export function localizeProseWork<T extends Record<string, unknown>>(
  work: T,
  locale?: AppLocale,
): T {
  const loc = locale ?? getCurrentLocale();
  let out = localizeFields(work, loc, ['title', 'description']);
  if (out.author && typeof out.author === 'object') {
    out = {
      ...out,
      author: localizeAuthor(out.author as Record<string, unknown>, loc),
    };
  }
  return out;
}

export function localizeProseChapter<T extends Record<string, unknown>>(
  chapter: T,
  locale?: AppLocale,
): T {
  return localizeFields(chapter, locale ?? getCurrentLocale(), [
    "title",
    "content",
  ]);
}

export function localizeProseWorks<T extends Record<string, unknown>>(
  works: T[],
  locale?: AppLocale,
): T[] {
  return works.map((w) => localizeProseWork(w, locale));
}

export function localizeProseChapters<T extends Record<string, unknown>>(
  chapters: T[],
  locale?: AppLocale,
): T[] {
  return chapters.map((c) => localizeProseChapter(c, locale));
}

export function localizeAuthors<T extends Record<string, unknown>>(
  authors: T[],
  locale?: AppLocale,
): T[] {
  return authors.map((a) => localizeAuthor(a, locale));
}

export function localizeCategories<T extends Record<string, unknown>>(
  categories: T[],
  locale?: AppLocale,
): T[] {
  return categories.map((c) => localizeCategory(c, locale));
}

export function localizeHolidays<T extends Record<string, unknown>>(
  holidays: T[],
  locale?: AppLocale,
): T[] {
  return holidays.map((h) => localizeHoliday(h, locale));
}
