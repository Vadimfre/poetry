import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/images/authors");
const UA = "PoetryBelarus/1.0";

const MISSING = {
  "ales-staver": [
    "https://ru.wikipedia.org/wiki/Special:FilePath/Staver%20A.jpg",
  ],
  "anatol-vertinsky": [
    "https://ru.wikipedia.org/wiki/Special:FilePath/Vertinski%20Anatoly%20Ilich.jpg",
  ],
};

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  for (const [slug, urls] of Object.entries(MISSING)) {
    let saved = false;
    for (const url of urls) {
      try {
        const dest = path.join(OUT, `${slug}.jpg`);
        await download(url, dest);
        console.log(`Saved ${slug} from ${url}`);
        saved = true;
        break;
      } catch (e) {
        console.warn(`Failed ${slug} from ${url}:`, e.message);
      }
    }
    if (!saved) console.warn(`No image for ${slug}`);
  }
}

main();
