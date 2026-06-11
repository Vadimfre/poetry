"use client";

import { useDroppable } from "@dnd-kit/core";
import styles from "./DroppableZone.module.css";

export interface DroppableZoneProps {
  id: string;
  children: React.ReactNode;
  label?: string;
  color?: string | null;
  isCorrect?: boolean | null;
  isChecked?: boolean;
  variant?: "card" | "inline" | "slot";
  onRemoveItem?: () => void;
  hasItem?: boolean;
}

export function DroppableZone({
  id,
  children,
  label,
  color,
  isCorrect = null,
  isChecked = false,
  variant = "card",
  onRemoveItem,
  hasItem = false,
}: DroppableZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const handleClick = () => {
    if (hasItem && onRemoveItem && !isChecked) {
      onRemoveItem();
    }
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      style={{ "--zone-color": color } as React.CSSProperties}
      className={`
        ${styles.zone}
        ${styles[variant]}
        ${isOver ? styles.over : ""}
        ${isChecked && isCorrect === true ? styles.correct : ""}
        ${isChecked && isCorrect === false ? styles.incorrect : ""}
        ${hasItem && !isChecked ? styles.clickable : ""}
      `}
    >
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
