"use client";

import { useAuthModalStore } from "@/src/entities/auth/auth-modal.store";
import { useI18n } from "@/src/shared/i18n";
import styles from "./PoemGuestGate.module.css";

interface PoemGuestGateProps {
  className?: string;
}

export default function PoemGuestGate({ className }: PoemGuestGateProps) {
  const { t } = useI18n();
  const openAuth = useAuthModalStore((s) => s.open);

  return (
    <div className={`${styles.gate} ${className ?? ""}`}>
      <p className={styles.title}>{t("poem.guestLimitTitle")}</p>
      <p className={styles.desc}>{t("poem.guestLimitDesc")}</p>
      <button type="button" className={styles.button} onClick={openAuth}>
        {t("poem.guestLimitAction")}
      </button>
    </div>
  );
}
