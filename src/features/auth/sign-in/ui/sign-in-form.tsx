"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/src/shared/lib/validations";
import styles from "../../auth.module.css";
import { useSignIn } from "../..";
import Link from "next/link";
import { useI18n } from "@/src/shared/i18n";

interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

export const SignInForm = ({
  onSuccess,
  onSwitchToSignUp,
}: SignInFormProps) => {
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending, error } = useSignIn({
    onSuccess,
  });

  const onSubmit = (data: LoginFormData) => {
    mutate(data);
  };

  return (
    <div className={styles.authCard}>
      <h1 className={styles.title}>{t("auth.signInTitle")}</h1>
      <p className={styles.subtitle}>{t("auth.signInSubtitle")}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.form}
        noValidate
      >
        <div className={styles.inputGroup}>
          <label className={styles.label}>{t("auth.email")}</label>
          <input
            type="email"
            placeholder="your@email.com"
            className={styles.input}
            {...register("email")}
          />
          {errors.email && (
            <span className={styles.error}>{errors.email.message}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>{t("auth.password")}</label>
          <input
            type="password"
            placeholder={t("auth.passwordPlaceholder")}
            className={styles.input}
            {...register("password")}
          />
          {errors.password && (
            <span className={styles.error}>{errors.password.message}</span>
          )}
        </div>

        <div className={styles.forgotPassword}>
          <Link href="/auth/reset-password">{t("auth.forgotPassword")}</Link>
        </div>

        {error && (
          <p className={styles.error} style={{ textAlign: "center" }}>
            {t("auth.wrongCredentials")}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className={`${styles.submitButton} ${
            isPending ? styles.submitButtonLoading : ""
          }`}
        >
          {isPending ? t("auth.signingIn") : t("auth.signIn")}
        </button>

        {onSwitchToSignUp && (
          <div className={styles.footer}>
            {t("auth.noAccount")}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className={styles.footerLink}
            >
              {t("auth.signUp")}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
