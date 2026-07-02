import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import { formatEventKey } from "@/modules/planner/clients/plannerClientHelpers";
import {
  daysUntilWedding,
  formatWeddingDate,
} from "@/modules/planner/dashboard/plannerDashboardHelpers";
import {
  budgetUsageBarWidth,
  budgetUsagePercent,
  formatBudgetUsagePercent,
  formatLKR,
} from "@/shared/lib/format";

export const BUDGET_AT_RISK_THRESHOLD = 85;

export type BudgetFilter = "all" | "active" | "at-risk";

export type BudgetRiskStatus = "no-budget" | "no-spend" | "at-risk" | "on-track";

export type BudgetEventSummary = {
  event: PlannerEventListItem;
  eventKey: string;
  weddingDateLabel: string;
  daysUntil: number;
  total: number;
  spent: number;
  remaining: number;
  usagePercent: number;
  usageLabel: string;
  barWidth: number;
  riskStatus: BudgetRiskStatus;
  atRisk: boolean;
};

export type BudgetPortfolioStats = {
  allocated: number;
  spent: number;
  remaining: number;
  portfolioUsagePercent: number;
  portfolioUsageLabel: string;
  atRiskWeddings: number;
  weddingsWithSpend: number;
  weddingsWithBudget: number;
};

export function mapEventToBudgetSummary(event: PlannerEventListItem): BudgetEventSummary {
  const total = event.totalBudget ?? 0;
  const spent = event.spentBudget ?? 0;
  const remaining = Math.max(total - spent, 0);
  const usagePercent = budgetUsagePercent(spent, total);
  const atRisk = total > 0 && usagePercent >= BUDGET_AT_RISK_THRESHOLD;

  let riskStatus: BudgetRiskStatus;
  if (total <= 0) {
    riskStatus = "no-budget";
  } else if (spent <= 0) {
    riskStatus = "no-spend";
  } else if (atRisk) {
    riskStatus = "at-risk";
  } else {
    riskStatus = "on-track";
  }

  return {
    event,
    eventKey: formatEventKey(event.eventId),
    weddingDateLabel: formatWeddingDate(event.eventDate),
    daysUntil: daysUntilWedding(event.eventDate),
    total,
    spent,
    remaining,
    usagePercent,
    usageLabel: formatBudgetUsagePercent(spent, total),
    barWidth: budgetUsageBarWidth(spent, total),
    riskStatus,
    atRisk,
  };
}

export function computeBudgetPortfolioStats(events: PlannerEventListItem[]): BudgetPortfolioStats {
  const totals = events.reduce(
    (acc, event) => {
      const total = event.totalBudget ?? 0;
      const spent = event.spentBudget ?? 0;
      acc.allocated += total;
      acc.spent += spent;
      if (total > 0) acc.weddingsWithBudget += 1;
      if (spent > 0) acc.weddingsWithSpend += 1;
      if (total > 0 && budgetUsagePercent(spent, total) >= BUDGET_AT_RISK_THRESHOLD) {
        acc.atRiskWeddings += 1;
      }
      return acc;
    },
    {
      allocated: 0,
      spent: 0,
      weddingsWithBudget: 0,
      weddingsWithSpend: 0,
      atRiskWeddings: 0,
    }
  );

  const portfolioUsagePercent = budgetUsagePercent(totals.spent, totals.allocated);

  return {
    allocated: totals.allocated,
    spent: totals.spent,
    remaining: Math.max(totals.allocated - totals.spent, 0),
    portfolioUsagePercent,
    portfolioUsageLabel: formatBudgetUsagePercent(totals.spent, totals.allocated),
    atRiskWeddings: totals.atRiskWeddings,
    weddingsWithSpend: totals.weddingsWithSpend,
    weddingsWithBudget: totals.weddingsWithBudget,
  };
}

function compareBudgetSummaries(a: BudgetEventSummary, b: BudgetEventSummary): number {
  if (a.atRisk !== b.atRisk) return a.atRisk ? -1 : 1;
  if (a.riskStatus === "no-budget" && b.riskStatus !== "no-budget") return 1;
  if (b.riskStatus === "no-budget" && a.riskStatus !== "no-budget") return -1;
  return b.usagePercent - a.usagePercent;
}

export function filterBudgetSummaries(
  summaries: BudgetEventSummary[],
  filter: BudgetFilter
): BudgetEventSummary[] {
  let list = [...summaries];

  if (filter === "active") {
    list = list.filter((summary) => summary.spent > 0);
  } else if (filter === "at-risk") {
    list = list.filter((summary) => summary.atRisk);
  }

  return list.sort(compareBudgetSummaries);
}

export function budgetFilterCounts(
  summaries: BudgetEventSummary[]
): Record<BudgetFilter, number> {
  return {
    all: summaries.length,
    active: summaries.filter((summary) => summary.spent > 0).length,
    "at-risk": summaries.filter((summary) => summary.atRisk).length,
  };
}

export function formatBudgetAmountPair(spent: number, total: number): string {
  if (total <= 0) return `${formatLKR(spent)} spent · no cap set`;
  return `${formatLKR(spent)} / ${formatLKR(total)}`;
}
