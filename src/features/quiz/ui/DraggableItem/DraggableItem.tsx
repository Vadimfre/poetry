"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import styles from "./DraggableItem.module.css";

export interface DraggableItemProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  color?: string | null;
  variant?: "default" | "bubble" | "word";
  isPlaced?: boolean;
  onClick?: () => void;
}

export function DraggableItem({
  id,
  children,
  disabled = false,
  color,
  variant = "default",
  isPlaced = false,
  onClick,
}: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled: disabled || isPlaced,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    "--item-color": color,
  } as React.CSSProperties;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick && !isDragging) {
      e.stopPropagation();
      onClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`
        ${styles.item}
        ${styles[variant]}
        ${isDragging ? styles.dragging : ""}
        ${isPlaced ? styles.placed : ""}
        ${disabled ? styles.disabled : ""}
      `}
    >
      {children}
    </div>
  );
}
