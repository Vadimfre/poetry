/**
 * Fills i18n.ru and i18n.en for all content (poems, authors, quizzes, etc.)
 * Run: npm run seed:i18n
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { translate } from "google-translate-api-x";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DELAY_MS = 80;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function tr(text: string, to: "ru" | "en"): Promise<string> {
  const trimmed = text?.trim();
  if (!trimmed) return text ?? "";

  const chunkSize = 4000;
  if (trimmed.length <= chunkSize) {
    try {
      const res = await translate(trimmed, { from: "be", to });
      return res.text;
    } catch {
      const res = await translate(trimmed, { to });
      return res.text;
    }
  }

  const parts: string[] = [];
  for (let i = 0; i < trimmed.length; i += chunkSize) {
    const chunk = trimmed.slice(i, i + chunkSize);
    try {
      const res = await translate(chunk, { from: "be", to });
      parts.push(res.text);
    } catch {
      const res = await translate(chunk, { to });
      parts.push(res.text);
    }
    await sleep(DELAY_MS);
  }
  return parts.join("");
}

async function trFields(
  fields: Record<string, string | null | undefined>,
  to: "ru" | "en",
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value == null || value === "") continue;
    out[key] = await tr(value, to);
    await sleep(DELAY_MS);
  }
  return out;
}

type I18nJson = Record<string, Record<string, string>>;

function mergeI18n(
  existing: I18nJson | null,
  locale: "ru" | "en",
  fields: Record<string, string>,
): I18nJson {
  return {
    ...(existing ?? {}),
    [locale]: { ...(existing?.[locale] ?? {}), ...fields },
  };
}

async function seedPoems() {
  const poems = await prisma.poem.findMany();
  console.log(`\n📜 Poems: ${poems.length}`);

  for (let i = 0; i < poems.length; i++) {
    const poem = poems[i];
    const existing = (poem.i18n as I18nJson | null) ?? {};
    const be = existing.be ?? {
      title: poem.title,
      content: poem.content,
      description: poem.description ?? "",
    };

    let i18n: I18nJson = { ...existing, be };

    if (!existing.ru) {
      console.log(`  [${i + 1}/${poems.length}] RU: ${poem.slug}`);
      const ru = await trFields(
        {
          title: be.title,
          content: be.content,
          description: be.description,
        },
        "ru",
      );
      i18n = mergeI18n(i18n, "ru", ru);
    }

    if (!existing.en) {
      console.log(`  [${i + 1}/${poems.length}] EN: ${poem.slug}`);
      const en = await trFields(
        {
          title: be.title,
          content: be.content,
          description: be.description,
        },
        "en",
      );
      i18n = mergeI18n(i18n, "en", en);
    }

    await prisma.poem.update({
      where: { id: poem.id },
      data: { i18n },
    });
  }
}

async function seedAuthors() {
  const authors = await prisma.author.findMany();
  console.log(`\n👤 Authors: ${authors.length}`);

  for (const author of authors) {
    const existing = (author.i18n as I18nJson | null) ?? {};
    const be = existing.be ?? {
      name: author.name,
      bio: author.bio ?? "",
    };
    let i18n: I18nJson = { ...existing, be };

    if (!existing.ru) {
      console.log(`  RU bio: ${author.slug}`);
      const ru = await trFields({ name: be.name, bio: be.bio }, "ru");
      i18n = mergeI18n(i18n, "ru", ru);
    }
    if (!existing.en) {
      console.log(`  EN bio: ${author.slug}`);
      const en = await trFields({ name: be.name, bio: be.bio }, "en");
      i18n = mergeI18n(i18n, "en", en);
    }

    await prisma.author.update({
      where: { id: author.id },
      data: { i18n },
    });
  }
}

async function seedCategories() {
  const categories = await prisma.category.findMany();
  console.log(`\n📂 Categories: ${categories.length}`);

  for (const cat of categories) {
    const existing = (cat.i18n as I18nJson | null) ?? {};
    const be = existing.be ?? {
      name: cat.name,
      description: cat.description ?? "",
    };
    let i18n: I18nJson = { ...existing, be };

    if (!existing.ru) {
      const ru = await trFields(
        { name: be.name, description: be.description },
        "ru",
      );
      i18n = mergeI18n(i18n, "ru", ru);
    }
    if (!existing.en) {
      const en = await trFields(
        { name: be.name, description: be.description },
        "en",
      );
      i18n = mergeI18n(i18n, "en", en);
    }

    await prisma.category.update({
      where: { id: cat.id },
      data: { i18n },
    });
  }
}

async function seedHolidays() {
  const holidays = await prisma.holiday.findMany();
  console.log(`\n🎉 Holidays: ${holidays.length}`);

  for (const h of holidays) {
    const existing = (h.i18n as I18nJson | null) ?? {};
    const be = existing.be ?? {
      name: h.name,
      description: h.description ?? "",
    };
    let i18n: I18nJson = { ...existing, be };

    if (!existing.ru) {
      const ru = await trFields(
        { name: be.name, description: be.description },
        "ru",
      );
      i18n = mergeI18n(i18n, "ru", ru);
    }
    if (!existing.en) {
      const en = await trFields(
        { name: be.name, description: be.description },
        "en",
      );
      i18n = mergeI18n(i18n, "en", en);
    }

    await prisma.holiday.update({ where: { id: h.id }, data: { i18n } });
  }
}

async function seedSeasonSlides() {
  const slides = await prisma.seasonSlide.findMany();
  console.log(`\n🖼 Season slides: ${slides.length}`);

  for (const slide of slides) {
    const existing = (slide.i18n as I18nJson | null) ?? {};
    const be = existing.be ?? {
      title: slide.title,
      subtitle: slide.subtitle,
      altText: slide.altText,
    };
    let i18n: I18nJson = { ...existing, be };

    if (!existing.ru) {
      const ru = await trFields(
        { title: be.title, subtitle: be.subtitle, altText: be.altText },
        "ru",
      );
      i18n = mergeI18n(i18n, "ru", ru);
    }
    if (!existing.en) {
      const en = await trFields(
        { title: be.title, subtitle: be.subtitle, altText: be.altText },
        "en",
      );
      i18n = mergeI18n(i18n, "en", en);
    }

    await prisma.seasonSlide.update({
      where: { id: slide.id },
      data: { i18n },
    });
  }
}

async function seedQuizzes() {
  const quizzes = await prisma.quiz.findMany({
    include: {
      questions: {
        include: { items: true, zones: true },
      },
    },
  });
  console.log(`\n🧩 Quizzes: ${quizzes.length}`);

  for (const quiz of quizzes) {
    const existing = (quiz.i18n as I18nJson | null) ?? {};
    const be = {
      title: quiz.title,
      description: quiz.description ?? "",
      ...(existing.be ?? {}),
    };
    let quizI18n: I18nJson = { ...existing, be };

    if (!existing.ru) {
      const ru = await trFields(
        { title: be.title, description: be.description },
        "ru",
      );
      quizI18n = mergeI18n(quizI18n, "ru", ru);
    }
    if (!existing.en) {
      const en = await trFields(
        { title: be.title, description: be.description },
        "en",
      );
      quizI18n = mergeI18n(quizI18n, "en", en);
    }

    await prisma.quiz.update({
      where: { id: quiz.id },
      data: { i18n: quizI18n },
    });

    for (const question of quiz.questions) {
      const qExisting = (question.i18n as I18nJson | null) ?? {};
      const qBe = { text: question.text, ...(qExisting.be ?? {}) };
      let qI18n: I18nJson = { ...qExisting, be: qBe };

      if (!qExisting.ru) {
        const ru = await trFields({ text: qBe.text }, "ru");
        qI18n = mergeI18n(qI18n, "ru", ru);
      }
      if (!qExisting.en) {
        const en = await trFields({ text: qBe.text }, "en");
        qI18n = mergeI18n(qI18n, "en", en);
      }

      await prisma.question.update({
        where: { id: question.id },
        data: { i18n: qI18n },
      });

      for (const item of question.items) {
        const iExisting = (item.i18n as I18nJson | null) ?? {};
        const iBe = {
          content: item.content,
          subtitle: item.subtitle ?? "",
          ...(iExisting.be ?? {}),
        };
        let iI18n: I18nJson = { ...iExisting, be: iBe };

        if (!iExisting.ru) {
          const ru = await trFields(
            { content: iBe.content, subtitle: iBe.subtitle },
            "ru",
          );
          iI18n = mergeI18n(iI18n, "ru", ru);
        }
        if (!iExisting.en) {
          const en = await trFields(
            { content: iBe.content, subtitle: iBe.subtitle },
            "en",
          );
          iI18n = mergeI18n(iI18n, "en", en);
        }

        await prisma.item.update({
          where: { id: item.id },
          data: { i18n: iI18n },
        });
      }

      for (const zone of question.zones) {
        const zExisting = (zone.i18n as I18nJson | null) ?? {};
        const zBe = { content: zone.content, ...(zExisting.be ?? {}) };
        let zI18n: I18nJson = { ...zExisting, be: zBe };

        if (!zExisting.ru) {
          const ru = await trFields({ content: zBe.content }, "ru");
          zI18n = mergeI18n(zI18n, "ru", ru);
        }
        if (!zExisting.en) {
          const en = await trFields({ content: zBe.content }, "en");
          zI18n = mergeI18n(zI18n, "en", en);
        }

        await prisma.zone.update({
          where: { id: zone.id },
          data: { i18n: zI18n },
        });
      }
    }
  }
}

async function seedProseWorks() {
  const works = await prisma.proseWork.findMany({
    include: { chapters: { orderBy: { order: "asc" } } },
  });
  console.log(`\n📚 Prose works: ${works.length}`);

  for (const work of works) {
    const existing = (work.i18n as I18nJson | null) ?? {};
    const be = existing.be ?? {
      title: work.title,
      description: work.description ?? "",
    };
    let i18n: I18nJson = { ...existing, be };

    if (!existing.ru) {
      const ru = await trFields(
        { title: be.title, description: be.description },
        "ru",
      );
      i18n = mergeI18n(i18n, "ru", ru);
    }
    if (!existing.en) {
      const en = await trFields(
        { title: be.title, description: be.description },
        "en",
      );
      i18n = mergeI18n(i18n, "en", en);
    }

    await prisma.proseWork.update({
      where: { id: work.id },
      data: { i18n },
    });

    for (const chapter of work.chapters) {
      const chExisting = (chapter.i18n as I18nJson | null) ?? {};
      const chBe = chExisting.be ?? {
        title: chapter.title,
        content: chapter.content,
      };
      let chI18n: I18nJson = { ...chExisting, be: chBe };

      if (!chExisting.ru) {
        const ru = await trFields(
          { title: chBe.title, content: chBe.content },
          "ru",
        );
        chI18n = mergeI18n(chI18n, "ru", ru);
      }
      if (!chExisting.en) {
        const en = await trFields(
          { title: chBe.title, content: chBe.content },
          "en",
        );
        chI18n = mergeI18n(chI18n, "en", en);
      }

      await prisma.proseChapter.update({
        where: { id: chapter.id },
        data: { i18n: chI18n },
      });
    }
  }
}

export async function runI18nSeed() {
  const only = process.env.SEED_I18N_ONLY;
  console.log("🌍 Seeding RU/EN translations (may take several minutes)...\n");

  if (!only || only === "categories") await seedCategories();
  if (!only || only === "authors") await seedAuthors();
  if (!only || only === "slides") await seedSeasonSlides();
  if (!only || only === "holidays") await seedHolidays();
  if (!only || only === "poems") await seedPoems();
  if (!only || only === "quizzes") await seedQuizzes();
  if (!only || only === "prose") await seedProseWorks();

  const stats = await prisma.$queryRaw<
    { poems_ru: number; poems_en: number; authors_ru: number; quizzes_ru: number }[]
  >`
    SELECT
      (SELECT COUNT(*)::int FROM "Poem" WHERE "i18n" ? 'ru') as poems_ru,
      (SELECT COUNT(*)::int FROM "Poem" WHERE "i18n" ? 'en') as poems_en,
      (SELECT COUNT(*)::int FROM "Author" WHERE "i18n" ? 'ru') as authors_ru,
      (SELECT COUNT(*)::int FROM "Quiz" WHERE "i18n" ? 'ru') as quizzes_ru
  `;
  console.log("\n✅ i18n done:", stats[0]);
}

async function main() {
  await runI18nSeed();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
