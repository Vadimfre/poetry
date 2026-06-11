"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterFormData,
} from "@/src/shared/lib/validations";
import { useSignUp } from "../model/use-sign-up";
import styles from "../../auth.module.css";
import { useState } from "react";
import { useI18n } from "@/src/shared/i18n";

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export const SignUpForm = ({
  onSuccess,
  onSwitchToSignIn,
}: SignUpFormProps) => {
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "STUDENT",
    },
  });

  const [successMessage, setSuccessMessage] = useState("");

  const { mutate, isPending } = useSignUp({
    onSuccess: () => {
      setSuccessMessage(t("auth.signUpSuccess"));
      onSuccess?.();
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    mutate(registerData);
  };

  return (
    <div className={styles.authCard}>
      <h1 className={styles.title}>{t("auth.signUpTitle")}</h1>
      <p className={styles.subtitle}>{t("auth.signUpSubtitle")}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.form}
        noValidate
      >
        <div className={styles.inputGroup}>
          <label className={styles.label}>{t("auth.name")}</label>
          <input
            type="text"
            placeholder={t("auth.namePlaceholder")}
            className={styles.input}
            {...register("name")}
          />
          {errors.name && (
            <span className={styles.error}>{errors.name.message}</span>
          )}
        </div>

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
          <label className={styles.label}>{t("auth.role")}</label>
          <select className={styles.input} {...register("role")}>
            <option value="STUDENT">{t("auth.roleStudent")}</option>
            <option value="TEACHER">{t("auth.roleTeacher")}</option>
          </select>
          {errors.role && (
            <span className={styles.error}>{errors.role.message}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>{t("auth.password")}</label>
          <input
            type="password"
            placeholder={t("auth.passwordMinPlaceholder")}
            className={styles.input}
            {...register("password")}
          />
          {errors.password && (
            <span className={styles.error}>{errors.password.message}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>{t("auth.confirmPassword")}</label>
          <input
            type="password"
            placeholder={t("auth.confirmPasswordPlaceholder")}
            className={styles.input}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className={styles.error}>
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {successMessage && (
          <p className={styles.successMessage}>{successMessage}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className={`${styles.submitButton} ${
            isPending ? styles.submitButtonLoading : ""
          }`}
        >
          {isPending ? t("auth.signingUp") : t("auth.signUpButton")}
        </button>

        {onSwitchToSignIn && (
          <div className={styles.footer}>
            {t("auth.hasAccount")}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className={styles.footerLink}
            >
              {t("auth.signIn")}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
