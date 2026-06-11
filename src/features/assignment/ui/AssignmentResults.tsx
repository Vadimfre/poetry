"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/src/entities/user";
import { assignmentApi } from "@/src/shared/api";
import type { QuizAssignment, QuizAttempt } from "@/src/shared/types/assignment.types";
import styles from "./Assignment.module.css";

function getApiMessage(err: unknown): string {
  const e = err as {
    response?: { data?: { message?: string | string[] } };
    message?: string;
  };
  const msg = e?.response?.data?.message;
  if (typeof msg === "string") return msg;
  if (Array.isArray(msg)) return msg.join(" ");
  return e?.message || "Памылка";
}

function gradeClass(grade: number): string {
  if (grade >= 10) return styles.grade10;
  if (grade >= 8) return styles.grade8;
  if (grade >= 6) return styles.grade6;
  return styles.grade4;
}

function initials(name: string | null | undefined, email: string | undefined) {
  const s = (name || email || "?").trim();
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return s.slice(0, 2).toUpperCase();
}

export function AssignmentResults({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useUserStore();
  const [assignment, setAssignment] = useState<QuizAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    if (user?.role !== "TEACHER") {
      router.push("/");
      return;
    }

    void loadResults();
  }, [assignmentId, hasHydrated, isAuthenticated, router, user?.role]);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);
      setAssignment(await assignmentApi.getResults(assignmentId));
    } catch (err: unknown) {
      setError(getApiMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const filteredAttempts = useMemo(() => {
    if (!assignment?.attempts) return [];
    const q = query.trim().toLowerCase();
    if (!q) return assignment.attempts;
    return assignment.attempts.filter((a) => {
      const name = (a.student?.name || "").toLowerCase();
      const email = (a.student?.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [assignment, query]);

  const stats = useMemo(() => {
    const list = assignment?.attempts || [];
    if (!list.length) {
      return { count: 0, avgPct: 0, avgGrade: 0 };
    }
    const sumPct = list.reduce((s, a) => s + a.percentage, 0);
    const sumGr = list.reduce((s, a) => s + a.grade, 0);
    return {
      count: list.length,
      avgPct: Math.round(sumPct / list.length),
      avgGrade: Math.round((sumGr / list.length) * 10) / 10,
    };
  }, [assignment]);

  if (!hasHydrated || loading) {
    return (
      <main className={`${styles.container} ${styles.pageBg}`}>
        <div className={styles.loadingCenter}>
          <div className={styles.spinner} />
          <span>Загрузка журнала…</span>
        </div>
      </main>
    );
  }

  if (error || !assignment) {
    return (
      <main className={`${styles.container} ${styles.pageBg}`}>
        <div className={styles.maxWidth}>
          <p className={styles.error}>{error || "Заданне не знойдзена"}</p>
          <Link href="/teacher" className={styles.backLink}>
            Да кабінета
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`${styles.container} ${styles.pageBg}`}>
      <div className={styles.maxWidth}>
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <div>
              <div className={styles.heroBadge}>Журнал</div>
              <h1 className={styles.title}>{assignment.title}</h1>
              <p className={styles.subtitle}>
                Клас: <strong>{assignment.classroom?.name}</strong>
                {assignment.dueDate
                  ? ` · дэдлайн ${new Date(assignment.dueDate).toLocaleString()}`
                  : ""}
              </p>
            </div>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => void loadResults()}
            >
              Абнавіць
            </button>
            <Link href="/teacher" className={styles.backLink}>
              Да кабінета
            </Link>
          </div>
        </header>

        <div className={styles.summaryStrip}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{stats.count}</div>
            <div className={styles.summaryLabel}>Здач</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{stats.avgPct}%</div>
            <div className={styles.summaryLabel}>Сярэдні %</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{stats.avgGrade}</div>
            <div className={styles.summaryLabel}>Сярэдняя адзнака</div>
          </div>
        </div>

        {assignment.attempts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <p className={styles.emptyTitle}>Пакуль няма здач</p>
            <p className={styles.meta}>
              Калі вучні прайдуць заданне, тут з&apos;явіцца табліца з вынікамі.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.journalToolbar}>
              <div className={styles.searchWrap}>
                <input
                  className={styles.searchInput}
                  type="search"
                  placeholder="Пошук па імі або email…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Пошук вучняў"
                />
              </div>
              <span className={styles.meta}>
                Паказана: {filteredAttempts.length} з {assignment.attempts.length}
              </span>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Вучань</th>
                    <th>Дата здачы</th>
                    <th>%</th>
                    <th>Балы</th>
                    <th>Адзнака</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.map((attempt) => (
                    <AttemptRow key={attempt.id} attempt={attempt} />
                  ))}
                </tbody>
              </table>
            </div>
            {filteredAttempts.length === 0 && query.trim() && (
              <p className={styles.meta} style={{ marginTop: 12 }}>
                Нічога не знойдзена па запыце «{query}».
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function AttemptRow({ attempt }: { attempt: QuizAttempt }) {
  const name = attempt.student?.name || attempt.student?.email || "—";
  const email = attempt.student?.email;
  return (
    <tr>
      <td>
        <div className={styles.userCell}>
          <div className={styles.avatarSm}>
            {initials(attempt.student?.name, attempt.student?.email)}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{name}</div>
            {email && attempt.student?.name && (
              <div className={styles.meta} style={{ fontSize: 12 }}>
                {email}
              </div>
            )}
          </div>
        </div>
      </td>
      <td>{new Date(attempt.submittedAt).toLocaleString()}</td>
      <td>
        <strong>{attempt.percentage}%</strong>
      </td>
      <td>
        {attempt.correct}/{attempt.total}
      </td>
      <td>
        <span className={`${styles.gradeBadge} ${gradeClass(attempt.grade)}`}>
          {attempt.grade}
        </span>
      </td>
    </tr>
  );
}
