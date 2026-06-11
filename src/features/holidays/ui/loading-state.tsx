"use client";

import { Sparkles } from "lucide-react";
import styles from "./loading-state.module.css";
import { useI18n } from "@/src/shared/i18n";

export function LoadingState() {
  const { t } = useI18n();

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        <div className={styles.loadingGlow}>
          <div className={styles.loadingPulse} />
          <div className={styles.loadingIconWrapper}>
            <Sparkles className={styles.loadingIcon} />
          </div>
        </div>
        <div className={styles.loadingText}>
          <p className={styles.loadingTitle}>{t("holiday.loadingTitle")}</p>
          <p className={styles.loadingSubtitle}>{t("holiday.loadingSubtitle")}</p>
        </div>
      </div>
    </div>
  );
}
