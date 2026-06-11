/** Склонение «твор» для русского UI (1 твор / 2–4 творы / 5+ творов). */
export function getPoemsWord(count: number): string {
  const lastTwo = count % 100;
  const lastOne = count % 10;

  if (lastTwo >= 11 && lastTwo <= 19) {
    return "творов";
  }

  if (lastOne === 1) {
    return "твор";
  }

  if (lastOne >= 2 && lastOne <= 4) {
    return "творы";
  }

  return "творов";
}

/**
 * Форматирование года публикации
 */
export function formatYear(year: number | null | undefined): string {
  if (!year) return '';
  return `${year} г.`;
}
