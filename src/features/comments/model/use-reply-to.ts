"use client";

import { useState, useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import type { Comment } from "@/src/shared/types";
import {
  smoothScrollElementToBottom,
  smoothScrollIntoView,
} from "@/src/shared/utils/smooth-scroll-to";

export const useReplyTo = (
  listRef?: React.RefObject<HTMLDivElement | null>,
) => {
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const handleReply = useCallback(
    (comment: Comment) => {
      flushSync(() => {
        setReplyingTo(comment);
      });

      const scrollPromises: Promise<void>[] = [];

      // 1) Scroll the comments list to its very bottom
      const listEl = listRef?.current;
      if (listEl) {
        scrollPromises.push(
          smoothScrollElementToBottom(listEl, {
            duration: 450,
            offset: 0,
          }),
        );
      }

      // 2) Scroll outer containers so the input area is visible with padding below
      const areaEl = areaRef.current;
      if (areaEl) {
        scrollPromises.push(
          smoothScrollIntoView(areaEl, {
            duration: 450,
            offset: 24,
          }),
        );
      }

      // 3) Focus textarea only after ALL scroll animations finish
      Promise.all(scrollPromises).then(() => {
        textareaRef.current?.focus();
      });
    },
    [listRef],
  );

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  return {
    replyingTo,
    handleReply,
    cancelReply,
    textareaRef,
    areaRef,
  };
};
