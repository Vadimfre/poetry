/**
 * One-time: download all external images into public/images.
 * Run: npx ts-node prisma/download-all-local-images.ts
 */
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../../public/images");
const UA = "PoetryBelarus/1.0 (local dev)";

const AUTHOR_DOWNLOADS: Record<string, string> = {
  "yakub-kolas":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Kanstantyn_Mickievi%C4%8D_%28Jakub_Ko%C5%82as%29._%D0%9A%D0%B0%D0%BD%D1%81%D1%82%D0%B0%D0%BD%D1%82%D1%8B%D0%BD_%D0%9C%D1%96%D1%86%D0%BA%D0%B5%D0%B2%D1%96%D1%87_%28%D0%AF%D0%BA%D1%83%D0%B1_%D0%9A%D0%BE%D0%BB%D0%B0%D1%81%29_%281925%29.jpg/330px-Kanstantyn_Mickievi%C4%8D_%28Jakub_Ko%C5%82as%29._%D0%9A%D0%B0%D0%BD%D1%81%D1%82%D0%B0%D0%BD%D1%82%D1%8B%D0%BD_%D0%9C%D1%96%D1%86%D0%BA%D0%B5%D0%B2%D1%96%D1%87_%28%D0%AF%D0%BA%D1%83%D0%B1_%D0%9A%D0%BE%D0%BB%D0%B0%D1%81%29_%281925%29.jpg",
  tsiotka:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/A%C5%82aiza_Pa%C5%A1kievi%C4%8D._%D0%90%D0%BB%D0%B0%D1%96%D0%B7%D0%B0_%D0%9F%D0%B0%D1%88%D0%BA%D0%B5%D0%B2%D1%96%D1%87_%281912%29.jpg/330px-A%C5%82aiza_Pa%C5%A1kievi%C4%8D._%D0%90%D0%BB%D0%B0%D1%96%D0%B7%D0%B0_%D0%9F%D0%B0%D1%88%D0%BA%D0%B5%D0%B2%D1%96%D1%87_%281912%29.jpg",
  "larysa-hieniyush":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/%C5%81arysa_Hieniju%C5%A1._%D0%9B%D0%B0%D1%80%D1%8B%D1%81%D0%B0_%D0%93%D0%B5%D0%BD%D1%96%D1%8E%D1%88_%281930-39%29.jpg/330px-%C5%81arysa_Hieniju%C5%A1._%D0%9B%D0%B0%D1%80%D1%8B%D1%81%D0%B0_%D0%93%D0%B5%D0%BD%D1%96%D1%8E%D1%88_%281930-39%29.jpg",
  "andrei-khadanovich":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Hadanovich2011.jpg/330px-Hadanovich2011.jpg",
  "kastus-veranitsyn":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gorodok-verenitsyn.JPG/330px-Gorodok-verenitsyn.JPG",
};

/** Copy from existing authors/{slug}.jpg */
const POET_FROM_AUTHOR: Record<string, string> = {
  bagushevich: "francishak-bahushevich",
  kupala: "yanka-kupala",
  kolas: "yakub-kolas",
  bagdanovich: "maksim-bahdanovich",
  byadulya: "zmitrok-biadula",
  brouka: "petrus-brouka",
  tank: "maksim-tank",
  kulyashou: "arkadz-kuliashou",
  karatkevich: "uladzimir-karatkevich",
  baradulin: "ryhor-baradulin",
  gilevich: "nil-hilevich",
  sipakau: "yanka-sipakov",
  bryl: "yanka-bryl",
  tsiotka: "tsiotka",
  bichel: "danuta-bichel-zahnetava",
  khadanovich: "andrei-khadanovich",
};

/** Wikipedia search for poets without author file */
const POET_WIKI: Record<string, string[]> = {
  garetski: ["Максим Гарецкий", "Maxim Haretski"],
  krapiva: ["Купала (псевдоним)", "Янка Купала"],
  chorny: ["Змитер Жylka", "Чёрный (поэт)"],
  panchanka: ["Иван Панченко (поэт)", "Іван Панчанка"],
  bykau: ["Vasil Bykau", "Вasil Bykau"],
  melezh: ["Ivan Melezh", "Іван Мележ"],
  viartsinski: ["Anatol Viartsinski", "Аnatol Viartsinski"],
  buraulkin: ["Mikalai Buraukin"],
  shamyakin: ["Ivan Shamyakin", "Іван Шамякін"],
  adamovich: ["Anton Adamovich"],
  builo: ["Nil Builo"],
  yanishchyts: ["Ryhor Yanishchyts"],
  nyaklyaeu: ["Uladzimir Nyaklyaeu"],
  dranko: ["Maksim Dranko"],
  mort: ["Natalia Mort", "Наталля Март"],
};

const SEASON_HERO: Record<string, string> = {
  "winter.jpg": "winter-1.png",
  "spring.jpg": "spring-1.png",
  "summer.jpg": "summer-1.png",
  "autumn.jpg": "autumn-1.png",
};

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function download(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.warn(`  FAIL ${res.status} ${url}`);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    console.log(`  OK ${path.relative(ROOT, dest)}`);
    return true;
  } catch (e) {
    console.warn(`  ERR ${url}`, e);
    return false;
  }
}

async function wikiThumb(query: string): Promise<string | null> {
  for (const lang of ["be", "ru", "en"]) {
    const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json`;
    const searchRes = await fetch(searchUrl, { headers: { "User-Agent": UA } });
    if (!searchRes.ok) continue;
    const [, titles] = (await searchRes.json()) as [string, string[]];
    const title = titles?.[0];
    if (!title) continue;

    const imgUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=400`;
    const imgRes = await fetch(imgUrl, { headers: { "User-Agent": UA } });
    if (!imgRes.ok) continue;
    const data = (await imgRes.json()) as {
      query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
    };
    for (const page of Object.values(data.query?.pages ?? {})) {
      if (page.thumbnail?.source) return page.thumbnail.source;
    }
    await sleep(300);
  }
  return null;
}

function copyFile(src: string, dest: string) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`  COPY ${path.relative(ROOT, dest)}`);
}

async function main() {
  console.log("📥 Authors (Wikimedia)...");
  for (const [slug, url] of Object.entries(AUTHOR_DOWNLOADS)) {
    const dest = path.join(ROOT, "authors", `${slug}.jpg`);
    if (fs.existsSync(dest)) {
      console.log(`  skip ${slug} (exists)`);
      continue;
    }
    await download(url, dest);
    await sleep(500);
  }

  console.log("\n📥 Season hero images...");
  const seasonsDir = path.join(ROOT, "seasons");
  for (const [hero, source] of Object.entries(SEASON_HERO)) {
    const src = path.join(seasonsDir, source);
    const dest = path.join(seasonsDir, hero);
    if (!fs.existsSync(src)) {
      console.warn(`  missing source ${source}`);
      continue;
    }
    if (fs.existsSync(dest)) {
      console.log(`  skip ${hero} (exists)`);
      continue;
    }
    copyFile(src, dest);
  }

  console.log("\n📥 Poets (from authors + Wikipedia)...");
  const poetsDir = path.join(ROOT, "poets");
  fs.mkdirSync(poetsDir, { recursive: true });

  for (const [poet, authorSlug] of Object.entries(POET_FROM_AUTHOR)) {
    const dest = path.join(poetsDir, `${poet}.jpg`);
    if (fs.existsSync(dest)) {
      console.log(`  skip poets/${poet}.jpg`);
      continue;
    }
    const authorPath = path.join(ROOT, "authors", `${authorSlug}.jpg`);
    if (fs.existsSync(authorPath)) {
      copyFile(authorPath, dest);
    } else {
      console.warn(`  no author file for ${poet} -> ${authorSlug}`);
    }
  }

  for (const [poet, queries] of Object.entries(POET_WIKI)) {
    const dest = path.join(poetsDir, `${poet}.jpg`);
    if (fs.existsSync(dest)) {
      console.log(`  skip poets/${poet}.jpg`);
      continue;
    }
    for (const q of queries) {
      const thumb = await wikiThumb(q);
      if (thumb && (await download(thumb, dest))) break;
      await sleep(500);
    }
    if (!fs.existsSync(dest)) {
      const fallback = path.join(ROOT, "author-placeholder.svg");
      console.warn(`  fallback placeholder for ${poet}`);
      // use kupala as generic fallback for quiz
      const kupala = path.join(ROOT, "authors", "yanka-kupala.jpg");
      if (fs.existsSync(kupala)) copyFile(kupala, dest);
      else if (fs.existsSync(fallback)) copyFile(fallback, dest);
    }
    await sleep(800);
  }

  console.log("\n✅ Done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
