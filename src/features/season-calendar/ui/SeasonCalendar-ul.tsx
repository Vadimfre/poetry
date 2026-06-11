"use client";

import styles from "@/components/SeasonCalendar/SeasonCalendar.module.css";
import { useSeasonCalendar } from "../model/use-season-calendar";
import { Holiday } from "@/src/shared";
import CalendarHeader from "./CalendarHeader";
import CalendarDays from "./CalendarDays";
import { HolidayModal } from "../../../../components/HolidayModal/holiday-modal";
import { useCalendarLabels } from "@/src/shared/i18n";

interface SeasonCalendarProps {
  holidays: Holiday[];
  monthNumbers: number[];
  year: number;
  accentColor?: string;
}

export default function SeasonCalendar({
  holidays,
  monthNumbers,
  year,
  accentColor = "#7cb342",
}: SeasonCalendarProps) {
  const { dayNames, getMonthsForNumbers } = useCalendarLabels();
  const months = getMonthsForNumbers(monthNumbers);

  const {
    activeMonthIndex,
    currentMonthNumber,
    days,
    selectedDay,
    selectedHoliday,
    modalOpen,
    handleDayClick,
    handleMonthClick,
    handlePrevMonth,
    handleNextMonth,
    handleCloseModal,
  } = useSeasonCalendar({ holidays, monthNumbers, year });

  const visibleMonthSlots = [-1, 0, 1].map((offset) => {
    const index = activeMonthIndex + offset;
    if (index < 0 || index >= months.length) {
      return { offset, empty: true as const };
    }
    return {
      offset,
      empty: false as const,
      index,
      month: months[index],
      monthNumber: monthNumbers[index],
    };
  });

  const prevMonthLabel =
    activeMonthIndex > 0 ? months[activeMonthIndex - 1] : null;
  const nextMonthLabel =
    activeMonthIndex < months.length - 1
      ? months[activeMonthIndex + 1]
      : null;

  return (
    <>
      <div
        className={styles.calendar}
        style={{ "--accent-color": accentColor } as React.CSSProperties}
      >
        <CalendarHeader month={months[activeMonthIndex]} year={year} />

        <CalendarDays dayNames={dayNames} />

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

        <div className={styles.monthNav}>
          <button
            type="button"
            className={styles.monthArrow}
            onClick={handlePrevMonth}
            disabled={activeMonthIndex === 0}
            aria-label={prevMonthLabel ?? "Папярэдні месяц"}
            title={prevMonthLabel ?? undefined}
          >
            <span className={styles.monthArrowIcon}>‹</span>
            {prevMonthLabel && (
              <span className={styles.monthArrowHint}>{prevMonthLabel}</span>
            )}
          </button>

          <div className={styles.seasonMonths}>
            {visibleMonthSlots.map((slot) => {
              if (slot.empty) {
                return (
                  <span
                    key={`empty-${slot.offset}`}
                    className={styles.seasonMonthEmpty}
                    aria-hidden="true"
                  />
                );
              }

              const isActive = slot.index === activeMonthIndex;

              return (
                <button
                  key={slot.monthNumber}
                  type="button"
                  className={`${styles.seasonMonth} ${
                    isActive ? styles.activeMonth : styles.neighborMonth
                  }`}
                  onClick={() => handleMonthClick(slot.index)}
                  aria-current={isActive ? "true" : undefined}
                  title={slot.month}
                >
                  {slot.month}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className={styles.monthArrow}
            onClick={handleNextMonth}
            disabled={activeMonthIndex === monthNumbers.length - 1}
            aria-label={nextMonthLabel ?? "Наступны месяц"}
            title={nextMonthLabel ?? undefined}
          >
            {nextMonthLabel && (
              <span className={styles.monthArrowHint}>{nextMonthLabel}</span>
            )}
            <span className={styles.monthArrowIcon}>›</span>
          </button>
        </div>
      </div>

      <HolidayModal
        open={modalOpen}
        onOpenChange={handleCloseModal}
        holiday={selectedHoliday as any}
        loading={false}
      />
    </>
  );
}
