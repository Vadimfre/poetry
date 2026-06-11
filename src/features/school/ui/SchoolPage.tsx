"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header/Header";
import { schoolApi } from "@/src/shared/api";
import { useI18n, usePlural } from "@/src/shared/i18n";
import { useLocaleQueryKey } from "@/src/shared/i18n/use-locale-query-key";
import styles from "./school.module.css";

export function SchoolPage() {
  const { t } = useI18n();
  const plural = usePlural();
  const gradesQueryKey = useLocaleQueryKey(["school", "grades"]);

  const { data, isLoading, error } = useQuery({
    queryKey: gradesQueryKey,
    queryFn: () => schoolApi.getGrades(),
  });

  const totalPoems =
    data?.grades.reduce((sum, g) => sum + g.poemCount, 0) ?? 0;
  const totalProse =
    data?.grades.reduce((sum, g) => sum + g.proseCount, 0) ?? 0;
  const totalMemorize =
    data?.grades.reduce((sum, g) => sum + g.memorizeCount, 0) ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.glowTop} aria-hidden="true" />
      <div className={styles.glowBottom} aria-hidden="true" />

      <div className={styles.shell}>
        <Header />

        <div className={styles.topBar}>
          <Link href="/" className={styles.backButton}>
            <ArrowLeft className={styles.backIcon} aria-hidden="true" />
            {t("common.back")}
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
                <span className={styles.titleAccent}>{t("school.title")}</span>
              </h1>
              <p className={styles.subtitle}>{t("school.subtitle")}</p>
              <p className={styles.sourceNote}>
                {t("school.sourceNote")}{" "}
                <a
                  href="https://knihi.com/skola/5.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  knihi.com/skola
                </a>
              </p>
            </div>

            {data && (
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatValue}>7</div>
                  <div className={styles.heroStatLabel}>{t("school.statGrades")}</div>
                </div>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatValue}>{totalPoems}</div>
                  <div className={styles.heroStatLabel}>{t("school.statPoems")}</div>
                </div>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatValue}>{totalProse}</div>
                  <div className={styles.heroStatLabel}>{t("school.statProse")}</div>
                </div>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatValue}>{totalMemorize}</div>
                  <div className={styles.heroStatLabel}>{t("school.statMemorize")}</div>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className={styles.sectionHead}>
          <div>
            <h2 className={styles.sectionTitle}>{t("school.pickGrade")}</h2>
            <p className={styles.sectionHint}>{t("school.pickGradeHint")}</p>
          </div>
          <Sparkles size={22} color="#c49758" aria-hidden="true" />
        </div>

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
          <div className={styles.gradeGrid}>
            {data.grades.map((g) => (
              <Link
                key={g.grade}
                href={`/school/${g.grade}`}
                className={styles.gradeCard}
                data-grade={g.grade}
              >
                <div className={styles.gradeTop}>
                  <div>
                    <span className={styles.gradeNumber}>{g.grade}</span>
                    <span className={styles.gradeSuffix}>{t("school.gradeShort")}</span>
                  </div>
                  <span className={styles.gradeArrow} aria-hidden="true">
                    <ArrowRight />
                  </span>
                </div>

                <p className={styles.gradeLabel}>{t("school.gradeLabel")}</p>

                <div className={styles.gradeStats}>
                  {g.poemCount > 0 && (
                    <span className={styles.statPill}>
                      {t("school.poemCount", {
                        count: g.poemCount,
                        word: plural(g.poemCount, {
                          one: "common.verseOne",
                          few: "common.verseFew",
                          many: "common.verseMany",
                        }),
                      })}
                    </span>
                  )}
                  {g.proseCount > 0 && (
                    <span className={styles.statPill}>
                      {t("school.proseCount", {
                        count: g.proseCount,
                        word: plural(g.proseCount, {
                          one: "common.proseOne",
                          few: "common.proseFew",
                          many: "common.proseMany",
                        }),
                      })}
                    </span>
                  )}
                  {g.memorizeCount > 0 && (
                    <span className={`${styles.statPill} ${styles.statPillMem}`}>
                      {t("school.memorizeCount", { count: g.memorizeCount })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {data && (
          <div className={styles.sectionHead} style={{ marginTop: 40 }}>
            <div>
              <h2 className={styles.sectionTitle}>{t("school.programNoteTitle")}</h2>
              <p className={styles.sectionHint}>{t("school.programNoteText")}</p>
            </div>
            <BookMarked size={22} color="#6d91cb" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}
