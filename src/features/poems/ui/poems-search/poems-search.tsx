"use client";

import styles from "./poems-search.module.css";
import { useI18n } from "@/src/shared/i18n";

interface PoemsSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export const PoemsSearch = ({
  value,
  onChange,
  onClear,
  placeholder,
}: PoemsSearchProps) => {
  const { t } = useI18n();
  const resolvedPlaceholder =
    placeholder ?? t("filters.searchPlaceholder");

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder={resolvedPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <button 
        className={`${styles.clearButton} ${value ? styles.visible : ''}`}
        onClick={onClear}
        type="button"
        aria-label={t("filters.clearSearch")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
