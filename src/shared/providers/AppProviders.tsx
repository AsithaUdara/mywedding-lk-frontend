"use client";

import { QueryProvider } from "@/shared/providers/QueryProvider";
import { AuthProvider } from "@/shared/context/AuthContext";
import { UIProvider } from "@/shared/context/UIContext";
import { NotificationProvider } from "@/shared/context/NotificationContext";
import type { ReactNode } from "react";

/** Client-side providers (auth, React Query, UI). */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        <NotificationProvider>
          <UIProvider>{children}</UIProvider>
        </NotificationProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
