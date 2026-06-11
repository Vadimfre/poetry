import { Injectable, NotFoundException } from "@nestjs/common";
import {
  localizeAuthor,
  localizeAuthors,
  localizeCategory,
  localizePoem,
  localizePoems,
  localizeProseWorks,
} from "../i18n/content-localizer";
import {
  restrictPoemContentForGuest,
  restrictPoemsContentForGuest,
} from "../lib/poem-guest-access";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PoemsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 20, userId?: number) {
    const skip = (page - 1) * limit;

    const [poems, total] = await Promise.all([
      this.prisma.poem.findMany({
        skip,
        take: limit,
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
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.poem.count(),
    ]);

    return {
      poems: restrictPoemsContentForGuest(localizePoems(poems), userId),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, userId?: number) {
    const poem = await this.prisma.poem.findUnique({
      where: { id },
      include: {
        author: true,
        categories: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            comments: true,
            favorites: true,
          },
        },
      },
    });

    if (!poem) {
      throw new NotFoundException("Poem not found");
    }

    // Increment views
    await this.prisma.poem.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Check if user has favorited this poem
    let isFavorited = false;
    if (userId) {
      const favorite = await this.prisma.favorite.findUnique({
        where: {
          userId_poemId: {
            userId,
            poemId: id,
          },
        },
      });
      isFavorited = !!favorite;
    }

    return {
      ...restrictPoemContentForGuest(localizePoem(poem), userId),
      isFavorited,
    };
  }

  async findBySlug(slug: string, userId?: number) {
    const poem = await this.prisma.poem.findUnique({
      where: { slug },
      include: {
        author: true,
        categories: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            comments: true,
            favorites: true,
          },
        },
      },
    });

    if (!poem) {
      throw new NotFoundException("Poem not found");
    }

    // Increment views
    await this.prisma.poem.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    // Check if user has favorited this poem
    let isFavorited = false;
    if (userId) {
      const favorite = await this.prisma.favorite.findUnique({
        where: {
          userId_poemId: {
            userId,
            poemId: poem.id,
          },
        },
      });
      isFavorited = !!favorite;
    }

    return {
      ...restrictPoemContentForGuest(localizePoem(poem), userId),
      isFavorited,
    };
  }

  async findByCategory(categoryId: number) {
    const poems = await this.prisma.poem.findMany({
      where: { categories: { some: { id: categoryId } } },
      include: {
        author: true,
        categories: true,
      },
      orderBy: { year: "asc" },
    });
    return localizePoems(poems);
  }

  async findByCategorySlug(categorySlug: string, userId?: number) {
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    const poems = await this.prisma.poem.findMany({
      where: { categories: { some: { id: category.id } } },
      include: {
        author: true,
        categories: true,
      },
      orderBy: { year: "asc" },
    });
    return restrictPoemsContentForGuest(localizePoems(poems), userId);
  }

  async search(query: string, userId?: number) {
    const poems = await this.prisma.poem.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { author: { name: { contains: query, mode: "insensitive" } } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        author: true,
        categories: true,
      },
      take: 20,
    });
    return restrictPoemsContentForGuest(localizePoems(poems), userId);
  }

  // ========== AUTHORS ==========

  async getAllAuthors() {
    const authors = await this.prisma.author.findMany({
      include: {
        _count: {
          select: {
            poems: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    return localizeAuthors(authors);
  }

  async getAuthorBySlug(slug: string, userId?: number) {
    const author = await this.prisma.author.findUnique({
      where: { slug },
      include: {
        poems: {
          include: {
            categories: true,
          },
          orderBy: { year: "asc" },
        },
        proseWorks: {
          include: { _count: { select: { chapters: true } } },
          orderBy: { year: "asc" },
        },
      },
    });

    if (!author) {
      throw new NotFoundException("Аўтар не знойдзены");
    }

    const poems = restrictPoemsContentForGuest(
      localizePoems(author.poems),
      userId,
    ).map((poem) => ({
      ...poem,
      category: poem.categories?.[0]
        ? localizeCategory(poem.categories[0] as Record<string, unknown>)
        : null,
    }));

    return {
      ...localizeAuthor(author),
      poems,
      proseWorks: localizeProseWorks(author.proseWorks).map((w) => ({
        id: w.id,
        title: w.title,
        slug: w.slug,
        kind: (w as { kind?: string }).kind,
        year: (w as { year?: number | null }).year,
        description: (w as { description?: string | null }).description,
        chapterCount:
          (w as { _count?: { chapters: number } })._count?.chapters ?? 0,
      })),
    };
  }

  async getStats(poemId: number, userId?: number) {
    const poem = await this.prisma.poem.findUnique({
      where: { id: poemId },
      select: {
        views: true,
        likesCount: true,
        commentsCount: true,
      },
    });

    if (!poem) {
      throw new NotFoundException("Твор не найден");
    }

    // Получаем актуальное количество избранных (лайков) через агрегацию
    const favoritesCount = await this.prisma.favorite.count({
      where: { poemId },
    });

    // Получаем актуальное количество комментариев через агрегацию
    const commentsCount = await this.prisma.comment.count({
      where: { poemId },
    });

    let isFavorited = false;
    if (userId) {
      const favorite = await this.prisma.favorite.findUnique({
        where: {
          userId_poemId: {
            userId,
            poemId,
          },
        },
      });
      isFavorited = !!favorite;
    }

    return {
      poemId,
      views: poem.views,
      likesCount: poem.likesCount, // поле из модели, может быть устаревшим
      favoritesCount,
      commentsCount,
      isFavorited,
      updatedAt: new Date().toISOString(),
    };
  }
}
