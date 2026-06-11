"use client";

import { useState, useMemo, useCallback } from "react";
import type { Poem } from "@/src/shared/types";

interface UsePoemsFilterOptions {
  poems: Poem[];
}

interface UsePoemsFilterReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredPoems: Poem[];
  clearSearch: () => void;
  hasResults: boolean;
  totalCount: number;
  filteredCount: number;
}

export const usePoemsFilter = ({
  poems,
}: UsePoemsFilterOptions): UsePoemsFilterReturn => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPoems = useMemo(() => {
    if (!searchQuery.trim()) return poems;

    const query = searchQuery.toLowerCase().trim();
    return poems.filter(
      (poem) =>
        poem.title.toLowerCase().includes(query) ||
        poem.author?.name.toLowerCase().includes(query),
    );
  }, [poems, searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filteredPoems,
    clearSearch,
    hasResults: filteredPoems.length > 0,
    totalCount: poems.length,
    filteredCount: filteredPoems.length,
  };
};
