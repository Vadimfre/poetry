"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePoem } from "@/src/features/poems";
import { Comments } from "@/src/features/comments";
import {
  useOptimisticFavorite,
  useOptimisticLike,
  useOptimisticViews,
} from "@/src/shared/hooks/interactions";
import PoemGuestGate from "@/components/PoemGuestGate/PoemGuestGate";
import { useUserStore } from "@/src/entities/user";
import styles from "./PoemViewSection.module.css";
import { toast } from "sonner";
import { useI18n } from "@/src/shared/i18n";

interface PoemViewSectionProps {
  poemId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const PoemViewSection = ({ poemId }: PoemViewSectionProps) => {
  const { t } = useI18n();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const poemIdNum = Number(poemId);

  // Данные пользователя
  const { isAuthenticated, hasHydrated } = useUserStore();

  // Получаем стих
  const { data: poem, isLoading, error } = usePoem(poemIdNum);

  // Лайки / просмотры
  const { isLiked, likeCount, toggleLike } = useOptimisticLike(poemIdNum);
  const { views } = useOptimisticViews(poemIdNum);

  // Избранное
  const { isFavorite, toggleFavorite, isMutating } =
    useOptimisticFavorite(poemIdNum);

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [poemIdNum]);

  useEffect(() => {
    if (!isCommentsOpen) return;

    // Wait for the comments section to mount, then scroll to the bottom
    const t = window.setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 0);

    return () => window.clearTimeout(t);
  }, [isCommentsOpen]);

  const handleBackClick = () => {
    router.back();
  };

  const handleCommentsToggle = () => {
    setIsCommentsOpen(!isCommentsOpen);
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error(t("poem.loginToFavorite"), {
        description: t("poem.loginToFavoriteDesc"),
      });
      return;
    }
    toggleFavorite();
  };

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  if (isLoading) {
    return (
      <section className={styles.poemViewSection}>
        <div className={styles.noVideoBackground}></div>
        <div className={styles.videoOverlay}></div>
        <div className="container">
          <div
            style={{
              textAlign: "center",
              padding: "100px 0",
              position: "relative",
              zIndex: 2,
            }}
          >
            <p>{t("common.loading")}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !poem) {
    return (
      <section className={styles.poemViewSection}>
        <div className={styles.noVideoBackground}></div>
        <div className={styles.videoOverlay}></div>
        <div className="container">
          <button className={styles.backButton} onClick={handleBackClick}>
            ← {t("common.back")}
          </button>
          <div
            style={{
              textAlign: "center",
              padding: "100px 0",
              position: "relative",
              zIndex: 2,
            }}
          >
            <p>{t("poem.notFound")}</p>
          </div>
        </div>
      </section>
    );
  }

  // Информация об авторе
  const authorName = poem.author?.name || t("common.unknownAuthor");
  const authorYears = poem.author?.birthYear
    ? `(${poem.author.birthYear}${poem.author.deathYear ? `–${poem.author.deathYear}` : ""})`
    : "";

  // Формируем URL видео
  // Если videoUrl начинается с /, это путь из public (используем напрямую)
  // Иначе это путь на бэкенде (добавляем API_URL)
  const visibleContent = poem.content ?? "";
  const isGuestLimited = hasHydrated && !isAuthenticated && !!visibleContent.trim();

  const videoUrl = poem.videoUrl
    ? poem.videoUrl.startsWith("/")
      ? poem.videoUrl
      : `${API_URL}${poem.videoUrl}`
    : null;

  return (
    <section className={styles.poemViewSection}>
      {/* Background Video */}
      {videoUrl ? (
        <>
          <video
            ref={videoRef}
            className={`${styles.videoBackground} ${!isVideoPlaying ? styles.paused : ""}`}
            autoPlay
            loop
            muted={isVideoMuted}
            playsInline
          >
            <source src={videoUrl} type="video/mp4" />
          </video>

          {/* Video Controls */}
          <div className={styles.videoControls}>
            <button
              className={styles.videoControlButton}
              onClick={toggleVideoPlay}
              title={isVideoPlaying ? t("poem.pauseVideo") : t("poem.playVideo")}
            >
              {isVideoPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            <button
              className={`${styles.videoControlButton} ${isVideoMuted ? styles.muted : ""}`}
              onClick={toggleVideoMute}
              title={isVideoMuted ? t("poem.unmute") : t("poem.mute")}
            >
              {isVideoMuted ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className={styles.noVideoBackground}></div>
      )}

      {/* Overlay */}
      <div className={styles.videoOverlay}></div>

      <div className="container">
        <button className={styles.backButton} onClick={handleBackClick}>
          ← {t("common.back")}
        </button>

        <div className={styles.poemContainer}>
          <div className={styles.poemHeader}>
            {poem.author?.slug ? (
              <Link
                href={`/author/${poem.author.slug}`}
                className={styles.authorLink}
              >
                <span className={styles.authorLabel}>
                  {authorName} {authorYears}
                </span>
              </Link>
            ) : (
              <p className={styles.authorLabel}>
                {authorName} {authorYears}
              </p>
            )}
            <h1 className={styles.poemTitle}>{poem.title}</h1>
          </div>

          <div
            className={`${styles.poemContent} ${isGuestLimited ? styles.poemContentLimited : ""}`}
          >
            <pre className={styles.poemText}>{visibleContent}</pre>
            {isGuestLimited && <PoemGuestGate />}
          </div>

          <div className={styles.poemFooter}>
            {poem.year && <span className={styles.poemYear}>{poem.year}</span>}
          </div>

          {/* Описание стиха */}
          {poem.description && (
            <div className={styles.poemDescription}>
              <h3 className={styles.descriptionTitle}>{t("poem.aboutPoem")}</h3>
              <p className={styles.descriptionText}>{poem.description}</p>
            </div>
          )}

          {/* Информация об авторе */}
          {poem.author?.bio && (
            <div className={styles.authorBio}>
              <h3 className={styles.bioTitle}>{t("poem.aboutAuthor")}</h3>
              <p className={styles.bioText}>
                {poem.author.bio.length > 200
                  ? `${poem.author.bio.slice(0, 200)}...`
                  : poem.author.bio}
              </p>
              {poem.author.slug && (
                <Link
                  href={`/author/${poem.author.slug}`}
                  className={styles.bioLink}
                >
                  {t("poem.readFullBio")}
                </Link>
              )}
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <div className={styles.actionsButtons}>
              <button
                className={`${styles.iconButton} ${isCommentsOpen ? styles.active : ""}`}
                onClick={handleCommentsToggle}
                title={t("poem.comments")}
              >
                <svg
                  className={styles.icon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>

              <button
                className={`${styles.iconButton} ${isLiked ? styles.active : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike();
                }}
                title={t("poem.like")}
              >
                <svg
                  className={styles.icon}
                  viewBox="0 0 24 24"
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {likeCount > 0 && (
                  <span className={styles.badge}>{likeCount}</span>
                )}
              </button>

              <button
                className={`${styles.iconButton} ${isFavorite ? styles.active : ""}`}
                onClick={handleFavorite}
                title={t("poem.favorite")}
                disabled={isMutating}
              >
                <svg
                  className={styles.icon}
                  viewBox="0 0 24 24"
                  fill={isFavorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            </div>

            {isFavorite && (
              <span className={styles.statusText}>
                {t("poem.addedToFavorites")}
              </span>
            )}
          </div>

          {/* Comments Section */}
          {isCommentsOpen && (
            <div className={styles.commentsSection}>
              <Comments poemId={poemIdNum} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PoemViewSection;
