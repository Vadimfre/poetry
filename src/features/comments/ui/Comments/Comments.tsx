"use client";

import { cn } from "@/lib/utils";
import { useCommentsList, useCreateComment, useReplyTo } from "../../model";
import { CommentsList } from "../CommentsList/CommentsList";
import { CommentInput } from "../CommentInput/CommentInput";
import styles from "./Comments.module.css";
import { useCallback, useRef, useState } from "react";

interface CommentsProps {
  poemId: number;
  className?: string;
}

export function Comments({ poemId, className }: CommentsProps) {
  const { data: comments, isLoading, error, refetch } = useCommentsList(poemId);

  const { mutate: createComment, isPending } = useCreateComment();

  const listRef = useRef<HTMLDivElement>(null);

  const { replyingTo, handleReply, cancelReply, textareaRef, areaRef } =
    useReplyTo(listRef);

  const [autoOpenParentId, setAutoOpenParentId] = useState<number | null>(null);
  const [scrollToCommentId, setScrollToCommentId] = useState<number | null>(
    null,
  );

  // Создание комментария
  const handleCreateComment = useCallback(
    (data: { poemId: number; text: string; parentId?: number }) => {
      createComment(data, {
        onSuccess: (newComment) => {
          cancelReply();
          if (data.parentId) {
            setAutoOpenParentId(data.parentId);
          }
          setScrollToCommentId(newComment.id);
        },
      });
    },
    [createComment, cancelReply],
  );

  return (
    <div className={cn(styles.container, className)}>
      {/* Comments List */}
      <CommentsList
        comments={comments || []}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onReply={handleReply}
        listRef={listRef}
        autoOpenParentId={autoOpenParentId}
        setAutoOpenParentId={setAutoOpenParentId}
        scrollToCommentId={scrollToCommentId}
        setScrollToCommentId={setScrollToCommentId}
      />

      {/* Input Area */}
      <CommentInput
        poemId={poemId}
        isPending={isPending}
        replyingTo={replyingTo}
        onCancelReply={cancelReply}
        onSubmit={handleCreateComment}
        inputRef={textareaRef}
        areaRef={areaRef}
      />
    </div>
  );
}
