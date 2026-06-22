import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/images/authors");
const UA = "PoetryBelarus/1.0 (author portraits)";

/** slug -> [wiki page titles to search, optional direct wiki file name] */
const AUTHORS = {
  "ales-pismanokov": {
    files: ["Pismanokov Alies.jpg", "Pismanok Ales.jpg"],
    urls: ["https://nashi-lyudi.by/images/33/2733.jpg"],
  },
  "ales-staver": { files: ["Staver A.jpg"] },
  "anatol-vertinsky": { files: ["Vertinski Anatoly Ilich.jpg"] },
  "andrei-khadanovich": {
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/2/21/Hadanovich2011.jpg",
    ],
  },
  "andrei-makayonak": {
    pages: ["Макёнак, Андрей"],
    files: ["Andrei Makayonak.jpg"],
  },
  "arkadz-kuliashou": {
    pages: ["Кулешов, Аркадий Петрович"],
    files: ["Arkady Kuleshov.jpg", "Kuleshov Arkady.jpg"],
  },
  "danuta-bichel-zahnetava": {
    urls: ["https://nashi-lyudi.by/images/73/8273.jpg"],
  },
  "francishak-bahushevich": {
    pages: ["Богушевич, Франциск"],
    files: ["Francishak Bahushevich.jpg", "Bahushevich.jpg"],
  },
  "kandrat-krapiva": { pages: ["Крапива, Кондрат", "Кандрат Крапіва"] },
  "kastus-veranitsyn": {
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/f/f3/Gorodok-verenitsyn.JPG",
    ],
  },
  "kuzma-chorny": { pages: ["Чёрный, Кузьма", "Кузьма Чорны"] },
  "larysa-hieniyush": {
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/5/5e/%C5%81arysa_Hieniju%C5%A1._%D0%9B%D0%B0%D1%80%D1%8B%D1%81%D0%B0_%D0%93%D0%B5%D0%BD%D1%96%D1%8E%D1%88_%281930-39%29.jpg",
    ],
  },
  "maksim-bahdanovich": {
    pages: ["Богданович, Максим"],
    files: ["Maksim Bahdanovich.jpg", "Bahdanovich Maksim.jpg"],
  },
  "maksim-haretski": {
    pages: ["Горецкий, Максим"],
    files: ["Maksim Haretski.jpg"],
  },
  "maksim-tank": {
    pages: ["Танк, Максим"],
    files: ["Maksim Tank.jpg", "Tank Maksim.jpg"],
  },
  "mikhail-charot": { pages: ["Чарот, Михаил", "Міхась Чарот"] },
  "mikhail-lynkow": { pages: ["Лыньков, Михаил", "Міхась Лынькоў"] },
  "mikhail-straltsou": {
    pages: ["Стрельцов, Михаил", "Міхась Стральцоў"],
  },
  "nil-hilevich": { pages: ["Гилевич, Нил", "Ніл Гілевіч"] },
  "pauluk-trus": { pages: ["Трус, Павлюк", "Паўлюк Трус"] },
  "petrus-brouka": { pages: ["Бровка, Петрусь", "Пятрусь Броўка"] },
  "pimen-panchanka": { pages: ["Панченко, Пимен", "Пімен Панчанка"] },
  "ryhor-baradulin": { pages: ["Барадулин, Рыгор", "Рыгор Барадулін"] },
  "tsiotka": {
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/1/14/A%C5%82aiza_Pa%C5%A1kievi%C4%8D._%D0%90%D0%BB%D0%B0%D1%96%D0%B7%D0%B0_%D0%9F%D0%B0%D1%88%D0%BA%D0%B5%D0%B2%D1%96%D1%87_%281912%29.jpg",
    ],
  },
  "uladzimir-karatkevich": {
    pages: ["Короткевич, Владимир", "Уладзімір Караткевіч"],
  },
  "uladzislau-halubok": {
    pages: ["Голубок, Владислав", "Уладзіслаў Галубок"],
  },
  "yakub-kolas": {
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/b/be/Kanstantyn_Mickievi%C4%8D_%28Jakub_Ko%C5%82as%29._%D0%9A%D0%B0%D0%BD%D1%81%D1%82%D0%B0%D0%BD%D1%82%D1%8B%D0%BD_%D0%9C%D1%96%D1%86%D0%BA%D0%B5%D0%B2%D1%96%D1%87_%28%D0%AF%D0%BA%D1%83%D0%B1_%D0%9A%D0%BE%D0%BB%D0%B0%D1%81%29_%281925%29.jpg",
    ],
  },
  "yanka-bryl": { pages: ["Брыль, Янка", "Янка Брыль"] },
  "yanka-kupala": { pages: ["Купала, Янка", "Янка Купала"] },
  "yanka-sipakov": { urls: ["https://karotkizmest.by/images/sipakou.jpg"] },
  "yauhen-puhcha": { pages: ["Пушча, Евгений", "Язэп Пушча"] },
  "zmitrok-biadula": { pages: ["Бедула, Дмитрий", "Змітрок Бядуля"] },
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isDecorative(name) {
  const l = name.toLowerCase();
  return (
    l.includes("flag") ||
    l.includes("logo") ||
    l.includes("icon") ||
    l.includes("prize") ||
    l.includes("commons") ||
    l.includes("wikipedia") ||
    l.includes("medal") ||
    l.includes("заслужен") ||
    l.endsWith(".svg") ||
    l.includes("почёт") ||
    l.includes("ribbon")
  );
}

async function wikiJson(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fileFromWiki(fileTitle, lang = "ru") {
  const title = fileTitle.startsWith("File:") ? fileTitle.slice(5) : fileTitle;
  const url = `https://${lang}.wikipedia.org/wiki/Special:FilePath/${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2500 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  return buf;
}

async function portraitFromPage(pageTitle, lang) {
  await sleep(1200);
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=440`;
  const data = await wikiJson(url);
  for (const page of Object.values(data?.query?.pages ?? {})) {
    if (page.thumbnail?.source) {
      const res = await fetch(page.thumbnail.source, {
        headers: { "User-Agent": UA },
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length >= 2500 && buf[0] === 0xff) return buf;
    }
  }

  await sleep(1200);
  const listUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=images&format=json`;
  const listData = await wikiJson(listUrl);
  for (const page of Object.values(listData?.query?.pages ?? {})) {
    for (const img of page.images ?? []) {
      if (isDecorative(img.title)) continue;
      await sleep(1200);
      const buf = await fileFromWiki(img.title.replace(/^File:/, ""), lang);
      if (buf) return buf;
    }
  }
  return null;
}

async function downloadUrl(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*" },
    redirect: "follow",
  });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2500 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  return buf;
}

async function resolvePortrait(slug, cfg) {
  for (const url of cfg.urls ?? []) {
    const buf = await downloadUrl(url);
    if (buf) return { buf, source: url };
    await sleep(500);
  }

  for (const file of cfg.files ?? []) {
    for (const lang of ["ru", "commons"]) {
      const host = lang === "commons" ? "commons.wikimedia.org" : `${lang}.wikipedia.org`;
      const url = `https://${host}/wiki/Special:FilePath/${encodeURIComponent(file)}`;
      const buf = await downloadUrl(url);
      if (buf) return { buf, source: url };
      await sleep(800);
    }
  }

  for (const page of cfg.pages ?? []) {
    for (const lang of ["ru", "be"]) {
      const buf = await portraitFromPage(page, lang);
      if (buf) return { buf, source: `${page} (${lang})` };
    }
  }

  return null;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let ok = 0;
  const failed = [];

  for (const [slug, cfg] of Object.entries(AUTHORS)) {
    const dest = path.join(OUT, `${slug}.jpg`);
    const result = await resolvePortrait(slug, cfg);
    if (result) {
      fs.writeFileSync(dest, result.buf);
      console.log(`OK  ${slug} — ${result.buf.length}b — ${result.source}`);
      ok++;
    } else if (fs.existsSync(dest)) {
      console.log(`KEEP ${slug}`);
      ok++;
    } else {
      console.error(`MISS ${slug}`);
      failed.push(slug);
    }
  }

  console.log(`\n${ok}/32 portraits ready`);
  if (failed.length) {
    console.error("Missing:", failed.join(", "));
    process.exit(1);
  }
}

main();
