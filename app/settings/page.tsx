"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useProfile,
  useUpdateProfile,
  useUpdateEmail,
  useUpdatePassword,
} from "@/src/features/profile";
import { useUserStore } from "@/src/entities/user";
import styles from "./settings.module.css";
import { changePasswordSchema } from "@/src/shared";
import { useI18n } from "@/src/shared/i18n";

export default function SettingsPage() {
  const { t, locale } = useI18n();
  const dateLocale =
    locale === "be" ? "be-BY" : locale === "ru" ? "ru-RU" : "en-US";
  const router = useRouter();
  const { user, isAuthenticated } = useUserStore();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();

  const updateProfile = useUpdateProfile();
  const updateEmail = useUpdateEmail();
  const updatePassword = useUpdatePassword();

  // Форма профиля
  const [name, setName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  // Форма email
  const [email, setEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  // Форма пароля
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Сообщения
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Загружаем данные профиля
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
    } else if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [profile, user]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");
    setTimeout(() => setErrorMessage(""), 5000);
  };

  const handleGoBack = () => {
    router.back();
  };

  // Сохранить имя
  const handleSaveName = async () => {
    try {
      await updateProfile.mutateAsync({ name });
      setIsEditingName(false);
      showSuccess(t("settings.nameUpdated"));
    } catch (err: any) {
      showError(err.response?.data?.message || t("settings.updateNameError"));
    }
  };

  // Сохранить email
  const handleSaveEmail = async () => {
    if (!emailPassword) {
      showError(t("settings.enterPasswordConfirm"));
      return;
    }

    try {
      await updateEmail.mutateAsync({ email, password: emailPassword });
      setIsEditingEmail(false);
      setEmailPassword("");
      showSuccess(t("settings.emailUpdated"));
    } catch (err: any) {
      showError(err.response?.data?.message || t("settings.updateEmailError"));
    }
  };

  // Сохранить пароль
  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError(t("settings.fillAllFields"));
      return;
    }

    if (newPassword !== confirmPassword) {
      showError(t("settings.passwordsMismatch"));
      return;
    }

    try {
      const validationResult = changePasswordSchema.safeParse({
        oldPassword: currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error;
        showError(firstError.message);
        return;
      }

      await updatePassword.mutateAsync({ currentPassword, newPassword });
      setIsEditingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showSuccess(t("settings.passwordUpdated"));
    } catch (err: any) {
      showError(err.response?.data?.message || t("settings.updatePasswordError"));
    }
  };

  // Если не авторизован
  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.notAuth}>
          <h2>{t("settings.loginTitle2")}</h2>
          <p>{t("settings.loginDescription2")}</p>
          <button
            onClick={() => router.push("/")}
            className={styles.homeButton}
          >
            {t("favorites.backHome")}
          </button>
        </div>
      </div>
    );
  }

  const avatarLetter = (profile?.name || user?.name || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className={styles.container}>
      <button onClick={handleGoBack} className={styles.backButton}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t("common.back")}
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>{t("settings.title")}</h1>
        <p className={styles.subtitle}>{t("settings.subtitleAccount")}</p>
      </div>

      {/* Сообщения */}
      {successMessage && (
        <div className={styles.successBanner}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className={styles.errorBanner}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {errorMessage}
        </div>
      )}

      {isLoadingProfile ? (
        <div className={styles.loading}>{t("common.loading")}</div>
      ) : (
        <div className={styles.content}>
          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarLarge}>{avatarLetter}</div>
              <div className={styles.profileInfo}>
                <h3 className={styles.profileName}>
                  {profile?.name || user?.name || t("header.userFallback")}
                </h3>
                <p className={styles.profileEmail}>
                  {profile?.email || user?.email}
                </p>
                {profile?._count && (
                  <div className={styles.stats}>
                    <span>
                      {t("settings.favoritesStat", {
                        count: profile._count.favorites,
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      {t("settings.commentsStat", {
                        count: profile._count.comments,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Секция: Имя */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t("settings.name")}</h2>
              {!isEditingName && (
                <button
                  className={styles.editButton}
                  onClick={() => setIsEditingName(true)}
                >
                  {t("common.edit")}
                </button>
              )}
            </div>

            {isEditingName ? (
              <div className={styles.editForm}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  placeholder={t("settings.namePlaceholder")}
                />
                <div className={styles.editActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setIsEditingName(false);
                      setName(profile?.name || user?.name || "");
                    }}
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    className={styles.saveBtn}
                    onClick={handleSaveName}
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? t("settings.saving") : t("common.save")}
                  </button>
                </div>
              </div>
            ) : (
              <p className={styles.fieldValue}>
                {name || t("settings.notSpecified")}
              </p>
            )}
          </div>

          {/* Секция: Email */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t("settings.email")}</h2>
              {!isEditingEmail && (
                <button
                  className={styles.editButton}
                  onClick={() => setIsEditingEmail(true)}
                >
                  {t("common.edit")}
                </button>
              )}
            </div>

            {isEditingEmail ? (
              <div className={styles.editForm}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder="your@email.com"
                />
                <input
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className={styles.input}
                  placeholder={t("settings.emailPasswordPlaceholder")}
                />
                <div className={styles.editActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setIsEditingEmail(false);
                      setEmail(profile?.email || user?.email || "");
                      setEmailPassword("");
                    }}
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    className={styles.saveBtn}
                    onClick={handleSaveEmail}
                    disabled={updateEmail.isPending}
                  >
                    {updateEmail.isPending ? t("settings.saving") : t("common.save")}
                  </button>
                </div>
              </div>
            ) : (
              <p className={styles.fieldValue}>{email}</p>
            )}
          </div>

          {/* Секция: Пароль */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {t("settings.passwordSection")}
              </h2>
              {!isEditingPassword && (
                <button
                  className={styles.editButton}
                  onClick={() => setIsEditingPassword(true)}
                >
                  {t("common.edit")}
                </button>
              )}
            </div>

            {isEditingPassword ? (
              <div className={styles.editForm}>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={styles.input}
                  placeholder={t("settings.currentPasswordPlaceholder")}
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                  placeholder={t("settings.newPasswordPlaceholder")}
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                  placeholder={t("settings.confirmPasswordPlaceholder")}
                />
                <div className={styles.editActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setIsEditingPassword(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    className={styles.saveBtn}
                    onClick={handleSavePassword}
                    disabled={updatePassword.isPending}
                  >
                    {updatePassword.isPending
                      ? t("settings.saving")
                      : t("settings.changePasswordAction")}
                  </button>
                </div>
              </div>
            ) : (
              <p className={styles.fieldValue}>••••••••</p>
            )}
          </div>

          {/* Дата регистрации */}
          {profile?.createdAt && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t("settings.registeredAt")}</h2>
              <p className={styles.fieldValue}>
                {new Date(profile.createdAt).toLocaleDateString(dateLocale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
