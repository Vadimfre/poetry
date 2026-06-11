"use client";

import Image from "next/image";
import { BookOpen, Calendar, Info, Star } from "lucide-react";
import { DialogHeader } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Holiday } from "@/src/shared";
import styles from "./hero-section.module.css";
import { useCalendarLabels } from "@/src/shared/i18n";
import { useI18n, usePlural } from "@/src/shared/i18n";

interface HeroSectionProps {
  holiday: Holiday;
}

export function HeroSection({ holiday }: HeroSectionProps) {
  const { formatHolidayDate, getSeasonLabel } = useCalendarLabels();

  return (
    <div className={styles.container}>
      <HeroBackground image={holiday.image ?? undefined} name={holiday.name} />

      <div className={styles.content}>
        <Badge className={styles.badge}>
          <Star className={styles.badgeIcon} />
          {getSeasonLabel(holiday.season)}
        </Badge>

        <div className={styles.dateContainer}>
          <div className={styles.dateIconWrapper}>
            <Calendar className={styles.dateIcon} />
          </div>
          <span className={styles.dateText}>
            {formatHolidayDate(holiday.day, holiday.month)}
          </span>
        </div>

        <DialogHeader className="text-left">
          <h2 className={styles.title}>{holiday.name}</h2>

          {holiday.description && (
            <p className={styles.description}>{holiday.description}</p>
          )}
        </DialogHeader>

        <HeroMeta poemsCount={holiday.poems.length} />
      </div>
    </div>
  );
}

function HeroBackground({ image, name }: { image?: string; name: string }) {
  if (image) {
    return (
      <>
        <Image
          src={image}
          alt={name}
          fill
          className={styles.backgroundImage}
          loading="eager"
          priority
        />
        <div className={styles.gradientRight} />
        <div className={styles.gradientTop} />
      </>
    );
  }

  return (
    <div className={styles.fallbackBackground}>
      <div className={styles.fallbackPattern}>
        <div className={styles.pulseCircle1} />
        <div className={styles.pulseCircle2} style={{ animationDelay: "1s" }} />
      </div>
    </div>
  );
}

function HeroMeta({ poemsCount }: { poemsCount: number }) {
  const { t } = useI18n();
  const plural = usePlural();
  const poemWord = plural(poemsCount, {
    one: "common.verseOne",
    few: "common.verseFew",
    many: "common.verseMany",
  });
  const poemsLabel =
    poemsCount === 0
      ? t("holiday.heroNoPoems")
      : `${poemsCount} ${poemWord}`;

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statItem}>
        <BookOpen className={`${styles.statIcon} ${styles.statIconBook}`} />
        <span className={styles.statValue}>{poemsLabel}</span>
      </div>
      <div className={styles.statItem}>
        <Info className={`${styles.statIcon} ${styles.statIconInfo}`} />
        <span className={styles.statValue}>
          {poemsCount === 0
            ? t("holiday.heroEmpty")
            : t("holiday.heroSeePoems")}
        </span>
      </div>
    </div>
  );
}
