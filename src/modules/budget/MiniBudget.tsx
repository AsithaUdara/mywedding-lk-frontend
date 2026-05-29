"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getBudgetOverview, type BudgetOverview } from "@/shared/lib/api/budget";
import { useRealTime } from "@/shared/context/RealTimeContext";
import { Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";
import Skeleton from "@/shared/components/ui/Skeleton";
import { motion } from "framer-motion";
import { formatLKR } from "@/shared/components/ui";
import { cp } from "@/modules/client/client-theme";
import { cn } from "@/shared/lib/cn";

const MiniBudget = ({ eventId }: { eventId: string }) => {
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
      <div className={cp.panel}>
        <Skeleton className="mb-6 h-8 w-1/3 rounded-lg" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (!overview) return null;

  const spentPercentage =
    overview.totalBudget > 0
      ? Math.min((overview.totalSpent / overview.totalBudget) * 100, 100)
      : 0;

  return (
    <div className={cp.panel}>
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="text-primary" size={16} strokeWidth={2} aria-hidden />
          </div>
          <h2 className={cp.sectionTitle}>Budget tracker</h2>
        </div>
        <Link
          href={`/events/${eventId}/budget`}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:text-primary/80"
        >
          Manage <ArrowRight size={14} aria-hidden />
        </Link>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-end justify-between">
            <span className={cp.label}>Usage</span>
            <span className="text-lg font-bold text-foreground">{spentPercentage.toFixed(0)}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="relative h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${spentPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className={cn(cp.label, "mb-1")}>Spent</p>
            <p className="text-sm font-bold text-primary">{formatLKR(overview.totalSpent)}</p>
          </div>
          <div
            className={cn(
              "rounded-xl border p-3",
              overview.remainingBudget < 0
                ? "border-destructive/20 bg-destructive/5"
                : "border-success/20 bg-success/5"
            )}
          >
            <p
              className={cn(
                cp.label,
                "mb-1",
                overview.remainingBudget < 0 ? "text-destructive" : "text-success"
              )}
            >
              Remaining
            </p>
            <p
              className={cn(
                "text-sm font-bold",
                overview.remainingBudget < 0 ? "text-destructive" : "text-success"
              )}
            >
              {formatLKR(overview.remainingBudget)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniBudget;
