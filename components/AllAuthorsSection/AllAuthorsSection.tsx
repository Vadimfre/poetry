"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/shared/api/client";
import { useI18n, usePlural } from "@/src/shared/i18n";
import { useLocaleQueryKey } from "@/src/shared/i18n/use-locale-query-key";
import { filterByLetter } from "@/src/shared/lib/alphabet-filter";
import { resolveMediaUrl } from "@/src/shared/lib/resolve-media-url";
import AlphabetFilter from "@/components/AlphabetFilter/AlphabetFilter";
import styles from "./AllAuthorsSection.module.css";

interface Author {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  birthYear: number | null;
  deathYear: number | null;
  image: string | null;
  _count?: { poems: number };
}

const AllAuthorsSection = () => {
  const { t } = useI18n();
  const plural = usePlural();
  const [isVisible, setIsVisible] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const authorsQueryKey = useLocaleQueryKey(["all-authors"]);
  const { data: authors, isLoading } = useQuery<Author[]>({
    queryKey: authorsQueryKey,
    queryFn: async () => {
      const response = await apiClient.get("/poems/authors");
      return response.data;
    },
  });

  const stats = useMemo(() => {
    const authorCount = authors?.length ?? 0;
    const poemCount =
      authors?.reduce((sum, author) => sum + (author._count?.poems ?? 0), 0) ??
      0;
    return { authorCount, poemCount };
  }, [authors]);

  const filteredAuthors = useMemo(
    () => filterByLetter(authors ?? [], activeLetter),
    [authors, activeLetter],
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className="container">
          <div className={styles.loading}>{t("allAuthors.loading")}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.label}>{t("allAuthors.label")}</span>
          <h2 className={styles.title}>{t("allAuthors.title")}</h2>
          <p className={styles.subtitle}>{t("allAuthors.subtitle")}</p>
          <div className={styles.actions}>
            <Link href="/filters" className={styles.primaryBtn}>
              {t("allAuthors.readPoems")}
            </Link>
            <Link href="/quizzes" className={styles.secondaryBtn}>
              {t("allAuthors.takeQuizzes")}
            </Link>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.authorCount}</span>
            <span className={styles.statLabel}>{t("allAuthors.statAuthors")}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.poemCount}+</span>
            <span className={styles.statLabel}>{t("allAuthors.statPoems")}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>5</span>
            <span className={styles.statLabel}>{t("allAuthors.statThemes")}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>75+</span>
            <span className={styles.statLabel}>{t("allAuthors.statQuizzes")}</span>
          </div>
        </div>

        {authors && authors.length > 0 && (
          <AlphabetFilter
            activeLetter={activeLetter}
            onLetterChange={setActiveLetter}
            items={authors}
            allLabel={t("allAuthors.filterAll")}
            ariaLabel={t("allAuthors.filterAria")}
          />
        )}

        {filteredAuthors.length === 0 ? (
          <div className={styles.emptyFilter}>
            {t("allAuthors.filterEmpty", { letter: activeLetter ?? "" })}
          </div>
        ) : (
        <div className={`${styles.grid} ${isVisible ? styles.visible : ""}`}>
          {filteredAuthors.map((author, index) => {
            const years = author.birthYear
              ? `${author.birthYear}–${author.deathYear || ""}`
              : "";

            return (
              <Link
                href={`/author/${author.slug}`}
                key={author.id}
                className={styles.card}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={styles.imageWrapper}>
                  {author.image && !imageErrors[author.slug] ? (
                    <img
                      src={resolveMediaUrl(author.image)}
                      alt={author.name}
                      className={styles.image}
                      onError={() =>
                        setImageErrors((prev) => ({
                          ...prev,
                          [author.slug]: true,
                        }))
                      }
                    />
                  ) : (
                    <img
                      src="/images/author-placeholder.svg"
                      alt=""
                      className={styles.imagePlaceholder}
                    />
                  )}
                </div>

                <div className={styles.info}>
                  <h3 className={styles.name}>{author.name}</h3>
                  {years && <span className={styles.years}>{years}</span>}
                  {author.bio && (
                    <p className={styles.bio}>{author.bio.slice(0, 120)}...</p>
                  )}
                  <span className={styles.poemsCount}>
                    {author._count?.poems || 0}{" "}
                    {plural(author._count?.poems || 0, {
                      one: "common.verseOne",
                      few: "common.verseFew",
                      many: "common.verseMany",
                    })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
};

export default AllAuthorsSection;
