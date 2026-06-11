"use client";

import { useQuery } from "@tanstack/react-query";
import { commentsApi } from "@/src/shared/api/comments.api";
import type { Comment } from "@/src/shared/types";

// Получить комментарии к стиху
export const useCommentsList = (poemId: number) => {
  return useQuery<Comment[]>({
    queryKey: ["comments", poemId],
    queryFn: () => commentsApi.getByPoem(poemId),
    enabled: !!poemId,
  });
};
