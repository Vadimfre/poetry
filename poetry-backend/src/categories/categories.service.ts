import { Injectable } from '@nestjs/common';
import {
  localizeCategories,
  localizeCategory,
  localizePoems,
} from '../i18n/content-localizer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { poems: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return localizeCategories(categories);
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        poems: true,
        _count: {
          select: { poems: true },
        },
      },
    });
    if (!category) return null;
    return {
      ...localizeCategory(category),
      poems: localizePoems(category.poems),
    };
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        poems: true,
        _count: {
          select: { poems: true },
        },
      },
    });
    if (!category) return null;
    return {
      ...localizeCategory(category),
      poems: localizePoems(category.poems),
    };
  }
}
