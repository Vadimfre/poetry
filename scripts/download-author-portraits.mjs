import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AUTHOR_PORTRAIT_URLS } from "./author-portrait-urls.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/images/authors");
const UA = "PoetryBelarus/1.0 (author portraits; contact: admin@poetry.local)";

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) throw new Error(`too small (${buf.length} bytes)`);
  if (buf[0] !== 0xff || buf[1] !== 0xd8) {
    throw new Error("not a JPEG");
  }
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function wikiFilePath(fileName) {
  const url = `https://ru.wikipedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    redirect: "follow",
  });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  return buf;
}

const WIKI_FALLBACK_FILES = {
  "andrei-makayonak": "Andrei Makayonak.jpg",
  "arkadz-kuliashou": "Arkady Kuleshov.jpg",
  "francishak-bahushevich": "Francishak Bahushevich.jpg",
  "kuzma-chorny": "Kuzma Chorny.jpg",
  "maksim-bahdanovich": "Maksim Bahdanovich.jpg",
  "maksim-tank": "Maksim Tank.jpg",
  "nil-hilevich": "Nil Hilevich.jpg",
  "petrus-brouka": "Petrus Brouka.jpg",
  "ryhor-baradulin": "Ryhor Baradulin.jpg",
  "uladzimir-karatkevich": "Uladzimir Karatkevich.jpg",
  "yanka-kupala": "Yanka Kupala.jpg",
  "zmitrok-biadula": "Zmitrok Biadula.jpg",
};

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const slugs = Object.keys(AUTHOR_PORTRAIT_URLS);
  let ok = 0;
  let fail = 0;

  for (const slug of slugs) {
    const dest = path.join(OUT, `${slug}.jpg`);
    const primary = AUTHOR_PORTRAIT_URLS[slug];

    try {
      const size = await download(primary, dest);
      console.log(`OK  ${slug} (${size} bytes)`);
      ok++;
      await new Promise((r) => setTimeout(r, 800));
      continue;
    } catch (e) {
      console.warn(`FAIL ${slug} primary: ${e.message}`);
    }

    const wikiFile = WIKI_FALLBACK_FILES[slug];
    if (wikiFile) {
      try {
        const buf = await wikiFilePath(wikiFile);
        if (buf) {
          fs.writeFileSync(dest, buf);
          console.log(`OK  ${slug} (wiki fallback, ${buf.length} bytes)`);
          ok++;
          await new Promise((r) => setTimeout(r, 1200));
          continue;
        }
      } catch (e) {
        console.warn(`FAIL ${slug} wiki: ${e.message}`);
      }
    }

    if (fs.existsSync(dest)) {
      console.log(`KEEP ${slug} (existing file kept)`);
      ok++;
    } else {
      console.error(`MISS ${slug}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} ok, ${fail} missing`);
  if (fail > 0) process.exit(1);
}

main();
