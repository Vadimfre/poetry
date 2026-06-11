export type UserRole = "USER" | "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";

export interface User {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
  role?: "STUDENT" | "TEACHER";
}

export interface EmailConfirmationDto {
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface EmailConfirmationResponse {
  success: boolean;
  message: string;
  user: User;
}
