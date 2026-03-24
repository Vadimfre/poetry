"use client";

import { useHolidaysBySeason } from "@/src/features/holidays/model/use-holidays";
import { seasonConfig, seasonMap } from "../season-slider-data";
import type { SlideSeason } from "../season-slider-data";
import type { Slide } from "../model/use-season-slides";
import Image from "next/image";
import SeasonCalendar from "../../season-calendar/ui/SeasonCalendar-ul";
import styles from "@/components/SeasonSlider/SeasonSlider.module.css";

interface SeasonSlideProps {
  slide: Slide;
  isActive: boolean;
}

export const SeasonSlide = ({ slide, isActive }: SeasonSlideProps) => {
  const apiSeason = seasonMap[slide.season];
  const { data: holidays = [], isLoading } = useHolidaysBySeason(apiSeason, {
    enabled: isActive,
  });

  const config = seasonConfig[slide.season];

  return (
    <div className={`${styles.slide} ${isActive ? styles.active : ""}`}>
      <Image
        src={slide.src}
        alt={slide.alt}
        fill
        className={styles.image}
        sizes="100vw"
        priority={isActive}
      />
      <div className={styles.overlay} />
      <div className={styles.slideContent}>
        <div className={styles.content}>
          <span className={styles.subtitle}>{slide.subtitle}</span>
          <h2 className={styles.title}>{slide.title}</h2>
        </div>
        <div className={styles.calendarWrapper}>
          {isActive && (
            <>
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                <SeasonCalendar
                  holidays={holidays}
                  months={config.months}
                  monthNumbers={config.monthNumbers}
                  year={config.year}
                  season={slide.season}
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
