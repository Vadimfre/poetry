import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { createHash } from "crypto";

@Injectable()
export class ViewsService {
  constructor(private prisma: PrismaService) {}

  private generateIpHash(ip: string): string {
    // Генерируем хэш IP для анонимизации
    return createHash("sha256")
      .update(ip + process.env.IP_HASH_SALT || "")
      .digest("hex");
  }

  private getStartOfDay(date: Date): Date {
    // Возвращает начало дня (00:00:00) для переданной даты
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  async recordView(
    poemId: number,
    userId?: number,
    ip?: string,
  ): Promise<{ views: number }> {
    // Проверяем существование стихотворения
    const poem = await this.prisma.poem.findUnique({
      where: { id: poemId },
    });

    if (!poem) {
      throw new NotFoundException("Стихотворение не найдено");
    }

    const today = this.getStartOfDay(new Date());
    let ipHash: string | null = null;

    if (ip) {
      ipHash = this.generateIpHash(ip);
    }

    // Проверяем, был ли уже сегодня просмотр от этого пользователя или IP
    const existingView = await this.prisma.view.findFirst({
      where: {
        poemId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // следующий день
        },
        OR: [
          { userId: userId ?? undefined },
          { ipHash: ipHash ?? undefined },
        ].filter(
          (cond) => cond.userId !== undefined || cond.ipHash !== undefined,
        ),
      },
    });

    // Если просмотр уже был сегодня, возвращаем текущее количество просмотров
    if (existingView) {
      const currentViews = await this.prisma.poem.findUnique({
        where: { id: poemId },
        select: { views: true },
      });
      return { views: currentViews?.views ?? 0 };
    }

    // В транзакции создаём запись View и увеличиваем счётчик
    return this.prisma.$transaction(async (tx) => {
      await tx.view.create({
        data: {
          poemId,
          userId: userId ?? null,
          ip: ip ?? null,
          ipHash: ipHash ?? null,
          date: today,
        },
      });

      const updatedPoem = await tx.poem.update({
        where: { id: poemId },
        data: {
          views: {
            increment: 1,
          },
        },
      });

      return { views: updatedPoem.views };
    });
  }

  async getViewsCount(poemId: number): Promise<number> {
    const poem = await this.prisma.poem.findUnique({
      where: { id: poemId },
      select: { views: true },
    });

    if (!poem) {
      throw new NotFoundException("Стихотворение не найдено");
    }

    return poem.views;
  }

  async getViewsHistory(
    poemId: number,
    days: number = 30,
  ): Promise<{ date: string; count: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const views = await this.prisma.view.groupBy({
      by: ["date"],
      where: {
        poemId,
        date: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    return views.map((v) => ({
      date: v.date.toISOString().split("T")[0],
      count: v._count.id,
    }));
  }
}
