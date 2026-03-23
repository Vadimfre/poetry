import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PoemsModule } from './poems/poems.module';
import { CommentsModule } from './comments/comments.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CategoriesModule } from './categories/categories.module';
import { AdminModule } from './admin/admin.module';
import { MailModule } from './libs/mail/mail.module';
import { EmailConfirmationModule } from './auth/email-confirmation/email-confirmation.module';
import { PasswordRecoveryModule } from './auth/password-recovery/password-recovery.module';
import { HolidaysModule } from './holidays/holidays.module';
import { AuthorsModule } from './authors/authors.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Статические файлы (видео, картинки)
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'upload'),
      serveRoot: '/upload',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PoemsModule,
    CommentsModule,
    FavoritesModule,
    CategoriesModule,
    AdminModule,
    MailModule,
    EmailConfirmationModule,
    PasswordRecoveryModule,
    HolidaysModule,
    AuthorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
