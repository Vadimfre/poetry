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

interface PoemCardProps {
  poem: Poem;
  index: number;
  isExpanded: boolean;
  isLiked: boolean;
  isSaved: boolean;
  totalLikes: number;
  onToggleExpand: () => void;
  onToggleLike: () => void;
  onToggleSave: () => void;
}

export function PoemCard({
  poem,
  index,
  isExpanded,
  isLiked,
  isSaved,
  totalLikes,
  onToggleExpand,
  onToggleLike,
  onToggleSave,
}: PoemCardProps) {
  const hasLongContent = poem.content.split("\n").length > 6;

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
                  <span className={styles.year}>{poem.year} год</span>
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
              onClick={onToggleSave}
              className={cn(
                styles.actionButton,
                styles.saveButton,
                isSaved && styles.saveButtonActive,
              )}
            >
              <Bookmark
                className={cn(
                  styles.actionIcon,
                  isSaved && styles.actionIconFilled,
                )}
              />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <PoemStats
          views={poem.views}
          likes={totalLikes}
          comments={poem._count?.comments ?? 0}
          videoUrl={poem.videoUrl}
        />
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Content */}
      <div className={styles.content}>
        {poem.description && (
          <p className={styles.description}>{poem.description}</p>
        )}
        <div className={styles.poemContent}>
          <div className={styles.verticalLine} />
          <p className={cn(styles.text, !isExpanded && styles.textCollapsed)}>
            {poem.content}
          </p>

          {hasLongContent && (
            <Button
              variant="ghost"
              onClick={onToggleExpand}
              className={styles.expandButton}
            >
              <span className="text-sm font-medium">
                {isExpanded ? "Згарнуць" : "Чытаць далей"}
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
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Button className={styles.fullPageButton} variant="outline">
          <ExternalLink className={styles.fullPageIcon} />
          Адкрыць поўную старонку верша
        </Button>
      </div>
    </div>
  );
}

function AuthorInfo({ author }: { author: Poem["author"] }) {
  return (
    <div className={styles.authorInfo}>
      {author.image ? (
        <Image
          src={author.image}
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
            {author.deathYear ? ` – ${author.deathYear}` : " – цяпер"}
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
}: {
  views: number;
  likes: number;
  comments: number;
  videoUrl: string;
}) {
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
      <div className={styles.statItem}>
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
          <span>Глядзець відэа</span>
        </a>
      )}
    </div>
  );
}
