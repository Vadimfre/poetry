import { Season } from "@/src/shared/types/holiday.types";

export type SlideSeason = "spring" | "summer" | "autumn" | "winter";

export const seasonMap = {
  spring: Season.SPRING,
  summer: Season.SUMMER,
  autumn: Season.AUTUMN,
  winter: Season.WINTER,
};

export const seasonColors = {
  spring: "#ff00be", // зелёный
  summer: "#FF9800", // оранжевый
  autumn: "#ff4500", // коричневый
  winter: "#2196F3", // синий
};

export const seasonConfig = {
  spring: {
    monthNumbers: [3, 4, 5],
    year: 2026,
    color: seasonColors.spring,
  },
  summer: {
    monthNumbers: [6, 7, 8],
    year: 2026,
    color: seasonColors.summer,
  },
  autumn: {
    monthNumbers: [9, 10, 11],
    year: 2026,
    color: seasonColors.autumn,
  },
  winter: {
    monthNumbers: [12, 1, 2],
    year: 2026,
    color: seasonColors.winter,
  },
};
