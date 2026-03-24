"use client";

import { useState, useEffect } from "react";
import styles from "@/components/SeasonCalendar/SeasonCalendar.module.css";
import { useSeasonCalendar } from "../model/use-season-calendar";
import { Holiday } from "@/src/shared";
import CalendarHeader from "./CalendarHeader";
import CalendarDays from "./CalendarDays";
import { useHolidaysByMonthAndDay } from "../../holidays/model/use-holidays";
import { seasonMap } from "../../season-slider/season-slider-data";
import { HolidayModal } from "../../holidays/ui/holiday-modal";

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
  season,
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
    selectedDay,
    handleDayClick,
    handleMonthClick,
  } = useSeasonCalendar({ holidays, monthNumbers, year });

  const apiSeason = seasonMap[season];

  const { data, isLoading } = useHolidaysByMonthAndDay(
    currentMonthNumber,
    selectedDay,
    apiSeason,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalHoliday, setModalHoliday] = useState<Holiday | null>(null);

  // Открываем модальное окно при выборе дня, если есть праздник
  useEffect(() => {
    if (selectedDay && data && data.length > 0) {
      setModalHoliday(data[0]);
      setModalOpen(true);
    } else {
      setModalOpen(false);
    }
  }, [selectedDay, data]);

  const handleCloseModal = () => {
    setModalOpen(false);
    // Сбросить выбранный день
    if (selectedDay) {
      handleDayClick(selectedDay); // это сбросит выделение, т.к. день уже выбран
    }
  };

  return (
    <>
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
            const isSelected = day !== null && selectedDay === day;

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
      </div>

      {/* Модальное окно праздника */}
      <HolidayModal
        open={modalOpen}
        onOpenChange={handleCloseModal}
        holiday={modalHoliday as any}
        loading={isLoading}
      />
    </>
  );
}
