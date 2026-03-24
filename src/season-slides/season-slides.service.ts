import { Injectable } from '@nestjs/common';
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

    return slides.map((slide) => ({
      id: slide.id,
      title: slide.title,
      subtitle: slide.subtitle,
      season: slide.season,
      imageUrl: slide.imageUrl,
      altText: slide.altText,
      order: slide.order,
      isActive: slide.isActive,
      createdAt: slide.createdAt,
      updatedAt: slide.updatedAt,
    }));
  }
}