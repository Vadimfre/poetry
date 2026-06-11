import { ProseKind } from "@prisma/client";

/** Явны каталог школьных і класічных твораў з точнымі назвамі старонак Wikisource. */
export type ProseCatalogEntry = {
  slug: string;
  wikisourcePage: string;
  authorSlug: string;
  kind?: ProseKind;
  year?: number;
  description?: string;
};

export const PROSE_CATALOG: ProseCatalogEntry[] = [
  {
    slug: "symon-muzyka",
    wikisourcePage: "\u0421\u044b\u043c\u043e\u043d-\u043c\u0443\u0437\u044b\u043a\u0430",
    authorSlug: "yakub-kolas",
    kind: "POEM",
    year: 1925,
    description:
      "\u041f\u0430\u044d\u043c\u0430 \u043f\u0440\u0430 \u043c\u0430\u0441\u0442\u0430\u043a\u0430-\u043c\u0443\u0437\u044b\u043a\u0430\u043d\u0442\u0430 \u0456 \u044f\u0433\u043e \u0448\u043b\u044f\u0445 \u0443 \u0441\u0432\u0435\u0442 \u043f\u0440\u044b\u0433\u043e\u0436\u0430\u0433\u0430 \u2014 \u0430\u0434\u0437\u0456\u043d \u0437 \u0433\u0430\u043b\u043e\u0443\u043d\u044b\u0445 \u0442\u0432\u043e\u0440\u0430\u045e \u042f\u043a\u0443\u0431\u0430 \u041a\u043e\u043b\u0430\u0441\u0430.",
  },
  {
    slug: "dzionnik-chorny",
    wikisourcePage: "\u0414\u0437\u0451\u043d\u043d\u0456\u043a (\u0427\u043e\u0440\u043d\u044b)",
    authorSlug: "kuzma-chorny",
    kind: "NOVEL",
    year: 1944,
    description:
      "\u041c\u0435\u043c\u0443\u0430\u0440\u044b \u041a\u0443\u0437\u044c\u043c\u044b \u0427\u043e\u0440\u043d\u0430\u0433\u0430 \u2014 \u0448\u0442\u043e\u0434\u0437\u0451\u043d\u043d\u044b\u044f \u0437\u0430\u043f\u0456\u0441\u044b \u043f\u0456\u0441\u044c\u043c\u0435\u043d\u043d\u0456\u043a\u0430.",
  },
  {
    slug: "poshuki-buduchyni",
    wikisourcePage: "\u041f\u043e\u0448\u0443\u043a\u0456 \u0431\u0443\u0434\u0443\u0447\u044b\u043d\u0456",
    authorSlug: "kuzma-chorny",
    kind: "NOVEL",
  },
  {
    slug: "zhurauliny-vyraj",
    wikisourcePage: "\u0416\u0443\u0440\u0430\u045e\u043b\u0456\u043d\u044b \u0432\u044b\u0440\u0430\u0439",
    authorSlug: "yakub-kolas",
    kind: "POEM",
    year: 1910,
  },
  {
    slug: "bahtushchyna-chorny",
    wikisourcePage: "\u0411\u0430\u0446\u044c\u043a\u0430\u045e\u0448\u0447\u044b\u043d\u0430 (\u0427\u043e\u0440\u043d\u044b)",
    authorSlug: "kuzma-chorny",
    kind: "STORY",
  },
  {
    slug: "mlechny-shlyakh-chorny",
    wikisourcePage: "\u041c\u043b\u0435\u0447\u043d\u044b \u0428\u043b\u044f\u0445 (\u0427\u043e\u0440\u043d\u044b)",
    authorSlug: "kuzma-chorny",
    kind: "STORY",
  },
  {
    slug: "vandrouniki-kolas",
    wikisourcePage: "\u0412\u0430\u043d\u0434\u0440\u043e\u045e\u043d\u0456\u043a\u0456",
    authorSlug: "yakub-kolas",
    kind: "POEM",
  },
  {
    slug: "adzinoki-kurgan",
    wikisourcePage: "\u0410\u0434\u0437\u0456\u043d\u043e\u043a\u0456 \u043a\u0443\u0440\u0433\u0430\u043d",
    authorSlug: "yakub-kolas",
    kind: "POEM",
  },
  {
    slug: "asyinae-gnyazdo",
    wikisourcePage: "\u0410\u0441\u0456\u043d\u0430\u0435 \u0433\u043d\u044f\u0437\u0434\u043e",
    authorSlug: "yakub-kolas",
    kind: "POEM",
  },
];

/** Імпарт усіх твораў з катэгорыі аўтара на Wikisource. */
export type AuthorImportProfile = {
  authorSlug: string;
  category: string;
  maxWorks?: number;
};

export const AUTHOR_IMPORT_PROFILES: AuthorImportProfile[] = [
  {
    authorSlug: "yakub-kolas",
    category: "Category:\u042f\u043a\u0443\u0431 \u041a\u043e\u043b\u0430\u0441",
    maxWorks: 25,
  },
  {
    authorSlug: "yanka-kupala",
    category: "Category:\u042f\u043d\u043a\u0430 \u041a\u0443\u043f\u0430\u043b\u0430",
    maxWorks: 15,
  },
  {
    authorSlug: "kuzma-chorny",
    category: "Category:\u041a\u0443\u0437\u044c\u043c\u0430 \u0427\u043e\u0440\u043d\u044b",
    maxWorks: 20,
  },
  {
    authorSlug: "maksim-bahdanovich",
    category: "Category:\u041c\u0430\u043a\u0441\u0456\u043c \u0411\u0430\u0433\u0434\u0430\u043d\u043e\u0432\u0456\u0447",
    maxWorks: 15,
  },
  {
    authorSlug: "zmitrok-biadula",
    category: "Category:\u0417\u043c\u0456\u0442\u0440\u043e\u043a \u0411\u044f\u0434\u0443\u043b\u044f",
    maxWorks: 10,
  },
  {
    authorSlug: "francishak-bahushevich",
    category: "Category:\u0424\u0440\u0430\u043d\u0446\u0456\u0448\u0430\u043a \u0411\u0430\u0433\u0443\u0448\u044d\u0432\u0456\u0447",
    maxWorks: 10,
  },
];

export function getAuthorProfile(authorSlug: string): AuthorImportProfile | undefined {
  return AUTHOR_IMPORT_PROFILES.find((p) => p.authorSlug === authorSlug);
}
