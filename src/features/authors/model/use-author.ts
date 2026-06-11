"use client";

import { Author } from "@/src/shared";
import { authorsApi } from "@/src/shared/api/author.api";
import { useQuery } from "@tanstack/react-query";
import { useLocaleQueryKey } from "@/src/shared/i18n/use-locale-query-key";

// Получаем всех авторов
export const useAuthors = () => {
  const queryKey = useLocaleQueryKey(["authors"]);
  return useQuery<Author[]>({
    queryKey,
    queryFn: () => authorsApi.getAll(),
  });
};

// Получаем одного автора по slug
export const useAuthor = (slug: string) => {
  const queryKey = useLocaleQueryKey(["author", slug]);
  return useQuery<Author>({
    queryKey,
    queryFn: () => authorsApi.getBySlug(slug),
    enabled: !!slug,
  });
};
