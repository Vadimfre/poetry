import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ToggleLikeResponseDto } from "./dto/toggle-like-response.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async toggleLike(
    userId: number,
    poemId: number,
  ): Promise<ToggleLikeResponseDto> {
    const [existingLike, poem] = await Promise.all([
      this.prisma.like.findUnique({
        where: { userId_poemId: { userId, poemId } },
      }),
      this.prisma.poem.findUnique({
        where: { id: poemId },
      }),
    ]);

    if (!poem) {
      throw new NotFoundException("Стихотворение не найдено");
    }

    return this.prisma.$transaction(async (tx) => {
      // Если лайк уже есть — удаляем
      if (existingLike) {
        await tx.like.delete({
          where: {
            id: existingLike.id,
          },
        });
      } else {
        // Если лайка нет — пытаемся создать
        try {
          await tx.like.create({
            data: {
              userId,
              poemId,
            },
          });
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            // race condition — лайк уже существует
          } else {
            throw error;
          }
        }
      }

      // Считаем реальное количество лайков из таблицы
      const realCount = await tx.like.count({ where: { poemId } });

      // Синхронизируем денормализованный счётчик
      await tx.poem.update({
        where: { id: poemId },
        data: { likesCount: realCount },
      });

      return {
        liked: !existingLike,
        likesCount: realCount,
      };
    });
  }

  async isLikedByUser(
    userId: number,
    poemId: number,
  ): Promise<{ liked: boolean }> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_poemId: {
          userId,
          poemId,
        },
      },
    });

    return { liked: !!like }; // ← оборачиваем в объект
  }

  async getLikesCount(poemId: number): Promise<{ likesCount: number }> {
    const likesCount = await this.prisma.like.count({
      where: { poemId },
    });

    return { likesCount };
  }

  async removeLike(userId: number, poemId: number): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      const like = await tx.like.findUnique({
        where: {
          userId_poemId: {
            userId,
            poemId,
          },
        },
      });

      if (!like) {
        throw new NotFoundException("Запись в лайкнутом не найдена");
      }

      await tx.like.delete({
        where: { id: like.id },
      });

      const realCount = await tx.like.count({ where: { poemId } });

      await tx.poem.update({
        where: { id: poemId },
        data: { likesCount: realCount },
      });
    });
  }

  async recalculateLikesCount(poemId: number): Promise<void> {
    const count = await this.prisma.like.count({
      where: { poemId },
    });

    await this.prisma.poem.update({
      where: { id: poemId },
      data: { likesCount: count },
    });
  }
  async recalculateAllLikesCounts() {
    const poems = await this.prisma.poem.findMany({
      select: { id: true },
    });

    await Promise.all(
      poems.map(async (poem) => {
        const count = await this.prisma.like.count({
          where: { poemId: poem.id },
        });

        await this.prisma.poem.update({
          where: { id: poem.id },
          data: { likesCount: count },
        });
      }),
    );

    return { message: `Пересчитано ${poems.length} стихов` };
  }
}
