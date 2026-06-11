"use client";

import { useState } from "react";
import { Send, X, Loader2 } from "lucide-react";
import type { Comment } from "@/src/shared/types";
import styles from "./CommentInput.module.css";
import { useI18n } from "@/src/shared/i18n";

interface CommentInputProps {
  poemId: number;
  isPending?: boolean;
  replyingTo?: Comment | null;
  onCancelReply?: () => void;
  onSubmit: (data: { poemId: number; text: string; parentId?: number }) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  areaRef?: React.Ref<HTMLDivElement>;
}

export function CommentInput({
  poemId,
  isPending,
  replyingTo,
  onCancelReply,
  onSubmit,
  inputRef,
  areaRef,
}: CommentInputProps) {
  const { t } = useI18n();
  const [inputValue, setInputValue] = useState("");

  // Отправка комментария
  const handleSend = () => {
    if (!inputValue.trim()) return;

    onSubmit({
      poemId,
      text: inputValue,
      parentId: replyingTo?.id,
    });
    setInputValue("");
  };

  // Обработчик для клавиатуры
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div ref={areaRef} className={styles.inputArea}>
      {/* Индикатор ответа */}
      {replyingTo && (
        <div className={styles.replyIndicator}>
          <span>
            {t("commentsSection.replyTo")} {replyingTo.text.slice(0, 50)}
            {replyingTo.text.length > 50 ? "..." : ""}
          </span>
          <button onClick={onCancelReply} className={styles.cancelReplyBtn}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className={styles.inputWrapper}>
        <textarea
          onKeyDown={handleKeyDown}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            replyingTo
              ? t("commentsSection.replyPlaceholder")
              : t("commentsSection.placeholder")
          }
          className={styles.input}
          rows={1}
          disabled={isPending}
          ref={inputRef}
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isPending}
          className={styles.sendBtn}
        >
          {isPending ? <Loader2 className="animate-spin" /> : <Send />}
        </button>
      </div>
    </div>
  );
}
