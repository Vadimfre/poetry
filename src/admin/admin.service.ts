import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ========== POEMS MANAGEMENT ==========

  async createPoem(data: {
    title: string;
    content: string;
    description?: string;
    authorId: number;
    year?: number;
    categoryId: number;
    videoUrl?: string;
  }) {
    const slug = this.generateSlug(data.title);

    // Проверяем уникальность slug
    const existing = await this.prisma.poem.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException('Верш з такой назвай ужо існуе');
    }

    const { categoryId, ...rest } = data;

    return this.prisma.poem.create({
      data: {
        ...rest,
        slug,
        categories: {
          connect: { id: categoryId },
        },
      },
      include: {
        author: true,
        categories: true,
      },
    });
  }

  async updatePoem(
    id: number,
    data: {
      title?: string;
      content?: string;
      description?: string;
      authorId?: number;
      year?: number;
      categoryId?: number;
      videoUrl?: string;
    },
  ) {
    const poem = await this.prisma.poem.findUnique({ where: { id } });
    if (!poem) {
      throw new NotFoundException('Верш не знойдзены');
    }

    const updateData: any = { ...data };

    // Если меняется title, обновляем slug
    if (data.title && data.title !== poem.title) {
      updateData.slug = this.generateSlug(data.title);
    }

    // Если передан categoryId, обновляем связь
    if (data.categoryId !== undefined) {
      updateData.categories = {
        set: [{ id: data.categoryId }],
      };
      delete updateData.categoryId;
    }

    return this.prisma.poem.update({
      where: { id },
      data: updateData,
      include: {
        author: true,
        categories: true,
      },
    });
  }

  async deletePoem(id: number) {
    const poem = await this.prisma.poem.findUnique({ where: { id } });
    if (!poem) {
      throw new NotFoundException('Стих не найден');
    }

    // Удаляем видео файл если есть
    if (poem.videoUrl) {
      const videoPath = path.join(process.cwd(), poem.videoUrl.replace(/^\//, ''));
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    return this.prisma.poem.delete({ where: { id } });
  }

  async getAllPoems() {
    return this.prisma.poem.findMany({
      include: {
        author: true,
        categories: true,
        _count: {
          select: {
            comments: true,
            favorites: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ========== AUTHORS MANAGEMENT ==========

  async createAuthor(data: {
    name: string;
    bio?: string;
    birthYear?: number;
    deathYear?: number;
    image?: string;
  }) {
    const slug = this.generateSlug(data.name);

    const existing = await this.prisma.author.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException('Аўтар з такім імем ужо існуе');
    }

    return this.prisma.author.create({
      data: {
        ...data,
        slug,
      },
    });
  }

  async getAllAuthors() {
    return this.prisma.author.findMany({
      include: {
        _count: {
          select: {
            poems: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  // ========== CATEGORIES MANAGEMENT ==========

  async createCategory(data: {
    name: string;
    description?: string;
  }) {
    const slug = this.generateSlug(data.name);

    return this.prisma.category.create({
      data: {
        ...data,
        slug,
      },
    });
  }

  async getAllCategories() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: {
            poems: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  // ========== USERS/ADMINS MANAGEMENT ==========

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            comments: true,
            favorites: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setUserRole(adminEmail: string, userId: number, role: 'USER' | 'ADMIN') {
    const targetUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Нельзя изменить роль суперадмина
    if (targetUser.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('Нельзя изменить роль главного администратора');
    }

    // Нельзя изменить свою роль
    if (targetUser.email === adminEmail) {
      throw new ForbiddenException('Нельзя изменить свою роль');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  async deleteUser(adminEmail: string, userId: number) {
    const targetUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Нельзя удалить суперадмина
    if (targetUser.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('Нельзя удалить главного администратора');
    }

    // Нельзя удалить себя
    if (targetUser.email === adminEmail) {
      throw new ForbiddenException('Нельзя удалить себя');
    }

    return this.prisma.user.delete({ where: { id: userId } });
  }

  // ========== STATS ==========

  async getStats() {
    const [poemsCount, usersCount, commentsCount, categoriesCount] =
      await Promise.all([
        this.prisma.poem.count(),
        this.prisma.user.count(),
        this.prisma.comment.count(),
        this.prisma.category.count(),
      ]);

    const adminsCount = await this.prisma.user.count({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    });

    return {
      poems: poemsCount,
      users: usersCount,
      admins: adminsCount,
      comments: commentsCount,
      categories: categoriesCount,
    };
  }

  // ========== HELPERS ==========

  private generateSlug(text: string): string {
    const translitMap: Record<string, string> = {
      // Русская и белорусская транслитерация
      а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
      з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
      п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
      ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
      я: 'ya', ' ': '-',
      // Белорусские буквы
      і: 'i', ў: 'u', ґ: 'g',
    };

    return text
      .toLowerCase()
      .split('')
      .map((char) => translitMap[char] || char)
      .join('')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
