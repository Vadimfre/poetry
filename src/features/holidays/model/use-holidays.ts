"use client";
import { useQuery } from "@tanstack/react-query";
import { holidaysApi } from "@/src/shared/api";
import { useLocaleQueryKey } from "@/src/shared/i18n/use-locale-query-key";
import {
  Holiday,
  Season,
  HolidaysResponse,
} from "@/src/shared/types/holiday.types";

export const seasons = [Season.WINTER, Season.SPRING, Season.SUMMER, Season.AUTUMN];

export const useHolidays = (page = 1, limit = 20) => {
  const queryKey = useLocaleQueryKey(["holidays", page, limit]);
  return useQuery<HolidaysResponse>({
    queryKey,
    queryFn: () => holidaysApi.getAll(page, limit),
  });
};

export const useHolidaySeasons = () => {
  return useQuery<Season[]>({
    queryKey: ["holiday-seasons"],
    queryFn: () => holidaysApi.getSeasons(),
  });
};

export const useHolidaysBySeason = (
  season: Season,
  options?: { enabled?: boolean },
) => {
  const queryKey = useLocaleQueryKey(["holidays", "season", season]);
  return useQuery<Holiday[]>({
    queryKey,
    queryFn: () => holidaysApi.getBySeason(season),
    enabled: !!season && (options?.enabled ?? true),
    staleTime: 10 * 60 * 1000,
  });
};

export const useHolidaysByMonthAndDay = (
  month: number,
  day: number | null,
  season?: Season,
) => {
  const queryKey = useLocaleQueryKey(["holidays", month, day, season]);
  return useQuery<Holiday[]>({
    queryKey,
    queryFn: async () => {
      if (!day) return [];
      return holidaysApi.getByMonthDay(month, day, season);
    },
    enabled: Boolean(day && month),
  });
};
