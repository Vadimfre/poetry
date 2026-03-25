"use client";

import { BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./empty-state.module.css";

export function EmptyState() {
  return (
    <div className={styles.emptyContainer}>
      <div className={styles.emptyIconWrapper}>
        <BookOpen className={styles.emptyIcon} />
      </div>
      <p className={styles.emptyTitle}>
        Вершаў для гэтага свята яшчэ няма
      </p>
      <p className={styles.emptySubtitle}>
        Станьце першым, хто дадасць верш да гэтага свята
      </p>
      <Button className={styles.emptyButton}>
        <Sparkles className={styles.emptyButtonIcon} />
        Дадаць верш
      </Button>
    </div>
  );
}
