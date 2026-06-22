"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/shared/api/client";
import { useLocaleQueryKey } from "@/src/shared/i18n/use-locale-query-key";
import { useI18n } from "@/src/shared/i18n/context";
import { resolveAuthorImageUrl } from "@/src/shared/lib/resolve-media-url";
import styles from "./AuthorsSection.module.css";

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

function authorTitleKey(slug: string) {
  if (slug === "maksim-bahdanovich") return "authorsSection.classicLiterature";
  if (["yanka-kupala", "yakub-kolas"].includes(slug)) {
    return "authorsSection.nationalPoet";
  }
  return "authorsSection.defaultBio";
}

function bioExcerpt(bio: string | null, max = 120) {
  if (!bio) return "";
  const line = bio.split("\n").find((l) => l.trim())?.trim() ?? bio.trim();
  return line.length > max ? `${line.slice(0, max).trim()}…` : line;
}

const AuthorsSection = () => {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const authorsQueryKey = useLocaleQueryKey(["authors"]);
  const { data: allAuthors } = useQuery<Author[]>({
    queryKey: authorsQueryKey,
    queryFn: async () => {
      const response = await apiClient.get("/poems/authors");
      return response.data;
    },
  });

  // Берём только 3 главных автора
  const authors =
    allAuthors?.filter((a) =>
      ["yanka-kupala", "yakub-kolas", "maksim-bahdanovich"].includes(a.slug),
    ) || [];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (authors.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % authors.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [authors.length]);

  return (
    <section className={styles.authorsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>{t("authorsSection.sectionLabel")}</span>
          <h2 className={styles.sectionTitle}>{t("authorsSection.title")}</h2>
          <p className={styles.sectionSubtitle}>{t("authorsSection.subtitle")}</p>
        </div>

        <div
          className={`${styles.authorsGrid} ${isVisible ? styles.visible : ""}`}
        >
          {authors.map((author, index) => {
            const years = author.birthYear
              ? `${author.birthYear}–${author.deathYear || ""}`
              : "";
            const quote = bioExcerpt(author.bio);
            const title = t(authorTitleKey(author.slug));

            return (
              <Link
                href={`/author/${author.slug}`}
                key={author.slug}
                className={`${styles.authorCard} ${index === activeIndex ? styles.active : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className={styles.authorImageWrapper}>
                  <img
                    src={resolveAuthorImageUrl(author.slug, author.image)}
                    alt={author.name}
                    className={styles.authorImage}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/author-placeholder.svg";
                      setImageErrors((prev) => ({
                        ...prev,
                        [author.slug]: true,
                      }));
                    }}
                  />
                </div>
                <div className={styles.authorInfo}>
                  <h3 className={styles.authorName}>{author.name}</h3>
                  <span className={styles.authorYears}>{years}</span>
                  <span className={styles.authorTitle}>{title}</span>
                  {quote && <p className={styles.authorQuote}>«{quote}»</p>}
                </div>
                <div className={styles.cardOverlay}></div>
              </Link>
            );
          })}
        </div>

        {/* Статистика */}
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>12</span>
            <span className={styles.statLabel}>{t("authorsSection.statAuthors")}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>50+</span>
            <span className={styles.statLabel}>{t("authorsSection.statPoems")}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>5</span>
            <span className={styles.statLabel}>{t("authorsSection.statDirections")}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>∞</span>
            <span className={styles.statLabel}>{t("authorsSection.statInspiration")}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthorsSection;
