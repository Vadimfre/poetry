"use client";

import styles from "@/components/SeasonCalendar/SeasonCalendar.module.css";
import { useSeasonCalendar } from "../model/use-season-calendar";
import { Holiday } from "@/src/shared";
import CalendarHeader from "./CalendarHeader";
import CalendarDays from "./CalendarDays";

interface SeasonCalendarProps {
  season: "spring" | "summer" | "autumn" | "winter";
  holidays: Holiday[];
  months: string[];
  monthNumbers: number[];
  year: number;
  accentColor?: string;
}

const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

export default function SeasonCalendar({
  holidays,
  months,
  monthNumbers,
  year,
  accentColor = "#7cb342",
}: SeasonCalendarProps) {
  const {
    activeMonthIndex,
    currentMonthNumber,
    days,
    selectedHoliday,
    handleDayClick,
    handleMonthClick,
  } = useSeasonCalendar({ holidays, months, monthNumbers, year });

  return (
    <div
      className={styles.calendar}
      style={{ "--accent-color": accentColor } as React.CSSProperties}
    >
      {/* Header */}
      <CalendarHeader month={months[activeMonthIndex]} year={2026} />

      {/* Дни недели */}
      <CalendarDays dayNames={dayNames} />

      {/* Сетка дней */}
      <div className={styles.days}>
        {days.map((day, i) => {
          const holiday = day
            ? holidays.find(
                (h) => h.day === day && h.month === currentMonthNumber,
              )
            : undefined;
          const isSelected =
            selectedHoliday?.day === day &&
            selectedHoliday?.month === currentMonthNumber;

          return (
            <span
              key={i}
              className={`${styles.day} ${day === null ? styles.empty : ""} ${
                holiday ? styles.holiday : ""
              } ${isSelected ? styles.selected : ""}`}
              onClick={() => handleDayClick(day)}
              title={holiday?.name}
            >
              {day}
              {holiday && <span className={styles.holidayDot} />}
            </span>
          );
        })}
      </div>

      {/* Месяцы сезона */}
      <div className={styles.seasonMonths}>
        {months.map((month, index) => (
          <button
            key={month}
            className={`${styles.seasonMonth} ${
              index === activeMonthIndex ? styles.activeMonth : ""
            }`}
            onClick={() => handleMonthClick(index)}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Попап выбранного праздника */}

    </div>
  );
}
