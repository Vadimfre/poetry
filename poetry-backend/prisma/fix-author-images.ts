import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import { AUTHOR_IMAGES } from "./author-images";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const UA = "PoetryBelarus/1.0 (local dev; contact: admin@poetry.local)";
const WIKI_THUMB_SIZE = 330;
const REQUEST_DELAY_MS = 2200;

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

async function fetchFileThumb(fileTitle: string, lang = "commons"): Promise<string | null> {
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
  const extraQueries: Record<string, string[]> = {
    "maksim-tank": ["Максім Танк", "Максим Танк (поэт)"],
    "uladzimir-karatkevich": ["Владимир Короткевич"],
    tsiotka: ["Алаіза Пашкевіч", "Цётка"],
    "maksim-bahdanovich": ["Максім Багдановіч"],
    "petrus-brouka": ["Пятрусь Броўка", "Петрусь Бровка"],
    "ryhor-baradulin": ["Рыгор Барадулін", "Рыгор Барадулин"],
    "nil-hilevich": ["Ніл Гілевіч", "Нил Гилевич"],
    "francishak-bahushevich": ["Францішак Багушэвіч"],
    "arkadz-kuliashou": ["Аркадзь Куляшоў", "Аркадий Кулешов"],
    "zmitrok-biadula": ["Змітрок Бядуля"],
    "yanka-sipakov": ["Сипаков, Янка", "Янка Сіпакоў"],
    "larysa-hieniyush": ["Ларыса Геніюш", "Лариса Гениюш"],
    "andrei-khadanovich": ["Андрэй Хадановіч", "Андрей Хаданович"],
    "ales-pismanokov": ["Алесь Пісьмянкоў", "Алесь Письмянков"],
    "danuta-bichel-zahnetava": ["Данута Бічэль-Загнетава"],
    "kastus-veranitsyn": ["Канстанцін Вераніцын", "Константин Вераницы"],
  };

  const queries = [name, ...(extraQueries[slug] ?? [])];

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

async function resolveImage(
  slug: string,
  name: string,
  current: string | null,
): Promise<string | null> {
  if (AUTHOR_IMAGES[slug]) return AUTHOR_IMAGES[slug];

  const needsFix =
    !current ||
    current.includes("encrypted-tbn0.gstatic.com") ||
    current.includes("gstatic.com");

  if (!needsFix && current) return null;

  return resolveFromWiki(name, slug);
}

async function main() {
  const authors = await prisma.author.findMany({
    select: { id: true, slug: true, name: true, image: true },
  });
  let updated = 0;

  for (const author of authors) {
    const image = await resolveImage(author.slug, author.name, author.image);
    if (!image || author.image === image) continue;

    await prisma.author.update({
      where: { id: author.id },
      data: { image },
    });
    console.log(`  ✓ ${author.name}`);
    updated++;
  }

  console.log(`\n✅ Author images updated: ${updated}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
