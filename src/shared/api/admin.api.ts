"use client";

import { apiClient } from "./client";
import type { Poem, Author } from "../types/poem.types";
import type { Category } from "../types/category.types";
import type {
  AdminStats,
  AdminUser,
  CreatePoemDto,
  UpdatePoemDto,
  CreateAuthorDto,
  CreateCategoryDto,
  UploadVideoResponse,
  AdminComment,
  AdminCommentsResponse,
  UpdateCommentDto,
  AdminLike,
  AdminLikesResponse,
  LikesStatistics,
  AdminView,
  AdminViewsResponse,
  ViewsAnalytics,
  AdminHoliday,
  CreateHolidayDto,
  UpdateHolidayDto,
  AdminSeasonSlide,
  CreateSeasonSlideDto,
  UpdateSeasonSlideDto,
} from "../types/admin.types";

export const adminApi = {
  // Stats
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get<AdminStats>("/admin/stats");
    return response.data;
  },

  // Poems
  getPoems: async (): Promise<Poem[]> => {
    const response = await apiClient.get<Poem[]>("/admin/poems");
    return response.data;
  },

  createPoem: async (data: CreatePoemDto): Promise<Poem> => {
    const response = await apiClient.post<Poem>("/admin/poems", data);
    return response.data;
  },

  updatePoem: async (id: number, data: UpdatePoemDto): Promise<Poem> => {
    const response = await apiClient.put<Poem>(`/admin/poems/${id}`, data);
    return response.data;
  },

  deletePoem: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/poems/${id}`);
  },

  // Video upload
  uploadVideo: async (file: File): Promise<UploadVideoResponse> => {
    const formData = new FormData();
    formData.append("video", file);
    const response = await apiClient.post<UploadVideoResponse>(
      "/admin/upload/video",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // Authors
  getAuthors: async (): Promise<Author[]> => {
    const response = await apiClient.get<Author[]>("/admin/authors");
    return response.data;
  },

  createAuthor: async (data: CreateAuthorDto): Promise<Author> => {
    const response = await apiClient.post<Author>("/admin/authors", data);
    return response.data;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>("/admin/categories");
    return response.data;
  },

  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post<Category>("/admin/categories", data);
    return response.data;
  },

  // Users (Super Admin only)
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await apiClient.get<AdminUser[]>("/admin/users");
    return response.data;
  },

  setUserRole: async (
    userId: number,
    role: "USER" | "ADMIN",
  ): Promise<AdminUser> => {
    const response = await apiClient.put<AdminUser>(
      `/admin/users/${userId}/role`,
      { role },
    );
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  // Комментарии
  getComments: async (
    page: number = 1,
    limit: number = 20,
    userId?: number,
    poemId?: number,
  ): Promise<AdminCommentsResponse> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (userId) params.append("userId", userId.toString());
    if (poemId) params.append("poemId", poemId.toString());
    const response = await apiClient.get<AdminCommentsResponse>(
      `/admin/comments?${params.toString()}`,
    );
    return response.data;
  },

  getCommentById: async (id: number): Promise<AdminComment> => {
    const response = await apiClient.get<AdminComment>(`/admin/comments/${id}`);
    return response.data;
  },

  updateComment: async (
    id: number,
    data: UpdateCommentDto,
  ): Promise<AdminComment> => {
    const response = await apiClient.put<AdminComment>(
      `/admin/comments/${id}`,
      data,
    );
    return response.data;
  },

  deleteComment: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/comments/${id}`);
  },

  bulkDeleteComments: async (ids: number[]): Promise<void> => {
    await apiClient.post("/admin/comments/bulk-delete", { ids });
  },

  // Лайки
  getLikes: async (
    page: number = 1,
    limit: number = 20,
    userId?: number,
    poemId?: number,
  ): Promise<AdminLikesResponse> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (userId) params.append("userId", userId.toString());
    if (poemId) params.append("poemId", poemId.toString());
    const response = await apiClient.get<AdminLikesResponse>(
      `/admin/likes?${params.toString()}`,
    );
    return response.data;
  },

  getLikesStatistics: async (): Promise<LikesStatistics> => {
    const response = await apiClient.get<LikesStatistics>(
      "/admin/likes/statistics",
    );
    return response.data;
  },

  deleteLike: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/likes/${id}`);
  },

  // Просмотры
  getViews: async (
    page: number = 1,
    limit: number = 20,
    poemId?: number,
  ): Promise<AdminViewsResponse> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (poemId) params.append("poemId", poemId.toString());
    const response = await apiClient.get<AdminViewsResponse>(
      `/admin/views?${params.toString()}`,
    );
    return response.data;
  },

  getViewsAnalytics: async (): Promise<ViewsAnalytics> => {
    const response = await apiClient.get<ViewsAnalytics>(
      "/admin/views/analytics",
    );
    return response.data;
  },

  getViewsByPoem: async (poemId: number): Promise<AdminView[]> => {
    const response = await apiClient.get<AdminView[]>(
      `/admin/views/poem/${poemId}`,
    );
    return response.data;
  },

  // Праздники (заглушки - endpoints будут добавлены позже)
  getHolidays: async (): Promise<AdminHoliday[]> => {
    const response = await apiClient.get<AdminHoliday[]>("/admin/holidays");
    return response.data;
  },

  createHoliday: async (data: CreateHolidayDto): Promise<AdminHoliday> => {
    const response = await apiClient.post<AdminHoliday>(
      "/admin/holidays",
      data,
    );
    return response.data;
  },

  updateHoliday: async (
    id: number,
    data: UpdateHolidayDto,
  ): Promise<AdminHoliday> => {
    const response = await apiClient.put<AdminHoliday>(
      `/admin/holidays/${id}`,
      data,
    );
    return response.data;
  },

  deleteHoliday: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/holidays/${id}`);
  },

  // Сезонные слайды (заглушки)
  getSeasonSlides: async (): Promise<AdminSeasonSlide[]> => {
    const response = await apiClient.get<AdminSeasonSlide[]>(
      "/admin/season-slides",
    );
    return response.data;
  },

  createSeasonSlide: async (
    data: CreateSeasonSlideDto,
  ): Promise<AdminSeasonSlide> => {
    const response = await apiClient.post<AdminSeasonSlide>(
      "/admin/season-slides",
      data,
    );
    return response.data;
  },

  updateSeasonSlide: async (
    id: number,
    data: UpdateSeasonSlideDto,
  ): Promise<AdminSeasonSlide> => {
    const response = await apiClient.put<AdminSeasonSlide>(
      `/admin/season-slides/${id}`,
      data,
    );
    return response.data;
  },

  deleteSeasonSlide: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/season-slides/${id}`);
  },
};
