"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/src/entities/user";
import { assignmentApi, classroomApi, quizApi } from "@/src/shared/api";
import type { Classroom, QuizAssignment } from "@/src/shared/types/assignment.types";
import type { QuizListItem } from "@/src/shared/types/quiz.types";
import { useI18n, usePlural } from "@/src/shared/i18n";
import {
  isDeadlineInFuture,
  localDateTimeToIso,
  todayLocalDateString,
} from "../lib/deadline";
import styles from "./Assignment.module.css";

interface TeacherWorkspaceProps {
  initialClassId?: string;
}

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

export function TeacherWorkspace({ initialClassId }: TeacherWorkspaceProps) {
  const { t } = useI18n();
  const plural = usePlural();
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useUserStore();
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState(initialClassId || "");
  const [className, setClassName] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [selectedQuizIds, setSelectedQuizIds] = useState<string[]>([]);
  const [useDeadline, setUseDeadline] = useState(false);
  const [dueDateOnly, setDueDateOnly] = useState("");
  const [dueTime, setDueTime] = useState("23:59");
  const [sendEmailResults, setSendEmailResults] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const selectedClass = useMemo(
    () => classes.find((classroom) => classroom.id === selectedClassId),
    [classes, selectedClassId],
  );

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

    void loadData();
  }, [hasHydrated, isAuthenticated, router, user?.role]);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(null), 4500);
    return () => window.clearTimeout(timer);
  }, [success]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [classroomsData, quizzesData] = await Promise.all([
        classroomApi.getMy(),
        quizApi.getAll(),
      ]);

      setClasses(classroomsData);
      setQuizzes(quizzesData);
      setSelectedClassId(
        initialClassId || classroomsData[0]?.id || selectedClassId,
      );
      setDueDateOnly(todayLocalDateString());
    } catch (err: unknown) {
      setError(getApiMessage(err, t("teacher.error")));
    } finally {
      setLoading(false);
    }
  };

  const createClassroom = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    const name = className.trim();
    if (name.length < 2) {
      setFieldErrors({ className: t("teacher.classNameMin") });
      return;
    }

    try {
      setSaving(true);
      const classroom = await classroomApi.create({ name });
      setClassName("");
      setClasses((prev) => [classroom, ...prev]);
      setSelectedClassId(classroom.id);
      setSuccess(t("teacher.classCreated"));
    } catch (err: unknown) {
      setFieldErrors({
        className: getApiMessage(err, t("teacher.error")),
      });
    } finally {
      setSaving(false);
    }
  };

  const createAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setError(null);

    if (!selectedClassId) {
      setError(t("teacher.selectClassFirst"));
      return;
    }

    const errs: Record<string, string> = {};

    if (selectedQuizIds.length === 0) {
      errs.quizzes = t("teacher.selectQuiz");
    }

    const titleTrim = assignmentTitle.trim();
    if (titleTrim.length > 120) {
      errs.title = t("teacher.titleTooLong");
    }

    let dueIso: string | undefined;
    if (useDeadline) {
      if (!dueDateOnly.trim()) {
        errs.dueDate = t("teacher.pickDeadline");
      } else {
        const iso = localDateTimeToIso(dueDateOnly, dueTime);
        if (!iso) {
          errs.dueDate = t("teacher.invalidDeadline");
        } else if (!isDeadlineInFuture(iso)) {
          errs.dueDate = t("teacher.deadlineFuture");
        } else {
          dueIso = iso;
        }
      }
    }

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    try {
      setSaving(true);
      const assignment = await assignmentApi.create(selectedClassId, {
        title: titleTrim || undefined,
        quizIds: selectedQuizIds,
        dueDate: dueIso,
        sendEmailResults,
      });
      setAssignmentTitle("");
      setSelectedQuizIds([]);
      setUseDeadline(false);
      setDueDateOnly(todayLocalDateString());
      setDueTime("23:59");
      setClasses((prev) =>
        prev.map((classroom) =>
          classroom.id === selectedClassId
            ? {
                ...classroom,
                assignments: [assignment, ...classroom.assignments],
              }
            : classroom,
        ),
      );
      setSuccess(t("teacher.assignmentCreated"));
    } catch (err: unknown) {
      setError(getApiMessage(err, t("teacher.error")));
    } finally {
      setSaving(false);
    }
  };

  const toggleQuiz = (quizId: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.quizzes;
      return next;
    });
    setSelectedQuizIds((prev) =>
      prev.includes(quizId)
        ? prev.filter((id) => id !== quizId)
        : [...prev, quizId],
    );
  };

  if (!hasHydrated || loading) {
    return (
      <main className={`${styles.container} ${styles.pageBg}`}>
        <div className={styles.loadingCenter}>
          <div className={styles.spinner} />
          <span>{t("teacher.loadingWorkspace")}</span>
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
              <div className={styles.heroBadge}>{t("teacher.badge")}</div>
              <h1 className={styles.title}>{t("teacher.title")}</h1>
              <p className={styles.subtitle}>{t("teacher.workspaceDesc")}</p>
            </div>
            <Link href="/quizzes" className={styles.secondaryButton}>
              {t("teacher.allQuizzes")}
            </Link>
            <Link href="/" className={styles.backLink}>
              {t("teacher.toSite")}
            </Link>
          </div>
        </header>

        {success && <div className={styles.successBanner}>{success}</div>}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.layout}>
          <aside className={`${styles.panel} ${styles.stack}`}>
            <p className={styles.sectionLabel}>{t("teacher.classesSection")}</p>
            <form onSubmit={createClassroom}>
              <div className={styles.field}>
                <label htmlFor="new-class-name">{t("teacher.newClass")}</label>
                <input
                  id="new-class-name"
                  value={className}
                  onChange={(event) => {
                    setClassName(event.target.value);
                    setFieldErrors((p) => {
                      const n = { ...p };
                      delete n.className;
                      return n;
                    });
                  }}
                  placeholder={t("teacher.createClassPlaceholder")}
                  maxLength={80}
                />
                {fieldErrors.className && (
                  <p className={styles.fieldError}>{fieldErrors.className}</p>
                )}
              </div>
              <button className={styles.button} type="submit" disabled={saving}>
                {t("teacher.createClassBtn")}
              </button>
            </form>

            {classes.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📚</div>
                <p className={styles.emptyTitle}>{t("teacher.noClassesYet")}</p>
                <p className={styles.meta}>{t("teacher.noClassesHint")}</p>
              </div>
            ) : (
              <div className={styles.tabs}>
                {classes.map((classroom) => (
                  <button
                    key={classroom.id}
                    type="button"
                    className={`${styles.tab} ${
                      classroom.id === selectedClassId ? styles.tabActive : ""
                    }`}
                    onClick={() => setSelectedClassId(classroom.id)}
                  >
                    <strong>{classroom.name}</strong>
                    <br />
                    <span className={styles.meta}>
                      {classroom.members.length}{" "}
                      {plural(classroom.members.length, {
                        one: "teacher.studentOne",
                        few: "teacher.studentFew",
                        many: "teacher.studentMany",
                      })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className={styles.stack}>
            {!selectedClass ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✨</div>
                <p className={styles.emptyTitle}>{t("teacher.startWithClass")}</p>
                <p className={styles.meta}>{t("teacher.startWithClassHint")}</p>
              </div>
            ) : (
              <>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h2 className={styles.cardTitle}>{selectedClass.name}</h2>
                      <p className={styles.meta}>
                        {t("teacher.joinCodeLabel")}{" "}
                        <span className={styles.code}>{selectedClass.code}</span>
                      </p>
                    </div>
                    <Link
                      href={`/teacher/classes/${selectedClass.id}`}
                      className={styles.linkButton}
                    >
                      {t("teacher.openClass")}
                    </Link>
                  </div>
                  <p className={styles.meta}>
                    <strong>{t("teacher.studentsLabel")}</strong>{" "}
                    {selectedClass.members.length
                      ? selectedClass.members
                          .map(
                            (member) =>
                              member.student.name || member.student.email,
                          )
                          .join(", ")
                      : t("teacher.noStudentsYet")}
                  </p>
                </div>

                <form className={styles.form} onSubmit={createAssignment}>
                  <p className={styles.sectionLabel}>
                    {t("teacher.newAssignment")}
                  </p>
                  <h2 className={styles.cardTitle}>
                    {t("teacher.assignmentForClass")}
                  </h2>
                  <p className={styles.meta}>{t("teacher.assignmentDesc")}</p>

                  <div className={styles.field}>
                    <label htmlFor="assign-title">
                      {t("teacher.titleOptional")}
                    </label>
                    <input
                      id="assign-title"
                      value={assignmentTitle}
                      onChange={(e) => {
                        setAssignmentTitle(e.target.value);
                        setFieldErrors((p) => {
                          const n = { ...p };
                          delete n.title;
                          return n;
                        });
                      }}
                      placeholder={t("teacher.titlePlaceholder")}
                      maxLength={120}
                    />
                    {fieldErrors.title && (
                      <p className={styles.fieldError}>{fieldErrors.title}</p>
                    )}
                  </div>

                  <label className={styles.toggleRow}>
                    <input
                      type="checkbox"
                      checked={useDeadline}
                      onChange={(e) => {
                        setUseDeadline(e.target.checked);
                        setFieldErrors((p) => {
                          const n = { ...p };
                          delete n.dueDate;
                          return n;
                        });
                        if (e.target.checked && !dueDateOnly) {
                          setDueDateOnly(todayLocalDateString());
                        }
                      }}
                    />
                    {t("teacher.setDeadline")}
                  </label>

                  {useDeadline && (
                    <>
                      <p className={styles.deadlineHint}>
                        {t("teacher.deadlineHint")}
                      </p>
                      <div className={styles.fieldRow}>
                        <div className={styles.field}>
                          <label htmlFor="due-date">
                            {t("teacher.dateLabel")}
                          </label>
                          <input
                            id="due-date"
                            type="date"
                            min={todayLocalDateString()}
                            value={dueDateOnly}
                            onChange={(e) => {
                              setDueDateOnly(e.target.value);
                              setFieldErrors((p) => {
                                const n = { ...p };
                                delete n.dueDate;
                                return n;
                              });
                            }}
                          />
                        </div>
                        <div className={styles.field}>
                          <label htmlFor="due-time">
                            {t("teacher.timeLabel")}
                          </label>
                          <input
                            id="due-time"
                            type="time"
                            value={dueTime}
                            onChange={(e) => {
                              setDueTime(e.target.value);
                              setFieldErrors((p) => {
                                const n = { ...p };
                                delete n.dueDate;
                                return n;
                              });
                            }}
                          />
                        </div>
                      </div>
                      {fieldErrors.dueDate && (
                        <p className={styles.fieldError}>{fieldErrors.dueDate}</p>
                      )}
                    </>
                  )}

                  <p className={styles.sectionLabel}>{t("header.quizzes")}</p>
                  <div className={styles.checkList}>
                    {quizzes.map((quiz) => {
                      const selected = selectedQuizIds.includes(quiz.id);
                      return (
                        <label
                          key={quiz.id}
                          className={`${styles.checkItem} ${
                            selected ? styles.checkItemSelected : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleQuiz(quiz.id)}
                          />
                          <span className={styles.quizPickIcon}>
                            {quiz.icon || "📝"}
                          </span>
                          <span className={styles.quizPickText}>
                            <span className={styles.quizPickTitle}>
                              {quiz.title}
                            </span>
                            <span className={styles.quizPickMeta}>
                              {quiz.questionsCount}{" "}
                              {plural(quiz.questionsCount, {
                                one: "common.questionOne",
                                few: "common.questionFew",
                                many: "common.questionMany",
                              })}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {fieldErrors.quizzes && (
                    <p className={styles.fieldError}>{fieldErrors.quizzes}</p>
                  )}

                  <label className={styles.toggleRow}>
                    <input
                      type="checkbox"
                      checked={sendEmailResults}
                      onChange={(e) => setSendEmailResults(e.target.checked)}
                    />
                    {t("teacher.emailAfterSubmit")}
                  </label>

                  <button
                    className={styles.button}
                    type="submit"
                    disabled={saving || selectedQuizIds.length === 0}
                  >
                    {t("teacher.assignBtn")}
                  </button>
                </form>

                <AssignmentList assignments={selectedClass.assignments} />
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function AssignmentList({ assignments }: { assignments: QuizAssignment[] }) {
  const { t } = useI18n();

  if (assignments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>
        <p className={styles.emptyTitle}>{t("teacher.noAssignmentsYet")}</p>
        <p className={styles.meta}>{t("teacher.noAssignmentsHint")}</p>
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <p className={styles.sectionLabel}>{t("teacher.activeAssignments")}</p>
      {assignments.map((assignment) => (
        <div key={assignment.id} className={styles.card}>
          <div className={styles.assignRow}>
            <div className={styles.assignMeta}>
              <h3 className={styles.cardTitle}>{assignment.title}</h3>
              <p className={styles.meta}>
                {assignment.items.map((item) => item.quiz.title).join(" → ")}
              </p>
              <span
                className={`${styles.statusPill} ${
                  assignment.attempts.length
                    ? styles.statusDone
                    : styles.statusTodo
                }`}
              >
                {assignment.attempts.length
                  ? t("teacher.submittedCount", {
                      count: assignment.attempts.length,
                    })
                  : t("teacher.awaitingSubmit")}
              </span>
            </div>
            <Link
              href={`/teacher/assignments/${assignment.id}/results`}
              className={styles.linkButton}
            >
              {t("teacher.resultsJournal")}
            </Link>
          </div>
          <p className={styles.meta}>
            {assignment.dueDate
              ? t("teacher.deadlineAt", {
                  date: new Date(assignment.dueDate).toLocaleString(),
                })
              : t("teacher.noDeadline")}
          </p>
        </div>
      ))}
    </div>
  );
}
