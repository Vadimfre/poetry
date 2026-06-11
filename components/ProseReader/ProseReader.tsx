"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { readingAssignmentApi } from "@/src/shared/api/prose.api";
import type { ProseChapterPage } from "@/src/shared/types/prose.types";
import { useI18n } from "@/src/shared/i18n";
import styles from "./ProseReader.module.css";

interface ProseReaderProps {
  data: ProseChapterPage;
  readingAssignmentId?: string;
}

export function ProseReader({ data, readingAssignmentId }: ProseReaderProps) {
  const { t } = useI18n();
  const [fontSize, setFontSize] = useState(1.12);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { work, chapter, navigation, toc } = data;

  const saveProgress = useCallback(async () => {
    if (!readingAssignmentId) return;
    try {
      await readingAssignmentApi.updateProgress(readingAssignmentId, {
        lastChapterId: chapter.id,
        progressPercent: Math.round(
          (navigation.current / navigation.total) * 100,
        ),
        completed: navigation.current >= navigation.total,
      });
    } catch {
      /* ignore if not logged in as student */
    }
  }, [
    readingAssignmentId,
    chapter.id,
    navigation.current,
    navigation.total,
  ]);

  useEffect(() => {
    void saveProgress();
  }, [saveProgress]);

  const paragraphs = chapter.content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={styles.layout}>
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHead}>
          <Link href={`/prose/${work.slug}`} className={styles.workLink}>
            {work.title}
          </Link>
          <button
            type="button"
            className={styles.sidebarClose}
            onClick={() => setSidebarOpen(false)}
            aria-label={t("proseReader.closeToc")}
          >
            ×
          </button>
        </div>
        <ol className={styles.toc}>
          {toc.map((item) => (
            <li key={item.id}>
              <Link
                href={`/prose/${work.slug}/read/${item.slug}${readingAssignmentId ? `?assignment=${readingAssignmentId}` : ""}`}
                className={
                  item.slug === chapter.slug ? styles.tocActive : undefined
                }
              >
                {item.order}. {item.title}
              </Link>
            </li>
          ))}
        </ol>
      </aside>

      <div className={styles.main}>
        <header className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <button
              type="button"
              className={styles.tocBtn}
              onClick={() => setSidebarOpen(true)}
            >
              {t("proseReader.contents")}
            </button>
            <Link
              href={`/author/${work.author.slug}`}
              className={styles.authorLink}
            >
              {work.author.name}
            </Link>
          </div>
          <div className={styles.fontControls}>
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.max(0.9, s - 0.08))}
              aria-label={t("proseReader.smaller")}
            >
              A−
            </button>
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.min(1.5, s + 0.08))}
              aria-label={t("proseReader.larger")}
            >
              A+
            </button>
          </div>
        </header>

        <article className={styles.article}>
          <p className={styles.progress}>
            {t("proseReader.chapterProgress", {
              current: navigation.current,
              total: navigation.total,
            })}
          </p>
          <h1 className={styles.chapterTitle}>{chapter.title}</h1>
          <div
            className={styles.body}
            style={{ fontSize: `${fontSize}rem`, lineHeight: 1.85 }}
          >
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </article>

        <nav className={styles.pager}>
          {navigation.prev ? (
            <Link
              href={`/prose/${work.slug}/read/${navigation.prev.slug}${readingAssignmentId ? `?assignment=${readingAssignmentId}` : ""}`}
              className={styles.pagerPrev}
            >
              ← {navigation.prev.title}
            </Link>
          ) : (
            <span />
          )}
          {navigation.next ? (
            <Link
              href={`/prose/${work.slug}/read/${navigation.next.slug}${readingAssignmentId ? `?assignment=${readingAssignmentId}` : ""}`}
              className={styles.pagerNext}
            >
              {navigation.next.title} →
            </Link>
          ) : (
            <span className={styles.done}>{t("proseReader.finished")}</span>
          )}
        </nav>
      </div>
    </div>
  );
}
