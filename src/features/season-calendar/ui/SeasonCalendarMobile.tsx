"use client";

import { useSeasonCalendar } from "../model/use-season-calendar";
import { Holiday } from "@/src/shared";
import { HolidayModal } from "../../../../components/HolidayModal/holiday-modal";
import { useCalendarLabels, useI18n } from "@/src/shared/i18n";
import styles from "./SeasonCalendarMobile.module.css";

interface SeasonCalendarMobileProps {
  holidays: Holiday[];
  monthNumbers: number[];
  year: number;
  accentColor?: string;
  seasonLabel: string;
}

export function SeasonCalendarMobile({
  holidays,
  monthNumbers,
  year,
  accentColor = "#7cb342",
  seasonLabel,
}: SeasonCalendarMobileProps) {
  const { t } = useI18n();
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

  const prevMonthLabel =
    activeMonthIndex > 0 ? months[activeMonthIndex - 1] : null;
  const nextMonthLabel =
    activeMonthIndex < months.length - 1
      ? months[activeMonthIndex + 1]
      : null;

  return (
    <>
      <section
        className={styles.section}
        style={{ "--accent-color": accentColor } as React.CSSProperties}
        aria-label={t("calendar.title")}
      >
        <div className={styles.sectionHead}>
          <p className={styles.seasonLabel}>{seasonLabel}</p>
          <h3 className={styles.sectionTitle}>{t("calendar.title")}</h3>
        </div>

        <div className={styles.monthStrip} role="tablist" aria-label={t("calendar.selectMonth")}>
          {months.map((month, index) => (
            <button
              key={monthNumbers[index]}
              type="button"
              role="tab"
              aria-selected={index === activeMonthIndex}
              className={`${styles.monthPill} ${
                index === activeMonthIndex ? styles.monthPillActive : ""
              }`}
              onClick={() => handleMonthClick(index)}
            >
              {month}
            </button>
          ))}
        </div>

        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.month}>{months[activeMonthIndex]}</span>
            <span className={styles.year}>{year}</span>
          </div>

          <div className={styles.dayNames}>
            {dayNames.map((d) => (
              <span key={d} className={styles.dayName}>
                {d}
              </span>
            ))}
          </div>

          <div className={styles.days}>
            {days.map((day, i) => {
              const holiday = day
                ? holidays.find(
                    (h) => h.day === day && h.month === currentMonthNumber,
                  )
                : undefined;
              const isSelected = day !== null && selectedDay === day;

              return (
                <button
                  key={i}
                  type="button"
                  disabled={day === null}
                  className={`${styles.day} ${day === null ? styles.empty : ""} ${
                    holiday ? styles.holiday : ""
                  } ${isSelected ? styles.selected : ""}`}
                  onClick={() => handleDayClick(day)}
                  aria-label={holiday ? holiday.name : undefined}
                >
                  {day}
                  {holiday && <span className={styles.holidayDot} aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <div className={styles.monthNav}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={handlePrevMonth}
              disabled={activeMonthIndex === 0}
              aria-label={prevMonthLabel ?? t("calendar.prevMonth")}
            >
              ‹
            </button>
            <span className={styles.navCurrent}>
              {months[activeMonthIndex]} {year}
            </span>
            <button
              type="button"
              className={styles.navBtn}
              onClick={handleNextMonth}
              disabled={activeMonthIndex === monthNumbers.length - 1}
              aria-label={nextMonthLabel ?? t("calendar.nextMonth")}
            >
              ›
            </button>
          </div>
        </div>
      </section>

      <HolidayModal
        open={modalOpen}
        onOpenChange={handleCloseModal}
        holiday={selectedHoliday as any}
        loading={false}
      />
    </>
  );
}
