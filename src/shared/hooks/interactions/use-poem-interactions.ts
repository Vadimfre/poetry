import { useQuery } from "@tanstack/react-query";
import { interactionsApi } from "../../api";
import { PoemInteractionsData } from "../../types/interactions.types";

export const interactionKeys = {
  data: (poemId: number) => ["poem", "interactions", poemId] as const,
};

export const usePoemInteractions = (poemId: number) => {
  const { isLoading, isError, error, data, refetch } =
    useQuery<PoemInteractionsData>({
      queryKey: interactionKeys.data(poemId),
      queryFn: () => interactionsApi.getInteractions(poemId),

      enabled: !!poemId,
      staleTime: 0,
      retry: 1,
      refetchOnMount: "always",
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    });

  return {
    isLoading,
    isError,
    error,
    refetch,
    liked: data?.liked ?? false,
    likesCount: data?.likesCount ?? 0,
    isFavorite: data?.isFavorite ?? false,
    favoritesCount: data?.favoritesCount ?? 0,
    views: data?.views ?? 0,
    commentsCount: data?.commentsCount ?? 0,
  };
};
