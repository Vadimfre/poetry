import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { createHash } from "crypto";

@Injectable()
export class ViewsService {
  constructor(private prisma: PrismaService) {}

  private hashIp(ip: string): string {
    return createHash("sha256")
      .update(ip + (process.env.IP_HASH_SALT || ""))
      .digest("hex");
  }

  private getStartOfDay(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  async addView(
    poemId: number,
    userId?: number,
    ip?: string,
  ): Promise<{ views: number }> {
    // 1. Проверка poem
    const poem = await this.prisma.poem.findUnique({
      where: { id: poemId },
      select: { views: true },
    });

    if (!poem) {
      throw new NotFoundException("Стихотворение не найдено");
    }

    const date = this.getStartOfDay();
    const ipHash = ip ? this.hashIp(ip) : null;

    try {
      // 2. Пытаемся создать просмотр
      await this.prisma.view.create({
        data: {
          poemId,
          userId: userId ?? null,
          ip: ip ?? null,
          ipHash,
          date,
        },
      });

      // 3. Если создали → увеличиваем счётчик
      const updated = await this.prisma.poem.update({
        where: { id: poemId },
        data: {
          views: {
            increment: 1,
          },
        },
        select: { views: true },
      });

      return { views: updated.views };
    } catch (e) {
      const updated = await this.prisma.poem.findUnique({
        where: { id: poemId },
        select: { views: true },
      });

      return { views: updated.views };
    }
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
}
