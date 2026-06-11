"use client";

import Image from "next/image";
import { Calendar, Star, BookOpen, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Holiday } from "@/src/shared";
import styles from "./info-tab.module.css";
import { useCalendarLabels } from "@/src/shared/i18n";
import { useI18n, usePlural } from "@/src/shared/i18n";

interface InfoTabProps {
  holiday: Holiday;
}

export function InfoTab({ holiday }: InfoTabProps) {
  const { t } = useI18n();
  const plural = usePlural();
  const { formatHolidayDate, getSeasonLabel } = useCalendarLabels();
  const uniqueAuthors = getUniqueAuthors(holiday);
  const poemCount = holiday.poems.length;
  const poemWord = plural(poemCount, {
    one: "common.poemOne",
    few: "common.poemFew",
    many: "common.poemMany",
  });

  return (
    <ScrollArea className={styles.scrollArea}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h3 className={styles.title}>
            {t("holiday.aboutTitle", { name: holiday.name })}
          </h3>

          <div className={styles.content}>
            <InfoRow
              icon={Calendar}
              label={t("holiday.dateLabel")}
              value={formatHolidayDate(holiday.day, holiday.month)}
            />
            <InfoRow
              icon={Star}
              label={t("holiday.seasonLabel")}
              value={getSeasonLabel(holiday.season)}
            />
            <InfoRow
              icon={BookOpen}
              label={t("holiday.poemCountLabel")}
              value={`${poemCount} ${poemWord}`}
            />

            {holiday.description && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>
                  {t("holiday.descriptionLabel")}
                </h4>
                <p className={styles.description}>{holiday.description}</p>
              </div>
            )}

            {uniqueAuthors.length > 0 && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>
                  {t("holiday.authorsLabel")}
                </h4>
                <div className={styles.authorsContainer}>
                  {uniqueAuthors.map((author) => (
                    <AuthorChip key={author.name} author={author} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className={styles.infoRow}>
      <Icon className={styles.infoIcon} />
      <div>
        <p className={styles.infoLabel}>{label}</p>
        <p className={styles.infoValue}>{value}</p>
      </div>
    </div>
  );
}

function AuthorChip({ author }: { author: { name: string; image?: string } }) {
  return (
    <div className={styles.authorChip}>
      {author.image ? (
        <Image
          src={author.image}
          alt={author.name}
          width={20}
          height={20}
          className={styles.authorImage}
          style={{ width: "auto", height: "auto" }}
        />
      ) : (
        <div className={styles.authorPlaceholder}>
          <User className={styles.authorPlaceholderIcon} />
        </div>
      )}
      <span className={styles.authorName}>{author.name}</span>
    </div>
  );
}

function getUniqueAuthors(holiday: Holiday) {
  const seen = new Set<string>();
  return holiday.poems
    .filter((p) => {
      if (seen.has(p.author.name)) return false;
      seen.add(p.author.name);
      return true;
    })
    .map((p) => ({ name: p.author.name, image: p.author.image ?? undefined }));
}
