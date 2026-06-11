"use client";

import { useState, useCallback } from "react";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";

export interface Placement {
  [itemId: string]: string | number;
}

export interface UseDragAndDropOptions<T extends string | number> {
  isChecked: boolean;
  onPlace?: (itemId: string, target: T) => void;
}

export function useDragAndDrop<T extends string | number>({
  isChecked,
  onPlace,
}: UseDragAndDropOptions<T>) {
  const [placements, setPlacements] = useState<Record<string, T>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      if (isChecked) return;

      const { active, over } = event;
      if (!over) return;

      const itemId = active.id as string;
      const targetId = over.id as T;

      setPlacements((prev) => {
        const newPlacements = { ...prev };
        
        // Remove any existing item from the target zone
        Object.entries(newPlacements).forEach(([iId, tId]) => {
          if (tId === targetId && iId !== itemId) {
            delete newPlacements[iId];
          }
        });
        
        newPlacements[itemId] = targetId;
        return newPlacements;
      });

      onPlace?.(itemId, targetId);
    },
    [isChecked, onPlace]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      if (isChecked) return;
      setPlacements((prev) => {
        const newPlacements = { ...prev };
        delete newPlacements[itemId];
        return newPlacements;
      });
    },
    [isChecked]
  );

  const clearPlacements = useCallback(() => {
    setPlacements({});
  }, []);

  const isPlaced = useCallback(
    (itemId: string) => itemId in placements,
    [placements]
  );

  const getPlacement = useCallback(
    (itemId: string) => placements[itemId],
    [placements]
  );

  return {
    placements,
    activeId,
    handleDragStart,
    handleDragEnd,
    removeItem,
    clearPlacements,
    isPlaced,
    getPlacement,
  };
}
