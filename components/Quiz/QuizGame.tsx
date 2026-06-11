"use client";

import { useState } from "react";
import Link from "next/link";
import type { AnswerDto, QuizPublic } from "@/src/shared/types/quiz.types";
import MatchQuiz from "./MatchQuiz";
import TimelineQuiz from "./TimelineQuiz";
import FillQuiz from "./FillQuiz";
import QuizResults from "./QuizResults";
import { useI18n } from "@/src/shared/i18n";
import styles from "./QuizGame.module.css";

interface QuizGameProps {
  quiz: QuizPublic;
  backHref?: string;
  backLabel?: string;
  showResults?: boolean;
  onComplete?: (payload: {
    answers: AnswerDto[];
    results: Record<string, Record<string, boolean>>;
  }) => Promise<void> | void;
}

export default function QuizGame({
  quiz,
  backHref = "/quizzes",
  backLabel,
  showResults = true,
  onComplete,
}: QuizGameProps) {
  const { t } = useI18n();
  const resolvedBackLabel = backLabel ?? t("quiz.backToQuizzes");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [answers, setAnswers] = useState<Record<string, AnswerDto[]>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleQuestionComplete = (
    questionId: string,
    itemResults: Record<string, boolean>,
    questionAnswers: AnswerDto[],
  ) => {
    const nextResults = {
      ...results,
      [questionId]: itemResults,
    };
    const nextAnswers = {
      ...answers,
      [questionId]: questionAnswers,
    };

    setResults(nextResults);
    setAnswers(nextAnswers);

    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 1500);
    } else {
      setTimeout(async () => {
        setCompletionError(null);
        setIsCompleting(true);

        try {
          await onComplete?.({
            answers: Object.values(nextAnswers).flat(),
            results: nextResults,
          });
          setIsFinished(true);
        } catch (error: any) {
          setCompletionError(
            error?.response?.data?.message ||
              error?.message ||
              t("quiz.saveResultError"),
          );
        } finally {
          setIsCompleting(false);
        }
      }, 1500);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setResults({});
    setAnswers({});
    setIsFinished(false);
    setCompletionError(null);
  };

  if (isCompleting) {
    return (
      <main className={styles.container}>{t("quiz.savingResult")}</main>
    );
  }

  if (completionError) {
    return (
      <main className={styles.container}>
        <div className={styles.content}>{completionError}</div>
      </main>
    );
  }

  if (isFinished) {
    if (!showResults) return null;

    return (
      <QuizResults quiz={quiz} results={results} onRestart={handleRestart} />
    );
  }

  return (
    <main
      className={styles.container}
      style={{ "--quiz-color": quiz.color } as React.CSSProperties}
    >
      <div className={styles.header}>
        <Link href={backHref} className={styles.backLink}>
          ← {resolvedBackLabel}
        </Link>
        <div className={styles.progressContainer}>
          <div className={styles.progressInfo}>
            <span className={styles.quizIcon}>{quiz.icon}</span>
            <span className={styles.quizTitle}>{quiz.title}</span>
            <span className={styles.questionCounter}>
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.questionText}>{currentQuestion.text}</h2>

        {currentQuestion.type === "MATCH" && (
          <MatchQuiz
            key={currentQuestion.id}
            question={currentQuestion}
            color={quiz.color}
            onComplete={(itemResults, questionAnswers) =>
              handleQuestionComplete(
                currentQuestion.id,
                itemResults,
                questionAnswers,
              )
            }
          />
        )}

        {currentQuestion.type === "ORDER" && (
          <TimelineQuiz
            key={currentQuestion.id}
            question={currentQuestion}
            color={quiz.color}
            onComplete={(itemResults, questionAnswers) =>
              handleQuestionComplete(
                currentQuestion.id,
                itemResults,
                questionAnswers,
              )
            }
          />
        )}

        {currentQuestion.type === "FILL" && (
          <FillQuiz
            key={currentQuestion.id}
            question={currentQuestion}
            color={quiz.color}
            onComplete={(itemResults, questionAnswers) =>
              handleQuestionComplete(
                currentQuestion.id,
                itemResults,
                questionAnswers,
              )
            }
          />
        )}
      </div>
    </main>
  );
}
