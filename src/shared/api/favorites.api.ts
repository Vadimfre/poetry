import { apiClient } from "./client";
import { FavoriteWithPoem } from "../types";

export const favoritesApi = {
  toggle: async (
    poemId: number,
  ): Promise<{ isFavorite: boolean; count: number }> => {
    const response = await apiClient.post(`/favorites/poems/${poemId}/toggle`);
    return response.data;
  },

  getStatus: async (poemId: number): Promise<{ isFavorite: boolean }> => {
    const response = await apiClient.get(`/favorites/poems/${poemId}/status`);
    return response.data;
  },

  getMyFavorites: async (): Promise<FavoriteWithPoem[]> => {
    const response = await apiClient.get("/favorites/my");
    return response.data;
  },

  remove: async (poemId: number): Promise<void> => {
    await apiClient.delete(`/favorites/poems/${poemId}`);
  },
};