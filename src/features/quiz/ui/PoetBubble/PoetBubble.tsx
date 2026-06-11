"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import styles from "./PoetBubble.module.css";
import { getInitials } from "../../lib";

export interface PoetBubbleProps {
  id: string;
  name: string;
  subtitle?: string;
  color?: string | null;
  disabled?: boolean;
  isPlaced?: boolean;
  onClick?: () => void;
}

interface PoetBubbleBaseProps {
  name: string;
  subtitle?: string;
  color?: string | null;
  disabled?: boolean;
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  setNodeRef?: (element: HTMLElement | null) => void;
  listeners?: Record<string, unknown>;
  attributes?: Record<string, unknown>;
  style?: React.CSSProperties;
}

function PoetBubbleBase({
  name,
  subtitle,
  color,
  disabled,
  isDragging,
  onClick,
  setNodeRef,
  listeners,
  attributes,
  style,
}: PoetBubbleBaseProps) {
  return (
    <div
      ref={setNodeRef}
      style={
        {
          ...style,
          "--bubble-color": color,
        } as React.CSSProperties
      }
      {...(listeners ?? {})}
      {...(attributes ?? {})}
      onClick={onClick}
      className={`
        ${styles.bubble}
        ${isDragging ? styles.dragging : ""}
        ${disabled ? styles.disabled : ""}
      `}
    >
      <div className={styles.avatar}>
        <span className={styles.initials}>{getInitials(name)}</span>
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </div>
  );
}

export function PoetBubbleOverlay({
  name,
  subtitle,
  color,
}: Pick<PoetBubbleProps, "id" | "name" | "subtitle" | "color">) {
  return (
    <PoetBubbleBase
      name={name}
      subtitle={subtitle}
      color={color}
      disabled={false}
      isDragging={true}
      style={{}}
    />
  );
}

export function PoetBubble({
  id,
  name,
  subtitle,
  color,
  disabled = false,
  isPlaced = false,
  onClick,
}: PoetBubbleProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled: disabled || isPlaced,
    });

  const handleClick = (e: React.MouseEvent) => {
    if (onClick && !isDragging) {
      e.stopPropagation();
      onClick();
    }
  };

  if (isPlaced) {
    return null;
  }

  const bubbleStyle = {
    transform: CSS.Translate.toString(transform),
    "--bubble-color": color,
    opacity: isDragging ? 0 : 1,
  } as React.CSSProperties;

  return (
    <PoetBubbleBase
      name={name}
      subtitle={subtitle}
      color={color}
      disabled={disabled}
      isDragging={isDragging}
      onClick={handleClick}
      setNodeRef={setNodeRef}
      listeners={listeners as unknown as Record<string, unknown>}
      attributes={attributes as unknown as Record<string, unknown>}
      style={bubbleStyle}
    />
  );
}
