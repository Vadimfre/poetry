"use client";

import { useI18n } from "@/src/shared/i18n";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthInput } from "../ui/auth-input";
import {
  ResetPasswordSchema,
  TypeResetPasswordSchema,
} from "@/src/shared/services/schemas/reset.password.schema";
import { useResetPasswordMutation } from "@/src/shared";
import styles from './reset-password-form.module.css'

export const ResetPasswordForm = () => {
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TypeResetPasswordSchema>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { reset, isLoadingReset } = useResetPasswordMutation();

  const onSubmit = (data: TypeResetPasswordSchema) => {
    reset(data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.decoration + " " + styles.decorationCircle}></div>
      <div className={styles.decoration + " " + styles.decorationSquare}></div>

      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t("auth.resetPasswordTitle")}</h1>
          <p className={styles.subtitle}>{t("authRecovery.resetDescription")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div className={styles.inputWrapper}>
            <AuthInput
              placeholder={t("auth.email")}
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
          </div>

          <button
            type="submit"
            disabled={isLoadingReset}
            className={styles.submitButton}
          >
            {isLoadingReset && <span className={styles.loading}></span>}
            {isLoadingReset ? t("authRecovery.sending") : t("authRecovery.sendLink")}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            {t("authRecovery.rememberPassword")}{" "}
            <a href="/" className={styles.link}>
              {t("auth.signIn")}
            </a>
          </p> 
        </div>
      </div>
    </div>
  );
};
