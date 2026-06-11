import { Season } from '@prisma/client';

export class SeasonSlideDto {
  id: string;
  title: string;
  subtitle: string;
  season: Season;
  imageUrl: string;
  altText: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}