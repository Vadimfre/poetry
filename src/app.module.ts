import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PoemsModule } from "./poems/poems.module";
import { CommentsModule } from "./comments/comments.module";
import { CategoriesModule } from "./categories/categories.module";
import { AdminModule } from "./admin/admin.module";
import { MailModule } from "./libs/mail/mail.module";
import { EmailConfirmationModule } from "./auth/email-confirmation/email-confirmation.module";
import { PasswordRecoveryModule } from "./auth/password-recovery/password-recovery.module";
import { HolidaysModule } from "./holidays/holidays.module";
import { AuthorsModule } from "./authors/authors.module";
import { SeasonSlidesModule } from "./season-slides/season-slides.module";
import { LikesModule } from "./likes/likes.module";
import { ViewsModule } from "./views/views.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { InteractionsModule } from './interactions/interactions.module';
import { QuizsModule } from './quizs/quizs.module';
import { ClassroomsModule } from "./classrooms/classrooms.module";
import { ProseModule } from "./prose/prose.module";
import { SchoolModule } from "./school/school.module";
import { AssignmentsModule } from "./assignments/assignments.module";
import { I18nModule } from "./i18n/i18n.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule,
    // Статические файлы (видео, картинки)
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "upload"),
      serveRoot: "/upload",
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PoemsModule,
    CommentsModule,
    CategoriesModule,
    AdminModule,
    MailModule,
    EmailConfirmationModule,
    PasswordRecoveryModule,
    HolidaysModule,
    AuthorsModule,
    SeasonSlidesModule,
    LikesModule,
    FavoritesModule,
    ViewsModule,
    InteractionsModule,
    QuizsModule,
    ClassroomsModule,
    AssignmentsModule,
    ProseModule,
    SchoolModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
