import type { Poem } from "./poem.types";

export enum Season {
  WINTER = "WINTER",
  SPRING = "SPRING",
  SUMMER = "SUMMER",
  AUTUMN = "AUTUMN",
}

export interface SeasonStyle {
  bg: string;
  accent: string;
}

export interface Holiday {
  id: string;
  name: string;
  slug: string;
  day: number;
  month: number;
  season: Season;
  image: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  poems: Poem[];
  _count?: {
    comments: number;
    favorites: number;
  };
}

export const SEASON_COLORS: Record<Season, SeasonStyle> = {
  WINTER: {
    bg: "from-blue-900/40 via-slate-900 to-indigo-900/40",
    accent: "blue",
  },
  SPRING: {
    bg: "from-emerald-900/40 via-slate-900 to-teal-900/40",
    accent: "emerald",
  },
  SUMMER: {
    bg: "from-amber-900/40 via-slate-900 to-orange-900/40",
    accent: "amber",
  },
  AUTUMN: {
    bg: "from-orange-900/40 via-slate-900 to-red-900/40",
    accent: "orange",
  },
};

export interface HolidayWithPoems extends Holiday {
  poems: Poem[];
}

export interface HolidaysResponse {
  holidays: Holiday[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
