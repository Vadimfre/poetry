import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

const OUT_DIR = path.join(process.cwd(), "..", "public", "images", "seasons");

const SETS: Record<string, string[]> = {
  winter: [
    "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1418988791264-47d7891392f8?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1518837699415-68715e04cabb?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1548777173-a76bc609baa5?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1491002059236-47b58325c805?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1477601260138-0d2d13fbaeee?auto=format&fit=crop&w=1600&q=80",
  ],
  spring: [
    "https://images.unsplash.com/photo-1490750967868-88ea4486c946?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1464226184664-7df2a993a3f6?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1524484482390-fb57fcd0f5b5?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1421273882041-3e1419032543?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1600&q=80",
  ],
  summer: [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a8fe09?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1441974231530-c3367d5b9a15?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  ],
  autumn: [
    "https://images.unsplash.com/photo-1476820865390-c52a945d6d60?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1441974231530-c3367d5b9a15?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a8fe09?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1600&q=80",
  ],
};

async function download(url: string, dest: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "PoetryBelarus/1.0" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log(`  ✓ ${path.basename(dest)} (${Math.round(buf.length / 1024)} KB)`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [season, urls] of Object.entries(SETS)) {
    console.log(`\n${season}:`);
    for (let i = 0; i < urls.length; i++) {
      const dest = path.join(OUT_DIR, `${season}-${i + 1}.jpg`);
      try {
        await download(urls[i], dest);
      } catch (e) {
        console.error(`  ✗ ${season}-${i + 1}:`, e);
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  console.log("\nDone.");
}

main();
