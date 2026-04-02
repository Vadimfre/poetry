import { useMutation, useQuery } from "@tanstack/react-query";
import { LikeData, OptimisticUpdateContext } from "../types/likes.type";
import { likesApi } from "../api/likes.api";
import { queryClient } from "../config/query-client";
import { toast } from "sonner";
import { useUserStore } from "@/src/entities/user";

export const likeKeys = {
  all: ["likes"] as const,
  data: (poemId: number) => [...likeKeys.all, "data", poemId] as const,
};

export const useOptimisticLike = (poemId: number) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  const {
    isLoading,
    isError,
    error,
    data: likeData,
  } = useQuery<LikeData>({
    queryKey: likeKeys.data(poemId),
    queryFn: async () => {
      if (isAuthenticated) {
        // авторизован — оба запроса
        const [status, count] = await Promise.all([
          likesApi.getStatus(poemId),
          likesApi.getCount(poemId),
        ]);
        return { liked: status.liked, likesCount: count.likesCount };
      } else {
        // не авторизован — только count
        const count = await likesApi.getCount(poemId);
        return { liked: false, likesCount: count.likesCount };
      }
    },
    staleTime: 0,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation<
    { liked: boolean; likesCount: number },
    Error,
    void,
    OptimisticUpdateContext
  >({
    mutationFn: () => likesApi.toggle(poemId),

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: likeKeys.data(poemId),
      });

      const previousData = queryClient.getQueryData<LikeData>(
        likeKeys.data(poemId),
      );

      queryClient.setQueryData<LikeData>(likeKeys.data(poemId), (old) => {
        if (!old) return { liked: true, likesCount: 1 };
        const newLiked = !old.liked;
        return {
          liked: newLiked,
          likesCount: Math.max(0, old.likesCount + (newLiked ? 1 : -1)),
        };
      });

      return { previousData };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData<LikeData>(
          likeKeys.data(poemId),
          context.previousData,
        );
      }
      queryClient.invalidateQueries({
        queryKey: likeKeys.data(poemId),
        exact: true,
      });
      toast.error("Лайк не обновлен!", {
        description: "Не удалось обновить лайк",
      });
    },

    onSuccess: (data) => {
      queryClient.setQueryData(likeKeys.data(poemId), data);
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
    isLiked: likeData?.liked ?? false,
    likeCount: likeData?.likesCount ?? 0,
  };
};
