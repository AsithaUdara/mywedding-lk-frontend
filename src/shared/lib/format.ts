/** Compact LKR display for dashboards (K / M suffix). */
export function formatLKR(amount: number): string {
  if (amount >= 1_000_000) return `LKR ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `LKR ${(amount / 1_000).toFixed(0)}K`;
  return `LKR ${amount.toLocaleString()}`;
}

/** Raw budget usage percentage (0–100), for progress bars and comparisons. */
export function budgetUsagePercent(spent: number, total: number): number {
  if (total <= 0 || spent <= 0) return 0;
  return Math.min((spent / total) * 100, 100);
}

/**
 * Human-readable budget usage — avoids showing 0% when spend is non-zero but small
 * (e.g. LKR 10K of LKR 2.5M = 0.4%).
 */
export function formatBudgetUsagePercent(spent: number, total: number): string {
  return formatPercentDisplay(budgetUsagePercent(spent, total));
}

/** Format an already-computed percentage (0–100). */
export function formatPercentDisplay(pct: number): string {
  if (pct === 0) return "0%";
  if (pct < 10) return `${pct.toFixed(1)}%`;
  return `${Math.round(pct)}%`;
}

/** Minimum visible width for usage bars when spend is non-zero but tiny. */
export function budgetUsageBarWidth(spent: number, total: number): number {
  const pct = budgetUsagePercent(spent, total);
  if (pct === 0) return 0;
  return Math.max(pct, 2);
}

/** YYYY-MM-DD in local timezone for HTML date inputs. */
export function todayForDateInput(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
