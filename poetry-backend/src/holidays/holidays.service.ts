import { Injectable, NotFoundException } from "@nestjs/common";
import { Season } from "@prisma/client";
import {
  localizeHoliday,
  localizeHolidays,
} from "../i18n/content-localizer";
import { restrictPoemsContentForGuest } from "../lib/poem-guest-access";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class HolidaysService {
  constructor(private prisma: PrismaService) {}

  private withGuestPoemAccess<T extends { poems?: { content?: string | null }[] }>(
    holiday: T,
    userId?: number,
  ): T {
    const localized = localizeHoliday(holiday);
    if (!Array.isArray(localized.poems)) return localized;
    return {
      ...localized,
      poems: restrictPoemsContentForGuest(localized.poems, userId),
    };
  }

  private withGuestPoemAccessList<T extends { poems?: { content?: string | null }[] }>(
    holidays: T[],
    userId?: number,
  ): T[] {
    return holidays.map((holiday) => this.withGuestPoemAccess(holiday, userId));
  }

  async findAll(page: number = 1, limit: number = 20, userId?: number) {
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
      holidays: this.withGuestPoemAccessList(localizeHolidays(holidays), userId),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySeason(season: Season, userId?: number) {
    const holidays = await this.prisma.holiday.findMany({
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
    return this.withGuestPoemAccessList(localizeHolidays(holidays), userId);
  }

  async findBySlug(slug: string, userId?: number) {
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

    return this.withGuestPoemAccess(holiday, userId);
  }

  async findByMonth(month: number, userId?: number) {
    const holidays = await this.prisma.holiday.findMany({
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
    return this.withGuestPoemAccessList(localizeHolidays(holidays), userId);
  }

  async findByMonthAndDay(month: number, day: number, userId?: number) {
    const holidays = await this.prisma.holiday.findMany({
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
    return this.withGuestPoemAccessList(localizeHolidays(holidays), userId);
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
    const holiday = await this.prisma.holiday.create({
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
    return localizeHoliday(holiday);
  }
}
