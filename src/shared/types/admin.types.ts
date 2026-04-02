import type { UserRole } from "./auth.types";

export interface AdminStats {
  poems: number;
  users: number;
  admins: number;
  comments: number;
  categories: number;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
  _count: {
    comments: number;
    favorites: number;
  };
}

export interface CreatePoemDto {
  title: string;
  content: string;
  description?: string;
  authorId: number;
  year?: number;
  categoryId: number;
  videoUrl?: string;
}

export interface UpdatePoemDto {
  title?: string;
  content?: string;
  description?: string;
  authorId?: number;
  year?: number;
  categoryId?: number;
  videoUrl?: string;
}

export interface CreateAuthorDto {
  name: string;
  bio?: string;
  birthYear?: number;
  deathYear?: number;
  image?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UploadVideoResponse {
  videoUrl: string;
  filename: string;
}

// Комментарии
export interface AdminComment {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string | null;
    email: string;
  };
  poem: {
    id: number;
    title: string;
  };
}

export interface AdminCommentsResponse {
  comments: AdminComment[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateCommentDto {
  text: string;
}

// Лайки
export interface AdminLike {
  id: number;
  createdAt: string;
  user: {
    id: number;
    name: string | null;
    email: string;
  };
  poem: {
    id: number;
    title: string;
  };
}

export interface AdminLikesResponse {
  likes: AdminLike[];
  total: number;
  page: number;
  limit: number;
}

export interface LikesStatistics {
  totalLikes: number;
  likesByDay: Array<{
    date: string;
    count: number;
  }>;
  topPoems: Array<{
    poemId: number;
    title: string;
    likes: number;
  }>;
}

// Просмотры
export interface AdminView {
  id: number;
  ipHash: string;
  createdAt: string;
  poem: {
    id: number;
    title: string;
  };
}

export interface AdminViewsResponse {
  views: AdminView[];
  total: number;
  page: number;
  limit: number;
}

export interface ViewsAnalytics {
  totalViews: number;
  viewsByDay: Array<{
    date: string;
    count: number;
  }>;
  topPoems: Array<{
    poemId: number;
    title: string;
    views: number;
  }>;
}

// Праздники
export interface AdminHoliday {
  id: number;
  name: string;
  description: string;
  date: string; // ISO string
  season: "WINTER" | "SPRING" | "SUMMER" | "AUTUMN";
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHolidayDto {
  name: string;
  description: string;
  date: string;
  season: "WINTER" | "SPRING" | "SUMMER" | "AUTUMN";
  image?: string;
}

export interface UpdateHolidayDto {
  name?: string;
  description?: string;
  date?: string;
  season?: "WINTER" | "SPRING" | "SUMMER" | "AUTUMN";
  image?: string;
}

// Сезонные слайды
export interface AdminSeasonSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  season: "WINTER" | "SPRING" | "SUMMER" | "AUTUMN";
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSeasonSlideDto {
  title: string;
  description: string;
  image: string;
  season: "WINTER" | "SPRING" | "SUMMER" | "AUTUMN";
  order?: number;
  isActive?: boolean;
}

export interface UpdateSeasonSlideDto {
  title?: string;
  description?: string;
  image?: string;
  season?: "WINTER" | "SPRING" | "SUMMER" | "AUTUMN";
  order?: number;
  isActive?: boolean;
}
