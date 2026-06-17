"use client";

import { useHolidaysBySeason } from "@/src/features/holidays/model/use-holidays";
import { SeasonCalendarMobile } from "@/src/features/season-calendar/ui/SeasonCalendarMobile";
import { seasonConfig, seasonMap } from "../season-slider-data";
import type { SlideSeason } from "../season-slider-data";
import { useI18n } from "@/src/shared/i18n";
import styles from "@/src/features/season-calendar/ui/SeasonCalendarMobile.module.css";

interface SeasonMobileCalendarProps {
  season: SlideSeason;
}

export function SeasonMobileCalendar({ season }: SeasonMobileCalendarProps) {
  const { t } = useI18n();
  const apiSeason = seasonMap[season];
  const config = seasonConfig[season];
  const { data: holidays = [], isLoading } = useHolidaysBySeason(apiSeason);

  if (isLoading) {
    return (
      <div className={styles.loading}>{t("calendar.loading")}</div>
    );
  }

  return (
    <SeasonCalendarMobile
      holidays={holidays}
      monthNumbers={config.monthNumbers}
      year={config.year}
      accentColor={config.color}
      seasonLabel={t(`season.${season}`)}
    />
  );
}
