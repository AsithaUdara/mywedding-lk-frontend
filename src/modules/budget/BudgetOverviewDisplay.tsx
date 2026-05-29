import React from "react";
import { type BudgetOverview } from "@/shared/lib/api/budget";
import { motion } from "framer-motion";
import { formatLKR } from "@/shared/components/ui";
import { cp } from "@/modules/client/client-theme";
import { cn } from "@/shared/lib/cn";

const BudgetOverviewDisplay = ({ overview }: { overview: BudgetOverview }) => {
  const spentPercentage =
    overview.totalBudget > 0
      ? Math.min((overview.totalSpent / overview.totalBudget) * 100, 100)
      : 0;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-muted/30 p-6">
        <div className="mb-3 flex items-end justify-between">
          <span className={cp.label}>Budget usage</span>
          <span className="font-playfair text-2xl font-bold text-foreground">
            {spentPercentage.toFixed(0)}%
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="relative h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${spentPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className={cn(cp.label, "mb-2")}>Total budget</p>
          <p className="text-2xl font-bold text-foreground">{formatLKR(overview.totalBudget)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className={cn(cp.label, "mb-2")}>Total spent</p>
          <p className="text-2xl font-bold text-primary">{formatLKR(overview.totalSpent)}</p>
        </div>
        <div
          className={cn(
            "rounded-2xl border p-6 shadow-sm",
            overview.remainingBudget < 0
              ? "border-destructive/20 bg-destructive/5"
              : "border-success/20 bg-success/5"
          )}
        >
          <p
            className={cn(
              cp.label,
              "mb-2",
              overview.remainingBudget < 0 ? "text-destructive" : "text-success"
            )}
          >
            Remaining
          </p>
          <p
            className={cn(
              "text-2xl font-bold",
              overview.remainingBudget < 0 ? "text-destructive" : "text-success"
            )}
          >
            {formatLKR(overview.remainingBudget)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverviewDisplay;
