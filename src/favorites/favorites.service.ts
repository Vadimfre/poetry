import { Injectable, NotFoundException } from "@nestjs/common";
import { localizePoem } from "../i18n/content-localizer";
import { PrismaService } from "../prisma/prisma.service";
import {
  FavoriteResponseDto,
  ToggleFavoriteResponseDto,
} from "./dto/favorite-response.dto";

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async toggleFavorite(
    userId: number,
    poemId: number,
  ): Promise<ToggleFavoriteResponseDto> {
    // Проверяем существование стихотворения
    const poem = await this.prisma.poem.findUnique({
      where: { id: poemId },
    });

    if (!poem) {
      throw new NotFoundException("Твор не найден");
    }

    // Ищем существующий избранный
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_poemId: {
          userId,
          poemId,
        },
      },
    });

    return this.prisma.$transaction(async (tx) => {
      if (existingFavorite) {
        // Удаляем из избранного и уменьшаем счетчик
        await tx.favorite.delete({
          where: {
            id: existingFavorite.id,
          },
        });

        const updatedPoem = await tx.poem.update({
          where: { id: poemId },
          data: {
            favoritesCount: {
              decrement: 1,
            },
          },
        });

        return {
          isFavorite: false,
          favoritesCount: updatedPoem.favoritesCount,
        };
      } else {
        // Добавляем в избранное и увеличиваем счетчик
        await tx.favorite.create({
          data: {
            userId,
            poemId,
          },
        });

        const updatedPoem = await tx.poem.update({
          where: { id: poemId },
          data: {
            favoritesCount: {
              increment: 1,
            },
          },
        });

        return {
          isFavorite: true,
          favoritesCount: updatedPoem.favoritesCount,
        };
      }
    });
  }

  async favoriteStatus(
    userId: number,
    poemId: number,
  ): Promise<{
    isFavorite: boolean;
    favoritesCount: number;
  }> {
    const [favorite, poem] = await Promise.all([
      this.prisma.favorite.findUnique({
        where: { userId_poemId: { userId, poemId } },
      }),
      this.prisma.poem.findUnique({
        where: { id: poemId },
        select: { favoritesCount: true },
      }),
    ]);

    return {
      isFavorite: !!favorite,
      favoritesCount: poem?.favoritesCount || 0,
    };
  }

  async getFavoritesCount(poemId: number): Promise<{ favoritesCount: number }> {
    const poem = await this.prisma.poem.findUnique({
      where: { id: poemId },
      select: { favoritesCount: true },
    });

    if (!poem) {
      throw new NotFoundException("Твор не найден");
    }

    return { favoritesCount: poem.favoritesCount };
  }

  async getUserFavorites(userId: number): Promise<FavoriteResponseDto[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        poem: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return favorites.map((fav) => ({
      id: fav.id,
      userId: fav.userId,
      poemId: fav.poemId,
      createdAt: fav.createdAt,
      poem: localizePoem(fav.poem),
    }));
  }

  async removeFavorite(userId: number, poemId: number): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      const favorite = await tx.favorite.findUnique({
        where: {
          userId_poemId: {
            userId,
            poemId,
          },
        },
      });

      if (!favorite) {
        throw new NotFoundException("Запись в избранном не найдена");
      }

      await tx.favorite.delete({
        where: { id: favorite.id },
      });

      await tx.poem.update({
        where: { id: poemId },
        data: {
          favoritesCount: {
            decrement: 1,
          },
        },
      });
    });
  }
}
