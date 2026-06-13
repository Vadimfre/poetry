import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import { AUTHOR_BIOS_FULL } from "./data/author-bios-full";
import { authorImageForSlug } from "./author-images";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

type I18nJson = Record<string, Record<string, string>>;

function mergeI18n(
  existing: I18nJson | null,
  locale: "be" | "ru" | "en",
  fields: Record<string, string>,
): I18nJson {
  return {
    ...(existing ?? {}),
    [locale]: { ...(existing?.[locale] ?? {}), ...fields },
  };
}

async function main() {
  const authors = await prisma.author.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      bio: true,
      image: true,
      birthYear: true,
      deathYear: true,
      i18n: true,
    },
  });

  let updated = 0;

  for (const author of authors) {
    const entry = AUTHOR_BIOS_FULL[author.slug];
    if (!entry) {
      console.warn(`⚠️  No full bio for: ${author.slug}`);
      continue;
    }

    const image =
      authorImageForSlug(author.slug) ?? entry.image ?? author.image;
    const birthYear = entry.birthYear ?? author.birthYear;
    const deathYear =
      entry.deathYear !== undefined ? entry.deathYear : author.deathYear;

    const existingI18n = (author.i18n as I18nJson | null) ?? {};
    let i18n = mergeI18n(existingI18n, "be", {
      name: author.name,
      bio: entry.bio,
    });
    i18n = mergeI18n(i18n, "ru", {
      name: author.name,
      bio: entry.bioRu,
    });

    await prisma.author.update({
      where: { id: author.id },
      data: {
        bio: entry.bio,
        image,
        birthYear,
        deathYear,
        i18n,
      },
    });

    console.log(
      `✓ ${author.name} (${entry.bio.length} be / ${entry.bioRu.length} ru chars)`,
    );
    updated++;
  }

  console.log(`\n✅ Updated ${updated} authors with full bios and i18n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
