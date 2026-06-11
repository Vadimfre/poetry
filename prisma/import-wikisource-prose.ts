import { PrismaClient, ProseKind } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import {
  AUTHOR_IMPORT_PROFILES,
  PROSE_CATALOG,
  ProseCatalogEntry,
  getAuthorProfile,
} from "./prose-catalog";
import { slugify } from "./lib/slugify";
import {
  getWikitext,
  listCategoryMembers,
} from "./lib/wikisource-client";
import {
  parseWikitextWork,
  shouldSkipPageTitle,
} from "./lib/wikitext-parser";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

type ImportTarget = {
  slug: string;
  wikisourcePage: string;
  authorSlug: string;
  kind?: ProseKind;
  year?: number;
  description?: string;
};

function parseArgs(argv: string[]) {
  const dryRun = argv.includes("--dry-run");
  const catalogOnly = argv.includes("--catalog-only");
  const skipCatalog = argv.includes("--skip-catalog");
  const allAuthors = argv.includes("--all-authors");
  const authorArg = argv.find((a) => a.startsWith("--author="));
  const authorSlug = authorArg?.split("=")[1];
  const limitArg = argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;

  return { dryRun, catalogOnly, skipCatalog, allAuthors, authorSlug, limit };
}

async function upsertWork(
  target: ImportTarget,
  dryRun: boolean,
): Promise<"ok" | "skip" | "missing"> {
  const author = await prisma.author.findUnique({
    where: { slug: target.authorSlug },
  });
  if (!author) {
    console.warn(`  ⚠ Author not in DB: ${target.authorSlug}`);
    return "missing";
  }

  console.log(`  📥 ${target.wikisourcePage} → ${target.slug}`);
  const wikitext = await getWikitext(target.wikisourcePage);
  if (!wikitext) {
    console.warn(`  ⚠ Page not found on Wikisource`);
    return "missing";
  }

  const parsed = parseWikitextWork(
    wikitext,
    target.wikisourcePage,
    target.kind,
  );
  if (!parsed) {
    console.warn(`  ⚠ Skipped (scan-only or too short)`);
    return "skip";
  }

  const data = {
    title: parsed.title,
    kind: target.kind ?? parsed.kind,
    description: target.description ?? parsed.description,
    year: target.year ?? parsed.year,
    authorId: author.id,
  };

  if (dryRun) {
    console.log(
      `  ✓ [dry-run] ${parsed.chapters.length} chapters, ${parsed.chapters.reduce((n, c) => n + c.content.length, 0)} chars`,
    );
    return "ok";
  }

  const work = await prisma.proseWork.upsert({
    where: { slug: target.slug },
    update: data,
    create: { slug: target.slug, ...data },
  });

  await prisma.proseChapter.deleteMany({ where: { proseWorkId: work.id } });

  const usedSlugs = new Set<string>();
  for (const chapter of parsed.chapters) {
    let slug = chapter.slug;
    let n = 2;
    while (usedSlugs.has(slug)) {
      slug = `${chapter.slug}-${n++}`;
    }
    usedSlugs.add(slug);

    await prisma.proseChapter.create({
      data: {
        proseWorkId: work.id,
        title: chapter.title,
        slug,
        order: chapter.order,
        content: chapter.content,
      },
    });
  }

  console.log(`  ✅ ${parsed.chapters.length} chapters saved`);
  return "ok";
}

function catalogTarget(entry: ProseCatalogEntry): ImportTarget {
  return {
    slug: entry.slug,
    wikisourcePage: entry.wikisourcePage,
    authorSlug: entry.authorSlug,
    kind: entry.kind,
    year: entry.year,
    description: entry.description,
  };
}

async function importCatalog(dryRun: boolean, limit?: number) {
  const entries = limit ? PROSE_CATALOG.slice(0, limit) : PROSE_CATALOG;
  console.log(`\n📚 Catalog import: ${entries.length} works`);

  let ok = 0;
  let skip = 0;
  let missing = 0;

  for (const entry of entries) {
    const result = await upsertWork(catalogTarget(entry), dryRun);
    if (result === "ok") ok++;
    else if (result === "skip") skip++;
    else missing++;
  }

  return { ok, skip, missing };
}

async function importAuthor(
  authorSlug: string,
  dryRun: boolean,
  limit?: number,
) {
  const profile = getAuthorProfile(authorSlug);
  if (!profile) {
    console.error(`Unknown author profile: ${authorSlug}`);
    process.exit(1);
  }

  console.log(`\n👤 Author import: ${authorSlug} (${profile.category})`);
  const members = await listCategoryMembers(profile.category, 500);
  const max = limit ?? profile.maxWorks ?? 20;

  let ok = 0;
  let skip = 0;
  let missing = 0;
  let imported = 0;

  for (const member of members) {
    if (imported >= max) break;
    if (shouldSkipPageTitle(member.title)) continue;

    const slug = slugify(
      `${member.title}-${authorSlug}`.replace(/\([^)]+\)/g, ""),
    );
    if (!slug) continue;

    const existing = await prisma.proseWork.findUnique({ where: { slug } });
    if (existing) continue;

    const result = await upsertWork(
      {
        slug,
        wikisourcePage: member.title,
        authorSlug,
      },
      dryRun,
    );

    if (result === "ok") {
      ok++;
      imported++;
    } else if (result === "skip") skip++;
    else missing++;
  }

  return { ok, skip, missing };
}

async function main() {
  const { dryRun, catalogOnly, skipCatalog, allAuthors, authorSlug, limit } =
    parseArgs(process.argv.slice(2));

  console.log("🌐 Wikisource prose importer (be.wikisource.org)");
  if (dryRun) console.log("   mode: dry-run");

  let totals = { ok: 0, skip: 0, missing: 0 };

  const catalogLimit = authorSlug || allAuthors ? undefined : limit;

  if (!skipCatalog) {
    const catalogStats = await importCatalog(dryRun, catalogLimit);
    totals.ok += catalogStats.ok;
    totals.skip += catalogStats.skip;
    totals.missing += catalogStats.missing;
  }

  if (!catalogOnly) {
    if (allAuthors) {
      for (const profile of AUTHOR_IMPORT_PROFILES) {
        const stats = await importAuthor(profile.authorSlug, dryRun, limit);
        totals.ok += stats.ok;
        totals.skip += stats.skip;
        totals.missing += stats.missing;
      }
    } else if (authorSlug) {
      const stats = await importAuthor(authorSlug, dryRun, limit);
      totals.ok += stats.ok;
      totals.skip += stats.skip;
      totals.missing += stats.missing;
    }
  }

  const count = await prisma.proseWork.count();
  console.log(
    `\n📊 Done: ${totals.ok} imported, ${totals.skip} skipped, ${totals.missing} missing. Total prose works in DB: ${count}`,
  );
  if (!dryRun && totals.ok > 0) {
    console.log("💡 Run `npm run seed:i18n -- prose` for ru/en translations.");
  }
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
