import { ViewResponse } from "../types/views.types";
import { apiClient } from "./client";

export const viewsApi = {
  // 🔄 Единственный метод - получает и добавляет просмотр
  getOrAddView: async (poemId: number): Promise<ViewResponse> => {
    const response = await apiClient.get<ViewResponse>(`/views/${poemId}`);
    return response.data;
  },
};
