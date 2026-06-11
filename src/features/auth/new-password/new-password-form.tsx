"use client";

import { useI18n } from "@/src/shared/i18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthInput } from "../ui/auth-input";
import { useNewPasswordMutation } from "@/src/shared";
import {
  NewPasswordSchema,
  TypeNewPasswordSchema,
} from "@/src/shared/services/schemas";
import styles from "./new-password-form.module.css"

export const NewPasswordForm = () => {
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TypeNewPasswordSchema>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const { newPassword, isLoadingNew } = useNewPasswordMutation();

  const onSubmit = (data: TypeNewPasswordSchema) => {
    newPassword(data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.decoration + " " + styles.decorationCircle}></div>
      <div className={styles.decoration + " " + styles.decorationSquare}></div>

      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t("auth.newPasswordTitle")}</h1>
          <p className={styles.subtitle}>{t("authRecovery.newPasswordHint")}</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles.form}
          noValidate
        >
          <div className={styles.inputWrapper}>
            <AuthInput
              placeholder={t("auth.passwordPlaceholder")}
              type="password"
              {...register("password")}
              error={errors.password?.message}
            />
          </div>

          <button
            type="submit"
            disabled={isLoadingNew}
            className={styles.submitButton}
          >
            {isLoadingNew && <span className={styles.loading}></span>}
            {isLoadingNew ? t("authRecovery.setting") : t("authRecovery.setPassword")}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            {t("authRecovery.oldPasswordRemember")}{" "}
            <a href="/" className={styles.link}>
              {t("auth.signIn")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
