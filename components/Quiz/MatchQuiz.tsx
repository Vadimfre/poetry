"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type {
  AnswerDto,
  QuizQuestionPublic,
  QuizItemPublic,
} from "@/src/shared/types/quiz.types";
import { getPlacedItemForZone } from "@/src/features/quiz/lib";
import { useI18n, usePlural } from "@/src/shared/i18n";
import { CheckButton } from "@/src/features/quiz/ui";
import styles from "./MatchQuiz.module.css";

interface MatchQuizProps {
  question: QuizQuestionPublic;
  color: string | null;
  onComplete: (
    itemResults: Record<string, boolean>,
    answers: AnswerDto[],
  ) => void;
}

interface DraggableAuthorProps {
  item: QuizItemPublic;
  color: string | null;
  isPlaced: boolean;
  disabled: boolean;
}

function DraggableAuthor({
  item,
  color,
  isPlaced,
  disabled,
}: DraggableAuthorProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: item.id,
      disabled: isPlaced || disabled,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    "--item-color": color,
  } as React.CSSProperties;

  if (isPlaced) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${styles.author} ${isDragging ? styles.dragging : ""}`}
    >
      {item.content}
    </div>
  );
}

interface DropZoneProps {
  zone: { id: string; content: string };
  color: string | null;
  placedItem: QuizItemPublic | null;
  isCorrect: boolean | null;
  isChecked: boolean;
  onRemove: () => void;
}

function DropZone({
  zone,
  color,
  placedItem,
  isCorrect,
  isChecked,
  onRemove,
}: DropZoneProps) {
  const { t } = useI18n();
  const { setNodeRef, isOver } = useDroppable({ id: zone.id });

  const handleClick = () => {
    if (placedItem && !isChecked) {
      onRemove();
    }
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      style={{ "--zone-color": color } as React.CSSProperties}
      className={`
        ${styles.zone}
        ${isOver ? styles.over : ""}
        ${isChecked && isCorrect === true ? styles.correct : ""}
        ${isChecked && isCorrect === false ? styles.incorrect : ""}
        ${placedItem && !isChecked ? styles.clickable : ""}
      `}
    >
      <span className={styles.zoneLabel}>{zone.content}</span>
      <div className={styles.zoneSlot}>
        {placedItem ? (
          <div className={styles.placedAuthor}>
            {placedItem.content}
            {isChecked && (
              <span className={styles.resultIcon}>{isCorrect ? "✓" : "✗"}</span>
            )}
          </div>
        ) : (
          <span className={styles.placeholder}>{t("quiz.dragHere")}</span>
        )}
      </div>
    </div>
  );
}

export default function MatchQuiz({
  question,
  color,
  onComplete,
}: MatchQuizProps) {
  const { t } = useI18n();
  const plural = usePlural();
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [isChecked, setIsChecked] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const availableItems = useMemo(
    () => question.items.filter((item) => !(item.id in placements)),
    [question.items, placements],
  );

  const allItemsSame = useMemo(
    () =>
      question.items.length > 1 &&
      question.items.every(
        (item) => item.content === question.items[0]?.content,
      ),
    [question.items],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    // No overlay needed
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (isChecked) return;

      const { active, over } = event;
      if (!over) return;

      const itemId = active.id as string;
      const zoneId = over.id as string;

      setPlacements((prev) => {
        const newPlacements = { ...prev };
        // Remove any item already in this zone
        Object.entries(newPlacements).forEach(([iId, zId]) => {
          if (zId === zoneId) delete newPlacements[iId];
        });
        newPlacements[itemId] = zoneId;
        return newPlacements;
      });
    },
    [isChecked],
  );

  const handleRemoveItem = useCallback(
    (zoneId: string) => {
      if (isChecked) return;
      setPlacements((prev) => {
        const newPlacements = { ...prev };
        const itemId = Object.entries(newPlacements).find(
          ([, zId]) => zId === zoneId,
        )?.[0];
        if (itemId) delete newPlacements[itemId];
        return newPlacements;
      });
    },
    [isChecked],
  );

  const handleCheck = useCallback(() => {
    const itemResults: Record<string, boolean> = {};

    // Check via itemZones: each item has itemZones with matching zoneId = correct
    Object.entries(placements).forEach(([itemId, zoneId]) => {
      const item = question.items.find((i) => i.id === itemId);
      const isCorrect =
        item?.itemZones.some((iz) => iz.zoneId === zoneId) ?? false;
      itemResults[itemId] = isCorrect;
    });

    setResults(itemResults);
    setIsChecked(true);
    onComplete(
      itemResults,
      Object.entries(placements).map(([itemId, zoneId]) => ({
        questionId: question.id,
        itemId,
        zoneId,
      })),
    );
  }, [placements, question.id, onComplete]);

  const placedCount = Object.keys(placements).length;
  const allPlaced = placedCount === question.items.length;
  const remainingCount = question.items.length - placedCount;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.container}>
        <div className={styles.zonesGrid}>
          {question.zones.map((zone) => {
            const placedItem = getPlacedItemForZone(
              question.items,
              placements,
              zone.id,
            );
            const placedItemId = Object.entries(placements).find(
              ([, zId]) => zId === zone.id,
            )?.[0];

            return (
              <DropZone
                key={zone.id}
                zone={zone}
                color={color}
                placedItem={placedItem}
                isCorrect={
                  placedItemId ? (results[placedItemId] ?? null) : null
                }
                isChecked={isChecked}
                onRemove={() => handleRemoveItem(zone.id)}
              />
            );
          })}
        </div>

        <div className={styles.authorsSection}>
          <h3 className={styles.authorsTitle}>
            {allItemsSame ? t("quiz.author") : t("quiz.authors")}
          </h3>
          {allItemsSame && (
            <p className={styles.authorsHint}>{t("quiz.matchSameAuthorHint")}</p>
          )}
          <div className={styles.authorsList}>
            {availableItems.map((item) => (
              <DraggableAuthor
                key={item.id}
                item={item}
                color={color}
                isPlaced={false}
                disabled={isChecked}
              />
            ))}
          </div>
        </div>

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
                      one: "quiz.authorOne",
                      few: "quiz.authorFew",
                      many: "quiz.authorMany",
                    })}`,
                  })}
            </CheckButton>
          </div>
        )}
      </div>
    </DndContext>
  );
}
