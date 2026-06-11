"use client";

import { useMemo } from "react";
import { aboutContentBe } from "./content/about/be";
import { aboutContentRu } from "./content/about/ru";
import { aboutContentEn } from "./content/about/en";
import { useI18n } from "./context";

const ABOUT = {
  be: aboutContentBe,
  ru: aboutContentRu,
  en: aboutContentEn,
} as const;

export function useAboutContent() {
  const { locale } = useI18n();
  return useMemo(() => ABOUT[locale], [locale]);
}
