"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "@/src/shared/api/comments.api";
import type { CreateCommentDto } from "@/src/shared/types";
import { toastMessageHandler } from "@/src/shared/utils";
import { interactionKeys } from "@/src/shared/hooks/interactions/use-poem-interactions";
import { PoemInteractionsData } from "@/src/shared/types/interactions.types";

// Создать комментарий
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ poemId, ...data }: { poemId: number } & CreateCommentDto) =>
      commentsApi.create(poemId, data),

    onMutate: async ({ poemId }) => {
      await queryClient.cancelQueries({
        queryKey: interactionKeys.data(poemId),
      });

      const previousData = queryClient.getQueryData<PoemInteractionsData>(
        interactionKeys.data(poemId),
      );

      queryClient.setQueryData<PoemInteractionsData>(
        interactionKeys.data(poemId),
        (old) => {
          if (!old) return old;
          return { ...old, commentsCount: old.commentsCount + 1 };
        },
      );

      return { previousData, poemId };
    },

    onSuccess: (_, { poemId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", poemId] });
      queryClient.invalidateQueries({ queryKey: ["comments-count", poemId] });
    },

    onError: (error: any, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData<PoemInteractionsData>(
          interactionKeys.data(context.poemId),
          context.previousData,
        );
      }
      if (error?.response?.status === 401) {
        toastMessageHandler({
          message: "Необходимо авторизоваться для создания комментария",
        });
      } else {
        toastMessageHandler(error);
      }
    },
  });
};
