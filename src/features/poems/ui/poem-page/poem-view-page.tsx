"use client";

import { useEffect, useState } from "react";
import { usePoem } from "../../model/use-poem";
import { useOptimisticLike } from "@/src/shared/hooks/interactions";
import { useOptimisticFavorite } from "@/src/shared/hooks/interactions";
import { usePoemInteractions } from "@/src/shared/hooks/interactions";
import { useOptimisticViews } from "@/src/shared/hooks/interactions";
import { PoemPageSkeleton } from "./poem-page-skeleton";
import { PoemHeader } from "./poem-header";
import { PoemContent } from "./poem-content";
import { InteractionBar } from "./interaction-bar";
import { PoemPageComments } from "./poem-page-comments";
import styles from "./poem-view-page.module.css";
import { useI18n } from "@/src/shared/i18n";

interface PoemViewPageProps {
  poemId: number;
}

export function PoemViewPage({ poemId }: PoemViewPageProps) {
  const { t } = useI18n();
  const { data: poem, isLoading, error } = usePoem(poemId);
  const { isLiked, likeCount, toggleLike } = useOptimisticLike(poemId);
  const { isFavorite, toggleFavorite } = useOptimisticFavorite(poemId);
  const { commentsCount, views } = usePoemInteractions(poemId);
  const { addView } = useOptimisticViews(poemId);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);

  useEffect(() => {
    if (!commentsOpen) return;

    const t = window.setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 0);

    return () => window.clearTimeout(t);
  }, [commentsOpen]);

  if (isLoading) return <PoemPageSkeleton />;

  if (error || !poem) {
    return (
      <div
        className={styles.page}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="text-center">
          <p className="text-slate-400 text-lg">{t("poem.notFound")}</p>
          <p className="text-slate-500 text-sm mt-2">{t("poem.tryLater")}</p>
        </div>
      </div>
    );
  }

  const handleToggleComments = () => {
    setCommentsOpen((prev) => !prev);
  };

  const handleFirstInteraction = () => {
    if (!viewTracked) {
      addView();
      setViewTracked(true);
    }
  };

  return (
    <div className={styles.page} onClick={handleFirstInteraction}>
      <div className={styles.container}>
        <PoemHeader isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />

        <div className={styles.contentShell}>
          <PoemContent poem={poem} />
        </div>

        <div className={styles.interactionWrap}>
          <InteractionBar
            views={views}
            likesCount={likeCount}
            isLiked={isLiked}
            commentsCount={commentsCount}
            isFavorite={isFavorite}
            onToggleLike={toggleLike}
            onToggleFavorite={toggleFavorite}
            onToggleComments={handleToggleComments}
            isCommentsOpen={commentsOpen}
          />
        </div>

        <div className={styles.commentsWrap}>
          <PoemPageComments
            poemId={poemId}
            commentsCount={commentsCount}
            isOpen={commentsOpen}
          />
        </div>
      </div>
    </div>
  );
}
