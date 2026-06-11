export const GUEST_POEM_VISIBLE_FRACTION = 0.5;

export function truncatePoemContentForGuest(
  content: string | null | undefined,
  userId?: number,
  fraction = GUEST_POEM_VISIBLE_FRACTION,
): string {
  const normalized = content ?? "";
  if (userId || !normalized.trim()) return normalized;

  const length = normalized.length;
  const target = Math.floor(length * fraction);
  if (target <= 0) return "";
  if (target >= length) return normalized;

  const searchEnd = Math.min(
    length,
    target + Math.max(20, Math.floor(length * 0.08)),
  );
  const slice = normalized.slice(0, searchEnd);
  const lastNewline = slice.lastIndexOf("\n");
  const cut =
    lastNewline >= Math.floor(target * 0.65) ? lastNewline : target;

  return normalized.slice(0, cut).trimEnd();
}

export function restrictPoemContentForGuest<T extends { content?: string | null }>(
  poem: T,
  userId?: number,
): T {
  if (!poem?.content) return poem;
  return {
    ...poem,
    content: truncatePoemContentForGuest(poem.content, userId),
  };
}

export function restrictPoemsContentForGuest<T extends { content?: string | null }>(
  poems: T[],
  userId?: number,
): T[] {
  return poems.map((poem) => restrictPoemContentForGuest(poem, userId));
}
