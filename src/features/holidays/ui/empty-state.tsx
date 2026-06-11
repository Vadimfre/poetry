"use client";

import { BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./empty-state.module.css";
import { useI18n } from "@/src/shared/i18n";

export function EmptyState() {
  const { t } = useI18n();

  return (
    <div className={styles.emptyContainer}>
      <div className={styles.emptyIconWrapper}>
        <BookOpen className={styles.emptyIcon} />
      </div>
      <p className={styles.emptyTitle}>{t("holiday.emptyTitle")}</p>
      <p className={styles.emptySubtitle}>{t("holiday.emptySubtitle")}</p>
      <Button className={styles.emptyButton} disabled>
        <Sparkles className={styles.emptyButtonIcon} />
        {t("holiday.emptyButton")}
      </Button>
    </div>
  );
}
