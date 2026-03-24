"use client";

import styles from "@/components/SeasonCalendar/SeasonCalendar.module.css";

interface CalendarDaysProps {
  dayNames: string[];
}
export default function CalendarDays({ dayNames }: CalendarDaysProps) {
  return (
    <div className={styles.dayNames}>
      {dayNames.map((d) => (
        <span key={d} className={styles.dayName}>
          {d}
        </span>
      ))}
    </div>
  );
}
