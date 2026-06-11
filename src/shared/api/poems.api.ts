import { Poem, PoemsResponse } from "../types";
import { apiClient } from "./client";

export const poemsApi = {
  getAll: async (page = 1, limit = 20): Promise<PoemsResponse> => {
    const response = await apiClient.get<PoemsResponse>(`/poems`, {
      params: { page, limit },
    });
    return response.data;
  },

  getOne: async (id: number): Promise<Poem> => {
    const response = await apiClient.get<Poem>(`/poems/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Poem> => {
    const response = await apiClient.get<Poem>(`/poems/slug/${slug}`);
    return response.data;
  },

  getByCollection: async (collectionId: number): Promise<Poem[]> => {
    const response = await apiClient.get<Poem[]>(
      `/poems/collection/${collectionId}`,
    );
    return response.data;
  },

  getByCategorySlug: async (categorySlug: string): Promise<Poem[]> => {
    const response = await apiClient.get<Poem[]>(
      `/poems/category/slug/${categorySlug}`,
    );
    return response.data;
  },

  search: async (query: string): Promise<Poem[]> => {
    const response = await apiClient.get<Poem[]>(`/poems/search`, {
      params: { q: query },
    });
    return response.data;
  },
};
