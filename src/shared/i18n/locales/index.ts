import { be } from "./be";
import { ru } from "./ru";
import type { Locale } from "../types";

export const translations: Record<Locale, Record<string, unknown>> = {
  be: be as Record<string, unknown>,
  ru: ru as Record<string, unknown>,
};
