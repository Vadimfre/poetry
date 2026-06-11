"use client";

import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/src/shared/api";
import { useLocaleQueryKey } from "@/src/shared/i18n/use-locale-query-key";
import type { Category } from "@/src/shared/types";

export const useCategories = () => {
  const queryKey = useLocaleQueryKey(["categories"]);
  return useQuery<Category[]>({
    queryKey,
    queryFn: () => categoriesApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCategory = (slug: string) => {
  const queryKey = useLocaleQueryKey(["category", slug]);
  return useQuery<Category>({
    queryKey,
    queryFn: () => categoriesApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
};
