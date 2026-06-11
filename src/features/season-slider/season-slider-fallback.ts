import type { Slide } from "./model/use-season-slides";
import type { SlideSeason } from "./season-slider-data";

/** Локальные фото по 3 на сезон (public/images/seasons). */
const IMAGES: Record<SlideSeason, string[]> = {
  winter: [
    "/images/seasons/winter-1.png",
    "/images/seasons/winter-2.png",
    "/images/seasons/winter-3.png",
  ],
  spring: [
    "/images/seasons/spring-1.png",
    "/images/seasons/spring-2.png",
    "/images/seasons/spring-3.png",
  ],
  summer: [
    "/images/seasons/summer-1.png",
    "/images/seasons/summer-2.png",
    "/images/seasons/summer-3.png",
  ],
  autumn: [
    "/images/seasons/autumn-1.png",
    "/images/seasons/autumn-2.png",
    "/images/seasons/autumn-3.png",
  ],
};

const SEASONS: SlideSeason[] = ["winter", "spring", "summer", "autumn"];

export function buildFallbackSeasonSlides(): Slide[] {
  const slides: Slide[] = [];

  for (const season of SEASONS) {
    for (let i = 0; i < IMAGES[season].length; i++) {
      slides.push({
        id: `${season}-${i + 1}`,
        src: IMAGES[season][i],
        alt: `${season} ${i + 1}`,
        title: season,
        subtitle: "",
        season,
      });
    }
  }

  return slides;
}
