import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addToFavorites(userId: number, poemId: number) {
    // Check if poem exists
    const poem = await this.prisma.poem.findUnique({
      where: { id: poemId },
    });

    if (!poem) {
      throw new NotFoundException('Poem not found');
    }

    // Check if already in favorites
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_poemId: {
          userId,
          poemId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Poem already in favorites');
    }

    return this.prisma.favorite.create({
      data: {
        userId,
        poemId,
      },
      include: {
        poem: {
          include: {
            author: true,
            categories: true,
          },
        },
      },
    });
  }

  async removeFromFavorites(userId: number, poemId: number) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_poemId: {
          userId,
          poemId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    return { message: 'Removed from favorites' };
  }

  async getUserFavorites(userId: number) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        poem: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async checkFavorite(userId: number, poemId: number) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_poemId: {
          userId,
          poemId,
        },
      },
    });

    return { isFavorite: !!favorite };
  }
}
