import { useQueries } from "@tanstack/react-query";
import { holidaysApi } from "@/src/shared/api";
import { Season } from "@/src/shared/types";

export const useAllSeasonHolidays = () => {
  const seasons = [Season.WINTER, Season.SPRING, Season.SUMMER, Season.AUTUMN];

  const results = useQueries({
    queries: seasons.map((season) => ({
      queryKey: ["holidays", "season", season],
      queryFn: () => holidaysApi.getBySeason(season),
      staleTime: 5 * 60 * 1000,
    })),
  });

  return {
    data: results.map((r) => r.data || []),
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
  };
};
