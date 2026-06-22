"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/src/shared/config/query-client";
import { UserStoreProvider } from "@/src/entities/user";
import { I18nProvider } from "@/src/shared/i18n";
import React from "react";
import { Toaster } from "sonner";
import { ScrollToTopOnNavigate } from "@/components/ScrollToTopOnNavigate/ScrollToTopOnNavigate";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <UserStoreProvider>
          <ScrollToTopOnNavigate />
          {children}
          <Toaster position="bottom-left" />
        </UserStoreProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
