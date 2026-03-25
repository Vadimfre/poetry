"use client";

import Image from "next/image";
import { Calendar, Star, BookOpen, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Holiday, Season } from "@/src/shared";
import { MONTH_NAMES } from "../../season-slider/season-slider-data";
import styles from "./info-tab.module.css";

interface InfoTabProps {
  holiday: Holiday;
}

export function InfoTab({ holiday }: InfoTabProps) {
  const uniqueAuthors = getUniqueAuthors(holiday);
  const poemCount = holiday.poems.length;
  const poemWord = getPoemWord(poemCount);

  return (
    <ScrollArea className={styles.scrollArea}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h3 className={styles.title}>
            Пра свята «{holiday.name}»
          </h3>

          <div className={styles.content}>
            <InfoRow
              icon={Calendar}
              label="Дата святкавання"
              value={`${holiday.day} ${MONTH_NAMES[holiday.month - 1]}`}
            />
            <InfoRow icon={Star} label="Сезон" value={Season[holiday.season]} />
            <InfoRow
              icon={BookOpen}
              label="Колькасць вершаў"
              value={`${poemCount} ${poemWord}`}
            />

            {holiday.description && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>
                  Апісанне
                </h4>
                <p className={styles.description}>
                  {holiday.description}
                </p>
              </div>
            )}

            {uniqueAuthors.length > 0 && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>
                  Аўтары вершаў
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

function getPoemWord(count: number): string {
  if (count === 1) return "верш";
  if (count < 5) return "вершы";
  return "вершаў";
}
