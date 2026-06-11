"use client";

import Link from "next/link";
import { usePoems } from "@/src/shared/hooks/use-poemsSTRANCH";
import { useI18n } from "@/src/shared/i18n";
import styles from "./FeaturedPoemsSection.module.css";

function excerpt(content: string | undefined, max = 120) {
  if (!content) return "";
  const line = content.split("\n").find((l) => l.trim())?.trim() ?? content.trim();
  return line.length > max ? `${line.slice(0, max).trim()}…` : line;
}

export default function FeaturedPoemsSection() {
  const { t } = useI18n();
  const { data, isLoading } = usePoems(1, 9);
  const poems = data?.poems ?? [];

  return (
    <section className={styles.section} id="read-poems">
      <div className="container">
        <div className={styles.header}>
          <div>
            <span className={styles.label}>{t("featuredPoems.label")}</span>
            <h2 className={styles.title}>{t("featuredPoems.title")}</h2>
            <p className={styles.subtitle}>{t("featuredPoems.subtitle")}</p>
          </div>
          <div className={styles.actions}>
            <Link href="/filters" className={styles.primaryBtn}>
              {t("featuredPoems.browseAll")}
            </Link>
            <Link href="/quizzes" className={styles.secondaryBtn}>
              {t("featuredPoems.quizzes")}
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loading}>{t("featuredPoems.loading")}</div>
        ) : poems.length === 0 ? (
          <div className={styles.empty}>{t("featuredPoems.empty")}</div>
        ) : (
          <div className={styles.grid}>
            {poems.map((poem) => (
              <Link key={poem.id} href={`/poem/${poem.id}`} className={styles.card}>
                <div>
                  <h3 className={styles.poemTitle}>{poem.title}</h3>
                  <div className={styles.meta}>
                    <span className={styles.author}>
                      {poem.author?.name ?? t("common.unknownAuthor")}
                    </span>
                    {poem.year ? <span>{poem.year}</span> : null}
                  </div>
                  {poem.content ? (
                    <p className={styles.excerpt}>{excerpt(poem.content)}</p>
                  ) : null}
                </div>
                <span className={styles.readMore}>{t("featuredPoems.readPoem")}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
