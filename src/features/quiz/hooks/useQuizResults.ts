"use client";

import { useState, useCallback, useMemo } from "react";

export interface UseQuizResultsOptions {
  checkAnswer: (itemId: string, target: string | number) => boolean;
  onComplete: (results: Record<string, boolean>) => void;
  totalItems: number;
}

export function useQuizResults({
  checkAnswer,
  onComplete,
  totalItems,
}: UseQuizResultsOptions) {
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [isChecked, setIsChecked] = useState(false);

  const checkAllAnswers = useCallback(
    (placements: Record<string, string | number>) => {
      const itemResults: Record<string, boolean> = {};

      Object.entries(placements).forEach(([itemId, target]) => {
        itemResults[itemId] = checkAnswer(itemId, target);
      });

      setResults(itemResults);
      setIsChecked(true);
      onComplete(itemResults);
    },
    [checkAnswer, onComplete],
  );

  const correctCount = useMemo(
    () => Object.values(results).filter(Boolean).length,
    [results],
  );

  const incorrectCount = useMemo(
    () => Object.values(results).filter((v) => v === false).length,
    [results],
  );

  const getResult = useCallback(
    (itemId: string): boolean | null => {
      if (!isChecked) return null;
      return results[itemId] ?? null;
    },
    [isChecked, results],
  );

  const reset = useCallback(() => {
    setResults({});
    setIsChecked(false);
  }, []);

  return {
    results,
    isChecked,
    checkAllAnswers,
    correctCount,
    incorrectCount,
    getResult,
    reset,
  };
}
