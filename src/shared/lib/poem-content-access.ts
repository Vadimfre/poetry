export const GUEST_POEM_VISIBLE_FRACTION = 0.5;

export function visiblePoemContent(
  content: string,
  canReadFull: boolean,
  fraction = GUEST_POEM_VISIBLE_FRACTION,
): { text: string; truncated: boolean } {
  const normalized = content ?? "";
  if (canReadFull || !normalized.trim()) {
    return { text: normalized, truncated: false };
  }

  const length = normalized.length;
  const target = Math.floor(length * fraction);

  if (target <= 0) {
    return { text: "", truncated: length > 0 };
  }

  if (target >= length) {
    return { text: normalized, truncated: false };
  }

  const searchEnd = Math.min(length, target + Math.max(20, Math.floor(length * 0.08)));
  const slice = normalized.slice(0, searchEnd);
  const lastNewline = slice.lastIndexOf("\n");
  const cut =
    lastNewline >= Math.floor(target * 0.65) ? lastNewline : target;

  return {
    text: normalized.slice(0, cut).trimEnd(),
    truncated: true,
  };
}
