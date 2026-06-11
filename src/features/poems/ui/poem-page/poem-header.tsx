"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Share2, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/src/shared/i18n";

interface PoemHeaderProps {
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function PoemHeader({ isFavorite, onToggleFavorite }: PoemHeaderProps) {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <motion.div
      className="sticky top-0 z-40 -mx-6 -mt-12 mb-8 px-6 py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: "rgba(251, 245, 236, 0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(120, 93, 62, 0.08)",
      }}
    >
      <div
        className="mx-auto flex items-center justify-between"
        style={{ maxWidth: "920px" }}
      >
        <motion.button
          onClick={() => router.back()}
          className="group flex items-center gap-2 rounded-xl px-3 py-2 text-stone-500 transition-all hover:bg-white/70 hover:text-stone-900"
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-sm font-medium">{t("common.back")}</span>
        </motion.button>

        <div className="flex items-center gap-2">
          <motion.button
            className="rounded-xl border border-stone-200/80 bg-white/75 p-2.5 text-stone-500 transition-all hover:bg-white hover:text-stone-900"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={t("poem.share")}
          >
            <Share2 className="h-4 w-4" />
          </motion.button>

          <motion.button
            onClick={onToggleFavorite}
            className="rounded-xl border border-stone-200/80 p-2.5 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            aria-label={t("poem.favorite")}
            style={{
              color: isFavorite ? "#f59e0b" : "#64748b",
              background: isFavorite
                ? "rgba(245, 158, 11, 0.12)"
                : "rgba(255,255,255,0.72)",
            }}
          >
            <Bookmark
              className="h-4 w-4 transition-all"
              fill={isFavorite ? "currentColor" : "none"}
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
