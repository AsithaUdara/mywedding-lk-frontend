"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerDashboard, type PlannerDashboardResponse } from "@/shared/lib/api/planner";

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
  const { user } = useAuth();
  const [profile, setProfile] = useState<PlannerDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerDashboard(token);
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const brand = useMemo<PlannerWorkspaceBrand | null>(() => {
    if (!profile || profile.activePlanTier !== "PlannerPro") return null;

    return {
      businessName: profile.businessName || profile.plannerName || "Your studio",
      agencyLogoUrl: profile.agencyLogoUrl ?? null,
      isPro: true,
    };
  }, [profile]);

  const value = useMemo(
    () => ({ profile, brand, loading, refresh }),
    [profile, brand, loading, refresh]
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
