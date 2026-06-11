"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  Inbox,
} from "lucide-react";
import Header from "@/components/Header/Header";
import { schoolApi } from "@/src/shared/api";
import { useI18n, usePlural } from "@/src/shared/i18n";
import { useLocaleQueryKey } from "@/src/shared/i18n/use-locale-query-key";
import type { Poem } from "@/src/shared/types";
import type { ProseWorkListItem } from "@/src/shared/types/prose.types";
import styles from "./school.module.css";

const GRADES = [5, 6, 7, 8, 9, 10, 11] as const;

type TabKey = "study" | "memorize" | "discussion" | "extra";

function excerpt(text: string | undefined, max = 140): string {
  if (!text) return "";
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max).trim()}…`;
}

export function SchoolGradePage({ grade }: { grade: number }) {
  const { t } = useI18n();
  const plural = usePlural();
  const [tab, setTab] = useState<TabKey>("study");
  const gradeQueryKey = useLocaleQueryKey(["school", "grade", grade]);

  const { data, isLoading, error } = useQuery({
    queryKey: gradeQueryKey,
    queryFn: () => schoolApi.getGrade(grade),
  });

  const tabs: { key: TabKey; label: string; count: number }[] = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: "study",
        label: t("school.tabStudy"),
        count: data.study.length + data.prose.study.length,
      },
      {
        key: "memorize",
        label: t("school.tabMemorize"),
        count: data.memorize.length + data.prose.memorize.length,
      },
      {
        key: "discussion",
        label: t("school.tabDiscussion"),
        count: data.discussion.length + data.prose.discussion.length,
      },
      {
        key: "extra",
        label: t("school.tabExtra"),
        count: data.extra.length + data.prose.extra.length,
      },
    ];
  }, [data, t]);

  const works = useMemo(() => {
    if (!data) return [];
    const poemList = data[tab];
    const proseList = data.prose[tab];
    return [
      ...poemList.map((p) => ({ type: "poem" as const, item: p })),
      ...proseList.map((w) => ({ type: "prose" as const, item: w })),
    ];
  }, [data, tab]);

  const isEmpty = works.length === 0;

  return (
    <div className={styles.page}>
      <div className={styles.glowTop} aria-hidden="true" />
      <div className={styles.glowBottom} aria-hidden="true" />

      <div className={styles.shell}>
        <Header />

        <div className={styles.topBar}>
          <Link href="/school" className={styles.backButton}>
            <ArrowLeft className={styles.backIcon} aria-hidden="true" />
            {t("school.backToGrades")}
          </Link>
        </div>

        <header className={styles.hero}>
          <div className={styles.heroOrnament} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={styles.heroBadge}>
                <GraduationCap className={styles.heroBadgeIcon} aria-hidden="true" />
                {t("school.badge")}
              </span>
              <h1 className={styles.title}>
                <span className={styles.titleAccent}>
                  {t("school.gradeTitle", { grade })}
                </span>
              </h1>
              <p className={styles.subtitle}>{t("school.gradeSubtitle")}</p>
              {data && (
                <p className={styles.sourceNote}>
                  {t("school.foundTotal", {
                    poems: `${data.totals.poems} ${plural(data.totals.poems, {
                      one: "common.verseOne",
                      few: "common.verseFew",
                      many: "common.verseMany",
                    })}`,
                    prose: `${data.totals.prose} ${plural(data.totals.prose, {
                      one: "common.proseOne",
                      few: "common.proseFew",
                      many: "common.proseMany",
                    })}`,
                  })}
                </p>
              )}
            </div>

            {data && (
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatValue}>{data.totals.poems}</div>
                  <div className={styles.heroStatLabel}>{t("school.statPoems")}</div>
                </div>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatValue}>{data.totals.prose}</div>
                  <div className={styles.heroStatLabel}>{t("school.statProse")}</div>
                </div>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatValue}>
                    {data.memorize.length + data.prose.memorize.length}
                  </div>
                  <div className={styles.heroStatLabel}>{t("school.statMemorize")}</div>
                </div>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatValue}>{grade}</div>
                  <div className={styles.heroStatLabel}>{t("school.gradeShort")}</div>
                </div>
              </div>
            )}
          </div>
        </header>

        <nav className={styles.gradeNav} aria-label={t("school.pickGrade")}>
          {GRADES.map((g) =>
            g === grade ? (
              <span key={g} className={styles.gradeNavActive}>
                {g}
              </span>
            ) : (
              <Link key={g} href={`/school/${g}`} className={styles.gradeNavItem}>
                {g}
              </Link>
            ),
          )}
        </nav>

        {isLoading && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>{t("school.loading")}</p>
          </div>
        )}

        {error && (
          <div className={styles.errorWrap}>
            <p className={styles.errorText}>{t("school.loadError")}</p>
          </div>
        )}

        {data && (
          <div className={styles.panel}>
            <div className={styles.tabs} role="tablist">
              {tabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.key}
                  className={`${styles.tab} ${tab === item.key ? styles.tabActive : ""}`}
                  onClick={() => setTab(item.key)}
                >
                  {item.label}
                  {item.count > 0 && (
                    <span className={styles.tabCount}>{item.count}</span>
                  )}
                </button>
              ))}
            </div>

            {isEmpty ? (
              <div className={styles.empty}>
                <Inbox className={styles.emptyIcon} aria-hidden="true" />
                <p className={styles.emptyTitle}>{t("school.emptySection")}</p>
                <p className={styles.emptyText}>{t("school.emptySectionHint")}</p>
              </div>
            ) : (
              <div className={styles.list}>
                {works.map((entry, index) =>
                  entry.type === "poem" ? (
                    <PoemCard
                      key={`poem-${entry.item.id}`}
                      poem={entry.item}
                      index={index + 1}
                    />
                  ) : (
                    <ProseCard
                      key={`prose-${entry.item.id}`}
                      work={entry.item}
                      index={index + 1}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PoemCard({ poem, index }: { poem: Poem; index: number }) {
  const { t } = useI18n();
  const preview = excerpt(poem.content || poem.description || undefined);

  return (
    <Link href={`/poem/${poem.id}`} className={styles.workCard}>
      <div className={styles.workCardTop}>
        <span className={styles.workIndex}>{index}</span>
        <div className={styles.workMain}>
          <h2 className={styles.workTitle}>{poem.title}</h2>
          <div className={styles.workMeta}>
            <span>{poem.author?.name}</span>
            {poem.year && <span>· {poem.year}</span>}
            <span className={`${styles.workBadge} ${styles.workBadgePoem}`}>
              {t("school.poem")}
            </span>
          </div>
        </div>
      </div>
      {preview && <p className={styles.workExcerpt}>{preview}</p>}
      <div className={styles.workFooter}>
        <span className={styles.workLink}>
          {t("school.openWork")}
          <ArrowRight aria-hidden="true" />
        </span>
        <BookOpen size={18} color="#8b7355" aria-hidden="true" />
      </div>
    </Link>
  );
}

function ProseCard({ work, index }: { work: ProseWorkListItem; index: number }) {
  const { t } = useI18n();
  const preview = excerpt(work.description || undefined);

  return (
    <Link href={`/prose/${work.slug}`} className={styles.workCard}>
      <div className={styles.workCardTop}>
        <span className={`${styles.workIndex} ${styles.workIndexProse}`}>
          {index}
        </span>
        <div className={styles.workMain}>
          <h2 className={styles.workTitle}>{work.title}</h2>
          <div className={styles.workMeta}>
            <span>{work.author?.name}</span>
            {work.year && <span>· {work.year}</span>}
            {work.chapterCount > 0 && (
              <span>· {t("school.chapters", { count: work.chapterCount })}</span>
            )}
            <span className={`${styles.workBadge} ${styles.workBadgeProse}`}>
              {t("school.prose")}
            </span>
          </div>
        </div>
      </div>
      {preview && <p className={styles.workExcerpt}>{preview}</p>}
      <div className={styles.workFooter}>
        <span className={styles.workLink}>
          {t("school.openWork")}
          <ArrowRight aria-hidden="true" />
        </span>
        <FileText size={18} color="#6d91cb" aria-hidden="true" />
      </div>
    </Link>
  );
}
