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
import { ErrorBanner } from "@/modules/planner/components/ui";
import {
  Badge,
  Button,
  EmptyState,
  PageHeader,
  PageLoadingSkeleton,
  ProgressBar,
  SectionCard,
  StatCard,
  formatLKR,
} from "@/shared/components/ui";
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
                className="w-[42%] max-w-5 rounded-t-md bg-muted"
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
            <span className="w-full truncate text-center text-[9px] font-medium text-muted-foreground">
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
    <div className="space-y-8 pb-4">
      <PageHeader
        title="Revenue & budgets"
        description="Monitor portfolio spend, remaining capacity, and per-wedding budget health."
        badge="Finance"
        action={
          <Button href="/planner/events" variant="secondary" size="sm">
            <Wallet size={16} aria-hidden />
            Manage events
          </Button>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Portfolio budget"
          value={formatLKR(summary.totalBudget)}
          icon={Wallet}
          iconTheme="accent"
          index={0}
        />
        <StatCard
          label="Total spent"
          value={formatLKR(summary.totalSpent)}
          sub={`${utilization}% utilized`}
          icon={TrendingDown}
          iconTheme="primary"
          index={1}
        />
        <StatCard
          label="Remaining"
          value={formatLKR(remaining)}
          sub={remaining < 0 ? "Over portfolio cap" : undefined}
          icon={PiggyBank}
          iconTheme={remaining < 0 ? "rose" : "success"}
          index={2}
        />
        <StatCard
          label="At risk"
          value={summary.highUtilCount}
          sub={
            summary.overCount > 0 ? `${summary.overCount} over budget` : "≥ 85% utilization"
          }
          icon={summary.overCount > 0 ? AlertTriangle : TrendingUp}
          iconTheme="warning"
          index={3}
        />
      </div>

      <SectionCard
        title="Portfolio overview"
        subtitle="Compare budget caps to spend across your top events"
      >
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No budget data yet.</p>
        ) : (
          <>
            <PortfolioSpendChart data={chartData} />
            <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-muted" aria-hidden />
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
        <div className="mt-6 border-t border-border pt-6">
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
          <p className="mt-2 text-right text-xs tabular-nums text-muted-foreground">
            {formatLKR(summary.totalSpent)} of {formatLKR(summary.totalBudget)}
          </p>
        </div>
      </SectionCard>

      <SectionCard
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
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                  revenueFilter === f.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
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
          <p className="py-8 text-center text-sm text-muted-foreground">Refreshing budgets…</p>
        ) : events.length === 0 ? (
          <EmptyState
            title="No budget data yet"
            description="Create client events with budgets to track spending across your portfolio."
            action={
              <Button href="/planner/events" size="sm">
                <CircleDollarSign size={16} aria-hidden />
                Add event
              </Button>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No events match this filter"
            description="Try another budget health filter or add events with budget targets."
            action={
              <Button type="button" size="sm" onClick={() => setRevenueFilter("all")}>
                Show all events
              </Button>
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
                <li
                  key={event.eventId}
                  className="rounded-2xl border border-border bg-background/80 p-5 transition-all duration-200 hover:border-primary/25 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-playfair text-lg font-bold text-primary"
                        aria-hidden
                      >
                        {event.eventName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-foreground">
                          {event.eventName}
                        </h3>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {event.clientEmail || "No client email"}
                        </p>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          {formatLKR(eventRemaining)} remaining · {pct}% used
                        </p>
                      </div>
                    </div>
                    <Button href={`/events/${event.eventId}/budget`} size="sm">
                      Open budget
                      <ArrowRight size={14} aria-hidden />
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="muted" className="normal-case tracking-normal">
                      Budget {formatLKR(event.totalBudget)}
                    </Badge>
                    <Badge variant="default" className="normal-case tracking-normal">
                      Spent {formatLKR(event.spentBudget)}
                    </Badge>
                    {over && (
                      <Badge variant="destructive" className="normal-case tracking-normal">
                        Over budget
                      </Badge>
                    )}
                    {!over && pct >= 85 && (
                      <Badge variant="accent" className="normal-case tracking-normal">
                        High utilization
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-muted-foreground">Spend progress</span>
                      <span className="font-semibold tabular-nums text-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
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
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
