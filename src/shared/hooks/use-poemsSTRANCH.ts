import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocaleQueryKey } from "@/src/shared/i18n/use-locale-query-key";
import { favoritesApi, poemsApi } from "../api";

export const usePoems = (page = 1, limit = 20) => {
  const queryKey = useLocaleQueryKey(["poems", page, limit]);
  return useQuery({
    queryKey,
    queryFn: () => poemsApi.getAll(page, limit),
  });
};

export const usePoem = (id: number) => {
  const queryKey = useLocaleQueryKey(["poem", id]);
  return useQuery({
    queryKey,
    queryFn: () => poemsApi.getOne(id),
    enabled: !!id,
  });
};

export const usePoemBySlug = (slug: string) => {
  const queryKey = useLocaleQueryKey(["poem", "slug", slug]);
  return useQuery({
    queryKey,
    queryFn: () => poemsApi.getBySlug(slug),
    enabled: !!slug,
  });
};

export const usePoemsByCollection = (collectionId: number) => {
  const queryKey = useLocaleQueryKey(["poems", "collection", collectionId]);
  return useQuery({
    queryKey,
    queryFn: () => poemsApi.getByCollection(collectionId),
    enabled: !!collectionId,
  });
};

export const useSearchPoems = (query: string) => {
  const queryKey = useLocaleQueryKey(["poems", "search", query]);
  return useQuery({
    queryKey,
    queryFn: () => poemsApi.search(query),
    enabled: query.length > 2,
  });
};

export const usePoemsByCategorySlug = (categorySlug: string) => {
  const queryKey = useLocaleQueryKey(["poems", "category", "slug", categorySlug]);
  return useQuery({
    queryKey,
    queryFn: () => poemsApi.getByCategorySlug(categorySlug),
    enabled: !!categorySlug,
  });
};
