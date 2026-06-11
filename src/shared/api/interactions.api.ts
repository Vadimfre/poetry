import { PoemInteractionsData } from "../types/interactions.types";
import { apiClient } from "./client";

export const interactionsApi = {
  getInteractions: async (poemId: number): Promise<PoemInteractionsData> => {
    const response = await apiClient.get(`/poems/${poemId}/interactions`);
    return response.data;
  },
  addView: async (poemId: number): Promise<{ views: number }> => {
    const response = await apiClient.post(`/poems/${poemId}/view`);
    return response.data;
  },
};
