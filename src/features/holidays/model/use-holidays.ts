"use client";
import { useQuery } from "@tanstack/react-query";
import { holidaysApi } from "@/src/shared/api";
import type {
  Holiday,
  Season,
  HolidaysResponse,
} from "@/src/shared/types/holiday.types";

export const useHolidays = (page = 1, limit = 20) => {
  return useQuery<HolidaysResponse>({
    queryKey: ["holidays", page, limit],
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
  return useQuery<Holiday[]>({
    queryKey: ["holidays", "season", season],
    queryFn: () => holidaysApi.getBySeason(season),
    enabled: !!season && (options?.enabled ?? true),
    staleTime: 10 * 60 * 1000, // 10 минут
  });
};

export const useHolidaysByMonthAndDay = (month: number, day: number) => {
  return useQuery<Holiday[]>({
    queryKey: ["holidays", "month", month, "day", day],
    queryFn: () => holidaysApi.getByMonthDay(month, day),
    enabled: month > 0 && day > 0,
  });
};
