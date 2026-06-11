"use client";

import Link from "next/link";
import styles from "./Quiz.module.css";
import { useQuizzes } from "@/src/features/quiz";
import { useI18n, usePlural } from "@/src/shared/i18n";

export function QuizListClient() {
  const { t } = useI18n();
  const plural = usePlural();
  const { data: quizzesList, isLoading, error } = useQuizzes();

  if (isLoading) {
    return <div>{t("common.loading")}</div>;
  }

  if (error || !quizzesList) {
    return <div>{t("quizzesPage.error")}</div>;
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← {t("common.back")}
        </Link>
        <h1 className={styles.title}>{t("quizzesPage.title")}</h1>
        <p className={styles.subtitle}>{t("quizzesPage.subtitle")}</p>
      </div>

      <div className={styles.grid}>
        {quizzesList.map((quiz, index) => (
          <Link
            key={quiz.id}
            href={`/quizzes/${quiz.id}`}
            className={styles.card}
            style={
              {
                "--card-color": quiz.color,
                "--card-delay": `${index * 0.1}s`,
              } as React.CSSProperties
            }
          >
            <div className={styles.cardIcon}>{quiz.icon}</div>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>{quiz.title}</h2>
              <p className={styles.cardDescription}>{quiz.description}</p>
              <div className={styles.cardMeta}>
                <span className={styles.questionCount}>
                  {quiz.questionsCount}{" "}
                  {plural(quiz.questionsCount, {
                    one: "common.questionOne",
                    few: "common.questionFew",
                    many: "common.questionMany",
                  })}
                </span>
                <span className={styles.playButton}>{t("quizzesPage.play")}</span>
              </div>
            </div>
            <div className={styles.cardGlow} />
          </Link>
        ))}
      </div>
    </main>
  );
}
