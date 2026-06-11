"use client";

import { useQuery } from "@tanstack/react-query";
import { quizApi } from "@/src/shared/api/quiz.api";
import { useLocaleQueryKey } from "@/src/shared/i18n/use-locale-query-key";
import type { QuizPublic } from "@/src/shared/types/quiz.types";

export const useQuiz = (id: string) => {
  const queryKey = useLocaleQueryKey(["quiz", id]);
  return useQuery<QuizPublic>({
    queryKey,
    queryFn: () => quizApi.getById(id),
    enabled: !!id,
  });
};
