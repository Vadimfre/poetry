"use client";

import styles from "@/components/SeasonSlider/SeasonSlider.module.css";
import { useI18n } from "@/src/shared/i18n";

interface NavigationArrowsProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function NavigationArrows({
  onNext,
  onPrev,
}: NavigationArrowsProps) {
  const { t } = useI18n();

  return (
    <>
      <button
        className={`${styles.arrow} ${styles.arrowLeft}`}
        onClick={onPrev}
        aria-label={t("season.prevSlide")}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button
        className={`${styles.arrow} ${styles.arrowRight}`}
        onClick={onNext}
        aria-label={t("season.nextSlide")}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </>
  );
}
