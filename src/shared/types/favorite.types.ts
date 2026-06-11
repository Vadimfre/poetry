import type { Poem } from "./poem.types";

export interface FavoriteData {
  isFavorite: boolean;
  favoritesCount: number;
}

export interface FavoriteBase {
  id: number;
  userId: number;
  poemId: number;
  createdAt: string;
}

export interface Favorite extends FavoriteBase {
  poem: Poem;
}

export interface FavoriteCount {
  count: number;
}

export interface FavoriteStatus {
  isFavorite: boolean;
  favoritesCount: number;
}

// ✅ Для апи
export interface ToggleFavoriteRequest {
  poemId: number;
}

export interface RemoveFavoriteRequest {
  poemId: number;
}

export interface GetFavoritesParams {
  page?: number;
  limit?: number;
}

export interface FavoriteOptimisticContext {
  previousData?: import("./interactions.types").PoemInteractionsData;
  poemId: number;
  action: "add" | "remove";
}
