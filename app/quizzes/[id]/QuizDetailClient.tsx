"use client";

import { useQuiz } from "@/src/features/quiz";
import { LoadingState, ErrorState } from "@/src/shared/ui";
import QuizGame from "@/components/Quiz/QuizGame";
import { useI18n } from "@/src/shared/i18n";

interface QuizDetailClientProps {
  id: string;
}

export function QuizDetailClient({ id }: QuizDetailClientProps) {
  const { t } = useI18n();
  const { data: quiz, isLoading, error } = useQuiz(id);

  if (isLoading) {
    return <LoadingState text={t("quizzesPage.loadingQuiz")} />;
  }

  if (error || !quiz) {
    return <ErrorState message={t("quizzesPage.notFound")} />;
  }

  return <QuizGame quiz={quiz} />;
}
