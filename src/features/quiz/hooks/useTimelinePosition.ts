"use client";

import { useState, useCallback, useRef } from "react";

export interface UseTimelinePositionOptions {
  timelineStart: number;
  timelineEnd: number;
}

export function useTimelinePosition({
  timelineStart,
  timelineEnd,
}: UseTimelinePositionOptions) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineRectRef = useRef<DOMRect | null>(null);
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastHoverYearRef = useRef<number | null>(null);

  const captureTimelineRect = useCallback(() => {
    if (!timelineRef.current) {
      timelineRectRef.current = null;
      return;
    }
    timelineRectRef.current = timelineRef.current.getBoundingClientRect();
  }, []);

  const clearTimelineRect = useCallback(() => {
    timelineRectRef.current = null;
  }, []);

  const calculateYearFromPosition = useCallback(
    (clientX: number): number | null => {
      if (!timelineRef.current) return null;

      const rect =
        timelineRectRef.current ?? timelineRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
      const year = Math.round(
        timelineStart + percentage * (timelineEnd - timelineStart),
      );

      return year;
    },
    [timelineStart, timelineEnd],
  );

  const calculatePositionFromYear = useCallback(
    (year: number): number => {
      return ((year - timelineStart) / (timelineEnd - timelineStart)) * 100;
    },
    [timelineStart, timelineEnd],
  );

  const isWithinTimeline = useCallback(
    (clientX: number, clientY: number): boolean => {
      if (!timelineRef.current) return false;

      const rect =
        timelineRectRef.current ?? timelineRef.current.getBoundingClientRect();
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top - 150 &&
        clientY <= rect.bottom + 80
      );
    },
    [],
  );

  const updateHoverYear = useCallback(
    (clientX: number) => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const year = calculateYearFromPosition(clientX);
        if (year !== lastHoverYearRef.current) {
          lastHoverYearRef.current = year;
          setHoverYear(year);
        }
      });
    },
    [calculateYearFromPosition],
  );

  const clearHoverYear = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    lastHoverYearRef.current = null;
    setHoverYear(null);
  }, []);

  const generateMarkers = useCallback(
    (count: number = 5): number[] => {
      const markers: number[] = [];
      for (let i = 0; i <= count; i++) {
        const year = Math.round(
          timelineStart + (i / count) * (timelineEnd - timelineStart),
        );
        markers.push(year);
      }
      return markers;
    },
    [timelineStart, timelineEnd],
  );

  return {
    timelineRef,
    hoverYear,
    calculateYearFromPosition,
    calculatePositionFromYear,
    isWithinTimeline,
    updateHoverYear,
    clearHoverYear,
    generateMarkers,
    captureTimelineRect,
    clearTimelineRect,
  };
}
