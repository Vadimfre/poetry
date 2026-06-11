"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/shared/api/client";
import { useLocaleQueryKey } from "@/src/shared/i18n/use-locale-query-key";
import { useI18n, usePlural } from "@/src/shared/i18n";
import Header from "@/components/Header/Header";
import Link from "next/link";
import styles from "./author.module.css";

interface Author {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  birthYear: number | null;
  deathYear: number | null;
  image: string | null;
  poems: Array<{
    id: number;
    title: string;
    slug: string;
    year: number | null;
    category: { name: string } | null;
  }>;
  proseWorks?: Array<{
    id: number;
    title: string;
    slug: string;
    kind: string;
    year: number | null;
    description?: string | null;
    chapterCount: number;
  }>;
}

interface PageProps {
  params: {
    slug: string;
  };
}

type WorksTab = "poems" | "prose";

export default function AuthorPage({ params }: PageProps) {
  const { t } = useI18n();
  const plural = usePlural();
  const [worksTab, setWorksTab] = useState<WorksTab>("poems");
  const [bioExpanded, setBioExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const authorQueryKey = useLocaleQueryKey(["author", params.slug]);

  const {
    data: author,
    isLoading,
    error,
  } = useQuery<Author>({
    queryKey: authorQueryKey,
    queryFn: async () => {
      const response = await apiClient.get(`/poems/authors/${params.slug}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className="container">
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>{t("authorPage.loading")}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !author) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className="container">
            <div className={styles.notFound}>
              <h1>{t("authorPage.notFound")}</h1>
              <Link href="/" className={styles.backLink}>
                ← {t("authorPage.backHome")}
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const years = author.birthYear
    ? `${author.birthYear}${author.deathYear ? `–${author.deathYear}` : ""}`
    : "";
  const poemWord = plural(author.poems.length, {
    one: "common.poemOne",
    few: "common.poemFew",
    many: "common.poemMany",
  });
  const proseCount = author.proseWorks?.length ?? 0;
  const bioParagraphs =
    author.bio
      ?.split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean) ?? [];
  const isBioLong =
    bioParagraphs.length > 2 || (author.bio?.length ?? 0) > 480;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className="container">
          <Link href="/" className={styles.backButton}>
            ← {t("common.back")}
          </Link>

          <div className={styles.hero}>
            <div className={styles.imageContainer}>
              {author.image && !imageError ? (
                <img
                  src={author.image}
                  alt={author.name}
                  className={styles.heroImage}
                  onError={() => setImageError(true)}
                />
              ) : (
                <img
                  src="/images/author-placeholder.svg"
                  alt=""
                  className={styles.imagePlaceholder}
                />
              )}
            </div>

            <div className={styles.heroContent}>
              <h1 className={styles.authorName}>{author.name}</h1>
              {years && (
                <div className={styles.yearsBadge}>
                  <span className={styles.yearsIcon}>📅</span>
                  <span className={styles.yearsText}>{years}</span>
                </div>
              )}
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>
                    {author.poems.length}
                  </span>
                  <span className={styles.statLabel}>{poemWord}</span>
                </div>
                {proseCount > 0 && (
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{proseCount}</span>
                    <span className={styles.statLabel}>
                      {t("authorPage.tabProse")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {author.bio && (
            <div className={styles.bioSection}>
              <h2 className={styles.sectionTitle}>{t("authorPage.biography")}</h2>
              <div className={styles.bioCard}>
                <div
                  className={`${styles.bioContent} ${
                    isBioLong && !bioExpanded ? styles.bioContentCollapsed : ""
                  }`}
                >
                  {bioParagraphs.map((paragraph, index) => (
                    <p key={index} className={styles.bioText}>
                      {paragraph}
                    </p>
                  ))}
                  {isBioLong && !bioExpanded && (
                    <div className={styles.bioFade} aria-hidden="true" />
                  )}
                </div>
                {isBioLong && (
                  <button
                    type="button"
                    className={styles.bioToggle}
                    onClick={() => setBioExpanded((open) => !open)}
                    aria-expanded={bioExpanded}
                  >
                    <span>
                      {bioExpanded
                        ? t("authorPage.readLess")
                        : t("authorPage.readMore")}
                    </span>
                    <svg
                      className={`${styles.bioChevron} ${
                        bioExpanded ? styles.bioChevronUp : ""
                      }`}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className={styles.poemsSection}>
            <div className={styles.poemsHeader}>
              <h2 className={styles.sectionTitle}>{t("authorPage.works")}</h2>
              <div className={styles.tabs}>
                <button
                  type="button"
                  className={
                    worksTab === "poems" ? styles.tabActive : styles.tab
                  }
                  onClick={() => setWorksTab("poems")}
                >
                  {t("authorPage.tabPoems")} ({author.poems.length})
                </button>
                <button
                  type="button"
                  className={
                    worksTab === "prose" ? styles.tabActive : styles.tab
                  }
                  onClick={() => setWorksTab("prose")}
                >
                  {t("authorPage.tabProse")} ({proseCount})
                </button>
              </div>
            </div>

            {worksTab === "poems" && (
              <div className={styles.poemsList}>
                {author.poems.length > 0 ? (
                  author.poems.map((poem, index) => (
                    <Link
                      href={`/poem/${poem.id}`}
                      key={poem.id}
                      className={styles.poemCard}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className={styles.poemNumber}>
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className={styles.poemContent}>
                        <h3 className={styles.poemTitle}>{poem.title}</h3>
                        <div className={styles.poemMeta}>
                          {poem.category?.name && (
                            <span className={styles.poemCategory}>
                              {poem.category.name}
                            </span>
                          )}
                          {poem.year && (
                            <span className={styles.poemYear}>{poem.year}</span>
                          )}
                        </div>
                      </div>
                      <div className={styles.poemArrow}>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>{t("authorPage.noPoems")}</p>
                  </div>
                )}
              </div>
            )}

            {worksTab === "prose" && (
              <div className={styles.poemsList}>
                {proseCount > 0 ? (
                  author.proseWorks!.map((work, index) => (
                    <Link
                      href={`/prose/${work.slug}`}
                      key={work.id}
                      className={styles.poemCard}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className={styles.poemNumber}>📖</div>
                      <div className={styles.poemContent}>
                        <h3 className={styles.poemTitle}>{work.title}</h3>
                        <div className={styles.poemMeta}>
                          <span className={styles.poemCategory}>
                            {t(`proseReader.kind.${work.kind}` as "proseReader.kind.NOVEL")}
                          </span>
                          {work.year && (
                            <span className={styles.poemYear}>{work.year}</span>
                          )}
                          <span className={styles.poemYear}>
                            {t("authorPage.chapters", {
                              count: work.chapterCount,
                            })}
                          </span>
                        </div>
                        {work.description && (
                          <p className={styles.proseDesc}>{work.description}</p>
                        )}
                      </div>
                      <div className={styles.poemArrow}>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>{t("authorPage.noProse")}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
