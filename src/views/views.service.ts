import { Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
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

  async getOrAddView(
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

    // 2. Проверяем, был ли уже просмотр сегодня
    //    Авторизованный — по userId, аноним — по ipHash
    let existingView = null;

    if (userId) {
      existingView = await this.prisma.view.findFirst({
        where: { poemId, userId, date },
      });
    }

    if (!existingView) {
      const ipHash = ip ? this.hashIp(ip) : null;
      if (ipHash) {
        existingView = await this.prisma.view.findFirst({
          where: { poemId, ipHash, date },
        });
      }
    }

    // 3. Если просмотр уже был — просто возвращаем текущий счётчик
    if (existingView) {
      return { views: poem.views };
    }

    // 4. Создаём просмотр
    const ipHash = ip ? this.hashIp(ip) : null;

    try {
      await this.prisma.view.create({
        data: {
          poemId,
          userId: userId ?? null,
          ip: ip ?? null,
          ipHash,
          date,
        },
      });

      // 5. Увеличиваем счётчик
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
      // Ловим только unique constraint violation (race condition)
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        const current = await this.prisma.poem.findUnique({
          where: { id: poemId },
          select: { views: true },
        });
        return { views: current!.views };
      }
      throw e;
    }
  }

  extractIp(req: any): string {
    return req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
  }

  setCacheHeaders(res: Response): void {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
  }
}
