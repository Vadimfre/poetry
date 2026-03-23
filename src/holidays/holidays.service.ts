import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Season } from "@prisma/client";

@Injectable()
export class HolidaysService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [holidays, total] = await Promise.all([
      this.prisma.holiday.findMany({
        skip,
        take: limit,
        include: {
          poems: {
            include: {
              author: true,
              categories: true,
            },
          },
        },
        orderBy: [{ month: "asc" }, { day: "asc" }],
      }),
      this.prisma.holiday.count(),
    ]);

    return {
      holidays,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySeason(season: Season) {
    return this.prisma.holiday.findMany({
      where: { season },
      include: {
        poems: {
          include: {
            author: true,
            categories: true,
          },
        },
      },
      orderBy: [{ month: "asc" }, { day: "asc" }],
    });
  }

  async findBySlug(slug: string) {
    const holiday = await this.prisma.holiday.findUnique({
      where: { slug },
      include: {
        poems: {
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
    });

    if (!holiday) {
      throw new NotFoundException("Holiday not found");
    }

    return holiday;
  }

  async findByMonth(month: number) {
    return this.prisma.holiday.findMany({
      where: { month },
      include: {
        poems: {
          include: {
            author: true,
            categories: true,
          },
        },
      },
      orderBy: { day: "asc" },
    });
  }

  async findByMonthAndDay(month: number, day: number) {
    return this.prisma.holiday.findMany({
      where: { month, day },
      include: {
        poems: {
          include: {
            author: true,
            categories: true,
          },
        },
      },
    });
  }

  async getSeasons() {
    return Object.values(Season);
  }

  async createHoliday(data: {
    name: string;
    slug: string;
    day: number;
    month: number;
    season: Season;
    poems?: {
      title: string;
      slug: string;
      content: string;
      authorId: number;
      categoryIds?: number[];
    }[];
  }) {
    return this.prisma.holiday.create({
      data: {
        name: data.name,
        slug: data.slug,
        day: data.day,
        month: data.month,
        season: data.season,
        poems: {
          create: data.poems?.map((poem) => ({
            title: poem.title,
            slug: poem.slug,
            content: poem.content,
            authorId: poem.authorId,
            categories: {
              connect: poem.categoryIds?.map((id) => ({ id })) || [],
            },
          })),
        },
      },
      include: {
        poems: {
          include: {
            author: true,
            categories: true,
          },
        },
      },
    });
  }
}
