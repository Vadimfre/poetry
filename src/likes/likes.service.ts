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
    const poem = await this.prisma.poem.findUnique({
      where: { id: poemId },
      select: { id: true, likesCount: true },
    });

    if (!poem) {
      throw new NotFoundException("Стихотворение не найдено");
    }

    return this.prisma.$transaction(async (tx) => {
      // Проверяем лайк внутри транзакции (актуальное состояние)
      const existingLike = await tx.like.findUnique({
        where: {
          userId_poemId: {
            userId,
            poemId,
          },
        },
      });

      // Если лайк уже есть — удаляем
      if (existingLike) {
        await tx.like.delete({
          where: {
            id: existingLike.id,
          },
        });

        const updatedPoem = await tx.poem.update({
          where: { id: poemId },
          data: {
            likesCount: {
              decrement: 1,
            },
          },
          select: {
            likesCount: true,
          },
        });

        return {
          liked: false,
          likesCount: updatedPoem.likesCount,
        };
      }

      // Если лайка нет — пытаемся создать
      try {
        await tx.like.create({
          data: {
            userId,
            poemId,
          },
        });
      } catch (error) {
        // Если поймали unique constraint — лайк уже существует (race condition)
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          // В этом случае просто считаем, что лайк уже был
        } else {
          throw error;
        }
      }

      const updatedPoem = await tx.poem.update({
        where: { id: poemId },
        data: {
          likesCount: {
            increment: 1,
          },
        },
        select: {
          likesCount: true,
        },
      });

      return {
        liked: true,
        likesCount: updatedPoem.likesCount,
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
