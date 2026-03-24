import { useQuery } from "@tanstack/react-query";
import type { SlideSeason } from "../season-slider-data";
import { apiClient } from "@/src/shared/api/client";
import { Season } from "@/src/shared/types/holiday.types";

export interface SeasonSlideFromApi {
  id: string;
  title: string;
  subtitle: string;
  season: Season;
  imageUrl: string;
  altText: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Slide {
  id: string;
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  season: SlideSeason;
}

const VALID_SEASONS: SlideSeason[] = ["spring", "summer", "autumn", "winter"];

function isValidSlideSeason(str: string): str is SlideSeason {
  return VALID_SEASONS.includes(str as SlideSeason);
}

// Преобразование API данных в формат слайдера
export const mapApiSlideToSlide = (apiSlide: SeasonSlideFromApi): Slide => {
  const lowerSeason = apiSlide.season.toLowerCase();
  const season: SlideSeason = isValidSlideSeason(lowerSeason)
    ? lowerSeason
    : "winter"; // fallback
  return {
    id: apiSlide.id,
    src: apiSlide.imageUrl,
    alt: apiSlide.altText,
    title: apiSlide.title,
    subtitle: apiSlide.subtitle,
    season,
  };
};

// Пустой fallback на случай ошибки
const emptySlidesFallback: Slide[] = [];

export const useSeasonSlides = () => {
  return useQuery<Slide[]>({
    queryKey: ["season-slides"],
    queryFn: async () => {
      try {
        const response =
          await apiClient.get<SeasonSlideFromApi[]>("/season-slides");
        const mapped = response.data.map(mapApiSlideToSlide);
        return mapped;
      } catch (error) {
        console.error(
          "Failed to fetch season slides, using empty fallback",
          error,
        );
        return emptySlidesFallback;
      }
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: emptySlidesFallback,
  });
};
