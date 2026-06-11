"use client";

import { useQuery } from "@tanstack/react-query";
import { poemsApi } from "@/src/shared/api";
import { useLocaleQueryKey } from "@/src/shared/i18n/use-locale-query-key";
import type { Poem } from "@/src/shared/types";

export const usePoem = (id: number) => {
  const queryKey = useLocaleQueryKey(["poem", id]);
  return useQuery<Poem>({
    queryKey,
    queryFn: () => poemsApi.getOne(id),
    enabled: !!id && id > 0,
  });
};

export const usePoemBySlug = (slug: string) => {
  const queryKey = useLocaleQueryKey(["poem", "slug", slug]);
  return useQuery<Poem>({
    queryKey,
    queryFn: () => poemsApi.getBySlug(slug),
    enabled: !!slug,
  });
};
