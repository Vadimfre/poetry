"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/src/shared/types";
import React from "react";

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "user-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

// Provider для SSR совместимости
export const UserStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <>{children}</>;
};
