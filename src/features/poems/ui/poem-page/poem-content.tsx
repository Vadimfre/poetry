"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { User, Quote } from "lucide-react";
import type { Poem } from "@/src/shared/types";
import PoemGuestGate from "@/components/PoemGuestGate/PoemGuestGate";
import { useUserStore } from "@/src/entities/user";
import { useI18n } from "@/src/shared/i18n";
import type { Locale } from "@/src/shared/i18n/types";

interface PoemContentProps {
  poem: Poem;
}

function dateLocaleFor(locale: Locale): string {
  return locale === "be" ? "be-BY" : locale === "ru" ? "ru-RU" : "en-US";
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function PoemContent({ poem }: PoemContentProps) {
  const { t, locale } = useI18n();
  const { isAuthenticated, hasHydrated } = useUserStore();
  const visibleContent = poem.content ?? "";
  const isGuestLimited = hasHydrated && !isAuthenticated && !!visibleContent.trim();

  const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return t("poem.relativeJustNow");
    if (diffMinutes < 60) {
      return t("poem.relativeMinutes", { count: diffMinutes });
    }
    if (diffHours < 24) {
      return t("poem.relativeHours", { count: diffHours });
    }
    if (diffDays < 7) {
      return t("poem.relativeDays", { count: diffDays });
    }
    return date.toLocaleDateString(dateLocaleFor(locale), {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Author + time */}
      <motion.div
        className="flex items-center gap-4"
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.5 }}
      >
        {poem.author.image ? (
          <Image
            src={poem.author.image}
            alt={poem.author.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/30 shadow-md"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 ring-2 ring-amber-100 shadow-md">
            <User className="h-5 w-5 text-amber-600" />
          </div>
        )}
        <div>
          <p className="text-[15px] font-semibold text-stone-900">
            {poem.author.name}
          </p>
          <p className="text-sm text-stone-500">
            {poem.author.birthYear &&
              `${poem.author.birthYear}${poem.author.deathYear ? ` – ${poem.author.deathYear}` : ""}`}
            {poem.author.birthYear && " · "}
            {formatRelativeTime(poem.createdAt)}
          </p>
        </div>
      </motion.div>

      {/* Title */}
      {poem.title && (
        <motion.h1
          className="text-3xl font-serif font-bold leading-tight text-stone-950"
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {poem.title}
        </motion.h1>
      )}

      {/* Categories */}
      {poem.categories.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-2"
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {poem.categories.map((category) => (
            <span
              key={category.id}
              className="cursor-pointer rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 transition-colors hover:border-amber-300 hover:bg-amber-100"
            >
              #{category.name}
            </span>
          ))}
        </motion.div>
      )}

      {/* Poem text card */}
      <motion.div
        className="relative overflow-hidden rounded-[28px] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(250,244,235,0.98))] p-8 shadow-[0_24px_60px_rgba(76,57,35,0.08)]"
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Decorative quote */}
        <Quote className="pointer-events-none absolute -right-2 -top-2 h-20 w-20 rotate-12 text-amber-100" />

        {/* Description */}
        {poem.description && (
          <p className="mb-6 rounded-r-lg border-l-2 border-amber-400/60 bg-amber-50 py-2 pl-4 text-sm italic leading-relaxed text-stone-600">
            {poem.description}
          </p>
        )}

        {/* Poem body */}
        <div className="relative pl-6">
          <div
            className="absolute left-0 top-0 bottom-0 w-0.75 rounded-full"
            style={{
              background:
                "linear-gradient(to bottom, #fbbf24, #f97316, #fbbf24)",
            }}
          />
          <p className="whitespace-pre-line font-serif text-[17px] leading-loose text-stone-700">
            {visibleContent}
          </p>
          {isGuestLimited && <PoemGuestGate className="mt-6" />}
        </div>

        {/* Year */}
        {poem.year && (
          <p className="mt-6 text-right text-sm italic text-stone-500">
            {poem.year} {t("common.year")}
          </p>
        )}
      </motion.div>
    </div>
  );
}
