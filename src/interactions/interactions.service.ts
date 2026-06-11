import { Injectable } from "@nestjs/common";
import { LikesService } from "../likes/likes.service";
import { FavoritesService } from "../favorites/favorites.service";
import { ViewsService } from "../views/views.service";
import { CommentsService } from "../comments/comments.service";

@Injectable()
export class InteractionsService {
  constructor(
    private likesService: LikesService,
    private favoritesService: FavoritesService,
    private viewsService: ViewsService,
    private commentsService: CommentsService,
  ) {}

  async getInteractions(poemId: number, userId: number | null, ip?: string) {
    const [likeStatus, likesCount, favoriteStatus, views, commentsCount] =
      await Promise.all([
        userId
          ? this.likesService.isLikedByUser(userId, poemId)
          : { liked: false },
        this.likesService.getLikesCount(poemId),
        userId
          ? this.favoritesService.favoriteStatus(userId, poemId)
          : { isFavorite: false, favoritesCount: 0 },
        this.viewsService.getViews(poemId),
        this.commentsService.getCommentCount(poemId),
      ]);

    return {
      liked: likeStatus.liked,
      likesCount: likesCount.likesCount,
      isFavorite: favoriteStatus.isFavorite,
      favoritesCount: favoriteStatus.favoritesCount,
      views: views.views,
      commentsCount,
    };
  }

  async addView(poemId: number, userId?: number, ip?: string) {
    return this.viewsService.getOrAddView(poemId, userId, ip);
  }
}
