"use client";

import { useI18n, usePlural } from "@/src/shared/i18n";
import { useVerificationMutation } from "@/src/shared";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./new-verification-form.module.css";

export function NewVerificationForm() {
  const { t } = useI18n();
  const plural = usePlural();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  const { verification } = useVerificationMutation();

  const calledRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    if (!token) {
      setError(t("authRecovery.tokenMissing"));
      return;
    }

    const performVerification = async () => {
      try {
        await verification(token);
        setSuccess(true);
        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              router.push("/");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err: any) {
        setError(err?.message || t("authRecovery.verifyError"));
      }
    };

    performVerification();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [token]);

  const showingSuccess = success;

  return (
    <div className={styles.container}>
      <div className={styles.decoration + " " + styles.decorationCircle}></div>
      <div className={styles.decoration + " " + styles.decorationSquare}></div>

      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t("auth.verifyEmailTitle")}</h1>
          <p className={styles.subtitle}>
            {showingSuccess
              ? t("authRecovery.verifySuccess")
              : error
                ? t("authRecovery.verifyError")
                : t("authRecovery.verifying")}
          </p>
        </div>

        <div className={styles.content}>
          {error ? (
            <>
              <div className={styles.errorIcon}>⚠️</div>
              <div className={styles.error}>{error}</div>
            </>
          ) : showingSuccess ? (
            <>
              <div className={styles.successIcon}>✓</div>
              <p className={styles.message}>{t("authRecovery.congrats")}</p>
              <p className={styles.message}>
                {t("authRecovery.redirectIn")}{" "}
                <span className={styles.countdown}>{countdown}</span>{" "}
                {plural(countdown, {
                  one: "authRecovery.secondOne",
                  few: "authRecovery.secondFew",
                  many: "authRecovery.secondMany",
                })}
                ...
              </p>
            </>
          ) : (
            <>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.message}>
                {t("authRecovery.checkingToken")}
              </p>
            </>
          )}
        </div>

        <div className={styles.actions}>
          {showingSuccess ? (
            <a
              href="/"
              className={`${styles.button} ${styles.primaryButton}`}
            >
              {t("authRecovery.signInAccount")}
            </a>
          ) : error ? (
            <>
              <a
                href="/"
                className={`${styles.button} ${styles.primaryButton}`}
              >
                {t("auth.signUp")}
              </a>
              <a
                href="/"
                className={`${styles.button} ${styles.secondaryButton}`}
              >
                {t("auth.signIn")}
              </a>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
