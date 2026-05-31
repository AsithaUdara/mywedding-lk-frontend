"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getBudgetOverview, type BudgetOverview } from "@/shared/lib/api/budget";
import { useRealTime } from "@/shared/context/RealTimeContext";
import { ArrowRight } from "lucide-react";
import Skeleton from "@/shared/components/ui/Skeleton";
import { motion } from "framer-motion";
import { formatLKR } from "@/shared/components/ui";
import { GlassButton, GlassSectionCard } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

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
        <Skeleton className="mb-6 h-8 w-1/3 rounded-lg" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </GlassSectionCard>
    );
  }

  if (!overview) return null;

  const spentPercentage =
    overview.totalBudget > 0
      ? Math.min((overview.totalSpent / overview.totalBudget) * 100, 100)
      : 0;

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
      <div className="flex flex-1 flex-col justify-center space-y-4">
        <div>
          <div className="mb-2 flex items-end justify-between">
            <span className={vg.label}>Usage</span>
            <span className="text-lg font-semibold tabular-nums text-foreground">
              {spentPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/50 ring-1 ring-white/60">
            <motion.div
              className="relative h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${spentPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-xl border border-white/55 bg-white/35 p-3 backdrop-blur-sm">
            <p className={cn(vg.label, "mb-1")}>Spent</p>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {formatLKR(overview.totalSpent)}
            </p>
          </div>
          <div
            className={cn(
              "rounded-xl border p-3 backdrop-blur-sm",
              overview.remainingBudget < 0
                ? "border-destructive/25 bg-destructive/10"
                : "border-success/25 bg-success/10"
            )}
          >
            <p
              className={cn(
                vg.label,
                "mb-1",
                overview.remainingBudget < 0 ? "text-destructive" : "text-success"
              )}
            >
              Remaining
            </p>
            <p
              className={cn(
                "text-sm font-semibold tabular-nums",
                overview.remainingBudget < 0 ? "text-destructive" : "text-success"
              )}
            >
              {formatLKR(overview.remainingBudget)}
            </p>
          </div>
        </div>
      </div>
    </GlassSectionCard>
  );
};

export default MiniBudget;
