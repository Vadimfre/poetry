"use client";

import { useI18n } from "@/src/shared/i18n";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Comments } from "@/src/features/comments";

interface PoemPageCommentsProps {
  poemId: number;
  commentsCount: number;
  isOpen: boolean;
}

export function PoemPageComments({
  poemId,
  commentsCount,
  isOpen,
}: PoemPageCommentsProps) {
  const { t } = useI18n();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          className="overflow-hidden"
        >
          <div className="mt-8">
            {/* Section header */}
            <motion.div
              className="mb-6 flex items-center gap-3 rounded-[24px] border border-stone-200/70 bg-white/85 px-5 py-4 shadow-[0_14px_36px_rgba(76,57,35,0.08)] backdrop-blur-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-stone-900">
                  {t("commentsSection.title")}
                </h3>
                <p className="text-sm text-stone-500">
                  {t("commentsSection.subtitle")}
                </p>
              </div>
              {commentsCount > 0 && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {commentsCount}
                </span>
              )}
            </motion.div>

            {/* Comments list */}
            <motion.div
              className="overflow-hidden rounded-[28px] border border-stone-200/80 bg-white/90 shadow-[0_24px_60px_rgba(76,57,35,0.08)] backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <Comments poemId={poemId} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
