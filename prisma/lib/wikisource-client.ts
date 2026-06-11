const API_BASE = "https://be.wikisource.org/w/api.php";
const USER_AGENT =
  "PoetryBelarus/1.0 (education project; contact: admin@poetry.local)";

const DEFAULT_DELAY_MS = 2200;
const MAX_RETRIES = 4;

let lastRequestAt = 0;

async function waitForSlot(delayMs = DEFAULT_DELAY_MS): Promise<void> {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < delayMs) {
    await new Promise((r) => setTimeout(r, delayMs - elapsed));
  }
  lastRequestAt = Date.now();
}

async function fetchJson<T>(params: Record<string, string>): Promise<T> {
  const url = `${API_BASE}?${new URLSearchParams({ format: "json", ...params })}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    await waitForSlot();
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (res.status === 429 || res.status === 503) {
      const backoff = 8000 + attempt * 5000;
      console.warn(`  ⏳ Rate limit (${res.status}), waiting ${backoff}ms…`);
      await new Promise((r) => setTimeout(r, backoff));
      continue;
    }

    const text = await res.text();
    if (text.startsWith("You are making") || text.startsWith("<!DOCTYPE")) {
      const backoff = 10000 + attempt * 5000;
      console.warn(`  ⏳ Wikisource throttled, waiting ${backoff}ms…`);
      await new Promise((r) => setTimeout(r, backoff));
      continue;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      if (attempt === MAX_RETRIES) {
        throw new Error(`Invalid JSON from Wikisource: ${text.slice(0, 120)}`);
      }
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  throw new Error("Wikisource request failed after retries");
}

type WikiPage = {
  pageid?: number;
  title?: string;
  missing?: string;
  revisions?: Array<{ "*": string }>;
};

export async function getWikitext(pageTitle: string): Promise<string | null> {
  const data = await fetchJson<{
    query?: { pages?: Record<string, WikiPage> };
  }>({
    action: "query",
    prop: "revisions",
    rvprop: "content",
    titles: pageTitle,
  });

  const page = Object.values(data.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined) return null;
  return page.revisions?.[0]?.["*"] ?? null;
}

export type CategoryMember = { title: string; pageid: number };

export async function listCategoryMembers(
  categoryTitle: string,
  limit = 500,
): Promise<CategoryMember[]> {
  const members: CategoryMember[] = [];
  let cmcontinue: string | undefined;

  do {
    const params: Record<string, string> = {
      action: "query",
      list: "categorymembers",
      cmtitle: categoryTitle,
      cmlimit: String(Math.min(limit - members.length, 50)),
    };
    if (cmcontinue) params.cmcontinue = cmcontinue;

    const data = await fetchJson<{
      query?: { categorymembers?: CategoryMember[] };
      continue?: { cmcontinue?: string };
    }>(params);

    members.push(...(data.query?.categorymembers ?? []));
    cmcontinue = data.continue?.cmcontinue;
  } while (cmcontinue && members.length < limit);

  return members;
}

export async function pageExists(pageTitle: string): Promise<boolean> {
  const data = await fetchJson<{
    query?: { pages?: Record<string, WikiPage> };
  }>({
    action: "query",
    titles: pageTitle,
  });
  const page = Object.values(data.query?.pages ?? {})[0];
  return Boolean(page && page.missing === undefined);
}
