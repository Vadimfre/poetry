"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/src/entities/user";
import { assignmentApi, classroomApi } from "@/src/shared/api";
import type { Classroom, QuizAssignment } from "@/src/shared/types/assignment.types";
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

export function StudentWorkspace({ classId }: { classId?: string }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useUserStore();
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [assignments, setAssignments] = useState<QuizAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    void loadData();
  }, [hasHydrated, isAuthenticated, router, user?.role]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [classroomsData, assignmentsData] = await Promise.all([
        classroomApi.getMy(),
        assignmentApi.getMy(),
      ]);
      setClasses(classroomsData);
      setAssignments(assignmentsData);
    } catch (err: unknown) {
      setError(getApiMessage(err, t("teacher.error")));
    } finally {
      setLoading(false);
    }
  };

  const visibleAssignments = classId
    ? assignments.filter((assignment) => assignment.classroomId === classId)
    : assignments;
  const currentClass = classId
    ? classes.find((classroom) => classroom.id === classId)
    : null;

  if (!hasHydrated || loading) {
    return (
      <main className={`${styles.container} ${styles.pageBg}`}>
        <div className={styles.loadingCenter}>
          <div className={styles.spinner} />
          <span>{t("student.loadingGeneric")}</span>
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
              <div className={styles.heroBadge}>{t("student.badge")}</div>
              <h1 className={styles.title}>
                {currentClass ? currentClass.name : t("student.myAssignments")}
              </h1>
              <p className={styles.subtitle}>{t("student.workspaceDesc")}</p>
            </div>
            <Link href="/student/join" className={styles.button}>
              {t("student.classCode")}
            </Link>
            <Link href="/quizzes" className={styles.secondaryButton}>
              {t("student.freeQuizzes")}
            </Link>
          </div>
        </header>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.layout}>
          <aside className={`${styles.panel} ${styles.stack}`}>
            <p className={styles.sectionLabel}>{t("student.myClasses")}</p>
            {classes.length === 0 ? (
              <div className={styles.emptyState} style={{ padding: 28 }}>
                <div className={styles.emptyIcon}>🎓</div>
                <p className={styles.emptyTitle}>{t("student.noClassesYet")}</p>
                <p className={styles.meta}>{t("student.noClassesHint")}</p>
              </div>
            ) : (
              <div className={styles.tabs}>
                <Link
                  href="/student"
                  className={`${styles.tab} ${!classId ? styles.tabActive : ""}`}
                >
                  {t("student.allAssignments")}
                </Link>
                {classes.map((classroom) => (
                  <Link
                    key={classroom.id}
                    href={`/student/classes/${classroom.id}`}
                    className={`${styles.tab} ${
                      classroom.id === classId ? styles.tabActive : ""
                    }`}
                  >
                    <strong>{classroom.name}</strong>
                    <br />
                    <span className={styles.meta}>
                      {classroom.teacher.name || classroom.teacher.email}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </aside>

          <section className={styles.stack}>
            <p className={styles.sectionLabel}>{t("teacher.assignments")}</p>
            {visibleAssignments.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✨</div>
                <p className={styles.emptyTitle}>{t("student.noAssignments")}</p>
                <p className={styles.meta}>{t("student.noAssignmentsHint")}</p>
              </div>
            ) : (
              visibleAssignments.map((assignment) => {
                const attempt = assignment.attempts[0];
                const due = assignment.dueDate
                  ? new Date(assignment.dueDate)
                  : null;
                const overdue =
                  due && !attempt && due.getTime() < Date.now();

                return (
                  <div key={assignment.id} className={styles.card}>
                    <div className={styles.assignRow}>
                      <div className={styles.assignMeta}>
                        <h3 className={styles.cardTitle}>{assignment.title}</h3>
                        <p className={styles.meta}>
                          {assignment.classroom?.name} ·{" "}
                          {assignment.items
                            .map((item) => item.quiz.title)
                            .join(" → ")}
                        </p>
                        <span
                          className={`${styles.statusPill} ${
                            attempt ? styles.statusDone : styles.statusTodo
                          }`}
                        >
                          {attempt
                            ? t("student.submittedStatus", {
                                percent: attempt.percentage,
                                grade: attempt.grade,
                              })
                            : overdue
                              ? t("student.deadlinePassed")
                              : t("student.awaiting")}
                        </span>
                      </div>
                      <Link
                        href={`/student/assignments/${assignment.id}`}
                        className={
                          attempt ? styles.secondaryButton : styles.button
                        }
                      >
                        {attempt ? t("student.result") : t("student.start")}
                      </Link>
                    </div>
                    {!attempt && assignment.dueDate && (
                      <p className={styles.meta}>
                        {t("student.deadlinePrefix")}{" "}
                        {new Date(assignment.dueDate).toLocaleString(
                          dateLocaleFor(locale),
                        )}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
