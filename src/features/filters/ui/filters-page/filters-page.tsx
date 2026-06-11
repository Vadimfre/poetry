"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCategories } from "@/src/features/categories";
import { useAuthors } from "@/src/features/authors";
import {
  useFilteredPoems,
  useFiltersPageDerived,
  useFiltersPageState,
} from "@/src/features/filters/model/use-filters-page";
import { usePoems } from "@/src/shared/hooks/use-poemsSTRANCH";
import { useI18n } from "@/src/shared/i18n";
import styles from "./filters-page.module.css";

export const FiltersPage = () => {
  const { t } = useI18n();
  const router = useRouter();

  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: authors, isLoading: isAuthorsLoading } = useAuthors();

  const {
    draftQuery,
    setDraftQuery,
    state,
    setState,
    handleApply,
    handleReset,
    toggleCategory,
  } = useFiltersPageState();

  const { data: poemsResponse, isLoading, error } = usePoems(1, 200);
  const poems = useMemo(
    () => poemsResponse?.poems || [],
    [poemsResponse?.poems],
  );

  const { appliedChips, yearFromN, yearToN, resultsTitle } =
    useFiltersPageDerived({
      state,
      setState,
      categories,
      authors,
    });

  const filteredPoems = useFilteredPoems({ poems, state, yearFromN, yearToN });

  const handleGoBack = () => router.back();

  const handleOpenAuthor = () => {
    if (!state.selectedAuthorSlug) return;
    router.push(`/author/${state.selectedAuthorSlug}`);
  };

  const handleOpenCategory = (slug: string) => {
    router.push(`/collection/${slug}`);
  };

  const handlePoemClick = (poemId: number) => {
    router.push(`/poem/${poemId}`);
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button onClick={handleGoBack} className={styles.backButton}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t("common.back")}
        </button>

        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>{t("filters.title")}</h1>
            <p className={styles.subtitle}>{t("filters.subtitleLong")}</p>
          </div>

          <div className={styles.headerRight}>
            <Link href="/favorites" className={styles.quickLink}>
              {t("header.favorites")}
            </Link>
            <Link href="/" className={styles.quickLinkSecondary}>
              {t("filters.toHome")}
            </Link>
          </div>
        </header>

        {appliedChips.length > 0 && (
          <section className={styles.chipsSection}>
            <div className={styles.chipsTitle}>{t("filters.activeFilters")}</div>
            <div className={styles.chips}>
              {appliedChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  className={styles.chip}
                  onClick={chip.onRemove}
                  title={t("filters.removeChip")}
                >
                  <span className={styles.chipLabel}>{chip.label}</span>
                  <span className={styles.chipX}>×</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className={styles.grid}>
          <aside className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>{t("filters.panelTitle")}</div>
              <div className={styles.panelActions}>
                <button
                  type="button"
                  className={styles.resetButton}
                  onClick={handleReset}
                >
                  {t("filters.reset")}
                </button>
                <button
                  type="button"
                  className={styles.applyButton}
                  onClick={handleApply}
                >
                  {t("filters.apply")}
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t("common.search")}</label>
              <div className={styles.searchRow}>
                <input
                  className={styles.input}
                  value={draftQuery}
                  onChange={(e) => setDraftQuery(e.target.value)}
                  placeholder={t("filters.searchPlaceholder")}
                />
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => setDraftQuery("")}
                  disabled={!draftQuery}
                  title={t("filters.clearSearch")}
                >
                  ×
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t("filters.author")}</label>
              <div className={styles.selectRow}>
                <select
                  className={styles.select}
                  value={state.selectedAuthorSlug}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      selectedAuthorSlug: e.target.value,
                    }))
                  }
                  disabled={isAuthorsLoading}
                >
                  <option value="">{t("filters.anyAuthor")}</option>
                  {(authors || []).map((a) => (
                    <option key={a.id} value={a.slug}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleOpenAuthor}
                  disabled={!state.selectedAuthorSlug}
                >
                  {t("filters.goTo")}
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t("filters.directions")}</label>
              <div className={styles.categoriesBox}>
                {isCategoriesLoading ? (
                  <div className={styles.hint}>{t("cardsSlider.loading")}</div>
                ) : (
                  <div className={styles.categoriesGrid}>
                    {(categories || []).map((c) => {
                      const active = state.selectedCategorySlugs.includes(
                        c.slug,
                      );
                      return (
                        <button
                          key={c.id}
                          type="button"
                          className={`${styles.categoryTag} ${
                            active ? styles.categoryTagActive : ""
                          }`}
                          onClick={() => toggleCategory(c.slug)}
                        >
                          <span className={styles.categoryDot}>
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                          <span className={styles.categoryText}>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {state.selectedCategorySlugs.length === 1 && (
                <button
                  type="button"
                  className={styles.openCategoryButton}
                  onClick={() =>
                    handleOpenCategory(state.selectedCategorySlugs[0])
                  }
                >
                  {t("filters.openDirection")}
                </button>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t("common.year")}</label>
              <div className={styles.yearsRow}>
                <input
                  className={styles.input}
                  inputMode="numeric"
                  value={state.yearFrom}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, yearFrom: e.target.value }))
                  }
                  placeholder={t("filters.yearFrom")}
                />
                <span className={styles.yearsDash}>—</span>
                <input
                  className={styles.input}
                  inputMode="numeric"
                  value={state.yearTo}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, yearTo: e.target.value }))
                  }
                  placeholder={t("filters.yearTo")}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t("filters.sortLabel")}</label>
              <div className={styles.sortGrid}>
                <button
                  type="button"
                  className={`${styles.sortButton} ${
                    state.sort === "popular" ? styles.sortButtonActive : ""
                  }`}
                  onClick={() =>
                    setState((prev) => ({ ...prev, sort: "popular" }))
                  }
                >
                  {t("filters.popular")}
                </button>
                <button
                  type="button"
                  className={`${styles.sortButton} ${
                    state.sort === "new" ? styles.sortButtonActive : ""
                  }`}
                  onClick={() => setState((prev) => ({ ...prev, sort: "new" }))}
                >
                  {t("filters.sortNew")}
                </button>
                <button
                  type="button"
                  className={`${styles.sortButton} ${
                    state.sort === "old" ? styles.sortButtonActive : ""
                  }`}
                  onClick={() => setState((prev) => ({ ...prev, sort: "old" }))}
                >
                  {t("filters.sortOld")}
                </button>
              </div>
            </div>
          </aside>

          <section className={styles.results}>
            <div className={styles.resultsHeader}>
              <div>
                <div className={styles.resultsTitle}>{resultsTitle}</div>
                <div className={styles.resultsSubtitle}>
                  {t("filters.foundCount", { count: filteredPoems.length })}
                </div>
              </div>
            </div>

            <div className={styles.resultsBody}>
              {isLoading ? (
                <div className={styles.emptyCard}>
                  <div className={styles.emptyTitle}>
                    {t("filters.loadingPoems")}
                  </div>
                  <div className={styles.emptyText}>{t("filters.waitMoment")}</div>
                </div>
              ) : error ? (
                <div className={styles.emptyCard}>
                  <div className={styles.emptyTitle}>{t("common.error")}</div>
                  <div className={styles.emptyText}>
                    {t("filters.loadPoemsError")}
                  </div>
                </div>
              ) : filteredPoems.length === 0 ? (
                <div className={styles.emptyCard}>
                  <div className={styles.emptyTitle}>{t("filters.noResults")}</div>
                  <div className={styles.emptyText}>
                    {t("filters.tryChange")}
                  </div>
                </div>
              ) : (
                <div className={styles.poemsGrid}>
                  {filteredPoems.slice(0, 24).map((poem) => (
                    <button
                      key={poem.id}
                      type="button"
                      className={styles.poemCard}
                      onClick={() => handlePoemClick(poem.id)}
                    >
                      <div>
                        <div className={styles.poemTitle}>{poem.title}</div>
                        <div className={styles.poemMeta}>
                          <span className={styles.poemAuthor}>
                            {poem.author?.name || t("common.unknownAuthor")}
                          </span>
                          {poem.year && (
                            <span className={styles.poemYear}>{poem.year}</span>
                          )}
                        </div>
                      </div>
                      <div className={styles.poemChevron}>→</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
