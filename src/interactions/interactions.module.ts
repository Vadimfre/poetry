import { Module } from "@nestjs/common";
import { InteractionsService } from "./interactions.service";
import { InteractionsController } from "./interactions.controller";
import { LikesModule } from "../likes/likes.module";
import { FavoritesModule } from "../favorites/favorites.module";
import { ViewsModule } from "../views/views.module";
import { CommentsModule } from "../comments/comments.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    LikesModule,
    FavoritesModule,
    ViewsModule,
    CommentsModule,
    AuthModule,
  ],
  controllers: [InteractionsController],
  providers: [InteractionsService],
})
export class InteractionsModule {}
