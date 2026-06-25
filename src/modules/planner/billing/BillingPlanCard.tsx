"use client";

import { Check, Crown, Loader2, Sparkles, Zap } from "lucide-react";
import {
  FREE_PLAN_FEATURES,
  PRO_MONTHLY_LKR,
  PRO_PLAN_FEATURES,
} from "@/modules/planner/billing/plannerBillingHelpers";
import { plannerPlanCard } from "@/modules/planner/theme/plannerWorkspaceTheme";
import { formatLKR } from "@/shared/lib/format";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { cn } from "@/shared/lib/cn";

type BillingPlanCardProps = {
  tier: "free" | "pro";
  isCurrent: boolean;
  upgrading?: boolean;
  onUpgrade?: () => void;
};

export function BillingPlanCard({ tier, isCurrent, upgrading, onUpgrade }: BillingPlanCardProps) {
  const isPro = tier === "pro";

  return (
    <article
      className={cn(
        "relative flex flex-col rounded-lg border bg-white p-5 shadow-[0_1px_1px_rgba(9,30,66,0.08)] sm:p-6",
        isCurrent
          ? isPro
            ? plannerPlanCard.proCurrentBorder
            : plannerPlanCard.freeCurrentBorder
          : plannerPlanCard.defaultBorder
      )}
    >
      {isCurrent && (
        <span
          className={cn(
            "absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            isPro ? plannerPlanCard.currentBadgePro : plannerPlanCard.currentBadgeFree
          )}
        >
          Current plan
        </span>
      )}

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-lg",
            isPro ? plannerPlanCard.proIconWell : plannerPlanCard.freeIconWell
          )}
        >
          {isPro ? <Crown size={20} aria-hidden /> : <Zap size={20} aria-hidden />}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#97A0AF]">
            {isPro ? "Professional" : "Starter"}
          </p>
          <p className="font-medium text-[#172B4D]">{isPro ? "Planner Pro" : "Free"}</p>
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold tabular-nums text-[#172B4D]">
        {isPro ? formatLKR(PRO_MONTHLY_LKR) : "LKR 0"}
        <span className="text-sm font-normal text-[#5E6C84]"> / month</span>
      </p>

      <ul className="mt-5 flex-1 space-y-2.5">
        {(isPro ? PRO_PLAN_FEATURES : FREE_PLAN_FEATURES).map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-[#42526E]">
            {isPro ? (
              <Sparkles size={14} className={cn("mt-0.5 shrink-0", plannerPlanCard.featureIconPro)} aria-hidden />
            ) : (
              <Check size={14} className={cn("mt-0.5 shrink-0", plannerPlanCard.featureIconFree)} aria-hidden />
            )}
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {isPro ? (
          isCurrent ? (
            <div
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold",
                plannerPlanCard.activeSubscription
              )}
            >
              <Check size={16} aria-hidden />
              Active subscription
            </div>
          ) : (
            <GlassButton
              type="button"
              variant="primary"
              className="w-full gap-1.5"
              disabled={upgrading}
              onClick={onUpgrade}
            >
              {upgrading ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden />
                  Redirecting…
                </>
              ) : (
                <>
                  <Crown size={16} aria-hidden />
                  Upgrade to Planner Pro
                </>
              )}
            </GlassButton>
          )
        ) : (
          <GlassButton variant="ghost" className="w-full" disabled>
            {isCurrent ? "Current plan" : "Included with Planner Pro"}
          </GlassButton>
        )}
      </div>

      {isPro && !isCurrent && (
        <p className="mt-2 text-center text-xs text-[#5E6C84]">Billed monthly via PayHere</p>
      )}
    </article>
  );
}
