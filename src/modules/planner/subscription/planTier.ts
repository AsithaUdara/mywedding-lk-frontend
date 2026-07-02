/** Human-readable labels for planner subscription tiers from the API. */
export function formatPlannerPlanTier(tier: string | null | undefined): string {
  if (!tier) return "—";
  if (tier === "PlannerPro") return "Planner Pro";
  if (tier === "Free") return "Free";
  return tier.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function isPlannerProTier(tier: string | null | undefined): boolean {
  return tier === "PlannerPro";
}
