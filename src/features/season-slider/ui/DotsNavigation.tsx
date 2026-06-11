"use client";

import styles from "@/components/SeasonSlider/SeasonSlider.module.css";
import { useI18n } from "@/src/shared/i18n";

interface DotsNavigationProps {
  slidesLength: number;
  current: number;
  onDotClick: (index: number) => void;
}

export default function DotsNavigation({
  slidesLength,
  current,
  onDotClick,
}: DotsNavigationProps) {
  const { t } = useI18n();

  return (
    <div className={styles.dots}>
      {Array.from({ length: slidesLength }).map((_, index) => (
        <button
          key={index}
          className={`${styles.dot} ${current === index ? styles.dotActive : ""}`}
          onClick={() => onDotClick(index)}
          aria-label={t("season.slideLabel", { number: index + 1 })}
        />
      ))}
    </div>
  );
}
