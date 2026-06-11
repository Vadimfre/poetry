import { useMutation, useQueryClient } from "@tanstack/react-query";
import { interactionKeys, usePoemInteractions } from "./use-poem-interactions";
import { viewsApi } from "../../api/views.api";

export const useOptimisticViews = (poemId: number) => {
  const queryClient = useQueryClient();
  const { isLoading, isError, error, views } = usePoemInteractions(poemId);

  const addViewMutation = useMutation({
    mutationFn: () => viewsApi.getOrAddView(poemId),
    onSuccess: (data) => {
      queryClient.setQueryData(interactionKeys.data(poemId), (old: any) => {
        if (!old) return old;
        return { ...old, views: data.views };
      });
      queryClient.invalidateQueries({
        queryKey: interactionKeys.data(poemId),
        exact: true,
      });
    },
  });

  const addView = () => {
    if (addViewMutation.isPending) return;
    addViewMutation.mutate();
  };

  return {
    isLoading,
    isError,
    error,
    addView,
    views,
  };
};
