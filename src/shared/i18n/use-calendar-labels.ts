"use client";

import { useCallback, useMemo } from "react";
import { Season } from "@/src/shared/types/holiday.types";
import { useI18n } from "./context";

const SEASON_KEYS: Record<Season, string> = {
  [Season.WINTER]: "season.winter",
  [Season.SPRING]: "season.spring",
  [Season.SUMMER]: "season.summer",
  [Season.AUTUMN]: "season.autumn",
};

export function useCalendarLabels() {
  const { locale, t } = useI18n();

  const dayNames = useMemo(
    () => [
      t("calendar.weekdayMon"),
      t("calendar.weekdayTue"),
      t("calendar.weekdayWed"),
      t("calendar.weekdayThu"),
      t("calendar.weekdayFri"),
      t("calendar.weekdaySat"),
      t("calendar.weekdaySun"),
    ],
    [t],
  );

  const getMonthGenitive = useCallback(
    (month: number) => t(`calendar.monthGen${month}`),
    [t],
  );

  const getMonthNominative = useCallback(
    (month: number) => t(`calendar.monthNom${month}`),
    [t],
  );

  const getSeasonLabel = useCallback(
    (season: Season) => t(SEASON_KEYS[season]),
    [t],
  );

  const formatHolidayDate = useCallback(
    (day: number, month: number) => {
      return `${day} ${getMonthGenitive(month)}`;
    },
    [locale, getMonthGenitive, getMonthNominative],
  );

  const getMonthsForNumbers = useCallback(
    (monthNumbers: number[]) =>
      monthNumbers.map((month) => getMonthNominative(month)),
    [getMonthNominative],
  );

  return {
    dayNames,
    getMonthGenitive,
    getMonthNominative,
    getSeasonLabel,
    formatHolidayDate,
    getMonthsForNumbers,
  };
}
