"use client";

import styles from "@/components/SeasonSlider/SeasonSlider.module.css";

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
  return (
    <div className={styles.dots}>
      {Array.from({ length: slidesLength }).map((_, index) => (
        <button
          key={index}
          className={`${styles.dot} ${current === index ? styles.dotActive : ""}`}
          onClick={() => onDotClick(index)}
          aria-label={`Слайд ${index + 1}`}
        />
      ))}
    </div>
  );
}
