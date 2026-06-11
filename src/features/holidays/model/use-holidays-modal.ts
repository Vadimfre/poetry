"use client";

import { useCallback, useMemo, useState } from "react";
import { Holiday, SEASON_COLORS, SeasonStyle } from "@/src/shared";

interface UseHolidayModalReturn {
  expandedPoem: number | null;
  savedPoems: Set<number>;
  activeTab: string;
  seasonStyle: SeasonStyle;
  setActiveTab: (tab: string) => void;
  toggleExpandPoem: (poemId: number) => void;
  toggleSave: (poemId: number) => void;
  isPoemSaved: (poemId: number) => boolean;
}

export function useHolidayModal(
  holiday: Holiday | null,
): UseHolidayModalReturn {
  const [expandedPoem, setExpandedPoem] = useState<number | null>(null);
  const [savedPoems, setSavedPoems] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState("poems");

  const toggleExpandPoem = useCallback((poemId: number) => {
    setExpandedPoem((prev) => (prev === poemId ? null : poemId));
  }, []);

  const toggleSave = useCallback((poemId: number) => {
    setSavedPoems((prev) => {
      const next = new Set(prev);
      if (next.has(poemId)) next.delete(poemId);
      else next.add(poemId);
      return next;
    });
  }, []);

  const isPoemSaved = useCallback(
    (poemId: number) => savedPoems.has(poemId),
    [savedPoems],
  );

  const seasonStyle = useMemo(() => {
    if (!holiday?.season) return SEASON_COLORS.WINTER;
    return SEASON_COLORS[holiday.season] ?? SEASON_COLORS.WINTER;
  }, [holiday?.season]);

  return {
    expandedPoem,
    savedPoems,
    activeTab,
    seasonStyle,
    setActiveTab,
    toggleExpandPoem,
    toggleSave,
    isPoemSaved,
  };
}
