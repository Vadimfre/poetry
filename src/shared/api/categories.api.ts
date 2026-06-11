import { Category } from "../types";
import { apiClient } from "./client";

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>("/categories");
    return response.data;
  },

  getOne: async (id: number): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/slug/${slug}`);
    return response.data;
  },
};
