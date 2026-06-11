import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const UA = "PoetryBelarus/1.0 (local dev; contact: admin@poetry.local)";
const WIKI_THUMB_SIZE = 400;
const REQUEST_DELAY_MS = 1500;
const AUTHORS_DIR = path.resolve(
  __dirname,
  "../../public/images/authors",
);

const TARGET_SLUGS = [
  "ales-pismanokov",
  "arkadz-kuliashou",
  "zmitrok-biadula",
  "danuta-bichel-zahnetava",
  "maksim-bahdanovich",
  "maksim-tank",
  "nil-hilevich",
  "petrus-brouka",
  "ryhor-baradulin",
  "uladzimir-karatkevich",
  "francishak-bahushevich",
  "yanka-kupala",
  "yanka-sipakov",
];

const FALLBACK_URLS: Record<string, string> = {
  "ales-pismanokov": "https://nashi-lyudi.by/images/33/2733.jpg",
  "danuta-bichel-zahnetava": "https://nashi-lyudi.by/images/73/8273.jpg",
  "yanka-sipakov": "https://karotkizmest.by/images/sipakou.jpg",
};

const EXTRA_QUERIES: Record<string, string[]> = {
  "maksim-tank": ["Максім Танк", "Максим Танк (поэт)"],
  "uladzimir-karatkevich": ["Владимир Короткевич"],
  "maksim-bahdanovich": ["Максім Багдановіч"],
  "petrus-brouka": ["Пятрусь Броўка", "Петрусь Бровка"],
  "ryhor-baradulin": ["Рыгор Барадулін", "Рыгор Барадулин"],
  "nil-hilevich": ["Ніл Гілевіч", "Нил Гилевич"],
  "francishak-bahushevich": ["Францішак Багушэвіч"],
  "arkadz-kuliashou": ["Аркадзь Куляшоў", "Аркадий Кулешов"],
  "zmitrok-biadula": ["Змітрок Бядуля"],
  "yanka-sipakov": ["Сипаков, Янка", "Янка Сіпакоў"],
  "ales-pismanokov": ["Алесь Пісьмянкоў", "Алесь Письмянков"],
  "danuta-bichel-zahnetava": ["Данута Бічэль-Загнетава"],
  "yanka-kupala": ["Янка Купала", "Иван Луцевич (Янка Купала)"],
};

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function wikiApi<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function isDecorativeFileName(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.includes("flag") ||
    lower.includes("logo") ||
    lower.includes("icon") ||
    lower.includes("prize") ||
    lower.includes("commons") ||
    lower.includes("wikipedia") ||
    lower.endsWith(".svg") ||
    lower.includes("заслужен")
  );
}

async function fetchFileThumb(
  fileTitle: string,
  lang = "commons",
): Promise<string | null> {
  const host =
    lang === "commons" ? "commons.wikimedia.org" : `${lang}.wikipedia.org`;
  const title = fileTitle.startsWith("File:") ? fileTitle : `File:${fileTitle}`;
  const url = `https://${host}/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=${WIKI_THUMB_SIZE}`;
  const data = await wikiApi<{
    query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
  }>(url);
  for (const page of Object.values(data?.query?.pages ?? {})) {
    if (page.thumbnail?.source) return page.thumbnail.source;
  }
  return null;
}

async function searchWikiTitle(query: string, lang: string): Promise<string | null> {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json`;
  const data = await wikiApi<[string, string[]]>(url);
  return data?.[1]?.[0] ?? null;
}

async function listPageImages(title: string, lang: string): Promise<string[]> {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=images&format=json`;
  const data = await wikiApi<{
    query?: { pages?: Record<string, { images?: Array<{ title: string }> }> };
  }>(url);
  for (const page of Object.values(data?.query?.pages ?? {})) {
    return page.images?.map((i) => i.title) ?? [];
  }
  return [];
}

async function fetchPageThumb(title: string, lang: string): Promise<string | null> {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=${WIKI_THUMB_SIZE}`;
  const data = await wikiApi<{
    query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
  }>(url);
  for (const page of Object.values(data?.query?.pages ?? {})) {
    if (page.thumbnail?.source) return page.thumbnail.source;
  }
  return null;
}

async function resolveFromWiki(name: string, slug: string): Promise<string | null> {
  const queries = [name, ...(EXTRA_QUERIES[slug] ?? [])];

  for (const query of queries) {
    for (const lang of ["be", "ru"] as const) {
      await sleep(REQUEST_DELAY_MS);
      const pageTitle = await searchWikiTitle(query, lang);
      if (!pageTitle) continue;

      await sleep(REQUEST_DELAY_MS);
      const pageThumb = await fetchPageThumb(pageTitle, lang);
      if (pageThumb) return pageThumb;

      await sleep(REQUEST_DELAY_MS);
      const files = await listPageImages(pageTitle, lang);
      for (const file of files) {
        if (isDecorativeFileName(file)) continue;
        await sleep(REQUEST_DELAY_MS);
        const thumb = await fetchFileThumb(file, lang);
        if (thumb) return thumb;
        const commonsThumb = await fetchFileThumb(file, "commons");
        if (commonsThumb) return commonsThumb;
      }
    }
  }

  return null;
}

async function downloadImage(url: string, dest: string): Promise<boolean> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return true;
}

async function main() {
  fs.mkdirSync(AUTHORS_DIR, { recursive: true });

  const authors = await prisma.author.findMany({
    where: { slug: { in: TARGET_SLUGS } },
    select: { id: true, slug: true, name: true, image: true },
    orderBy: { name: "asc" },
  });

  let updated = 0;
  const authorImagesMap: Record<string, string> = {};

  for (const author of authors) {
    const localPath = `/images/authors/${author.slug}.jpg`;
    const destFile = path.join(AUTHORS_DIR, `${author.slug}.jpg`);

    if (fs.existsSync(destFile)) {
      await prisma.author.update({
        where: { id: author.id },
        data: { image: localPath },
      });
      authorImagesMap[author.slug] = localPath;
      console.log(`  ✓ ${author.name} (already on disk)`);
      updated++;
      continue;
    }

    await sleep(REQUEST_DELAY_MS);
    const remoteUrl =
      (await resolveFromWiki(author.name, author.slug)) ??
      FALLBACK_URLS[author.slug] ??
      null;
    if (!remoteUrl) {
      console.warn(`  ⚠️  ${author.name}: image not found`);
      continue;
    }

    await sleep(500);
    const ok = await downloadImage(remoteUrl, destFile);
    if (!ok) {
      console.warn(`  ⚠️  ${author.name}: download failed`);
      continue;
    }

    await prisma.author.update({
      where: { id: author.id },
      data: { image: localPath },
    });
    authorImagesMap[author.slug] = localPath;
    console.log(`  ✓ ${author.name}`);
    updated++;
  }

  console.log(`\n✅ Downloaded/updated ${updated} author images`);
  console.log("Map for author-images.ts:");
  for (const [slug, img] of Object.entries(authorImagesMap)) {
    console.log(`  "${slug}": "${img}",`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
