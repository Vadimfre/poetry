"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useFavorites,
  useRemoveFavorite,
} from "@/src/shared/hooks/interactions";
import { useUserStore } from "@/src/entities/user";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/StateScreen/StateScreen";
import { useI18n, usePlural } from "@/src/shared/i18n";
import styles from "./favorites.module.css";

export default function FavoritesPage() {
  const { t } = useI18n();
  const plural = usePlural();
  const router = useRouter();
  const { isAuthenticated } = useUserStore();
  const { favorites, isLoading, error } = useFavorites();
  const removeFavorite = useRemoveFavorite();

  const handleGoBack = () => {
    router.back();
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <EmptyState
          icon="auth"
          title={t("favorites.loginTitle")}
          description={t("favorites.loginDescription")}
          actionHref="/"
          actionLabel={t("favorites.backHome")}
        />
      );
    }

    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState description={t("favorites.loadError")} />;
    }

    if (favorites.length === 0) {
      return (
        <EmptyState
          icon="bookmark"
          title={t("favorites.emptyTitle")}
          description={t("favorites.emptyDescription")}
          actionHref="/"
          actionLabel={t("favorites.browsePoems")}
        />
      );
    }

    return (
      <div className={styles.grid}>
        {favorites.map((favorite) => (
          <div key={favorite.id} className={styles.card}>
            <div className={styles.cardContent}>
              <Link
                href={`/poem/${favorite.poem.id}`}
                className={styles.cardLink}
              >
                <h3 className={styles.cardTitle}>{favorite.poem.title}</h3>
                <div className={styles.cardMeta}>
                  <span className={styles.cardAuthor}>
                    {favorite.poem.author?.name || t("common.unknownAuthor")}
                  </span>
                  {favorite.poem.year && (
                    <>
                      <span className={styles.cardDivider}>•</span>
                      <span className={styles.cardYear}>
                        {favorite.poem.year}
                      </span>
                    </>
                  )}
                </div>
                <p className={styles.cardExcerpt}>
                  {favorite.poem.content
                    .split("\n")
                    .slice(0, 2)
                    .join("\n")
                    .substring(0, 120)}
                  ...
                </p>
              </Link>
              <button
                onClick={() => removeFavorite.mutate(favorite.poem.id)}
                className={styles.removeButton}
                title={t("favorites.remove")}
                disabled={removeFavorite.isPending}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
        {t("favorites.back")}
      </button>

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t("favorites.title")}</h1>
          <p className={styles.subtitle}>
            {isAuthenticated && favorites.length > 0
              ? `${favorites.length} ${plural(favorites.length, {
                  one: "common.poemOne",
                  few: "common.poemFew",
                  many: "common.poemMany",
                })}`
              : t("favorites.subtitleDefault")}
          </p>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
