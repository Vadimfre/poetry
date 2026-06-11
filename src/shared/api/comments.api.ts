import { apiClient } from "./client";
import type { Comment, CreateCommentDto, UpdateCommentDto } from "../types";

export const commentsApi = {
  // Получить комментарии к стиху
  getByPoem: async (poemId: number): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>(`/comments/poem/${poemId}`);
    return response.data;
  },

  // Создать комментарий
  create: async (poemId: number, data: CreateCommentDto): Promise<Comment> => {
    const response = await apiClient.post<Comment>(
      `/comments/poem/${poemId}`,
      data,
    );
    return response.data;
  },

  // Обновить комментарий
  update: async (id: number, data: UpdateCommentDto): Promise<Comment> => {
    const response = await apiClient.put<Comment>(`/comments/${id}`, data);
    return response.data;
  },

  // Удалить комментарий
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/comments/${id}`);
  },

  // Получить количество комментариев к стиху
  getCount: async (poemId: number): Promise<number> => {
    const response = await apiClient.get<{ count: number }>(
      `/comments/poem/${poemId}/count`,
    );
    return response.data.count; // ← достаём число из объекта
  },

};
