"use client";

import { useCallback, useMemo, useState } from "react";
import { Holiday, SEASON_COLORS, SeasonStyle } from "@/src/shared";
import {
  seasonConfig,
  SlideSeason,
} from "../../season-slider/season-slider-data";

interface UseHolidayModalReturn {
  // State
  expandedPoem: number | null;
  likedPoems: Set<number>;
  savedPoems: Set<number>;
  activeTab: string;
  seasonStyle: SeasonStyle;
  months: string[];

  // Actions
  setActiveTab: (tab: string) => void;
  toggleExpandPoem: (poemId: number) => void;
  toggleLike: (poemId: number) => void;
  toggleSave: (poemId: number) => void;
  isPoemLiked: (poemId: number) => boolean;
  isPoemSaved: (poemId: number) => boolean;
  getPoemLikes: (poemId: number, baseLikes: number) => number;
}

export function useHolidayModal(
  holiday: Holiday | null,
): UseHolidayModalReturn {
  const [expandedPoem, setExpandedPoem] = useState<number | null>(null);
  const [likedPoems, setLikedPoems] = useState<Set<number>>(new Set());
  const [savedPoems, setSavedPoems] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState("poems");

  const months = useMemo(() => {
    if (!holiday?.season) return [];
    return seasonConfig[holiday.season.toLowerCase() as SlideSeason].months;
  }, [holiday?.season]);

  const toggleExpandPoem = useCallback((poemId: number) => {
    setExpandedPoem((prev) => (prev === poemId ? null : poemId));
  }, []);

  const toggleLike = useCallback((poemId: number) => {
    setLikedPoems((prev) => {
      const next = new Set(prev);
      if (next.has(poemId)) next.delete(poemId);
      else next.add(poemId);
      return next;
    });
  }, []);

  const toggleSave = useCallback((poemId: number) => {
    setSavedPoems((prev) => {
      const next = new Set(prev);
      if (next.has(poemId)) next.delete(poemId);
      else next.add(poemId);
      return next;
    });
  }, []);

  const isPoemLiked = useCallback(
    (poemId: number) => likedPoems.has(poemId),
    [likedPoems],
  );
  const isPoemSaved = useCallback(
    (poemId: number) => savedPoems.has(poemId),
    [savedPoems],
  );

  const getPoemLikes = useCallback(
    (poemId: number, baseLikes: number) => {
      return baseLikes + (likedPoems.has(poemId) ? 1 : 0);
    },
    [likedPoems],
  );

  const seasonStyle = useMemo(() => {
    if (!holiday?.season) return SEASON_COLORS.WINTER;
    return SEASON_COLORS[holiday.season] ?? SEASON_COLORS.WINTER;
  }, [holiday?.season]);

  return {
    expandedPoem,
    likedPoems,
    savedPoems,
    activeTab,
    seasonStyle,
    setActiveTab,
    toggleExpandPoem,
    toggleLike,
    toggleSave,
    isPoemLiked,
    isPoemSaved,
    getPoemLikes,
    months,
  };
}
