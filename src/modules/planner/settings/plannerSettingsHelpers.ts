import type { PlannerDashboardResponse } from "@/shared/lib/api/planner";
import { formatPlannerPlanTier, isPlannerProTier } from "@/modules/planner/subscription/planTier";

export type SettingsTab = "profile" | "branding" | "templates";

export const SETTINGS_JIRA_INPUT =
  "w-full rounded border border-[#DFE1E6] bg-white px-3 py-2 text-sm text-[#172B4D] outline-none transition-colors placeholder:text-[#97A0AF] focus:border-primary focus:ring-2 focus:ring-primary/20";

export type SettingsPortfolioStats = {
  planLabel: string;
  isPro: boolean;
  eventCapacity: number | string;
  managedEvents: number;
  capacityLabel: string;
};

export function computeSettingsStats(profile: PlannerDashboardResponse | null): SettingsPortfolioStats {
  const isPro = isPlannerProTier(profile?.activePlanTier);
  const capacity = profile?.maxConcurrentEvents;

  return {
    planLabel: formatPlannerPlanTier(profile?.activePlanTier),
    isPro,
    eventCapacity: isPro ? "Unlimited" : (capacity ?? "—"),
    managedEvents: profile?.events?.length ?? 0,
    capacityLabel: isPro ? "Planner Pro" : "Concurrent weddings",
  };
}

export function parseSettingsTab(value: string | null): SettingsTab {
  if (value === "branding" || value === "templates") return value;
  return "profile";
}

export function plannerInitials(name: string | null | undefined, email: string | null | undefined): string {
  const source = name?.trim() || email?.trim() || "?";
  return source
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatTemplateKey(index: number): string {
  return `TPL-${String(index + 1).padStart(3, "0")}`;
}

export type PlannerProfileFormState = {
  businessName: string;
  businessDescription: string;
  contactPhone: string;
  city: string;
};

export function profileToForm(profile: PlannerDashboardResponse): PlannerProfileFormState {
  return {
    businessName: profile.businessName || "",
    businessDescription: profile.businessDescription || "",
    contactPhone: profile.contactPhone || "",
    city: profile.city || "",
  };
}
