import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    poemId: number,
    text: string,
    parentId?: number,
  ) {
    return this.prisma.$transaction(async (prisma) => {
      // 1. Проверка стиха
      const poem = await prisma.poem.findUnique({
        where: { id: poemId },
      });

      if (!poem) {
        throw new NotFoundException("Стихотворение не найдено");
      }

      // 2. Проверка parentId
      if (parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: parentId },
          select: { poemId: true },
        });

        if (!parentComment) {
          throw new NotFoundException("Комментарий для ответа не найден");
        }

        if (parentComment.poemId !== poemId) {
          throw new ForbiddenException(
            "Комментарий для ответа принадлежит другому стихотворению",
          );
        }
      }

      // 3. Создание комментария
      const comment = await prisma.comment.create({
        data: {
          text,
          userId,
          poemId,
          parentId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // 4. Обновление счетчика
      await prisma.poem.update({
        where: { id: poemId },
        data: {
          commentsCount: {
            increment: 1,
          },
        },
      });

      return comment;
    });
  }

  // 🔍 FIND
  async findByPoem(poemId: number) {
    return this.prisma.comment.findMany({
      where: { poemId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        parent: {
          select: {
            id: true,
            text: true,
            userId: true,
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ✏️ UPDATE
  async update(id: number, userId: number, text: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException("Комментарий не найден");
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException(
        "Вы можете редактировать только свои комментарии",
      );
    }

    return this.prisma.comment.update({
      where: { id },
      data: { text },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  // ❌ DELETE
  async delete(id: number, userId: number) {
    return this.prisma.$transaction(async (prisma) => {
      const comment = await prisma.comment.findUnique({
        where: { id },
      });

      if (!comment) {
        throw new NotFoundException("Комментарий не найден");
      }

      if (comment.userId !== userId) {
        throw new ForbiddenException(
          "Вы можете удалять только свои комментарии",
        );
      }

      // 1. Считаем сколько удалим replies
      const deletedRepliesCount = await prisma.comment.count({
        where: { parentId: id },
      });

      // 2. Удаляем replies
      await prisma.comment.deleteMany({
        where: { parentId: id },
      });

      // 3. Удаляем сам комментарий
      await prisma.comment.delete({
        where: { id },
      });

      // 4. Обновляем счетчик
      await prisma.poem.update({
        where: { id: comment.poemId },
        data: {
          commentsCount: {
            decrement: deletedRepliesCount + 1,
          },
        },
      });

      return { message: "Комментарий успешно удален" };
    });
  }

  // 🔢 COUNT
  async getCommentCount(poemId: number): Promise<number> {
    return this.prisma.comment.count({
      where: { poemId },
    });
  }
}
