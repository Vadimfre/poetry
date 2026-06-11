import { Poem } from "@prisma/client";

export class FavoriteResponseDto {
  id: number;
  userId: number;
  poemId: number;
  createdAt: Date;
  poem?: Poem;
}

export class ToggleFavoriteResponseDto {
  isFavorite: boolean;
  favoritesCount: number;
}
