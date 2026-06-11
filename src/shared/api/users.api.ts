import { User } from "../types";
import { apiClient } from "./client";

export interface UpdateProfileDto {
  name?: string;
  avatar?: string;
}

export interface UpdateEmailDto {
  email: string;
  password: string;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile extends User {
  createdAt: string;
  _count?: {
    favorites: number;
    comments: number;
  };
}

export const usersApi = {
  // Получить текущего пользователя
  getMe: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>("/users/me");
    return response.data;
  },

  // Получить пользователя по ID
  getById: async (id: number): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(`/users/${id}`);
    return response.data;
  },

  // Обновить профиль
  updateProfile: async (data: UpdateProfileDto): Promise<User> => {
    const response = await apiClient.put<User>("/users/profile", data);
    return response.data;
  },

  // Обновить email
  updateEmail: async (data: UpdateEmailDto): Promise<User> => {
    const response = await apiClient.put<User>("/users/email", data);
    return response.data;
  },

  // Обновить пароль
  updatePassword: async (
    data: UpdatePasswordDto,
  ): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(
      "/users/password",
      data,
    );
    return response.data;
  },
};
