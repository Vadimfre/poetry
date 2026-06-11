"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "@/src/shared/api/comments.api";
import type { UpdateCommentDto } from "@/src/shared/types";

// Обновить комментарий
export const useUpdateComment = (poemId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCommentDto }) =>
      commentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", poemId] });
    },
  });
};
