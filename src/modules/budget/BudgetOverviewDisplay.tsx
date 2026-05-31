import React from "react";
import { type BudgetOverview } from "@/shared/lib/api/budget";
import { motion } from "framer-motion";
import { formatLKR } from "@/shared/components/ui";
import { GlassStatCard } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";
import { CircleDollarSign, TrendingDown, Wallet } from "lucide-react";

const BudgetOverviewDisplay = ({ overview }: { overview: BudgetOverview }) => {
  const spentPercentage =
    overview.totalBudget > 0
      ? Math.min((overview.totalSpent / overview.totalBudget) * 100, 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/55 bg-white/35 p-5 backdrop-blur-sm">
        <div className="mb-3 flex items-end justify-between">
          <span className={vg.label}>Budget usage</span>
          <span className="text-2xl font-semibold tabular-nums text-foreground">
            {spentPercentage.toFixed(0)}%
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-white/50 ring-1 ring-white/60">
          <motion.div
            className="relative h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${spentPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <GlassStatCard
          label="Total budget"
          value={formatLKR(overview.totalBudget)}
          icon={Wallet}
          iconTheme="muted"
        />
        <GlassStatCard
          label="Total spent"
          value={formatLKR(overview.totalSpent)}
          icon={CircleDollarSign}
          iconTheme="primary"
        />
        <div
          className={cn(
            rf.statCard,
            overview.remainingBudget < 0
              ? "border-destructive/25 bg-destructive/10"
              : "border-success/25 bg-success/10"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1",
              overview.remainingBudget < 0
                ? "bg-destructive/10 text-destructive ring-destructive/15"
                : "bg-success/10 text-success ring-success/15"
            )}
          >
            <TrendingDown size={18} strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                vg.label,
                overview.remainingBudget < 0 ? "text-destructive" : "text-success"
              )}
            >
              Remaining
            </p>
            <p
              className={cn(
                "mt-0.5 text-2xl font-semibold tabular-nums tracking-tight",
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

export default BudgetOverviewDisplay;
