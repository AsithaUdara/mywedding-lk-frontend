"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePlannerDashboardQuery } from "@/shared/hooks/query/usePlannerQueries";
import { queryKeys } from "@/shared/lib/query/queryKeys";
import type { PlannerDashboardResponse } from "@/shared/lib/api/planner";

export type PlannerWorkspaceBrand = {
  businessName: string;
  agencyLogoUrl: string | null;
  isPro: boolean;
};

type PlannerBrandingContextValue = {
  profile: PlannerDashboardResponse | null;
  brand: PlannerWorkspaceBrand | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const PlannerBrandingContext = createContext<PlannerBrandingContextValue | null>(null);

export function PlannerBrandingProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data: profile = null, isLoading, refetch } = usePlannerDashboardQuery();

  const brand = useMemo<PlannerWorkspaceBrand | null>(() => {
    if (!profile || profile.activePlanTier !== "PlannerPro") return null;

    return {
      businessName: profile.businessName || profile.plannerName || "Your studio",
      agencyLogoUrl: profile.agencyLogoUrl ?? null,
      isPro: true,
    };
  }, [profile]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.planner.dashboard() });
    await refetch();
  }, [queryClient, refetch]);

  const value = useMemo(
    () => ({ profile, brand, loading: isLoading, refresh }),
    [profile, brand, isLoading, refresh]
  );

  return (
    <PlannerBrandingContext.Provider value={value}>{children}</PlannerBrandingContext.Provider>
  );
}

export function usePlannerBranding() {
  const ctx = useContext(PlannerBrandingContext);
  if (!ctx) {
    throw new Error("usePlannerBranding must be used within PlannerBrandingProvider");
  }
  return ctx;
}
