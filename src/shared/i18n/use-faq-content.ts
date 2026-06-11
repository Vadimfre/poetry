"use client";

import { useMemo } from "react";
import { faqCategoriesBe, faqItemsBe } from "./content/faq/be";
import { faqCategoriesRu, faqItemsRu } from "./content/faq/ru";
import { faqCategoriesEn, faqItemsEn } from "./content/faq/en";
import type { FaqCategory } from "./content/faq/be";
import { useI18n } from "./context";

const FAQ = {
  be: { categories: faqCategoriesBe, items: faqItemsBe },
  ru: { categories: faqCategoriesRu, items: faqItemsRu },
  en: { categories: faqCategoriesEn, items: faqItemsEn },
} as const;

export type { FaqCategory, FaqItem } from "./content/faq/be";

export function useFaqContent() {
  const { locale } = useI18n();
  return useMemo(() => FAQ[locale], [locale]);
}
