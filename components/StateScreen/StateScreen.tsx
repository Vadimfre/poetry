"use client";

import Link from "next/link";
import { useI18n } from "@/src/shared/i18n";
import styles from "./StateScreen.module.css";

interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text }: LoadingStateProps) {
  const { t } = useI18n();
  return (
    <div className={styles.stateScreen}>
      <div className={styles.loadingSpinner} />
      <p className={styles.loadingText}>{text ?? t("common.loading")}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
}

export function ErrorState({ title, description }: ErrorStateProps) {
  const { t } = useI18n();
  return (
    <div className={styles.stateScreen}>
      <div className={`${styles.stateIcon} ${styles.stateIconError}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <h2 className={styles.stateTitle}>{title ?? t("common.error")}</h2>
      <p className={styles.stateDescription}>
        {description ?? t("common.errorGeneric")}
      </p>
    </div>
  );
}

interface EmptyStateProps {
  icon?: "bookmark" | "auth";
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function EmptyState({
  icon = "bookmark",
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className={styles.stateScreen}>
      <div
        className={`${styles.stateIcon} ${
          icon === "auth" ? styles.stateIconAuth : styles.stateIconBookmark
        }`}
      >
        {icon === "auth" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </div>
      <h2 className={styles.stateTitle}>{title}</h2>
      <p className={styles.stateDescription}>{description}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className={styles.stateButton}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
