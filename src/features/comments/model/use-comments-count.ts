"use client";

import { useQuery } from "@tanstack/react-query";
import { commentsApi } from "@/src/shared/api/comments.api";

// Получить количество комментариев к стиху
export const useCommentsCount = (poemId: number) => {
  return useQuery({
    queryKey: ["comments-count", poemId],
    queryFn: () => commentsApi.getCount(poemId),
    enabled: !!poemId,
  });
};
