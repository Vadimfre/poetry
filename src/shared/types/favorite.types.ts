import type { Poem } from "./poem.types";

export interface Favorite {
  id: number;
  userId: number;
  poemId: number;
  createdAt: string;
  poem: Poem;
}

export interface FavoriteWithPoem extends Favorite {
  poem: Poem;
}
