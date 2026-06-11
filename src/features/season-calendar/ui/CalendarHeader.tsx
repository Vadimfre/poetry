"use client";

import styles from "@/components/SeasonCalendar/SeasonCalendar.module.css";

interface CalendarHeaderProps {
  month: string;
  year: number;
}

export default function CalendarHeader({ month, year }: CalendarHeaderProps) {
  return (
    <div className={styles.header}>
      <span className={styles.month}>{month}</span>
      <span className={styles.year}>{year}</span>
    </div>
  );
}