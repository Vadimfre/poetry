import type { TranslationParams } from "./types";

export function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : undefined;
}

export function interpolate(
  template: string,
  params?: TranslationParams,
): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    String(params[key] ?? ""),
  );
}
