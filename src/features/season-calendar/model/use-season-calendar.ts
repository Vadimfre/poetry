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
  const [activeMonthIndex, setActiveMonthIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

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

      if (selectedDay === day) {
        setSelectedDay(null);
        setSelectedHoliday(null);
      } else {
        setSelectedDay(day);
        setSelectedHoliday(getHolidayForDay(day) || null);
      }
    },
    [selectedDay, getHolidayForDay],
  );

  const handleMonthClick = useCallback((index: number) => {
    setActiveMonthIndex(index);
    setSelectedDay(null);
    setSelectedHoliday(null);
  }, []);

  return {
    activeMonthIndex,
    currentMonthNumber,
    days,
    selectedDay,
    selectedHoliday,
    handleDayClick,
    handleMonthClick,
  };
};
