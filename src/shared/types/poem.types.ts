import type { Category } from "./category.types";
import type { Comment } from "./comment.types";

export interface Author {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  birthYear: number | null;
  deathYear: number | null;
  image: string | null;
  createdAt: string;
  poems?: Poem[];
  _count?: {
    poems: number;
  };
}

export interface Poem {
  id: number;
  title: string;
  slug: string;
  content: string;
  description: string | null;

  authorId: number;
  author: Author;

  year: number | null;
  videoUrl: string;
  views: number;
  likes: number;

  categories: Category[];

  comments?: Comment[];
  isFavorited?: boolean;

  _count?: {
    comments: number;
    favorites: number;
  };

  createdAt: string;
  updatedAt: string;

  /** True when requested locale has no poem translation (public API) */
  translationMissing?: boolean;

  /** Raw i18n from admin API */
  i18n?: Record<string, Record<string, string>>;

  schoolGrades?: Array<{ grade: number; kind: string }>;
}

export interface PoemsResponse {
  poems: Poem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
