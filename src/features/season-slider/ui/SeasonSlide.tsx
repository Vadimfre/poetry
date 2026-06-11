"use client";

import { useHolidaysBySeason } from "@/src/features/holidays/model/use-holidays";
import { seasonConfig, seasonMap } from "../season-slider-data";
import type { Slide } from "../model/use-season-slides";
import type { SlideSeason } from "../season-slider-data";
import Image from "next/image";
import SeasonCalendar from "../../season-calendar/ui/SeasonCalendar-ul";
import styles from "@/components/SeasonSlider/SeasonSlider.module.css";
import { useI18n } from "@/src/shared/i18n";

interface SeasonSlideProps {
  season: SlideSeason;
  slides: Slide[];
  activeImageIndex: number;
  isActive: boolean;
}

export const SeasonSlide = ({
  season,
  slides,
  activeImageIndex,
  isActive,
}: SeasonSlideProps) => {
  const { t } = useI18n();
  const apiSeason = seasonMap[season];
  const { data: holidays = [], isLoading } = useHolidaysBySeason(apiSeason, {
    enabled: isActive,
  });

  const config = seasonConfig[season];
  const seasonTitle = t(`season.${season}`);

  return (
    <div className={`${styles.slide} ${isActive ? styles.active : ""}`}>
      {slides.map((slide, index) => (
        <Image
          key={slide.id}
          src={slide.src}
          alt={slide.alt}
          fill
          className={`${styles.image} ${
            index === activeImageIndex ? styles.imageVisible : styles.imageHidden
          }`}
          sizes="100vw"
          priority={isActive && index === activeImageIndex}
        />
      ))}

      <div className={styles.overlay} />
      <div className={styles.slideContent}>
        <div className={styles.content}>
          <h2 className={styles.title}>{seasonTitle}</h2>
        </div>
        <div className={styles.calendarWrapper}>
          {isActive && (
            <>
              {isLoading ? (
                <div>{t("calendar.loading")}</div>
              ) : (
                <SeasonCalendar
                  holidays={holidays}
                  monthNumbers={config.monthNumbers}
                  year={config.year}
                  accentColor={config.color}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
