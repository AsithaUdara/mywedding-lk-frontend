"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Crown, Sparkles, Users, Zap } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerOverview, PlannerOverviewResponse, updatePlannerSubscription } from "@/shared/lib/api/planner";
import { ErrorBanner } from "@/modules/planner/components/ui";
import {
  Badge,
  Button,
  Card,
  PageHeader,
  PageLoadingSkeleton,
  ProgressBar,
  SectionCard,
  StatCard,
  SuccessBanner,
  formatLKR,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

const PRO_MONTHLY_LKR = 12_000;

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

  const upgrade = async () => {
    if (!user) return;
    try {
      setUpgrading(true);
      setError(null);
      setMessage(null);
      const token = await user.getIdToken();
      await updatePlannerSubscription(token, { tier: "PlannerPro", monthlyFee: PRO_MONTHLY_LKR });
      setMessage("Planner Pro activated successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upgrade failed.");
    } finally {
      setUpgrading(false);
    }
  };

  const activePlan = overview?.activePlanTier ?? "Free";
  const maxConcurrentEvents = overview?.maxConcurrentEvents ?? 1;
  const activeWeddings = overview?.activeWeddings ?? 0;
  const isPro = activePlan === "PlannerPro";

  const capacityPct = useMemo(() => {
    if (maxConcurrentEvents <= 0) return 0;
    return Math.min(100, Math.round((activeWeddings / maxConcurrentEvents) * 100));
  }, [activeWeddings, maxConcurrentEvents]);

  const atCapacity = !isPro && activeWeddings >= maxConcurrentEvents;

  if (loading && !overview) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 pb-4">
      <PageHeader
        title="Plan & billing"
        description="Manage your planner subscription, concurrent wedding limits, and upgrade when you scale."
        badge={activePlan}
      />

      {error && <ErrorBanner message={error} />}
      {message && <SuccessBanner message={message} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Current plan"
          value={activePlan}
          icon={Crown}
          iconTheme={isPro ? "accent" : "muted"}
          index={0}
        />
        <StatCard
          label="Concurrent limit"
          value={isPro ? "Unlimited" : maxConcurrentEvents}
          sub={`${activeWeddings} in use`}
          icon={Users}
          iconTheme="primary"
          index={1}
        />
        <StatCard
          label="Active weddings"
          value={activeWeddings}
          icon={Zap}
          iconTheme="success"
          index={2}
        />
        <StatCard
          label="Monthly fee"
          value={isPro ? formatLKR(PRO_MONTHLY_LKR) : "Free"}
          sub={isPro ? "Planner Pro" : "No charge"}
          icon={Sparkles}
          iconTheme="accent"
          index={3}
        />
      </div>

      <SectionCard
        title="Capacity usage"
        subtitle={
          isPro
            ? "Planner Pro — no concurrent wedding cap"
            : `Free plan allows ${maxConcurrentEvents} active wedding at a time`
        }
      >
        {isPro ? (
          <p className="text-sm text-muted-foreground">
            You are on <span className="font-semibold text-foreground">Planner Pro</span> with
            unlimited concurrent client weddings.{" "}
            <span className="tabular-nums font-semibold text-primary">{activeWeddings}</span>{" "}
            active right now.
          </p>
        ) : (
          <>
            <ProgressBar
              label="Concurrent weddings"
              count={activeWeddings}
              total={maxConcurrentEvents}
              barClassName={atCapacity ? "bg-destructive" : "bg-primary"}
            />
            {atCapacity && (
              <p className="mt-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                You have reached your plan limit. Upgrade to Planner Pro to take on more clients at
                once.
              </p>
            )}
          </>
        )}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          className={cn(
            "relative flex flex-col border-border",
            !isPro && "ring-2 ring-primary/30"
          )}
        >
          {!isPro && (
            <Badge variant="default" className="absolute right-4 top-4 normal-case tracking-normal">
              Current plan
            </Badge>
          )}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Zap size={22} aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Starter
              </p>
              <p className="font-playfair text-2xl font-bold text-foreground">Free</p>
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tabular-nums text-primary">
            LKR 0
            <span className="text-base font-normal text-muted-foreground"> / month</span>
          </p>
          <ul className="mt-6 flex-1 space-y-3">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
          <Button variant="secondary" className="mt-8 w-full" disabled>
            {isPro ? "Included in your history" : "Current plan"}
          </Button>
        </Card>

        <Card
          className={cn(
            "relative flex flex-col overflow-hidden border-primary/25 bg-gradient-to-br from-primary/5 via-card to-accent/10",
            isPro && "ring-2 ring-accent/50"
          )}
        >
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-accent/15 blur-2xl"
            aria-hidden
          />
          {isPro && (
            <Badge variant="accent" className="absolute right-4 top-4 normal-case tracking-normal">
              Current plan
            </Badge>
          )}
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Crown size={22} aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
                Professional
              </p>
              <p className="font-playfair text-2xl font-bold text-foreground">Planner Pro</p>
            </div>
          </div>
          <p className="relative mt-4 text-3xl font-bold tabular-nums text-primary">
            {formatLKR(PRO_MONTHLY_LKR)}
            <span className="text-base font-normal text-muted-foreground"> / month</span>
          </p>
          <ul className="relative mt-6 flex-1 space-y-3">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            type="button"
            className="relative mt-8 w-full"
            disabled={upgrading || isPro}
            onClick={() => void upgrade()}
          >
            {isPro ? (
              <>
                <Check size={18} aria-hidden />
                Active subscription
              </>
            ) : upgrading ? (
              "Upgrading…"
            ) : (
              <>
                <Crown size={18} aria-hidden />
                Upgrade to Planner Pro
              </>
            )}
          </Button>
          {!isPro && (
            <p className="relative mt-3 text-center text-[11px] text-muted-foreground">
              Billed monthly
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
