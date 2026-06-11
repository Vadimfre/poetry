import { ProseKind } from "@prisma/client";
import { slugify } from "./slugify";

export type ParsedChapter = {
  title: string;
  slug: string;
  order: number;
  content: string;
};

export type ParsedWork = {
  title: string;
  kind: ProseKind;
  year?: number;
  description: string;
  chapters: ParsedChapter[];
};

function stripNestedTemplates(input: string): string {
  let text = input;
  for (let i = 0; i < 30; i++) {
    const next = text.replace(/\{\{[^{}]*\}\}/g, "");
    if (next === text) break;
    text = next;
  }
  return text;
}

function wikiLinkToText(link: string): string {
  const inner = link.slice(2, -2);
  const pipe = inner.indexOf("|");
  return pipe >= 0 ? inner.slice(pipe + 1) : inner;
}

export function wikitextToPlainText(wikitext: string): string {
  let text = wikitext;

  text = text.replace(/<pages[^>]*\/>/gi, "");
  text = text.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "");
  text = text.replace(/<!--[\s\S]*?-->/g, "");
  text = stripNestedTemplates(text);
  text = text.replace(/\[\[(?:[^|\]]+\|)?([^\]]+)\]\]/g, "$1");
  text = text.replace(/'''+/g, "");
  text = text.replace(/''/g, "");
  text = text.replace(/^[*#:;]+/gm, "");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

function extractHeaderField(wikitext: string, field: string): string | undefined {
  const re = new RegExp(`\\|\\s*${field}\\s*=\\s*([^\\n|]+)`, "i");
  const match = wikitext.match(re);
  return match?.[1]?.trim();
}

function detectKind(wikitext: string): ProseKind {
  const section = (extractHeaderField(wikitext, "секцыя") ?? "").toLowerCase();
  if (section.includes("паэма") || section.includes("поэма")) return "POEM";
  if (section.includes("аповед") || section.includes("аповесь")) return "STORY";
  if (section.includes("п'ес") || section.includes("пьес")) return "PLAY";
  if (section.includes("верш")) return "POEM";
  return "NOVEL";
}

function extractYear(wikitext: string): number | undefined {
  const yearField = extractHeaderField(wikitext, "год");
  const match = (yearField ?? wikitext).match(/\b(1[89]\d{2}|20[0-1]\d)\b/);
  return match ? Number(match[1]) : undefined;
}

export function isScanOnlyPage(wikitext: string, plainText: string): boolean {
  const hasPagesTag = /<pages\s/i.test(wikitext);
  const meaningful = plainText.replace(/\s/g, "").length;
  return hasPagesTag && meaningful < 400;
}

export function shouldSkipPageTitle(title: string): boolean {
  if (title.startsWith("Аўтар:")) return true;
  if (title.startsWith("Катэгорыя:")) return true;
  if (title.includes("Хрэстаматыя")) return true;
  if (title.includes("(газета)")) return true;
  if (/Методыка|методыка/.test(title)) return true;
  if (/лацінка\//.test(title)) return true;
  if (title.includes("Беларуская мова ў")) return true;
  if (title.includes("Zbornik") || title.includes("Зборнік «Нашай Нівы»"))
    return true;
  return false;
}

export function parseWikitextWork(
  wikitext: string,
  fallbackTitle: string,
  kindOverride?: ProseKind,
): ParsedWork | null {
  const plain = wikitextToPlainText(wikitext);
  if (isScanOnlyPage(wikitext, plain)) return null;
  if (plain.replace(/\s/g, "").length < 150) return null;

  const title =
    extractHeaderField(wikitext, "назва")?.replace(/[\[\]]/g, "") ??
    fallbackTitle.replace(/\s*\([^)]+\)\s*$/, "").trim();

  const kind = kindOverride ?? detectKind(wikitext);
  const year = extractYear(wikitext);
  const author = extractHeaderField(wikitext, "аўтар");
  const section = extractHeaderField(wikitext, "секцыя");

  const description = [
    section && author ? `${section}. Аўтар: ${author}.` : section ?? null,
    !section && author ? `Аўтар: ${author}.` : null,
    year ? `Год: ${year}.` : null,
    "Крыніца: be.wikisource.org",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const headerRegex = /^==+\s*(.+?)\s*==+\s*$/gm;
  const matches = [...wikitext.matchAll(headerRegex)];

  const skipHeader = (name: string) =>
    /^(Урыўкі|Змест|Примечания|Катэгор|See also|Спасылкі)/i.test(name);

  const chapters: ParsedChapter[] = [];

  if (matches.length === 0) {
    chapters.push({
      title: "Тэкст",
      slug: "tekst",
      order: 1,
      content: plain,
    });
  } else {
    const intro = wikitext.slice(0, matches[0].index ?? 0);
    const introText = wikitextToPlainText(intro);
    if (introText.length > 200) {
      chapters.push({
        title: "Уступ",
        slug: "ustup",
        order: 1,
        content: introText,
      });
    }

    for (let i = 0; i < matches.length; i++) {
      const chapterTitle = matches[i][1].trim();
      if (skipHeader(chapterTitle)) continue;

      const start = (matches[i].index ?? 0) + matches[i][0].length;
      const end = matches[i + 1]?.index ?? wikitext.length;
      const chunk = wikitext.slice(start, end);
      const content = wikitextToPlainText(chunk);
      if (content.length < 80) continue;

      chapters.push({
        title: chapterTitle,
        slug: slugify(chapterTitle) || `chapter-${chapters.length + 1}`,
        order: chapters.length + 1,
        content,
      });
    }

    if (chapters.length === 0) {
      chapters.push({
        title: "Тэкст",
        slug: "tekst",
        order: 1,
        content: plain,
      });
    }
  }

  return {
    title,
    kind,
    year,
    description: description || `Твор «${title}» з Вікікрыніцы.`,
    chapters,
  };
}
