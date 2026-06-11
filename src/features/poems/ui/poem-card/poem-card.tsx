"use client";

import type { Poem } from "@/src/shared/types";
import styles from "./poem-card.module.css";

interface PoemCardProps {
  poem: Poem;
  onClick: (poemId: number) => void;
}

export const PoemCard = ({ poem, onClick }: PoemCardProps) => {
  return (
    <div
      className={styles.poemCard}
      onClick={() => onClick(poem.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick(poem.id);
        }
      }}
    >
      <div className={styles.poemInfo}>
        <h3 className={styles.poemTitle}>{poem.title}</h3>
        <div className={styles.poemMeta}>
          <span className={styles.poemAuthor}>{poem.author.name}</span>
          {poem.year && <span className={styles.poemYear}>{poem.year}</span>}
        </div>
      </div>
    </div>
  );
};
