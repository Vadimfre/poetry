import type { QuizItemPublic } from "@/src/shared/types/quiz.types";

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatPlural(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 19) {
    return many;
  }
  if (mod10 === 1) {
    return one;
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return few;
  }
  return many;
}

export function getAvailableItems(
  items: QuizItemPublic[],
  placements: Record<string, unknown>,
): QuizItemPublic[] {
  return items.filter((item) => !(item.id in placements));
}

export function getPlacedItemForZone(
  items: QuizItemPublic[],
  placements: Record<string, string>,
  zoneId: string,
): QuizItemPublic | null {
  const placedItemId = Object.entries(placements).find(
    ([, zId]) => zId === zoneId,
  )?.[0];
  return items.find((item) => item.id === placedItemId) ?? null;
}
