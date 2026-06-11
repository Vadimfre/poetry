import { apiClient } from "./client";
import type {
  User,
  LoginDto,
  RegisterDto,
  AuthResponse,
} from "../types/auth.types";

export const authApi = {
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>("/auth/profile");
    return response.data;
  },

  checkAuth: async (): Promise<{ authenticated: boolean; user: User }> => {
    const response = await apiClient.get("/auth/check");
    return response.data;
  },

  newVerification: async (token: string | null): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/email-confirmation",
      { token },
    );
    return response.data;
  },
};
