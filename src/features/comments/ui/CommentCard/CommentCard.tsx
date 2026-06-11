"use client";

import Image from "next/image";
import { User } from "lucide-react";
import type { Comment } from "@/src/shared/types";
import styles from "./CommentCard.module.css";
import { Button } from "@/components/ui/button";
import { useI18n, usePlural } from "@/src/shared/i18n";

interface CommentCardProps {
  comment: Comment;
  onReply?: (comment: Comment) => void;
  replies?: Comment[];
  showReplies?: boolean;
  onToggleReplies?: () => void;
}

export function CommentCard({
  comment,
  onReply,
  replies = [],
  showReplies = false,
  onToggleReplies,
}: CommentCardProps) {
  const { t, locale } = useI18n();
  const plural = usePlural();
  const dateLocale =
    locale === "be" ? "be-BY" : locale === "ru" ? "ru-RU" : "en-US";
  const hasReplies = replies.length > 0;

  return (
    <div id={`comment-${comment.id}`} className={styles.commentWrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          {comment.user?.avatar ? (
            <Image
              src={comment.user.avatar}
              alt={comment.user.name || ""}
              width={32}
              height={32}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <User />
            </div>
          )}
          <div className={styles.userInfo}>
            <div className={styles.userNameRow}>
              <span className={styles.userName}>
                {comment.user?.name || "Anonim"}
              </span>
              {onReply && (
                <Button
                  onClick={() => onReply(comment)}
                  className={styles.replyBtn}
                >
                  {t("commentsSection.reply")}
                </Button>
              )}
            </div>
            <span className={styles.time}>
              {new Date(comment.createdAt).toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </div>

        {/* Пометка "ответ на @username" */}
        {comment.parent && (
          <div className={styles.replyTo}>
            {t("commentsSection.replyToUser", {
              name: comment.parent.user?.name ?? "",
            })}
          </div>
        )}

        <p className={styles.text}>{comment.text}</p>

        {hasReplies && onToggleReplies && (
          <div className={styles.actions}>
            <button onClick={onToggleReplies} className={styles.showRepliesBtn}>
              {showReplies
                ? t("commentsSection.hide")
                : `${replies.length} ${plural(replies.length, {
                    one: "commentsSection.replyOne",
                    few: "commentsSection.replyFew",
                    many: "commentsSection.replyMany",
                  })}`}
            </button>
          </div>
        )}
      </div>

      {/* Вложенные ответы */}
      {showReplies && hasReplies && (
        <div className={styles.replies}>
          {replies.map((reply) => (
            <CommentCard key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}
