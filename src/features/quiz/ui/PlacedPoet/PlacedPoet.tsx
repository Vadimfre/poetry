"use client";

import { getInitials } from "../../lib";
import styles from "./PlacedPoet.module.css";

export interface PlacedPoetProps {
  name: string;
  placedYear: number;
  positionPercent: number;
  correctYear?: number;
  isChecked?: boolean;
  isCorrect?: boolean | null;
  color?: string | null;
  onClick?: () => void;
}

export function PlacedPoet({
  name,
  placedYear,
  positionPercent,
  correctYear,
  isChecked = false,
  isCorrect = null,
  color,
  onClick,
}: PlacedPoetProps) {
  const handleClick = () => {
    if (!isChecked && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`
        ${styles.placed}
        ${isChecked && isCorrect === true ? styles.correct : ""}
        ${isChecked && isCorrect === false ? styles.incorrect : ""}
        ${!isChecked ? styles.clickable : ""}
      `}
      style={
        {
          left: `${positionPercent}%`,
          "--placed-color": color,
        } as React.CSSProperties
      }
      onClick={handleClick}
    >
      <div className={styles.connector} />
      <div className={styles.marker}>
        <div className={styles.avatar}>
          <span className={styles.initials}>{getInitials(name)}</span>
        </div>
        <div className={styles.info}>
          <span className={styles.name}>{name}</span>
          <span className={styles.year}>{placedYear}</span>
          {isChecked && isCorrect === false && correctYear && (
            <span className={styles.correctYear}>
              Правільна: {correctYear}
            </span>
          )}
        </div>
        {isChecked && (
          <span className={styles.badge}>{isCorrect ? "✓" : "✗"}</span>
        )}
      </div>
    </div>
  );
}
