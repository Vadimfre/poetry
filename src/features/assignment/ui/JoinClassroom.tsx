"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { classroomApi } from "@/src/shared/api";
import { useI18n } from "@/src/shared/i18n";
import styles from "./Assignment.module.css";

function getApiMessage(err: unknown, fallback: string): string {
  const e = err as {
    response?: { data?: { message?: string | string[] } };
    message?: string;
  };
  const msg = e?.response?.data?.message;
  if (typeof msg === "string") return msg;
  if (Array.isArray(msg)) return msg.join(" ");
  return e?.message || fallback;
}

export function JoinClassroom() {
  const { t } = useI18n();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldError(null);
    setError(null);
    const c = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (c.length < 4) {
      setFieldError(t("student.codeMinLength"));
      return;
    }

    try {
      setSaving(true);
      const classroom = await classroomApi.join({ code: c });
      router.push(`/student/classes/${classroom.id}`);
    } catch (err: unknown) {
      setError(getApiMessage(err, t("teacher.error")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={`${styles.container} ${styles.pageBg}`}>
      <div className={`${styles.maxWidth} ${styles.joinCard}`}>
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <div>
              <div className={styles.heroBadge}>{t("student.joinBadge")}</div>
              <h1 className={styles.title}>{t("student.joinTitle")}</h1>
              <p className={styles.subtitle}>{t("student.joinDesc")}</p>
            </div>
            <Link href="/student" className={styles.backLink}>
              {t("common.back")}
            </Link>
          </div>
        </header>

        <form className={styles.form} onSubmit={submit}>
          <div className={styles.field}>
            <label htmlFor="class-code">{t("student.codeLabel")}</label>
            <input
              id="class-code"
              className={styles.codeInput}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.toUpperCase().replace(/\s/g, ""))
              }
              placeholder="XXXX"
              autoComplete="off"
              maxLength={16}
            />
            {fieldError && (
              <p className={styles.fieldError}>{fieldError}</p>
            )}
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.button} type="submit" disabled={saving}>
            {saving ? t("student.joining") : t("student.join")}
          </button>
        </form>
      </div>
    </main>
  );
}
