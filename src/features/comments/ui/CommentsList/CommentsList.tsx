"use client";

import { useCallback, useEffect, useState } from "react";
import { CommentCard } from "../CommentCard/CommentCard";
import { LoadingState, ErrorState, EmptyState } from "@/src/shared/ui";
import type { Comment } from "@/src/shared/types";
import styles from "./CommentsList.module.css";

// Функция для сбора всех ответов под корневым комментарием
const collectAllReplies = (
  allComments: Comment[],
  parentId: number,
): Comment[] => {
  const result: Comment[] = [];
  const directReplies = allComments.filter((c) => c.parentId === parentId);

  for (const reply of directReplies) {
    result.push(reply);
    // Рекурсивно собираем ответы на этот ответ
    result.push(...collectAllReplies(allComments, reply.id));
  }

  return result;
};

interface CommentsListProps {
  comments: Comment[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onReply?: (comment: Comment) => void;
  listRef?: React.Ref<HTMLDivElement>;
  autoOpenParentId?: number | null;
  setAutoOpenParentId?: (id: number | null) => void;
  scrollToCommentId?: number | null;
  setScrollToCommentId?: (id: number | null) => void;
}

export function CommentsList({
  comments,
  isLoading,
  error,
  onRetry,
  onReply,
  listRef,
  autoOpenParentId,
  setAutoOpenParentId,
  scrollToCommentId,
  setScrollToCommentId,
}: CommentsListProps) {
  // Состояние для открытых комментариев
  const [expandedComments, setExpandedComments] = useState<Set<number>>(
    new Set(),
  );
  // Корневые комментарии
  const mainComments = comments?.filter((c) => !c.parentId) ?? [];

  // Автооткрытие ответов при ответе
  useEffect(() => {
    if (autoOpenParentId) {
      setExpandedComments((prev) => {
        const newSet = new Set(prev);
        newSet.add(autoOpenParentId);
        return newSet;
      });
      setAutoOpenParentId?.(null);
    }
  }, [autoOpenParentId, setAutoOpenParentId]);

  // Скролл до отправленного коммента
  useEffect(() => {
    if (!scrollToCommentId) return;

    const el = document.getElementById(`comment-${scrollToCommentId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setScrollToCommentId?.(null);
    }
  }, [scrollToCommentId, comments, setScrollToCommentId]);

  // Переключение ответов для комментария
  const toggleReplies = useCallback((commentId: number) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      if (newSet.size === prev.size) return prev;

      return newSet;
    });
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (mainComments.length === 0) {
    return <EmptyState />;
  }

  return (
    <div ref={listRef} className={styles.list}>
      {mainComments.map((comment) => {
        const replies = collectAllReplies(comments, comment.id);
        const isExpanded = expandedComments.has(comment.id);
        return (
          <CommentCard
            key={comment.id}
            comment={comment}
            replies={replies}
            showReplies={isExpanded}
            onToggleReplies={() => toggleReplies(comment.id)}
            onReply={onReply}
          />
        );
      })}
    </div>
  );
}
