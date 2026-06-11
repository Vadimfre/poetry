"use client";

import { useQuery } from "@tanstack/react-query";
import { quizApi } from "@/src/shared/api/quiz.api";
import { useLocaleQueryKey } from "@/src/shared/i18n/use-locale-query-key";
import type { QuizListItem } from "@/src/shared/types/quiz.types";

export const useQuizzes = () => {
  const queryKey = useLocaleQueryKey(["quizzes"]);
  return useQuery<QuizListItem[]>({
    queryKey,
    queryFn: () => quizApi.getAll(),
  });
};
