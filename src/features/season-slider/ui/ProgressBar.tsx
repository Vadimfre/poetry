"use client";

import styles from "@/components/SeasonSlider/SeasonSlider.module.css";

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className={styles.progress}>
      <div
        className={styles.progressBar}
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
