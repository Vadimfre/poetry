import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/src/shared/i18n/context";
import { favoritesApi } from "../../api/favorites.api";
import { interactionKeys } from "./use-poem-interactions";
import { Favorite } from "../../types";
import { useUserStore } from "@/src/entities/user";

export const favoritesKeys = {
  my: (locale?: string) =>
    locale ? (["favorites", "my", locale] as const) : (["favorites", "my"] as const),
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (poemId: number) => favoritesApi.removeFavorite(poemId),
    onSuccess: (_data, poemId) => {
      queryClient.invalidateQueries({ queryKey: favoritesKeys.my() });
      queryClient.invalidateQueries({
        queryKey: interactionKeys.data(poemId),
      });
    },
  });
};

export const useFavorites = () => {
  const { isAuthenticated } = useUserStore();
  const { locale } = useI18n();

  const { data, isLoading, isError, error, refetch } = useQuery<Favorite[]>({
    queryKey: favoritesKeys.my(locale),
    queryFn: () => favoritesApi.getMyFavorites(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    favorites: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
  };
};
