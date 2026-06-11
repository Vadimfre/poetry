import { Favorite, FavoriteData } from "../types";
import { apiClient } from "./client";

export const favoritesApi = {
  toggleFavorite: async (poemId: number): Promise<FavoriteData> => {
    const response = await apiClient.post(`/favorites/poem/${poemId}/toggle`);
    return response.data;
  },

  getFavoriteStatus: async (
    poemId: number,
  ): Promise<{ isFavorite: boolean }> => {
    const response = await apiClient.get(`/favorites/poem/${poemId}/status`);
    return response.data;
  },

  getMyFavorites: async (): Promise<Favorite[]> => {
    const response = await apiClient.get("/favorites/my");
    return response.data;
  },

  removeFavorite: async (poemId: number): Promise<void> => {
    await apiClient.delete(`/favorites/poem/${poemId}`);
  },

  getCount: async (poemId: number): Promise<{ favoritesCount: number }> => {
    const response = await apiClient.get(`/favorites/poem/${poemId}/count`);
    return response.data;
  },
};
