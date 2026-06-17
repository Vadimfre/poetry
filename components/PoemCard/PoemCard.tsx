"use client";

import Image from "next/image";
import {
  Heart,
  MessageCircle,
  User,
  Eye,
  Play,
  ChevronDown,
  ExternalLink,
  Bookmark,
  Quote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Poem } from "@/src/shared";
import styles from "./PoemCard.module.css";
import { Comments } from "@/src/features/comments";
import Link from "next/link";
import PoemGuestGate from "@/components/PoemGuestGate/PoemGuestGate";
import { useUserStore } from "@/src/entities/user";
import { useI18n } from "@/src/shared/i18n";
import { resolveMediaUrl } from "@/src/shared/lib/resolve-media-url";

interface PoemCardProps {
  poem: Poem;
  index: number;
  isExpanded: boolean;
  isLiked: boolean;
  isFavorite: boolean;
  totalLikes: number;
  commentsCount: number;
  isCommentsOpen: boolean;
  viewsOverride?: number;
  onToggleExpand: () => void;
  onToggleLike: () => void;
  onToggleFavorite: () => void;
  onToggleComments: () => void;
}

export function PoemCard({
  poem,
  index,
  isExpanded,
  isLiked,
  isFavorite,
  totalLikes,
  commentsCount,
  isCommentsOpen,
  viewsOverride,
  onToggleExpand,
  onToggleLike,
  onToggleFavorite,
  onToggleComments,
}: PoemCardProps) {
  const { t } = useI18n();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const canReadFullPoem = hasHydrated && isAuthenticated;
  const visibleContent = poem.content ?? "";
  const isGuestLimited = hasHydrated && !isAuthenticated && !!visibleContent.trim();
  const hasLongContent =
    canReadFullPoem && poem.content.split("\n").length > 6;
  const views = viewsOverride ?? poem.views;

  return (
    <div className={styles.card}>
      {/* Decorative Quote */}
      <div className={styles.decorativeQuote}>
        <Quote className="w-24 h-24 text-white" />
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className="flex-1 min-w-0">
            {/* Title Row */}
            <div className={styles.titleRow}>
              <div className={styles.indexBadge}>
                <span className={styles.indexText}>{index + 1}</span>
              </div>
              <div className={styles.titleContainer}>
                <h4 className={styles.title}>{poem.title}</h4>
                {poem.year && (
                  <span className={styles.year}>
                    {poem.year} {t("common.year")}
                  </span>
                )}
              </div>
            </div>

            {/* Author Info */}
            <AuthorInfo author={poem.author} />

            {/* Categories */}
            {poem.categories.length > 0 && (
              <div className={styles.categories}>
                {poem.categories.map((category) => (
                  <Badge key={category.id} className={styles.categoryBadge}>
                    #{category.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleLike}
              className={cn(
                styles.actionButton,
                styles.likeButton,
                isLiked && styles.likeButtonActive,
              )}
            >
              <Heart
                className={cn(
                  styles.actionIcon,
                  isLiked && styles.actionIconFilled,
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className={cn(
                styles.actionButton,
                styles.saveButton,
                isFavorite && styles.saveButtonActive,
              )}
            >
              <Bookmark
                className={cn(
                  styles.actionIcon,
                  isFavorite && styles.actionIconFilled,
                )}
              />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <PoemStats
          views={views}
          likes={totalLikes}
          comments={commentsCount}
          videoUrl={poem.videoUrl}
          isCommentsOpen={isCommentsOpen}
          onToggleComments={onToggleComments}
        />
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Content */}
      <div className={styles.content}>
        {poem.description && (
          <p className={styles.description}>{poem.description}</p>
        )}
        {isCommentsOpen ? (
          <Comments poemId={poem.id} />
        ) : (
          <div className={styles.poemContent}>
            <div className={styles.verticalLine} />
            <p
              className={cn(
                styles.text,
                hasLongContent && !isExpanded && styles.textCollapsed,
              )}
            >
              {visibleContent}
            </p>

            {isGuestLimited && <PoemGuestGate />}

            {hasLongContent && (
              <Button
                variant="ghost"
                onClick={onToggleExpand}
                className={styles.expandButton}
              >
                <span className="text-sm font-medium">
                  {isExpanded ? t("poem.collapse") : t("poem.readMore")}
                </span>
                <ChevronDown
                  className={cn(
                    styles.expandIcon,
                    isExpanded && styles.expandIconRotated,
                  )}
                />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isCommentsOpen && (
        <div className={styles.footer}>
          <Link href={`/poem/${poem.id}`}>
            <Button className={styles.fullPageButton} variant="outline">
              <ExternalLink className={styles.fullPageIcon} />
              {t("poem.openFull")}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function AuthorInfo({ author }: { author: Poem["author"] }) {
  const { t } = useI18n();
  return (
    <div className={styles.authorInfo}>
      {author.image ? (
        <Image
          src={resolveMediaUrl(author.image)}
          alt={author.name}
          width={36}
          height={36}
          className={styles.authorImage}
          style={{ width: "36px", height: "36px", objectFit: "cover" }}
        />
      ) : (
        <div className={styles.authorPlaceholder}>
          <User className="w-4 h-4 text-slate-300" />
        </div>
      )}
      <div className={styles.authorDetails}>
        <span className={styles.authorName}>{author.name}</span>
        {author.birthYear && (
          <span className={styles.authorYears}>
            {author.birthYear}
            {author.deathYear ? ` – ${author.deathYear}` : ` – ${t("common.now")}`}
          </span>
        )}
      </div>
    </div>
  );
}

function PoemStats({
  views,
  likes,
  comments,
  videoUrl,
  isCommentsOpen,
  onToggleComments,
}: {
  views: number;
  likes: number;
  comments: number;
  videoUrl: string;
  isCommentsOpen: boolean;
  onToggleComments: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className={styles.stats}>
      <div className={styles.statItem}>
        <Eye className={cn(styles.statIcon, styles.viewsIcon)} />
        <span>{views.toLocaleString()}</span>
      </div>
      <div className={styles.statItem}>
        <Heart className={cn(styles.statIcon, styles.likesIcon)} />
        <span>{likes}</span>
      </div>
      <div
        className={cn(
          styles.statItem,
          isCommentsOpen && styles.statItemClickable,
          { [styles.statItemClickable]: true },
        )}
        onClick={onToggleComments}
        role="button"
        tabIndex={0}
      >
        <MessageCircle className={cn(styles.statIcon, styles.commentsIcon)} />
        <span>{comments}</span>
      </div>
      {videoUrl && (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.videoLink}
        >
          <Play className={styles.videoIcon} />
          <span>{t("poem.watchVideo")}</span>
        </a>
      )}
    </div>
  );
}
