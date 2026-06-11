"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getBudgetOverview, type BudgetOverview } from "@/shared/lib/api/budget";
import { useRealTime } from "@/shared/context/RealTimeContext";
import { AlertTriangle, ArrowRight, CircleDollarSign, PiggyBank, Wallet } from "lucide-react";
import Skeleton from "@/shared/components/ui/Skeleton";
import { motion } from "framer-motion";
import {
  budgetUsageBarWidth,
  budgetUsagePercent,
  formatBudgetUsagePercent,
  formatLKR,
} from "@/shared/lib/format";
import { GlassButton, GlassSectionCard } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

type BudgetHealthTone = "healthy" | "warning" | "critical" | "over" | "neutral";

function getBudgetHealth(spent: number, total: number): { tone: BudgetHealthTone; label: string } {
  if (total <= 0) return { tone: "neutral", label: "Set your budget" };
  const pct = (spent / total) * 100;
  if (spent > total) return { tone: "over", label: "Over budget" };
  if (pct >= 90) return { tone: "critical", label: "Nearly at limit" };
  if (pct >= 75) return { tone: "warning", label: "Approaching limit" };
  return { tone: "healthy", label: "On track" };
}

const PROGRESS_BAR_CLASS: Record<BudgetHealthTone, string> = {
  healthy: "bg-primary",
  warning: "bg-amber-500",
  critical: "bg-orange-500",
  over: "bg-destructive",
  neutral: "bg-muted-foreground/35",
};

const STATUS_BADGE_CLASS: Record<BudgetHealthTone, string> = {
  healthy: "border-success/20 bg-success/10 text-success",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-800",
  critical: "border-orange-500/25 bg-orange-500/10 text-orange-700",
  over: "border-destructive/25 bg-destructive/10 text-destructive",
  neutral: "border-border/60 bg-muted/30 text-muted-foreground",
};

function BudgetHero({ overview }: { overview: BudgetOverview }) {
  const isOver = overview.remainingBudget < 0;
  const hasBudget = overview.totalBudget > 0;

  return (
    <div className="space-y-1">
      <p className={rf.label}>{isOver ? "Over budget by" : "Available to spend"}</p>
      <p
        className={cn(
          "text-3xl font-semibold tabular-nums tracking-tight sm:text-[2rem]",
          isOver ? "text-destructive" : "text-foreground"
        )}
      >
        {isOver
          ? formatLKR(Math.abs(overview.remainingBudget))
          : formatLKR(overview.remainingBudget)}
      </p>
      <p className={rf.caption}>
        {hasBudget ? (
          <>
            <span className="font-medium text-foreground">{formatLKR(overview.totalSpent)}</span>
            {" spent · "}
            <span className="font-medium text-foreground">{formatLKR(overview.totalBudget)}</span>
            {" total budget"}
          </>
        ) : (
          "Add a total budget to track spending against your plan."
        )}
      </p>
    </div>
  );
}

function BudgetProgress({
  overview,
  health,
}: {
  overview: BudgetOverview;
  health: ReturnType<typeof getBudgetHealth>;
}) {
  const barWidth = budgetUsageBarWidth(overview.totalSpent, overview.totalBudget);
  const usageLabel = formatBudgetUsagePercent(overview.totalSpent, overview.totalBudget);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
            STATUS_BADGE_CLASS[health.tone]
          )}
        >
          {health.tone === "over" && <AlertTriangle size={12} aria-hidden />}
          {health.label}
        </span>
        <span className="text-lg font-semibold tabular-nums text-foreground">{usageLabel}</span>
      </div>

      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-muted/50 ring-1 ring-border/40"
        role="progressbar"
        aria-valuenow={budgetUsagePercent(overview.totalSpent, overview.totalBudget)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Budget used: ${usageLabel}`}
      >
        <motion.div
          className={cn("h-full rounded-full", PROGRESS_BAR_CLASS[health.tone])}
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between gap-3 text-xs tabular-nums text-muted-foreground">
        <span>Spent {formatLKR(overview.totalSpent)}</span>
        <span>Budget {formatLKR(overview.totalBudget)}</span>
      </div>
    </div>
  );
}

function BudgetKpiGrid({ overview }: { overview: BudgetOverview }) {
  const isOver = overview.remainingBudget < 0;

  const items = [
    {
      label: "Total budget",
      value: formatLKR(overview.totalBudget),
      icon: Wallet,
      iconClass: "bg-white/50 text-muted-foreground ring-white/60",
      valueClass: "text-foreground",
    },
    {
      label: "Spent",
      value: formatLKR(overview.totalSpent),
      icon: CircleDollarSign,
      iconClass: "bg-primary/10 text-primary ring-primary/15",
      valueClass: "text-foreground",
    },
    {
      label: isOver ? "Over by" : "Remaining",
      value: isOver
        ? formatLKR(Math.abs(overview.remainingBudget))
        : formatLKR(overview.remainingBudget),
      icon: PiggyBank,
      iconClass: isOver
        ? "bg-destructive/10 text-destructive ring-destructive/15"
        : "bg-success/10 text-success ring-success/15",
      valueClass: isOver ? "text-destructive" : "text-success",
    },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/55 bg-white/40 px-2.5 py-3 backdrop-blur-sm sm:px-3"
        >
          <div
            className={cn(
              "mb-2 flex h-8 w-8 items-center justify-center rounded-lg ring-1",
              item.iconClass
            )}
          >
            <item.icon size={15} strokeWidth={2} aria-hidden />
          </div>
          <p className={rf.label}>{item.label}</p>
          <p className={cn("mt-0.5 text-sm font-semibold tabular-nums sm:text-base", item.valueClass)}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

const MiniBudget = ({ eventId, className }: { eventId: string; className?: string }) => {
  const { user } = useAuth();
  const { budgetVersion } = useRealTime();
  const [overview, setOverview] = useState<BudgetOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBudget = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const data = await getBudgetOverview(token, eventId);
      setOverview(data);
    } catch (error) {
      console.error("Failed to fetch budget overview:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    void fetchBudget();
  }, [fetchBudget, budgetVersion]);

  if (isLoading) {
    return (
      <GlassSectionCard className={className} title="Budget tracker" subtitle="Spend vs plan">
        <div className="space-y-5">
          <Skeleton className="h-16 w-2/3 rounded-lg" />
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
      </GlassSectionCard>
    );
  }

  if (!overview) return null;

  const health = getBudgetHealth(overview.totalSpent, overview.totalBudget);

  return (
    <GlassSectionCard
      className={className}
      title="Budget tracker"
      subtitle="Spend vs plan for this celebration"
      action={
        <GlassButton href={`/events/${eventId}/budget`} variant="ghost" className="gap-1">
          Manage
          <ArrowRight size={14} aria-hidden />
        </GlassButton>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-5">
        <BudgetHero overview={overview} />
        <BudgetProgress overview={overview} health={health} />
        <BudgetKpiGrid overview={overview} />
      </div>
    </GlassSectionCard>
  );
};

export default MiniBudget;
