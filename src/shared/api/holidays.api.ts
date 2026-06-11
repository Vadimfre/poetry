import { Holiday, HolidaysResponse, Season } from "../types";
import { apiClient } from "./client";

export const holidaysApi = {
  getAll: async (page = 1, limit = 20): Promise<HolidaysResponse> => {
    const response = await apiClient.get<HolidaysResponse>(
      `/holidays?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getSeasons: async (): Promise<Season[]> => {
    const response = await apiClient.get<Season[]>("/holidays/seasons");
    return response.data;
  },

  getBySeason: async (season: Season): Promise<Holiday[]> => {
    const response = await apiClient.get<Holiday[]>(
      `/holidays/season/${season}`,
    );
    return response.data;
  },

  getByMonthDay: async (
    month: number,
    day: number,
    season?: Season,
  ): Promise<Holiday[]> => {
    let holidays: Holiday[] = [];

    if (season) {
      // Загружаем праздники только нужного сезона
      holidays = await holidaysApi.getBySeason(season);
    } else {
      // Загружаем все праздники
      const all = await holidaysApi.getAll(1, 1000);
      holidays = all.holidays;
    }

    return holidays.filter((h) => h.month === month && h.day === day);
  },
};
