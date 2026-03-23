import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PoemsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 20) {
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
      poems,
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
      ...poem,
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
      ...poem,
      isFavorited,
    };
  }

  async findByCategory(categoryId: number) {
    return this.prisma.poem.findMany({
      where: { categories: { some: { id: categoryId } } },
      include: {
        author: true,
        categories: true,
      },
      orderBy: { year: "asc" },
    });
  }

  async findByCategorySlug(categorySlug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return this.prisma.poem.findMany({
      where: { categories: { some: { id: category.id } } },
      include: {
        author: true,
        categories: true,
      },
      orderBy: { year: "asc" },
    });
  }

  async search(query: string) {
    return this.prisma.poem.findMany({
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
  }

  // ========== AUTHORS ==========

  async getAllAuthors() {
    return this.prisma.author.findMany({
      include: {
        _count: {
          select: {
            poems: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async getAuthorBySlug(slug: string) {
    const author = await this.prisma.author.findUnique({
      where: { slug },
      include: {
        poems: {
          include: {
            categories: true,
          },
          orderBy: { year: "asc" },
        },
      },
    });

    if (!author) {
      throw new NotFoundException("Аўтар не знойдзены");
    }

    return author;
  }
}
