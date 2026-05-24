"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PiggyBank, TrendingDown, Wallet } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import {
  BudgetBarChart,
  EmptyState,
  EventHubCard,
  formatLKR,
  LoadingState,
  PageHeader,
  ProgressBar,
  SectionCard,
  StatCard,
} from "@/modules/planner/components/ui";
import Link from "next/link";

export default function PlannerBudgetPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerEvents(token);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(
    () =>
      events.reduce(
        (acc, event) => {
          acc.totalBudget += event.totalBudget;
          acc.totalSpent += event.spentBudget;
          return acc;
        },
        { totalBudget: 0, totalSpent: 0 }
      ),
    [events]
  );

  const remaining = summary.totalBudget - summary.totalSpent;
  const utilization = summary.totalBudget > 0 ? Math.round((summary.totalSpent / summary.totalBudget) * 100) : 0;

  const chartData = useMemo(
    () =>
      events.slice(0, 8).map((e) => ({
        label: (e.eventName.split(" ")[0] || "E").slice(0, 6),
        spent: e.spentBudget,
        total: e.totalBudget,
      })),
    [events]
  );

  return (
    <section className="space-y-8">
      <PageHeader
        title="Budget Summary"
        description="Track spending and remaining budget across all planner-managed weddings."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          index={0}
          label="Total budget"
          value={formatLKR(summary.totalBudget)}
          icon={<Wallet size={22} />}
          color="bg-gradient-to-br from-primary to-primary/80"
        />
        <StatCard
          index={1}
          label="Total spent"
          value={formatLKR(summary.totalSpent)}
          sub={`${utilization}% utilized`}
          icon={<TrendingDown size={22} />}
          color="bg-gradient-to-br from-rose-500 to-pink-600"
        />
        <StatCard
          index={2}
          label="Remaining"
          value={formatLKR(remaining)}
          icon={<PiggyBank size={22} />}
          color={
            remaining < 0
              ? "bg-gradient-to-br from-red-500 to-red-600"
              : "bg-gradient-to-br from-emerald-500 to-teal-600"
          }
        />
      </div>

      <SectionCard title="Spend by event" subtitle="Relative allocation across portfolio">
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No budget data yet</p>
        ) : (
          <BudgetBarChart data={chartData} />
        )}
        <div className="mt-6">
          <ProgressBar
            label="Portfolio utilization"
            count={summary.totalSpent}
            total={summary.totalBudget || 1}
            color="bg-primary"
          />
        </div>
      </SectionCard>

      {loading ? (
        <LoadingState label="Loading budgets…" />
      ) : events.length === 0 ? (
        <EmptyState
          title="No budget data yet"
          description="Create client events with budgets to track spending here."
          action={
            <Link href="/planner/events" className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
              Add event
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const pct =
              event.totalBudget > 0
                ? Math.min(100, Math.round((event.spentBudget / event.totalBudget) * 100))
                : 0;
            return (
              <EventHubCard
                key={event.eventId}
                eventName={event.eventName}
                clientEmail={event.clientEmail}
                meta={`${pct}% of ${formatLKR(event.totalBudget)} spent`}
                href={`/events/${event.eventId}/budget`}
                actionLabel="Open budget"
              >
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${pct > 100 ? "bg-red-500" : "bg-primary"}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </EventHubCard>
            );
          })}
        </div>
      )}
    </section>
  );
}
