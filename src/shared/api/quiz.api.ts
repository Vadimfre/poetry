import type {
  QuizListItem,
  QuizPublic,
  CheckQuizAnswersDto,
  CheckQuizAnswersResponse,
} from "../types/quiz.types";
import { apiClient } from "./client";

export const quizApi = {
  getAll: async (): Promise<QuizListItem[]> => {
    const response = await apiClient.get<QuizListItem[]>("/quizzes");
    return response.data;
  },

  getById: async (id: string): Promise<QuizPublic> => {
    const response = await apiClient.get<QuizPublic>(`/quizzes/${id}`);
    return response.data;
  },

  checkAnswers: async (
    id: string,
    dto: CheckQuizAnswersDto,
  ): Promise<CheckQuizAnswersResponse> => {
    const response = await apiClient.post<CheckQuizAnswersResponse>(
      `/quizzes/${id}/check`,
      dto,
    );
    return response.data;
  },
};
