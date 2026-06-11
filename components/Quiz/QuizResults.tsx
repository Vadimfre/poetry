"use client";

import Link from "next/link";
import type { QuizPublic } from "@/src/shared/types/quiz.types";
import { useI18n } from "@/src/shared/i18n";
import styles from "./QuizResults.module.css";

interface QuizResultsProps {
  quiz: QuizPublic;
  results: Record<string, Record<string, boolean>>;
  onRestart: () => void;
}

export default function QuizResults({
  quiz,
  results,
  onRestart,
}: QuizResultsProps) {
  const { t } = useI18n();

  // Calculate total score
  let totalCorrect = 0;
  let totalItems = 0;

  Object.values(results).forEach((questionResults) => {
    Object.values(questionResults).forEach((isCorrect) => {
      totalItems++;
      if (isCorrect) totalCorrect++;
    });
  });

  const percentage = Math.round((totalCorrect / totalItems) * 100);

  const getMessage = () => {
    if (percentage === 100)
      return { emoji: "🏆", text: t("quiz.resultPerfect") };
    if (percentage >= 80)
      return { emoji: "🌟", text: t("quiz.resultGreat") };
    if (percentage >= 60)
      return { emoji: "👍", text: t("quiz.resultGood") };
    if (percentage >= 40)
      return { emoji: "📚", text: t("quiz.resultOk") };
    return { emoji: "💪", text: t("quiz.resultTryAgain") };
  };

  const message = getMessage();

  return (
    <main
      className={styles.container}
      style={{ "--quiz-color": quiz.color } as React.CSSProperties}
    >
      <div className={styles.content}>
        <div className={styles.resultCard}>
          <div className={styles.emoji}>{message.emoji}</div>

          <h1 className={styles.title}>{t("quiz.result")}</h1>

          <div className={styles.scoreCircle}>
            <svg className={styles.circleSvg} viewBox="0 0 100 100">
              <circle
                className={styles.circleBackground}
                cx="50"
                cy="50"
                r="45"
              />
              <circle
                className={styles.circleProgress}
                cx="50"
                cy="50"
                r="45"
                style={{
                  strokeDasharray: `${percentage * 2.83} 283`,
                }}
              />
            </svg>
            <div className={styles.scoreText}>
              <span className={styles.percentage}>{percentage}%</span>
              <span className={styles.fraction}>
                {totalCorrect}/{totalItems}
              </span>
            </div>
          </div>

          <p className={styles.message}>{message.text}</p>

          <div className={styles.quizInfo}>
            <span className={styles.quizIcon}>{quiz.icon}</span>
            <span className={styles.quizTitle}>{quiz.title}</span>
          </div>

          <div className={styles.actions}>
            <button className={styles.restartButton} onClick={onRestart}>
              <span className={styles.buttonIcon}>🔄</span>
              {t("quiz.tryAgain")}
            </button>

            <Link href="/quizzes" className={styles.backButton}>
              <span className={styles.buttonIcon}>📋</span>
              {t("quiz.allQuizzes")}
            </Link>
          </div>
        </div>

        <div className={styles.confetti}>
          {percentage >= 80 && (
            <>
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={styles.confettiPiece}
                  style={
                    {
                      "--delay": `${Math.random() * 2}s`,
                      "--x": `${Math.random() * 100}%`,
                      "--rotation": `${Math.random() * 360}deg`,
                      "--color": [
                        "#FF6B6B",
                        "#4ECDC4",
                        "#A78BFA",
                        "#FFE66D",
                        "#95E1D3",
                      ][Math.floor(Math.random() * 5)],
                    } as React.CSSProperties
                  }
                />
              ))}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
