"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CircleDollarSign,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import { ErrorBanner, ProgressBar, formatLKR } from "@/modules/planner/components/ui";
import { EmptyState, PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

type RevenueFilter = "all" | "over" | "attention" | "healthy";

const REVENUE_FILTERS: { value: RevenueFilter; label: string }[] = [
  { value: "all", label: "All events" },
  { value: "over", label: "Over budget" },
  { value: "attention", label: "≥ 85% used" },
  { value: "healthy", label: "Under 50%" },
];

function utilizationPct(spent: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((spent / total) * 100);
}

function PortfolioSpendChart({
  data,
}: {
  data: { label: string; spent: number; total: number }[];
}) {
  const max = Math.max(...data.map((d) => Math.max(d.spent, d.total, 1)), 1);

  return (
    <div
      className="flex h-32 items-end gap-2 sm:gap-3"
      role="img"
      aria-label="Portfolio spend compared to budget by event"
    >
      {data.map((d, i) => {
        const spentH = Math.max(10, Math.round((d.spent / max) * 100));
        const budgetH = Math.max(10, Math.round((d.total / max) * 100));
        const over = d.spent > d.total && d.total > 0;

        return (
          <div key={`${d.label}-${i}`} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div className="flex h-28 w-full items-end justify-center gap-1">
              <div
                className="w-[42%] max-w-5 rounded-t-md bg-white/50 ring-1 ring-white/60"
                style={{ height: `${budgetH}%` }}
                title={`Budget ${formatLKR(d.total)}`}
              />
              <div
                className={cn(
                  "w-[42%] max-w-5 rounded-t-md",
                  over ? "bg-destructive" : "bg-primary"
                )}
                style={{ height: `${spentH}%` }}
                title={`Spent ${formatLKR(d.spent)}`}
              />
            </div>
            <span className={cn("w-full truncate text-center text-[9px] font-medium", vg.caption)}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function PlannerBudgetPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [revenueFilter, setRevenueFilter] = useState<RevenueFilter>("all");
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
      setError(err instanceof Error ? err.message : "Failed to load revenue data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(
    () =>
      events.reduce(
        (acc, event) => {
          acc.totalBudget += event.totalBudget;
          acc.totalSpent += event.spentBudget;
          const pct = utilizationPct(event.spentBudget, event.totalBudget);
          if (event.spentBudget > event.totalBudget && event.totalBudget > 0) acc.overCount += 1;
          if (pct >= 85) acc.highUtilCount += 1;
          return acc;
        },
        { totalBudget: 0, totalSpent: 0, overCount: 0, highUtilCount: 0 }
      ),
    [events]
  );

  const remaining = summary.totalBudget - summary.totalSpent;
  const utilization = utilizationPct(summary.totalSpent, summary.totalBudget);

  const chartData = useMemo(
    () =>
      [...events]
        .sort((a, b) => b.spentBudget - a.spentBudget)
        .slice(0, 8)
        .map((e) => ({
          label: (e.eventName.split(" ")[0] || "Event").slice(0, 8),
          spent: e.spentBudget,
          total: e.totalBudget,
        })),
    [events]
  );

  const filteredEvents = useMemo(() => {
    let list = [...events];
    if (revenueFilter === "over") {
      list = list.filter((e) => e.spentBudget > e.totalBudget && e.totalBudget > 0);
    } else if (revenueFilter === "attention") {
      list = list.filter((e) => utilizationPct(e.spentBudget, e.totalBudget) >= 85);
    } else if (revenueFilter === "healthy") {
      list = list.filter((e) => utilizationPct(e.spentBudget, e.totalBudget) < 50);
    }
    return list.sort(
      (a, b) =>
        utilizationPct(b.spentBudget, b.totalBudget) -
        utilizationPct(a.spentBudget, a.totalBudget)
    );
  }, [events, revenueFilter]);

  if (loading && events.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Revenue & budgets"
        description="Monitor portfolio spend, remaining capacity, and per-wedding budget health."
        badge="Finance"
        action={
          <GlassButton href="/planner/events" variant="ghost" className="gap-1.5">
            <Wallet size={16} aria-hidden />
            Manage events
          </GlassButton>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassStatCard
          label="Portfolio budget"
          value={formatLKR(summary.totalBudget)}
          sub="Total allocated"
          icon={Wallet}
          iconTheme="accent"
        />
        <GlassStatCard
          label="Total spent"
          value={formatLKR(summary.totalSpent)}
          sub={`${utilization}% utilized`}
          icon={TrendingDown}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Remaining"
          value={formatLKR(remaining)}
          sub={remaining < 0 ? "Over portfolio cap" : "Available capacity"}
          icon={PiggyBank}
          iconTheme={remaining < 0 ? "warning" : "success"}
        />
        <GlassStatCard
          label="At risk"
          value={summary.highUtilCount}
          sub={summary.overCount > 0 ? `${summary.overCount} over budget` : "≥ 85% utilization"}
          icon={summary.overCount > 0 ? AlertTriangle : TrendingUp}
          iconTheme="warning"
        />
      </div>

      <GlassSectionCard
        title="Portfolio overview"
        subtitle="Compare budget caps to spend across your top events"
      >
        {chartData.length === 0 ? (
          <p className={cn("py-8 text-center", vg.subtitle)}>No budget data yet.</p>
        ) : (
          <>
            <PortfolioSpendChart data={chartData} />
            <div className={cn("mt-4 flex flex-wrap gap-4", vg.caption)}>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-white/50 ring-1 ring-white/60" aria-hidden />
                Budget cap
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden />
                Spent
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-destructive" aria-hidden />
                Over budget
              </span>
            </div>
          </>
        )}
        <div className="mt-6 border-t border-white/40 pt-6">
          <ProgressBar
            label="Portfolio utilization"
            count={summary.totalSpent}
            total={summary.totalBudget || 1}
            barClassName={
              utilization >= 100
                ? "bg-destructive"
                : utilization >= 85
                  ? "bg-warning"
                  : "bg-primary"
            }
          />
          <p className={cn("mt-2 text-right tabular-nums", vg.caption)}>
            {formatLKR(summary.totalSpent)} of {formatLKR(summary.totalBudget)}
          </p>
        </div>
      </GlassSectionCard>

      <GlassSectionCard
        title="By wedding"
        subtitle="Open event budgets to adjust categories and expenses"
        action={
          <div className="flex flex-wrap gap-1.5">
            {REVENUE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setRevenueFilter(f.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                  revenueFilter === f.value
                    ? "vgo-nav-active"
                    : "vgo-nav-idle rf-glass-subtle vgo-glass-subtle"
                )}
                aria-pressed={revenueFilter === f.value}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <p className={cn("py-8 text-center", vg.subtitle)}>Refreshing budgets…</p>
        ) : events.length === 0 ? (
          <EmptyState
            title="No budget data yet"
            description="Create client events with budgets to track spending across your portfolio."
            action={
              <GlassButton href="/planner/dashboard#create-event-dashboard" variant="primary" className="gap-1.5">
                <CircleDollarSign size={16} aria-hidden />
                Add event
              </GlassButton>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No events match this filter"
            description="Try another budget health filter or add events with budget targets."
            action={
              <GlassButton type="button" variant="primary" onClick={() => setRevenueFilter("all")}>
                Show all events
              </GlassButton>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : (
          <ul className="space-y-4" role="list">
            {filteredEvents.map((event) => {
              const pct = utilizationPct(event.spentBudget, event.totalBudget);
              const over = event.spentBudget > event.totalBudget && event.totalBudget > 0;
              const eventRemaining = event.totalBudget - event.spentBudget;

              return (
                <li key={event.eventId}>
                  <article
                    className={cn(
                      "rounded-xl border border-white/55 bg-white/40 p-5 backdrop-blur-sm sm:p-6",
                      "transition-all duration-200 hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55 hover:shadow-[0_4px_20px_hsl(345_100%_25%/0.08)]"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-4">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-luxury-display text-lg font-bold text-primary"
                          aria-hidden
                        >
                          {event.eventName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className={cn("truncate font-medium", vg.body)}>{event.eventName}</h3>
                          <p className={cn("mt-0.5 truncate", vg.subtitle)}>
                            {event.clientEmail || "No client email"}
                          </p>
                          <p className={cn("mt-1 font-medium", vg.caption)}>
                            {formatLKR(eventRemaining)} remaining · {pct}% used
                          </p>
                        </div>
                      </div>
                      <GlassButton href={`/events/${event.eventId}/budget`} variant="primary" className="gap-1">
                        Open budget
                        <ArrowRight size={14} aria-hidden />
                      </GlassButton>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-white/60 bg-white/50", vg.caption)}>
                        Budget {formatLKR(event.totalBudget)}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/15">
                        Spent {formatLKR(event.spentBudget)}
                      </span>
                      {over && (
                        <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive ring-1 ring-destructive/15">
                          Over budget
                        </span>
                      )}
                      {!over && pct >= 85 && (
                        <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning ring-1 ring-warning/15">
                          High utilization
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className={vg.caption}>Spend progress</span>
                        <span className="font-semibold tabular-nums text-foreground">{pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/50 ring-1 ring-white/60">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            over
                              ? "bg-destructive"
                              : pct >= 85
                                ? "bg-warning"
                                : "bg-primary"
                          )}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </GlassSectionCard>
    </div>
  );
}
