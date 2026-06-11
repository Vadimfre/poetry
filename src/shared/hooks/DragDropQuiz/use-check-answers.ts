"use client";

import { useMutation } from "@tanstack/react-query";
import { quizApi } from "@/src/shared/api/quiz.api";
import type {
  CheckQuizAnswersDto,
  CheckQuizAnswersResponse,
} from "@/src/shared/types/quiz.types";

export const useCheckAnswers = (quizId: string) => {
  return useMutation<CheckQuizAnswersResponse, Error, CheckQuizAnswersDto>({
    mutationFn: (dto) => quizApi.checkAnswers(quizId, dto),
  });
};
