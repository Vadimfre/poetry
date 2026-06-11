import { apiClient } from "./client";

export const likesApi = {
  toggle: async (
    poemId: number,
  ): Promise<{ liked: boolean; likesCount: number }> => {
    const response = await apiClient.post(`/likes/${poemId}/toggle`);
    return response.data;
  },

  getStatus: async (poemId: number): Promise<{ liked: boolean }> => {
    const response = await apiClient.get(`/likes/${poemId}/me`);
    return response.data;
  },

  getCount: async (poemId: number): Promise<{ likesCount: number }> => {
    const response = await apiClient.get(`/likes/${poemId}/count`);
    return response.data;
  },

  removeLike: async (poemId: number): Promise<void> => {
    await apiClient.delete(`/likes/poem/${poemId}`);
  },
};
