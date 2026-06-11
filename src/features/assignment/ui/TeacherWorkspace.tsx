"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/src/entities/user";
import { assignmentApi, classroomApi, quizApi, proseApi, readingAssignmentApi } from "@/src/shared/api";
import type { Classroom, QuizAssignment } from "@/src/shared/types/assignment.types";
import type { ProseWorkListItem, ReadingAssignment } from "@/src/shared/types/prose.types";
import type { QuizListItem } from "@/src/shared/types/quiz.types";
import {
  isDeadlineInFuture,
  localDateTimeToIso,
  todayLocalDateString,
} from "../lib/deadline";
import styles from "./Assignment.module.css";

interface TeacherWorkspaceProps {
  initialClassId?: string;
}

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

export function TeacherWorkspace({ initialClassId }: TeacherWorkspaceProps) {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useUserStore();
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [proseWorks, setProseWorks] = useState<ProseWorkListItem[]>([]);
  const [readingAssignments, setReadingAssignments] = useState<ReadingAssignment[]>([]);
  const [selectedProseId, setSelectedProseId] = useState<number | null>(null);
  const [readingTitle, setReadingTitle] = useState("");
  const [readingUseDeadline, setReadingUseDeadline] = useState(false);
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
    const t = window.setTimeout(() => setSuccess(null), 4500);
    return () => window.clearTimeout(t);
  }, [success]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [classroomsData, quizzesData, proseData] = await Promise.all([
        classroomApi.getMy(),
        quizApi.getAll(),
        proseApi.getAll(),
      ]);

      setClasses(classroomsData);
      setQuizzes(quizzesData);
      setProseWorks(proseData);
      setSelectedClassId(
        initialClassId || classroomsData[0]?.id || selectedClassId,
      );
      setDueDateOnly(todayLocalDateString());
    } catch (err: unknown) {
      setError(getApiMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const createClassroom = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    const name = className.trim();
    if (name.length < 2) {
      setFieldErrors({
        className: "Назва класа — мінімум 2 сімвалы",
      });
      return;
    }

    try {
      setSaving(true);
      const classroom = await classroomApi.create({ name });
      setClassName("");
      setClasses((prev) => [classroom, ...prev]);
      setSelectedClassId(classroom.id);
      setSuccess("Клас створаны");
    } catch (err: unknown) {
      setFieldErrors({ className: getApiMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const createAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setError(null);

    if (!selectedClassId) {
      setError("Абярыце клас");
      return;
    }

    const errs: Record<string, string> = {};

    if (selectedQuizIds.length === 0) {
      errs.quizzes = "Абярыце хаця б адзін квіз";
    }

    const titleTrim = assignmentTitle.trim();
    if (titleTrim.length > 120) {
      errs.title = "Назва задання — не больш за 120 сімвалаў";
    }

    let dueIso: string | undefined;
    if (useDeadline) {
      if (!dueDateOnly.trim()) {
        errs.dueDate = "Абярыце дату дэдлайна";
      } else {
        const iso = localDateTimeToIso(dueDateOnly, dueTime);
        if (!iso) {
          errs.dueDate = "Некарэктная дата або час";
        } else if (!isDeadlineInFuture(iso)) {
          errs.dueDate =
            "Дэдлайн павінен быць у будучыні (мінімум на 1 хвіліну ад цяперашняга часу)";
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
      setSuccess("Заданне прызначана");
    } catch (err: unknown) {
      setError(getApiMessage(err));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!selectedClassId || user?.role !== "TEACHER") return;
    void readingAssignmentApi
      .getForClassroom(selectedClassId)
      .then(setReadingAssignments)
      .catch(() => setReadingAssignments([]));
  }, [selectedClassId, user?.role, success]);

  const createReadingAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setError(null);

    if (!selectedClassId) {
      setError("Абярыце клас");
      return;
    }
    if (!selectedProseId) {
      setFieldErrors({ prose: "Абярыце твор для чытання" });
      return;
    }

    let dueIso: string | undefined;
    if (readingUseDeadline && dueDateOnly.trim()) {
      const iso = localDateTimeToIso(dueDateOnly, dueTime);
      if (!iso) {
        setFieldErrors({ dueDate: "Некарэктная дата" });
        return;
      }
      dueIso = iso;
      if (!isDeadlineInFuture(dueIso)) {
        setFieldErrors({ dueDate: "Дэдлайн павінен быць у будучыні" });
        return;
      }
    }

    try {
      setSaving(true);
      await readingAssignmentApi.create(selectedClassId, {
        proseWorkId: selectedProseId,
        title: readingTitle.trim() || undefined,
        dueDate: dueIso,
      });
      setReadingTitle("");
      setSelectedProseId(null);
      setSuccess("Абавязковае чытанне прызначана");
      const list = await readingAssignmentApi.getForClassroom(selectedClassId);
      setReadingAssignments(list);
    } catch (err: unknown) {
      setError(getApiMessage(err));
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
          <span>Загрузка кабінета…</span>
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
              <div className={styles.heroBadge}>Настаўнік</div>
              <h1 className={styles.title}>Кабінет настаўніка</h1>
              <p className={styles.subtitle}>
                Стварайце класы з кодам падключэння, абірайце адзін або некалькі
                квізаў у адным заданні — вучань прайдзе іх запар, вынік і адзнака
                захоўваюцца ў журнале.
              </p>
            </div>
            <Link href="/quizzes" className={styles.secondaryButton}>
              Усе квізы
            </Link>
            <Link href="/" className={styles.backLink}>
              На сайт
            </Link>
          </div>
        </header>

        {success && <div className={styles.successBanner}>{success}</div>}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.layout}>
          <aside className={`${styles.panel} ${styles.stack}`}>
            <p className={styles.sectionLabel}>Класы</p>
            <form onSubmit={createClassroom}>
              <div className={styles.field}>
                <label htmlFor="new-class-name">Новы клас</label>
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
                  placeholder="Напрыклад: 8 «А»"
                  maxLength={80}
                />
                {fieldErrors.className && (
                  <p className={styles.fieldError}>{fieldErrors.className}</p>
                )}
              </div>
              <button className={styles.button} type="submit" disabled={saving}>
                Стварыць клас
              </button>
            </form>

            {classes.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📚</div>
                <p className={styles.emptyTitle}>Пакуль няма класаў</p>
                <p className={styles.meta}>
                  Стварыце першы клас — з&apos;явіцца код для вучняў.
                </p>
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
                      {classroom.members.length === 1
                        ? "вучань"
                        : "вучняў"}
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
                <p className={styles.emptyTitle}>Пачніце з класа</p>
                <p className={styles.meta}>
                  Стварыце клас у бакавой панэлі, каб прызначаць квізы.
                </p>
              </div>
            ) : (
              <>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h2 className={styles.cardTitle}>{selectedClass.name}</h2>
                      <p className={styles.meta}>
                        Код падключэння:{" "}
                        <span className={styles.code}>{selectedClass.code}</span>
                      </p>
                    </div>
                    <Link
                      href={`/teacher/classes/${selectedClass.id}`}
                      className={styles.linkButton}
                    >
                      Адкрыць клас
                    </Link>
                  </div>
                  <p className={styles.meta}>
                    <strong>Вучні:</strong>{" "}
                    {selectedClass.members.length
                      ? selectedClass.members
                          .map(
                            (member) =>
                              member.student.name || member.student.email,
                          )
                          .join(", ")
                      : "пакуль ніхто не далучыўся — адпраўце код"}
                  </p>
                </div>

                <form className={styles.form} onSubmit={createAssignment}>
                  <p className={styles.sectionLabel}>Новае заданне</p>
                  <h2 className={styles.cardTitle}>Квізы для класа</h2>
                  <p className={styles.meta}>
                    Абярыце адзін або некалькі квізаў — вучань прайдзе іх
                    паслядоўна, а вынік будзе адзін на ўсё заданне.
                  </p>

                  <div className={styles.field}>
                    <label htmlFor="assign-title">Назва (неабавязкова)</label>
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
                      placeholder="Калі пуста — возьмем назву першага квіза"
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
                    Указаць дэдлайн
                  </label>

                  {useDeadline && (
                    <>
                      <p className={styles.deadlineHint}>
                        Каляндар і час працуюць асобна — так надзейней, чым адно
                        поле ў браўзеры. Дэдлайн павінен быць у будучыні.
                      </p>
                      <div className={styles.fieldRow}>
                        <div className={styles.field}>
                          <label htmlFor="due-date">Дата</label>
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
                          <label htmlFor="due-time">Час</label>
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

                  <p className={styles.sectionLabel}>Квізы</p>
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
                              {quiz.questionsCount === 1
                                ? "пытанне"
                                : "пытанняў"}
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
                      onChange={(e) =>
                        setSendEmailResults(e.target.checked)
                      }
                    />
                    Адправіць вынік на email вучню пасля здачы
                  </label>

                  <button
                    className={styles.button}
                    type="submit"
                    disabled={saving || selectedQuizIds.length === 0}
                  >
                    Прызначыць заданне
                  </button>
                </form>

                <form className={styles.form} onSubmit={createReadingAssignment}>
                  <p className={styles.sectionLabel}>Абавязковае чытанне</p>
                  <h2 className={styles.cardTitle}>Прадзенне для класа</h2>
                  <p className={styles.meta}>
                    Абярыце паэму, apaved або раман — вучні прачитаюць яго ў
                    зручнай читалке на сайце.
                  </p>

                  <div className={styles.field}>
                    <label htmlFor="reading-title">Назва (неабавязкова)</label>
                    <input
                      id="reading-title"
                      value={readingTitle}
                      onChange={(e) => setReadingTitle(e.target.value)}
                      placeholder="Напрыклад: прачитайце «Новая зямля»"
                      maxLength={120}
                    />
                  </div>

                  <p className={styles.sectionLabel}>Твор</p>
                  <div className={styles.checkList}>
                    {proseWorks.map((work) => (
                      <label
                        key={work.id}
                        className={`${styles.checkItem} ${
                          selectedProseId === work.id
                            ? styles.checkItemSelected
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="prose-work"
                          checked={selectedProseId === work.id}
                          onChange={() => setSelectedProseId(work.id)}
                        />
                        <span>
                          <strong>{work.title}</strong>
                          <br />
                          <span className={styles.meta}>
                            {work.author?.name} · {work.chapterCount} част.
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {fieldErrors.prose && (
                    <p className={styles.fieldError}>{fieldErrors.prose}</p>
                  )}

                  <label className={styles.toggleRow}>
                    <input
                      type="checkbox"
                      checked={readingUseDeadline}
                      onChange={(e) => setReadingUseDeadline(e.target.checked)}
                    />
                    Указаць тэрмін чытання
                  </label>

                  {readingUseDeadline && (
                    <div className={styles.fieldRow}>
                      <div className={styles.field}>
                        <label htmlFor="reading-due-date">Дата</label>
                        <input
                          id="reading-due-date"
                          type="date"
                          min={todayLocalDateString()}
                          value={dueDateOnly}
                          onChange={(e) => setDueDateOnly(e.target.value)}
                        />
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="reading-due-time">Час</label>
                        <input
                          id="reading-due-time"
                          type="time"
                          value={dueTime}
                          onChange={(e) => setDueTime(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    className={styles.button}
                    type="submit"
                    disabled={saving || !selectedProseId}
                  >
                    Прызначыць чытанне
                  </button>
                </form>

                {readingAssignments.length > 0 && (
                  <div className={styles.stack}>
                    <p className={styles.sectionLabel}>Чытанне для класа</p>
                    {readingAssignments.map((ra) => (
                      <div key={ra.id} className={styles.card}>
                        <h3 className={styles.cardTitle}>{ra.title}</h3>
                        <p className={styles.meta}>
                          {ra.proseWork.title} ·{" "}
                          {ra.progress?.length ?? 0} вуч. з праgresam
                        </p>
                        {ra.dueDate && (
                          <p className={styles.meta}>
                            Тэрмін:{" "}
                            {new Date(ra.dueDate).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

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
  if (assignments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>
        <p className={styles.emptyTitle}>Заданняў пакуль няма</p>
        <p className={styles.meta}>
          Пасля прызначэння тут з&apos;явіцца спіс і спасылка на журнал.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <p className={styles.sectionLabel}>Актыўныя заданні</p>
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
                  ? `Здадзена: ${assignment.attempts.length}`
                  : "Чакае здачы"}
              </span>
            </div>
            <Link
              href={`/teacher/assignments/${assignment.id}/results`}
              className={styles.linkButton}
            >
              Журнал вынікаў
            </Link>
          </div>
          <p className={styles.meta}>
            {assignment.dueDate
              ? `Дэдлайн: ${new Date(assignment.dueDate).toLocaleString()}`
              : "Без дэдлайна"}
          </p>
        </div>
      ))}
    </div>
  );
}
