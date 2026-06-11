"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarDays, PiggyBank, TrendingDown, Wallet } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import { ErrorBanner } from "@/modules/planner/components/ui";
import { EmptyState, PageLoadingSkeleton } from "@/shared/components/ui";
import { GlassButton, GlassPageHeader, GlassSectionCard, GlassStatCard } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";
import {
  budgetUsageBarWidth,
  budgetUsagePercent,
  formatBudgetUsagePercent,
  formatLKR,
} from "@/shared/lib/format";

type EventFilter = "all" | "at-risk" | "active";

function eventBudgetTotal(event: PlannerEventListItem): number {
  return event.totalBudget ?? 0;
}

function eventBudgetSpent(event: PlannerEventListItem): number {
  return event.spentBudget ?? 0;
}

export default function PlannerBudgetPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerEvents(token);
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load budget data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(
    () =>
      events.reduce(
        (acc, e) => {
          const total = eventBudgetTotal(e);
          const spent = eventBudgetSpent(e);
          acc.budget += total;
          acc.spent += spent;
          if (total > 0 && budgetUsagePercent(spent, total) >= 85) acc.atRisk += 1;
          return acc;
        },
        { budget: 0, spent: 0, atRisk: 0 }
      ),
    [events]
  );

  const remaining = Math.max(totals.budget - totals.spent, 0);
  const portfolioBarWidth = budgetUsageBarWidth(totals.spent, totals.budget);
  const portfolioUsage = budgetUsagePercent(totals.spent, totals.budget);

  const filteredEvents = useMemo(() => {
    let list = [...events].filter((e) => eventBudgetTotal(e) > 0);
    if (eventFilter === "at-risk") {
      list = list.filter((e) => budgetUsagePercent(eventBudgetSpent(e), eventBudgetTotal(e)) >= 85);
    } else if (eventFilter === "active") {
      list = list.filter((e) => eventBudgetSpent(e) > 0);
    }
    return list.sort(
      (a, b) =>
        budgetUsagePercent(eventBudgetSpent(b), eventBudgetTotal(b)) -
        budgetUsagePercent(eventBudgetSpent(a), eventBudgetTotal(a))
    );
  }, [events, eventFilter]);

  const spentSub =
    formatBudgetUsagePercent(totals.spent, totals.budget) +
    " utilized" +
    (totals.atRisk > 0 ? ` · ${totals.atRisk} at risk` : "");

  if (loading && events.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-4 pb-4">
      <GlassPageHeader title="Revenue & budgets" description="Spend vs client budgets." />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-3 sm:grid-cols-3">
        <GlassStatCard label="Allocated" value={formatLKR(totals.budget)} icon={Wallet} iconTheme="primary" />
        <GlassStatCard
          label="Spent"
          value={formatLKR(totals.spent)}
          sub={spentSub}
          icon={PiggyBank}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Remaining"
          value={formatLKR(remaining)}
          sub={formatBudgetUsagePercent(totals.spent, totals.budget) + " of cap used"}
          icon={TrendingDown}
          iconTheme="success"
        />
      </div>

      <GlassSectionCard
        title="By wedding"
        action={
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { value: "all" as const, label: "All" },
                { value: "active" as const, label: "Has spend" },
                { value: "at-risk" as const, label: "At risk" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setEventFilter(tab.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  eventFilter === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "border border-white/60 bg-white/40 text-foreground hover:bg-white/60"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      >
        {totals.budget > 0 && (
          <div className="mb-4 flex items-center gap-4 border-b border-white/50 pb-4">
            <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Portfolio
            </span>
            <div
              className="h-3.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted/70 ring-1 ring-black/5"
              role="progressbar"
              aria-valuenow={portfolioUsage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={cn("h-full rounded-full", portfolioUsage >= 85 ? "bg-warning" : "bg-primary")}
                style={{ width: `${portfolioBarWidth}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
              {formatLKR(totals.spent)} / {formatLKR(totals.budget)}
            </span>
          </div>
        )}

        {loading ? (
          <p className={cn("py-4 text-center text-sm", vg.subtitle)}>Loading…</p>
        ) : events.length === 0 ? (
          <EmptyState
            title="No weddings yet"
            description="Budget tracking appears when you manage client events."
            action={
              <GlassButton href="/planner/events" variant="primary" className="gap-1.5">
                <CalendarDays size={16} aria-hidden />
                Events
              </GlassButton>
            }
            className="border-0 bg-transparent py-6 shadow-none"
          />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No matches"
            description={
              eventFilter === "at-risk"
                ? "No weddings are at 85% or more of their budget."
                : "No weddings have recorded spend yet."
            }
            action={
              <GlassButton type="button" variant="ghost" onClick={() => setEventFilter("all")}>
                Show all
              </GlassButton>
            }
            className="border-0 bg-transparent py-6 shadow-none"
          />
        ) : (
          <ul className="divide-y divide-white/60" role="list">
            {filteredEvents.map((event) => {
              const total = eventBudgetTotal(event);
              const spent = eventBudgetSpent(event);
              const atRisk = budgetUsagePercent(spent, total) >= 85;

              return (
                <li key={event.eventId} className="py-4 first:pt-1 last:pb-1">
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <p
                          className={cn("text-base font-semibold leading-snug text-foreground", vg.body)}
                          title={event.eventName}
                        >
                          {event.eventName}
                          {atRisk && (
                            <AlertTriangle
                              size={14}
                              className="ml-1.5 inline align-text-bottom text-warning"
                              aria-label="At risk"
                            />
                          )}
                        </p>
                        <span
                          className={cn(
                            "text-sm tabular-nums",
                            atRisk ? "font-semibold text-warning" : "text-muted-foreground"
                          )}
                        >
                          {formatLKR(spent)} / {formatLKR(total)}
                          <span className="mx-1.5 text-muted-foreground/60">·</span>
                          <span className={atRisk ? "text-warning" : "font-medium text-foreground"}>
                            {formatBudgetUsagePercent(spent, total)}
                          </span>
                        </span>
                      </div>
                      <div
                        className="mt-3 h-3.5 overflow-hidden rounded-full bg-muted/70 ring-1 ring-black/5"
                        role="progressbar"
                        aria-valuenow={budgetUsagePercent(spent, total)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${event.eventName} budget usage`}
                      >
                        <div
                          className={cn("h-full rounded-full", atRisk ? "bg-warning" : "bg-primary")}
                          style={{ width: `${budgetUsageBarWidth(spent, total)}%` }}
                        />
                      </div>
                    </div>
                    <GlassButton
                      href={`/events/${event.eventId}/budget`}
                      variant="ghost"
                      className="mt-0.5 h-9 shrink-0 gap-1 px-3 text-sm"
                    >
                      Open
                      <ArrowRight size={14} aria-hidden />
                    </GlassButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </GlassSectionCard>
    </div>
  );
}
