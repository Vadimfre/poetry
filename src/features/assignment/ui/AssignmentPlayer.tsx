"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuizGame from "@/components/Quiz/QuizGame";
import { useUserStore } from "@/src/entities/user";
import { assignmentApi } from "@/src/shared/api";
import type {
  QuizAssignment,
  QuizAttempt,
} from "@/src/shared/types/assignment.types";
import type { AnswerDto } from "@/src/shared/types/quiz.types";
import { useI18n } from "@/src/shared/i18n";
import type { Locale } from "@/src/shared/i18n/types";
import styles from "./Assignment.module.css";

function getApiMessage(err: unknown, fallback: string): string {
  const e = err as {
    response?: { data?: { message?: string | string[] } };
    message?: string;
  };
  const msg = e?.response?.data?.message;
  if (typeof msg === "string") return msg;
  if (Array.isArray(msg)) return msg.join(" ");
  return e?.message || fallback;
}

function dateLocaleFor(locale: Locale): string {
  return locale === "be" ? "be-BY" : locale === "ru" ? "ru-RU" : "en-US";
}

export function AssignmentPlayer({ assignmentId }: { assignmentId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useUserStore();
  const [assignment, setAssignment] = useState<QuizAssignment | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalQuizzes = assignment?.quizzes?.length ?? 0;

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    if (user?.role !== "STUDENT") {
      router.push("/");
      return;
    }

    void loadAssignment();
  }, [assignmentId, hasHydrated, isAuthenticated, router, user?.role]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assignmentApi.getById(assignmentId);
      setAssignment(data);
      setAttempt(data.attempts[0] || null);
      setQuizIndex(0);
      setAnswers([]);
    } catch (err: unknown) {
      setError(getApiMessage(err, t("teacher.error")));
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = async (payload: { answers: AnswerDto[] }) => {
    if (!assignment?.quizzes) return;

    const nextAnswers = [...answers, ...payload.answers];
    setAnswers(nextAnswers);

    if (quizIndex < assignment.quizzes.length - 1) {
      setQuizIndex((prev) => prev + 1);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await assignmentApi.submit(assignment.id, {
        answers: nextAnswers,
      });
      setAttempt(result);
    } catch (err: unknown) {
      setError(getApiMessage(err, t("teacher.error")));
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasHydrated || loading) {
    return (
      <main className={`${styles.container} ${styles.pageBg}`}>
        <div className={styles.loadingCenter}>
          <div className={styles.spinner} />
          <span>{t("teacher.loadingAssignment")}</span>
        </div>
      </main>
    );
  }

  if (error && !assignment) {
    return (
      <main className={`${styles.container} ${styles.pageBg}`}>
        <div className={styles.maxWidth}>
          <p className={styles.error}>{error}</p>
          <Link href="/student" className={styles.backLink}>
            {t("teacher.backToAssignments")}
          </Link>
        </div>
      </main>
    );
  }

  if (!assignment) {
    return null;
  }

  if (attempt) {
    return <AttemptResult assignment={assignment} attempt={attempt} />;
  }

  const quiz = assignment.quizzes?.[quizIndex];

  if (!quiz) {
    return (
      <main className={`${styles.container} ${styles.pageBg}`}>
        <div className={styles.maxWidth}>
          <p className={styles.error}>{t("teacher.noQuizzesInAssignment")}</p>
        </div>
      </main>
    );
  }

  if (submitting) {
    return (
      <main className={`${styles.container} ${styles.pageBg}`}>
        <div className={styles.loadingCenter}>
          <div className={styles.spinner} />
          <span>{t("teacher.savingResult")}</span>
        </div>
      </main>
    );
  }

  const pct =
    totalQuizzes > 0
      ? Math.round(((quizIndex + 1) / totalQuizzes) * 100)
      : 0;

  return (
    <div className={styles.pageBg}>
      <div className={styles.maxWidth}>
        {error && (
          <p
            className={styles.error}
            style={{ margin: "12px 0", padding: "0 4px" }}
          >
            {error}
          </p>
        )}
        <div className={styles.progressStrip}>
          <span>
            {t("teacher.quizProgress", {
              title: assignment.title,
              current: quizIndex + 1,
              total: totalQuizzes,
            })}
          </span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${Math.min(100, pct)}%`,
              }}
            />
          </div>
          <span style={{ opacity: 0.85 }}>{pct}%</span>
        </div>
      </div>
      <QuizGame
        key={quiz.id}
        quiz={quiz}
        backHref="/student"
        backLabel={t("teacher.backToAssignments")}
        showResults={false}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}

function AttemptResult({
  assignment,
  attempt,
}: {
  assignment: QuizAssignment;
  attempt: QuizAttempt;
}) {
  const { t, locale } = useI18n();

  return (
    <main className={`${styles.container} ${styles.pageBg}`}>
      <div className={styles.maxWidth}>
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <div>
              <div className={styles.heroBadge}>{t("teacher.doneBadge")}</div>
              <h1 className={styles.title}>{assignment.title}</h1>
              <p className={styles.subtitle}>{t("teacher.resultSaved")}</p>
            </div>
            <Link href="/student" className={styles.button}>
              {t("teacher.backToAssignments")}
            </Link>
          </div>
        </header>

        <section className={styles.card}>
          <p className={styles.sectionLabel}>{t("teacher.yourResult")}</p>
          <div className={styles.result}>
            <div className={styles.stat}>
              <strong>{attempt.percentage}%</strong>
              <span>{t("teacher.percentLabel")}</span>
            </div>
            <div className={styles.stat}>
              <strong>
                {attempt.correct}/{attempt.total}
              </strong>
              <span>{t("teacher.scoreLabel")}</span>
            </div>
            <div className={styles.stat}>
              <strong>{attempt.grade}</strong>
              <span>{t("teacher.gradeLabel")}</span>
            </div>
            <div className={styles.stat}>
              <strong>
                {new Date(attempt.submittedAt).toLocaleDateString(
                  dateLocaleFor(locale),
                )}
              </strong>
              <span>{t("teacher.dateLabelShort")}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
