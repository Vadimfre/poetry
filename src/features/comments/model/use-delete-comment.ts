"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "@/src/shared/api/comments.api";

// Удалить комментарий
export const useDeleteComment = (poemId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => commentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", poemId] });
      queryClient.invalidateQueries({
        queryKey: ["poem", "interactions", poemId],
      });
    },
  });
};
