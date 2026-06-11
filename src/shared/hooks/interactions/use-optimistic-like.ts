import { useMutation } from "@tanstack/react-query";
import { OptimisticLikeUpdateContext } from "../../types/likes.types";
import { likesApi } from "../../api/likes.api";
import { queryClient } from "../../config/query-client";
import { toast } from "sonner";
import { useUserStore } from "@/src/entities/user";
import { interactionKeys, usePoemInteractions } from "./use-poem-interactions";
import { PoemInteractionsData } from "../../types/interactions.types";

export const useOptimisticLike = (poemId: number) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  const { isLoading, isError, error, liked, likesCount } =
    usePoemInteractions(poemId);

  const mutation = useMutation<
    { liked: boolean; likesCount: number },
    Error,
    void,
    OptimisticLikeUpdateContext
  >({
    mutationFn: () => likesApi.toggle(poemId),

    onMutate: async () => {
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
          const newLiked = !old.liked;
          return {
            ...old,
            liked: newLiked,
            likesCount: Math.max(0, old.likesCount + (newLiked ? 1 : -1)),
          };
        },
      );

      return { previousData };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData<PoemInteractionsData>(
          interactionKeys.data(poemId),
          context.previousData,
        );
      }
      queryClient.invalidateQueries({
        queryKey: interactionKeys.data(poemId),
        exact: true,
      });
      toast.error("Лайк не обновлен!", {
        description: "Не удалось обновить лайк",
      });
    },

    onSuccess: (data) => {
      queryClient.setQueryData<PoemInteractionsData>(
        interactionKeys.data(poemId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            liked: data.liked,
            likesCount: data.likesCount,
          };
        },
      );
    },
  });

  const toggleLike = () => {
    if (!isAuthenticated) {
      toast.error("Увайдзіце ў сістэму", {
        description: "Каб паставіць лайк, трэба аўтарызавацца",
      });
      return;
    }
    if (mutation.isPending) return;
    mutation.mutate();
  };

  return {
    isLoading,
    isError,
    error,
    isMutating: mutation.isPending,
    mutationError: mutation.error,
    toggleLike,
    isLiked: liked,
    likeCount: likesCount,
  };
};
