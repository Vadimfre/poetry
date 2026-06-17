"use client";

import { useState, useCallback } from "react";
import type { Holiday } from "@/src/shared/types/holiday.types";

interface UseSeasonCalendarProps {
  holidays: Holiday[];
  monthNumbers: number[];
  year: number;
}

export const useSeasonCalendar = ({
  holidays,
  monthNumbers,
  year,
}: UseSeasonCalendarProps) => {
  const [activeMonthIndex, setActiveMonthIndex] = useState(() => {
    const currentMonth = new Date().getMonth() + 1;
    const idx = monthNumbers.indexOf(currentMonth);
    return idx >= 0 ? idx : 0;
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const currentMonthNumber = monthNumbers[activeMonthIndex];

  const days = getDaysInMonth(year, currentMonthNumber);

  function getDaysInMonth(year: number, month: number) {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const result: (number | null)[] = [];
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < startOffset; i++) result.push(null);
    for (let day = 1; day <= daysInMonth; day++) result.push(day);

    return result;
  }

  const getHolidayForDay = useCallback(
    (day: number) =>
      holidays.find((h) => h.day === day && h.month === currentMonthNumber),
    [holidays, currentMonthNumber],
  );

  const handleDayClick = useCallback(
    (day: number | null) => {
      if (!day) return;
      const holiday = getHolidayForDay(day);
      if (!holiday) return;

      if (selectedDay === day) {
        setSelectedDay(null);
        setSelectedHoliday(null);
        setModalOpen(false);
      } else {
        setSelectedDay(day);
        setSelectedHoliday(getHolidayForDay(day) || null);
        setModalOpen(true);
      }
    },
    [selectedDay, getHolidayForDay],
  );

  const handleMonthClick = useCallback((index: number) => {
    setActiveMonthIndex(index);
    setSelectedDay(null);
    setSelectedHoliday(null);
  }, []);

  const handlePrevMonth = useCallback(() => {
    setActiveMonthIndex((prev) => Math.max(0, prev - 1));
    setSelectedDay(null);
    setSelectedHoliday(null);
  }, []);

  const handleNextMonth = useCallback(() => {
    setActiveMonthIndex((prev) =>
      Math.min(monthNumbers.length - 1, prev + 1),
    );
    setSelectedDay(null);
    setSelectedHoliday(null);
  }, [monthNumbers.length]);

  const handleHolidayClick = useCallback((holiday: Holiday) => {
    setSelectedDay(holiday.day);
    setSelectedHoliday(holiday);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback((open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setSelectedDay(null);
      setSelectedHoliday(null);
    }
  }, []);

  const monthHolidays = holidays.filter((h) => h.month === currentMonthNumber);

  return {
    activeMonthIndex,
    currentMonthNumber,
    days,
    selectedDay,
    selectedHoliday,
    modalOpen,
    monthHolidays,
    handleDayClick,
    handleHolidayClick,
    handleMonthClick,
    handlePrevMonth,
    handleNextMonth,
    handleCloseModal,
  };
};
