import { cn } from "@/shared/lib/cn";

/** Shared layout tokens for couple event workspace pages. */
export const eventWorkspace = {
  headerStack: "space-y-5",
  contentGrid: "grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start",
  /** Home overview: explicit 2×2 placement so row pairs align */
  homeOverviewGrid:
    "grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch [&>*]:min-h-0",
  homeOverviewTasks: "lg:col-span-8 lg:col-start-1 lg:row-start-1",
  homeOverviewVendors: "lg:col-span-4 lg:col-start-9 lg:row-start-1",
  homeOverviewBudget: "lg:col-span-8 lg:col-start-1 lg:row-start-2",
  homeOverviewActivity: "lg:col-span-4 lg:col-start-9 lg:row-start-2",
  /** Row 1: stretch to the taller column; task list height syncs to proposals via EventHomeOverviewRow */
  homeOverviewCardPair: "flex h-full min-h-[220px] flex-col",
  /** Row 2 (budget + activity): stretch so the second row stays aligned */
  homeOverviewCard: "flex h-full min-h-[220px] flex-col",
  mainColumn: "space-y-6 lg:col-span-8",
  sideColumn: "space-y-6 lg:col-span-4",
  detailPage: "space-y-6",
  pageEnter: "animate-in fade-in slide-in-from-bottom-2 duration-300",
  statGrid: "grid grid-cols-1 gap-4 sm:grid-cols-3",
  statCard:
    "flex h-full min-h-[108px] items-start gap-4 rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm",
  statIcon:
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10",
  statLabel: "text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
  statValue: "mt-1 text-2xl font-semibold tabular-nums leading-none text-foreground",
  statSub: "mt-1.5 text-xs text-muted-foreground",
};

export function eventStatCardClass(className?: string) {
  return cn(eventWorkspace.statCard, className);
}
