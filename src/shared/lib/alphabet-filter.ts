/** Belarusian alphabet (32 letters) */
export const BELARUSIAN_ALPHABET = [
  "А",
  "Б",
  "В",
  "Г",
  "Д",
  "Е",
  "Ё",
  "Ж",
  "З",
  "І",
  "Й",
  "К",
  "Л",
  "М",
  "Н",
  "О",
  "П",
  "Р",
  "С",
  "Т",
  "У",
  "Ў",
  "Ф",
  "Х",
  "Ц",
  "Ч",
  "Ш",
  "Ы",
  "Ь",
  "Э",
  "Ю",
  "Я",
] as const;

export type AlphabetLetter = (typeof BELARUSIAN_ALPHABET)[number];

export function getFirstLetter(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase();
}

export function filterByLetter<T extends { name: string }>(
  items: T[],
  letter: string | null,
): T[] {
  if (!letter) return items;
  return items.filter((item) => getFirstLetter(item.name) === letter);
}

export function getAvailableLetters(
  items: { name: string }[],
  alphabet: readonly string[] = BELARUSIAN_ALPHABET,
): Set<string> {
  const letters = new Set<string>();
  for (const item of items) {
    const letter = getFirstLetter(item.name);
    if (alphabet.includes(letter)) {
      letters.add(letter);
    }
  }
  return letters;
}
