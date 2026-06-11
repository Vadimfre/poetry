import { Injectable } from '@nestjs/common';
import { localizeSeasonSlide } from '../i18n/content-localizer';
import { PrismaService } from '../prisma/prisma.service';
import { SeasonSlideDto } from './dto/season-slide.dto';

@Injectable()
export class SeasonSlidesService {
  constructor(private prisma: PrismaService) {}

  async findAllActive(): Promise<SeasonSlideDto[]> {
    const slides = await this.prisma.seasonSlide.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return slides.map((slide) => {
      const localized = localizeSeasonSlide(slide);
      return {
        id: localized.id,
        title: localized.title as string,
        subtitle: localized.subtitle as string,
        season: localized.season,
        imageUrl: localized.imageUrl,
        altText: localized.altText as string,
        order: localized.order,
        isActive: localized.isActive,
        createdAt: localized.createdAt,
        updatedAt: localized.updatedAt,
      } satisfies SeasonSlideDto;
    });
  }
}