"use client";

import { useMemo, useState } from "react";
import styles from "./SeasonSlider.module.css";
import { useSeasonSlides } from "@/src/features/season-slider/model/use-season-slides";
import { useSlider } from "@/src/features/season-slider/model/use-slide";
import DotsNavigation from "@/src/features/season-slider/ui/DotsNavigation";
import NavigationArrows from "@/src/features/season-slider/ui/NavigationArrows";
import ProgressBar from "@/src/features/season-slider/ui/ProgressBar";
import { SeasonSlide } from "@/src/features/season-slider/ui/SeasonSlide";
import { SeasonMobileCalendar } from "@/src/features/season-slider/ui/SeasonMobileCalendar";
import type { SlideSeason } from "@/src/features/season-slider/season-slider-data";
import { useI18n } from "@/src/shared/i18n";

const SEASON_ORDER: SlideSeason[] = ["winter", "spring", "summer", "autumn"];

function getCurrentSeason(): SlideSeason {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

function getCurrentSeasonIndex(): number {
  const season = getCurrentSeason();
  const idx = SEASON_ORDER.indexOf(season);
  return idx >= 0 ? idx : 0;
}

export default function SeasonSlider() {
  const { t } = useI18n();
  const { data: slides, isLoading } = useSeasonSlides();

  const [seasonIndex, setSeasonIndex] = useState(getCurrentSeasonIndex);

  const slidesBySeason = useMemo(() => {
    const grouped: Record<SlideSeason, typeof slides> = {
      winter: [],
      spring: [],
      summer: [],
      autumn: [],
    };
    slides?.forEach((slide) => {
      grouped[slide.season]?.push(slide);
    });
    return grouped;
  }, [slides]);

  const activeSeason = SEASON_ORDER[seasonIndex];
  const activeSeasonSlides = slidesBySeason[activeSeason] ?? [];

  const { currentSlide: activeImageIndex, goToSlide } = useSlider(
    activeSeasonSlides.length,
    0,
    5000,
    seasonIndex,
  );

  const prevSeason = () => {
    setSeasonIndex((prev) => (prev - 1 + SEASON_ORDER.length) % SEASON_ORDER.length);
  };

  const nextSeason = () => {
    setSeasonIndex((prev) => (prev + 1) % SEASON_ORDER.length);
  };

  if (isLoading) {
    return (
      <div className={styles.slider}>
        <div className={styles.loading}>{t("season.loadingSlides")}</div>
      </div>
    );
  }

  if (!slides?.length) {
    return (
      <div className={styles.slider}>
        <div className={styles.empty}>{t("season.noSlides")}</div>
      </div>
    );
  }

  return (
    <div className={styles.seasonBlock}>
      <div className={`${styles.slider} ${styles.hasSlides}`}>
        <div className={styles.slidesContainer}>
          {SEASON_ORDER.map((season, index) => {
            const seasonSlides = slidesBySeason[season] ?? [];
            if (!seasonSlides.length) return null;

            return (
              <SeasonSlide
                key={season}
                season={season}
                slides={seasonSlides}
                activeImageIndex={
                  index === seasonIndex ? activeImageIndex : 0
                }
                isActive={index === seasonIndex}
              />
            );
          })}
        </div>

        <NavigationArrows onNext={nextSeason} onPrev={prevSeason} />

        {activeSeasonSlides.length > 1 && (
          <>
            <DotsNavigation
              slidesLength={activeSeasonSlides.length}
              current={activeImageIndex}
              onDotClick={goToSlide}
            />
            <ProgressBar
              progress={
                activeSeasonSlides.length === 1
                  ? 1
                  : activeImageIndex / (activeSeasonSlides.length - 1)
              }
            />
          </>
        )}
      </div>

      <SeasonMobileCalendar season={activeSeason} />
    </div>
  );
}
