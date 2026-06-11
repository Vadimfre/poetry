import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUserStore } from "@/src/entities/user";
import { queryClient } from "@/src/shared/config/query-client";
import { FavoriteOptimisticContext } from "@/src/shared/types/favorite.types";
import { favoritesApi } from "@/src/shared/api/favorites.api";
import { interactionKeys, usePoemInteractions } from "./use-poem-interactions";
import { PoemInteractionsData } from "@/src/shared/types/interactions.types";
import { favoritesKeys } from "./use-favorites-list";

export const useOptimisticFavorite = (poemId: number) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  const { isLoading, isError, error, isFavorite, favoritesCount } =
    usePoemInteractions(poemId);

  const mutation = useMutation<
    { isFavorite: boolean; favoritesCount: number },
    Error,
    void,
    FavoriteOptimisticContext
  >({
    mutationFn: () => favoritesApi.toggleFavorite(poemId),

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: interactionKeys.data(poemId),
      });

      const previousData = queryClient.getQueryData<PoemInteractionsData>(
        interactionKeys.data(poemId),
      );

      const action = previousData?.isFavorite ? "remove" : "add";

      queryClient.setQueryData<PoemInteractionsData>(
        interactionKeys.data(poemId),
        (old) => {
          if (!old) return old;
          const newIsFavorite = !old.isFavorite;
          return {
            ...old,
            isFavorite: newIsFavorite,
            favoritesCount: Math.max(
              0,
              old.favoritesCount + (newIsFavorite ? 1 : -1),
            ),
          };
        },
      );

      return { previousData, poemId, action };
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
      toast.error("Избранное не обновлено!", {
        description: "Не удалось обновить избранное",
      });
    },

    onSuccess: (data, _variables, context) => {
      queryClient.setQueryData<PoemInteractionsData>(
        interactionKeys.data(poemId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            isFavorite: data.isFavorite,
            favoritesCount: data.favoritesCount,
          };
        },
      );
queryClient.invalidateQueries({ queryKey: favoritesKeys.my() });
      const action = context?.action === "add" ? "дададзена" : "выдалена";
      toast.success(`Верш ${action} у избранае`, {
        description:
          context?.action === "add"
            ? "Верш паспяхова дададзены ў ваш спіс избранага"
            : "Верш выдалены з вашага спісу избранага",
      });
    },
  });

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      toast.error("Увайдзіце ў сістэму", {
        description: "Каб дадаць у избранае, трэба аўтарызавацца",
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
    toggleFavorite,
    isFavorite,
    favoriteCount: favoritesCount,
  };
};
