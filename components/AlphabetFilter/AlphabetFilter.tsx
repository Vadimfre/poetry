"use client";

import {
  BELARUSIAN_ALPHABET,
  getAvailableLetters,
} from "@/src/shared/lib/alphabet-filter";
import styles from "./AlphabetFilter.module.css";

interface AlphabetFilterProps {
  activeLetter: string | null;
  onLetterChange: (letter: string | null) => void;
  items: { name: string }[];
  allLabel: string;
  ariaLabel: string;
}

const AlphabetFilter = ({
  activeLetter,
  onLetterChange,
  items,
  allLabel,
  ariaLabel,
}: AlphabetFilterProps) => {
  const availableLetters = getAvailableLetters(items);

  return (
    <nav className={styles.filter} aria-label={ariaLabel}>
      <div className={styles.scrollWrap}>
        <button
          type="button"
          className={`${styles.letter} ${styles.allBtn} ${activeLetter === null ? styles.active : ""}`}
          onClick={() => onLetterChange(null)}
          aria-pressed={activeLetter === null}
        >
          {allLabel}
        </button>
        {BELARUSIAN_ALPHABET.map((letter) => {
          const hasAuthors = availableLetters.has(letter);
          const isActive = activeLetter === letter;

          return (
            <button
              key={letter}
              type="button"
              className={`${styles.letter} ${isActive ? styles.active : ""} ${!hasAuthors ? styles.disabled : ""}`}
              onClick={() => hasAuthors && onLetterChange(letter)}
              disabled={!hasAuthors}
              aria-pressed={isActive}
              aria-disabled={!hasAuthors}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default AlphabetFilter;
