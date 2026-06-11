import { Author } from "../types";
import { apiClient } from "./client";

export const authorsApi = {
  getAll: async (): Promise<Author[]> => {
    const response = await apiClient.get<Author[]>("/authors");
    return response.data;
  },

  getOne: async (id: number): Promise<Author> => {
    const response = await apiClient.get<Author>(`/authors/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Author> => {
    const response = await apiClient.get<Author>(`/authors/slug/${slug}`);
    return response.data;
  },
};
