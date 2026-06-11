"use client";

import { useState, useCallback, useMemo, useRef } from "react";

import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
  type DragMoveEvent,
} from "@dnd-kit/core";

import type {
  AnswerDto,
  QuizQuestionPublic,
} from "@/src/shared/types/quiz.types";

import { useTimelinePosition } from "@/src/features/quiz/hooks";

import { useI18n, usePlural } from "@/src/shared/i18n";

import {
  PoetBubble,
  PoetBubbleOverlay,
  PlacedPoet,
  CheckButton,
} from "@/src/features/quiz/ui";

import styles from "./TimelineQuiz.module.css";

interface TimelineQuizProps {
  question: QuizQuestionPublic;

  color: string | null;

  onComplete: (
    itemResults: Record<string, boolean>,
    answers: AnswerDto[],
  ) => void;
}

export default function TimelineQuiz({
  question,

  color,

  onComplete,
}: TimelineQuizProps) {
  const { t } = useI18n();
  const plural = usePlural();
  const content = question.content as Record<string, any> | null;

  const timelineStart = content?.timelineStart ?? 1800;

  const timelineEnd = content?.timelineEnd ?? 1900;

  const [placements, setPlacements] = useState<Record<string, number>>({});

  const [results, setResults] = useState<Record<string, boolean>>({});

  const [isChecked, setIsChecked] = useState(false);

  const [activeId, setActiveId] = useState<string | null>(null);

  const startPointerPositionRef = useRef<{ x: number; y: number } | null>(null);
  const lastPointerPositionRef = useRef<{ x: number; y: number } | null>(null);

  const {
    timelineRef,

    hoverYear,

    calculateYearFromPosition,

    calculatePositionFromYear,

    isWithinTimeline,

    updateHoverYear,

    clearHoverYear,

    generateMarkers,

    captureTimelineRect,

    clearTimelineRect,
  } = useTimelinePosition({ timelineStart, timelineEnd });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const markers = useMemo(() => generateMarkers(5), [generateMarkers]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveId(event.active.id as string);

      captureTimelineRect();

      const pointerEvent = event.activatorEvent as PointerEvent;

      startPointerPositionRef.current = {
        x: pointerEvent.clientX,
        y: pointerEvent.clientY,
      };

      lastPointerPositionRef.current = startPointerPositionRef.current;
    },
    [captureTimelineRect],
  );

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const startPointerPosition = startPointerPositionRef.current;

      if (!startPointerPosition) return;

      const x = startPointerPosition.x + event.delta.x;
      const y = startPointerPosition.y + event.delta.y;

      lastPointerPositionRef.current = { x, y };

      updateHoverYear(x);
    },

    [updateHoverYear],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);

      clearHoverYear();

      clearTimelineRect();

      const lastPointerPosition = lastPointerPositionRef.current;

      startPointerPositionRef.current = null;
      lastPointerPositionRef.current = null;

      if (isChecked) return;

      const { active } = event;

      const finalX = lastPointerPosition?.x;

      const finalY = lastPointerPosition?.y;

      if (finalX === undefined || finalY === undefined) return;

      if (isWithinTimeline(finalX, finalY)) {
        const year = calculateYearFromPosition(finalX);

        if (year !== null) {
          setPlacements((prev) => ({
            ...prev,

            [active.id as string]: year,
          }));
        }
      }
    },

    [
      isChecked,
      isWithinTimeline,
      calculateYearFromPosition,
      clearHoverYear,
      clearTimelineRect,
    ],
  );

  const handleRemovePoet = useCallback(
    (itemId: string) => {
      if (isChecked) return;

      setPlacements((prev) => {
        const newPlacements = { ...prev };

        delete newPlacements[itemId];

        return newPlacements;
      });
    },

    [isChecked],
  );

  const handleCheck = useCallback(() => {
    const itemResults: Record<string, boolean> = {};

    // Check: placed year must be within ±5 of correct year

    question.items.forEach((item) => {
      const placedYear = placements[item.id];

      if (placedYear !== undefined && item.year !== null) {
        itemResults[item.id] = Math.abs(placedYear - item.year) <= 5;
      } else {
        itemResults[item.id] = false;
      }
    });

    setResults(itemResults);

    setIsChecked(true);

    onComplete(
      itemResults,
      Object.entries(placements).map(([itemId, year]) => ({
        questionId: question.id,
        itemId,
        order: year,
      })),
    );
  }, [placements, question.items, onComplete]);

  const placedCount = Object.keys(placements).length;

  const allPlaced = placedCount === question.items.length;

  const remainingCount = question.items.length - placedCount;

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return question.items.find((item) => item.id === activeId) ?? null;
  }, [activeId, question.items]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.container}>
        <div className={styles.instructions}>
          <span className={styles.icon}>📅</span>

          <span>{t("quiz.timelineHint")}</span>
        </div>

        <div className={styles.timelineSection}>
          <div className={styles.timelineWrapper} ref={timelineRef}>
            <div
              className={styles.timeline}
              style={{ "--timeline-color": color } as React.CSSProperties}
            >
              {/* Year markers */}

              {markers.map((year, index) => (
                <div
                  key={year}
                  className={styles.marker}
                  style={{ left: `${(index / (markers.length - 1)) * 100}%` }}
                >
                  <div className={styles.markerTick} />

                  <span className={styles.markerYear}>{year}</span>
                </div>
              ))}

              {/* Hover indicator */}

              {activeId && hoverYear !== null && (
                <div
                  className={styles.hoverIndicator}
                  style={{
                    left: `${calculatePositionFromYear(hoverYear)}%`,
                  }}
                >
                  <span className={styles.hoverYear}>{hoverYear}</span>

                  <div className={styles.hoverLine} />
                </div>
              )}

              {/* Placed poets */}

              {question.items.map((item) => {
                const placedYear = placements[item.id];

                if (placedYear === undefined) return null;

                return (
                  <PlacedPoet
                    key={item.id}
                    name={item.content}
                    placedYear={placedYear}
                    positionPercent={calculatePositionFromYear(placedYear)}
                    correctYear={item.year ?? undefined}
                    isChecked={isChecked}
                    isCorrect={isChecked ? results[item.id] : null}
                    color={color ?? undefined}
                    onClick={() => handleRemovePoet(item.id)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.poetsPool}>
          {question.items.map((item) => (
            <PoetBubble
              key={item.id}
              id={item.id}
              name={item.content}
              color={color}
              isPlaced={item.id in placements}
              disabled={isChecked}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem ? (
            <PoetBubbleOverlay
              id={activeItem.id}
              name={activeItem.content}
              subtitle={undefined}
              color={color ?? undefined}
            />
          ) : null}
        </DragOverlay>

        {!isChecked && (
          <div className={styles.actions}>
            <CheckButton
              onClick={handleCheck}
              disabled={!allPlaced}
              color={color}
            >
              {allPlaced
                ? t("quiz.check")
                : t("quiz.remaining", {
                    count: `${remainingCount} ${plural(remainingCount, {
                      one: "quiz.poetOne",
                      few: "quiz.poetFew",
                      many: "quiz.poetMany",
                    })}`,
                  })}
            </CheckButton>
          </div>
        )}
      </div>
    </DndContext>
  );
}
