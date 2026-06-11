"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Header from "@/components/Header/Header";
import { proseApi } from "@/src/shared/api/prose.api";
import { useI18n } from "@/src/shared/i18n";
import { useLocaleQueryKey } from "@/src/shared/i18n/use-locale-query-key";
import styles from "./prose.module.css";

export default function ProseWorkPage({
  params,
}: {
  params: { slug: string };
}) {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("assignment");
  const queryKey = useLocaleQueryKey(["prose", params.slug]);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => proseApi.getBySlug(params.slug),
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <p>{t("common.loading")}</p>
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <p>{t("proseReader.notFound")}</p>
        </main>
      </>
    );
  }

  const firstChapter = data.chapters[0];

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className="container">
          <Link href={`/author/${data.author.slug}`} className={styles.back}>
            ← {data.author.name}
          </Link>
          <div className={styles.hero}>
            <span className={styles.kind}>{t(`proseReader.kind.${data.kind}`)}</span>
            <h1>{data.title}</h1>
            {data.year && <p className={styles.year}>{data.year}</p>}
            {data.description && (
              <p className={styles.description}>{data.description}</p>
            )}
            {firstChapter && (
              <Link
                href={`/prose/${data.slug}/read/${firstChapter.slug}${assignmentId ? `?assignment=${assignmentId}` : ""}`}
                className={styles.readBtn}
              >
                {t("proseReader.startReading")}
              </Link>
            )}
          </div>

          {data.chapters.length > 0 && (
            <section className={styles.chapters}>
              <h2>{t("proseReader.contents")}</h2>
              <ol>
                {data.chapters.map((ch) => (
                  <li key={ch.id}>
                    <Link href={`/prose/${data.slug}/read/${ch.slug}${assignmentId ? `?assignment=${assignmentId}` : ""}`}>
                      {ch.order}. {ch.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {data.quizzes && data.quizzes.length > 0 && (
            <section className={styles.quizzes}>
              <h2>{t("proseReader.relatedQuizzes")}</h2>
              <ul>
                {data.quizzes.map((q) => (
                  <li key={q.id}>
                    <Link href={`/quizzes/${q.id}`}>{q.title}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
