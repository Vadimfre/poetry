import { useMemo } from "react";
import type { SlideSeason } from "../season-slider-data";
import { buildFallbackSeasonSlides } from "../season-slider-fallback";

export interface Slide {
  id: string;
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  season: SlideSeason;
}

export const useSeasonSlides = () => {
  const slides = useMemo(() => buildFallbackSeasonSlides(), []);

  return {
    data: slides,
    isLoading: false,
  };
};
