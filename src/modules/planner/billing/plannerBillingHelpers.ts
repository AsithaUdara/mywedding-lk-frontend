import type { PlannerOverviewResponse } from "@/shared/lib/api/planner";
import { formatLKR } from "@/shared/lib/format";
import { formatPlannerPlanTier, isPlannerProTier } from "@/modules/planner/subscription/planTier";

export const PRO_MONTHLY_LKR = 6_000;

export const FREE_PLAN_FEATURES = [
  "1 concurrent wedding",
  "Core CRM & event hub",
  "Booking pipeline view",
  "Team invites per event",
] as const;

export const PRO_PLAN_FEATURES = [
  "Unlimited concurrent weddings",
  "Priority AI itinerary & vendor match",
  "Full copilot & timeline tools",
  "Advanced booking & revenue dashboards",
] as const;

export const BILLING_JIRA_INPUT =
  "w-full rounded border border-[#DFE1E6] bg-white px-3 py-2 text-sm text-[#172B4D] outline-none transition-colors placeholder:text-[#97A0AF] focus:border-primary focus:ring-2 focus:ring-primary/20";

export type BillingPortfolioStats = {
  activePlanLabel: string;
  isPro: boolean;
  maxConcurrentEvents: number;
  activeWeddings: number;
  atCapacity: boolean;
  usagePercent: number;
  nextBillingLabel: string;
  nextBillingSub: string;
  monthlyFeeLabel: string;
};

export function computeBillingStats(overview: PlannerOverviewResponse | null): BillingPortfolioStats {
  const activePlan = overview?.activePlanTier ?? "Free";
  const isPro = isPlannerProTier(activePlan);
  const maxConcurrentEvents = overview?.maxConcurrentEvents ?? 1;
  const activeWeddings = overview?.activeWeddings ?? 0;
  const atCapacity = !isPro && activeWeddings >= maxConcurrentEvents;
  const usagePercent =
    maxConcurrentEvents > 0
      ? Math.min((activeWeddings / maxConcurrentEvents) * 100, 100)
      : 0;

  let nextBillingLabel = "—";
  if (isPro && overview?.subscriptionEndsAt) {
    nextBillingLabel = new Date(overview.subscriptionEndsAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  return {
    activePlanLabel: formatPlannerPlanTier(activePlan),
    isPro,
    maxConcurrentEvents,
    activeWeddings,
    atCapacity,
    usagePercent,
    nextBillingLabel,
    nextBillingSub: isPro ? "Planner Pro renewal" : "Free plan",
    monthlyFeeLabel: formatLKR(overview?.subscriptionMonthlyFee ?? PRO_MONTHLY_LKR),
  };
}

export function formatBillingDateLong(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { dateStyle: "long" });
}

export function formatCardExpiry(month?: number, year?: number): string | null {
  if (!month || !year) return null;
  return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}
