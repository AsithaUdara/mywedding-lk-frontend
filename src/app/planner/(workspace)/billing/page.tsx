"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Crown, Sparkles, Users, Zap } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  createPlannerSubscriptionCheckout,
  getPlannerOverview,
  PlannerOverviewResponse,
} from "@/shared/lib/api/planner";
import { submitPayHereCheckout } from "@/shared/lib/payhereCheckout";
import {
  ErrorBanner,
  ProgressBar,
  SuccessBanner,
  formatLKR,
} from "@/modules/planner/components/ui";
import { PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";
import {
  formatPlannerPlanTier,
  isPlannerProTier,
} from "@/modules/planner/subscription/planTier";
import { PlannerPaymentMethodSection } from "@/modules/planner/billing/PlannerPaymentMethodSection";

const PRO_MONTHLY_LKR = 6_000;

const FREE_FEATURES = [
  "1 concurrent wedding",
  "Core CRM & event hub",
  "Booking pipeline view",
  "Team invites per event",
];

const PRO_FEATURES = [
  "Unlimited concurrent weddings",
  "Priority AI itinerary & vendor match",
  "Full copilot & timeline tools",
  "Advanced booking & revenue dashboards",
];

export default function PlannerBillingPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [overview, setOverview] = useState<PlannerOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerOverview(token);
      setOverview(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load billing data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (searchParams.get("expired") === "1") {
      setError(
        "Your planner subscription has expired. Renew Planner Pro below to restore CRM access."
      );
    }
  }, [searchParams]);

  useEffect(() => {
    const paymentReturn = searchParams.get("payment");
    if (paymentReturn === "success") {
      setMessage("Payment received. Planner Pro will activate shortly after confirmation.");
      void load();
    } else if (paymentReturn === "cancelled") {
      setError("Payment was cancelled. Your plan was not changed.");
    }
  }, [searchParams, load]);

  const upgrade = async () => {
    if (!user) return;
    try {
      setUpgrading(true);
      setError(null);
      setMessage(null);
      const token = await user.getIdToken();
      const checkout = await createPlannerSubscriptionCheckout(token, {
        tier: "PlannerPro",
        monthlyFee: PRO_MONTHLY_LKR,
      });
      if (checkout?.checkout?.checkoutUrl) {
        submitPayHereCheckout(checkout.checkout, { target: "_self" });
        return;
      }
      setError("Could not start checkout. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upgrade failed.");
    } finally {
      setUpgrading(false);
    }
  };

  const activePlan = overview?.activePlanTier ?? "Free";
  const maxConcurrentEvents = overview?.maxConcurrentEvents ?? 1;
  const activeWeddings = overview?.activeWeddings ?? 0;
  const isPro = isPlannerProTier(activePlan);
  const activePlanLabel = formatPlannerPlanTier(activePlan);

  const atCapacity = !isPro && activeWeddings >= maxConcurrentEvents;

  if (loading && !overview) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Plan & billing"
        description="Manage your planner subscription, concurrent wedding limits, and upgrade when you scale."
        badge={activePlanLabel}
      />

      {error && <ErrorBanner message={error} />}
      {message && <SuccessBanner message={message} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassStatCard
          label="Current plan"
          value={activePlanLabel}
          sub={isPro ? "Planner Pro active" : "Free tier"}
          icon={Crown}
          iconTheme={isPro ? "accent" : "muted"}
        />
        <GlassStatCard
          label="Concurrent limit"
          value={isPro ? "Unlimited" : maxConcurrentEvents}
          sub={`${activeWeddings} in use`}
          icon={Users}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Active weddings"
          value={activeWeddings}
          sub="In your portfolio now"
          icon={Zap}
          iconTheme="success"
        />
        <GlassStatCard
          label="Next billing"
          value={
            isPro && overview?.subscriptionEndsAt
              ? new Date(overview.subscriptionEndsAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : "—"
          }
          sub={isPro ? "Planner Pro renewal" : "Free plan"}
          icon={Crown}
          iconTheme={isPro ? "accent" : "muted"}
        />
      </div>

      {!isPro && (
        <GlassSectionCard
          title="Capacity usage"
          subtitle={`Free plan allows ${maxConcurrentEvents} active wedding at a time`}
        >
          <ProgressBar
            label="Concurrent weddings"
            count={activeWeddings}
            total={maxConcurrentEvents}
            barClassName={atCapacity ? "bg-destructive" : "bg-primary"}
          />
          {atCapacity && (
            <p className="mt-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning backdrop-blur-sm">
              You have reached your plan limit. Upgrade to Planner Pro to take on more clients at once.
            </p>
          )}
        </GlassSectionCard>
      )}

      <PlannerPaymentMethodSection
        isPro={isPro}
        subscriptionEndsAt={overview?.subscriptionEndsAt}
        onUpdated={() => void load()}
      />

      <GlassSectionCard title="Choose your plan" subtitle="Compare features and upgrade via PayHere">
        <div className="grid gap-6 lg:grid-cols-2">
          <article
            className={cn(
              rf.panel,
              "relative flex flex-col p-5 sm:p-6",
              !isPro && "border-primary/35 ring-1 ring-primary/25"
            )}
          >
            {!isPro && (
              <span className="absolute right-4 top-4 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/15">
                Current plan
              </span>
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/50 text-muted-foreground ring-1 ring-white/60">
                <Zap size={22} aria-hidden />
              </div>
              <div>
                <p className={vg.label}>Starter</p>
                <p className="text-2xl font-semibold text-foreground">Free</p>
              </div>
            </div>
            <p className="mt-4 text-3xl font-semibold tabular-nums text-foreground">
              LKR 0
              <span className={cn("text-base font-normal", vg.subtitle)}> / month</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className={cn("flex items-start gap-2", vg.subtitle)}>
                  <Check size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
            <GlassButton variant="ghost" className="mt-8 w-full" disabled>
              {isPro ? "Included with Planner Pro" : "Current plan"}
            </GlassButton>
          </article>

          <article
            className={cn(
              rf.panel,
              "relative flex flex-col overflow-hidden border-primary/25 bg-gradient-to-br from-primary/10 via-white/50 to-white/40 p-5 sm:p-6",
              isPro && "ring-1 ring-accent/40"
            )}
          >
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-accent/15 blur-2xl"
              aria-hidden
            />
            {isPro && (
              <span className="absolute right-4 top-4 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent ring-1 ring-accent/15">
                Current plan
              </span>
            )}
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Crown size={22} aria-hidden />
              </div>
              <div>
                <p className={cn(vg.label, "text-accent")}>Professional</p>
                <p className="text-2xl font-semibold text-foreground">Planner Pro</p>
              </div>
            </div>
            <p className="relative mt-4 text-3xl font-semibold tabular-nums text-foreground">
              {formatLKR(PRO_MONTHLY_LKR)}
              <span className={cn("text-base font-normal", vg.subtitle)}> / month</span>
            </p>
            <ul className="relative mt-6 flex-1 space-y-3">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className={cn("flex items-start gap-2", vg.body)}>
                  <Sparkles size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
            {isPro ? (
              <div
                className={cn(
                  "relative mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--vgo-gold)/0.35)] bg-[hsl(var(--vgo-gold)/0.12)] px-4 py-3 text-sm font-semibold text-[hsl(42_42%_38%)]"
                )}
              >
                <Check size={18} aria-hidden />
                Active subscription
              </div>
            ) : (
              <GlassButton
                type="button"
                variant="primary"
                className="relative mt-8 w-full gap-1.5"
                disabled={upgrading}
                onClick={() => void upgrade()}
              >
                {upgrading ? (
                  "Redirecting to PayHere…"
                ) : (
                  <>
                    <Crown size={18} aria-hidden />
                    Upgrade to Planner Pro
                  </>
                )}
              </GlassButton>
            )}
            {!isPro && (
              <p className={cn("relative mt-3 text-center", vg.caption)}>Billed monthly via PayHere</p>
            )}
          </article>
        </div>
      </GlassSectionCard>
    </div>
  );
}
