"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/src/shared/i18n";
import type { Dispatch, SetStateAction } from "react";
import type { Poem } from "@/src/shared/types";

export type SortValue = "popular" | "new" | "old";

export type FiltersState = {
  query: string;
  selectedCategorySlugs: string[];
  selectedAuthorSlug: string;
  yearFrom: string;
  yearTo: string;
  sort: SortValue;
};

export const DEFAULT_FILTERS_STATE: FiltersState = {
  query: "",
  selectedCategorySlugs: [],
  selectedAuthorSlug: "",
  yearFrom: "",
  yearTo: "",
  sort: "popular",
};

type NamedEntity = { id: number; slug: string; name: string };

type UseFiltersPageStateResult = {
  draftQuery: string;
  setDraftQuery: (value: string) => void;
  state: FiltersState;
  setState: Dispatch<SetStateAction<FiltersState>>;
  handleApply: () => void;
  handleReset: () => void;
  toggleCategory: (slug: string) => void;
};

export const useFiltersPageState = (
  initialState: FiltersState = DEFAULT_FILTERS_STATE,
): UseFiltersPageStateResult => {
  const [draftQuery, setDraftQuery] = useState("");
  const [state, setState] = useState<FiltersState>(initialState);

  const handleApply = () => {
    setState((prev) => ({ ...prev, query: draftQuery.trim() }));
  };

  const handleReset = () => {
    setDraftQuery("");
    setState(initialState);
  };

  const toggleCategory = (slug: string) => {
    setState((prev) => ({
      ...prev,
      selectedCategorySlugs: prev.selectedCategorySlugs.includes(slug)
        ? prev.selectedCategorySlugs.filter((s) => s !== slug)
        : [...prev.selectedCategorySlugs, slug],
    }));
  };

  return {
    draftQuery,
    setDraftQuery,
    state,
    setState,
    handleApply,
    handleReset,
    toggleCategory,
  };
};

function normalizeYear(value: string): number | null {
  const v = value.trim();
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function matchesQuery(poem: Poem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const title = (poem.title || "").toLowerCase();
  const authorName = (poem.author?.name || "").toLowerCase();

  return title.includes(q) || authorName.includes(q);
}

function comparePoems(sort: SortValue) {
  return (a: Poem, b: Poem) => {
    if (sort === "new") {
      return (b.year || -Infinity) - (a.year || -Infinity);
    }

    if (sort === "old") {
      return (a.year || Infinity) - (b.year || Infinity);
    }

    return (b.views || 0) - (a.views || 0);
  };
}

type UseFiltersPageDerivedParams = {
  state: FiltersState;
  setState: Dispatch<SetStateAction<FiltersState>>;
  categories?: NamedEntity[];
  authors?: NamedEntity[];
};

type UseFiltersPageDerivedResult = {
  selectedAuthor?: NamedEntity;
  selectedCategories: NamedEntity[];
  appliedChips: Array<{ id: string; label: string; onRemove: () => void }>;
  yearFromN: number | null;
  yearToN: number | null;
  resultsTitle: string;
};

export const useFiltersPageDerived = ({
  state,
  setState,
  categories,
  authors,
}: UseFiltersPageDerivedParams): UseFiltersPageDerivedResult => {
  const { t } = useI18n();

  const selectedAuthor = useMemo(() => {
    if (!state.selectedAuthorSlug) return undefined;
    return authors?.find((a) => a.slug === state.selectedAuthorSlug);
  }, [authors, state.selectedAuthorSlug]);

  const selectedCategories = useMemo(() => {
    const all = categories || [];
    const set = new Set(state.selectedCategorySlugs);
    return all.filter((c) => set.has(c.slug));
  }, [categories, state.selectedCategorySlugs]);

  const appliedChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; onRemove: () => void }> =
      [];

    if (state.query) {
      chips.push({
        id: "query",
        label: t("filters.chipSearch", { query: state.query }),
        onRemove: () => setState((prev) => ({ ...prev, query: "" })),
      });
    }

    if (selectedAuthor) {
      chips.push({
        id: "author",
        label: t("filters.chipAuthor", { name: selectedAuthor.name }),
        onRemove: () =>
          setState((prev) => ({ ...prev, selectedAuthorSlug: "" })),
      });
    }

    for (const c of selectedCategories) {
      chips.push({
        id: `cat:${c.slug}`,
        label: c.name,
        onRemove: () =>
          setState((prev) => ({
            ...prev,
            selectedCategorySlugs: prev.selectedCategorySlugs.filter(
              (s) => s !== c.slug,
            ),
          })),
      });
    }

    if (state.yearFrom || state.yearTo) {
      const label = t("filters.chipYears", {
        from: state.yearFrom || "…",
        to: state.yearTo || "…",
      });
      chips.push({
        id: "years",
        label,
        onRemove: () =>
          setState((prev) => ({ ...prev, yearFrom: "", yearTo: "" })),
      });
    }

    if (state.sort !== "popular") {
      chips.push({
        id: "sort",
        label: t("filters.chipSortLabel", {
          sort:
            state.sort === "new"
              ? t("filters.chipSortNew")
              : t("filters.chipSortOld"),
        }),
        onRemove: () => setState((prev) => ({ ...prev, sort: "popular" })),
      });
    }

    return chips;
  }, [
    selectedAuthor,
    selectedCategories,
    setState,
    state.query,
    state.sort,
    state.yearFrom,
    state.yearTo,
    t,
  ]);

  const yearFromN = useMemo(
    () => normalizeYear(state.yearFrom),
    [state.yearFrom],
  );
  const yearToN = useMemo(() => normalizeYear(state.yearTo), [state.yearTo]);

  const resultsTitle = useMemo(() => {
    if (state.query) {
      return t("filters.resultsByQuery", { query: state.query });
    }
    if (
      state.selectedAuthorSlug ||
      state.selectedCategorySlugs.length > 0 ||
      state.yearFrom ||
      state.yearTo
    ) {
      return t("filters.resultsByFilters");
    }
    return t("filters.allPoems");
  }, [
    state.query,
    state.selectedAuthorSlug,
    state.selectedCategorySlugs.length,
    state.yearFrom,
    state.yearTo,
    t,
  ]);

  return {
    selectedAuthor,
    selectedCategories,
    appliedChips,
    yearFromN,
    yearToN,
    resultsTitle,
  };
};

type UseFilteredPoemsParams = {
  poems: Poem[];
  state: FiltersState;
  yearFromN: number | null;
  yearToN: number | null;
};

export const useFilteredPoems = ({
  poems,
  state,
  yearFromN,
  yearToN,
}: UseFilteredPoemsParams): Poem[] => {
  return useMemo(() => {
    const categorySet = new Set(state.selectedCategorySlugs);

    return poems
      .filter((p) => matchesQuery(p, state.query))
      .filter((p) => {
        if (!state.selectedAuthorSlug) return true;
        return p.author?.slug === state.selectedAuthorSlug;
      })
      .filter((p) => {
        if (categorySet.size === 0) return true;
        const poemCats = p.categories || [];
        return poemCats.some((c) => categorySet.has(c.slug));
      })
      .filter((p) => {
        if (!yearFromN && !yearToN) return true;
        if (!p.year) return false;
        if (yearFromN !== null && p.year < yearFromN) return false;
        if (yearToN !== null && p.year > yearToN) return false;
        return true;
      })
      .slice()
      .sort(comparePoems(state.sort));
  }, [
    poems,
    state.query,
    state.selectedAuthorSlug,
    state.selectedCategorySlugs,
    state.sort,
    yearFromN,
    yearToN,
  ]);
};
