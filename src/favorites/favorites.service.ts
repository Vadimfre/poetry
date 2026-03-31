import { Injectable, NotFoundException } from "@nestjs/common";
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
      throw new NotFoundException("Стихотворение не найдено");
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

  async isFavorite(userId: number, poemId: number): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_poemId: {
          userId,
          poemId,
        },
      },
    });

    return !!favorite;
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
      poem: fav.poem,
    }));
  }

  async removeFavorite(userId: number, poemId: number): Promise<void> {
    const favorite = await this.prisma.favorite.findUnique({
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

    await this.prisma.favorite.delete({
      where: { id: favorite.id },
    });
  }
}
