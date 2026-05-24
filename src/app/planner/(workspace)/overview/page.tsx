"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock4,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getPlannerEvents,
  getPlannerOverview,
  PlannerEventListItem,
  PlannerOverviewResponse,
} from "@/shared/lib/api/planner";
import {
  BudgetBarChart,
  ErrorBanner,
  formatLKR,
  LoadingState,
  PageHeader,
  ProgressBar,
  QuickActionLink,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/modules/planner/components/ui";

export default function PlannerOverviewPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<PlannerOverviewResponse | null>(null);
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const [overviewData, eventsData] = await Promise.all([
        getPlannerOverview(token),
        getPlannerEvents(token),
      ]);
      setOverview(overviewData);
      setEvents(eventsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load planner overview.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const bookingTotals = useMemo(() => {
    const pending = overview?.pendingBookings ?? 0;
    const confirmed = overview?.confirmedBookings ?? 0;
    const completed = events.reduce((s, e) => s + e.completedBookings, 0);
    const total = pending + confirmed + completed || 1;
    return { pending, confirmed, completed, total };
  }, [overview, events]);

  const budgetSummary = useMemo(() => {
    return events.reduce(
      (acc, e) => {
        acc.total += e.totalBudget;
        acc.spent += e.spentBudget;
        return acc;
      },
      { total: 0, spent: 0 }
    );
  }, [events]);

  const chartData = useMemo(
    () =>
      events.slice(0, 6).map((e) => ({
        label: e.eventName.split(" ")[0] || "Event",
        spent: e.spentBudget,
        total: e.totalBudget,
      })),
    [events]
  );

  const utilizationPct =
    budgetSummary.total > 0
      ? Math.round((budgetSummary.spent / budgetSummary.total) * 100)
      : 0;

  if (loading && !overview) {
    return <LoadingState label="Loading your workspace…" />;
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title={overview?.businessName || "Planner Overview"}
        description={
          overview
            ? `${overview.activePlanTier} plan · up to ${overview.maxConcurrentEvents} concurrent weddings`
            : "Your command center for every client celebration"
        }
        badge={overview?.activePlanTier}
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Active Weddings"
          value={overview?.activeWeddings ?? 0}
          sub={`of ${overview?.maxConcurrentEvents ?? 0} plan limit`}
          icon={<Users size={22} />}
          color="bg-gradient-to-br from-primary to-primary/80"
        />
        <StatCard
          index={1}
          label="Pending Bookings"
          value={overview?.pendingBookings ?? 0}
          sub="Awaiting vendor confirmation"
          icon={<Clock4 size={22} />}
          color="bg-gradient-to-br from-amber-500 to-orange-500"
        />
        <StatCard
          index={2}
          label="Confirmed"
          value={overview?.confirmedBookings ?? 0}
          sub="Ready to execute"
          icon={<CheckCircle2 size={22} />}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
          trend={bookingTotals.total > 1 ? undefined : undefined}
        />
        <StatCard
          index={3}
          label="Portfolio Budget"
          value={formatLKR(budgetSummary.total)}
          sub={`${utilizationPct}% utilized`}
          icon={<Wallet size={22} />}
          color="bg-gradient-to-br from-violet-500 to-purple-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Booking Pipeline"
          subtitle="Across all managed weddings"
          action={
            <Link href="/planner/bookings" className="text-xs font-bold text-primary hover:underline">
              View all
            </Link>
          }
        >
          <div className="space-y-5">
            <ProgressBar
              label="Pending"
              count={bookingTotals.pending}
              total={bookingTotals.total}
              color="bg-amber-500"
            />
            <ProgressBar
              label="Confirmed"
              count={bookingTotals.confirmed}
              total={bookingTotals.total}
              color="bg-blue-500"
            />
            <ProgressBar
              label="Completed"
              count={bookingTotals.completed}
              total={bookingTotals.total}
              color="bg-emerald-500"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Budget by Event"
          subtitle="Top weddings by allocation"
          action={
            <Link href="/planner/budget" className="text-xs font-bold text-primary hover:underline">
              Full report
            </Link>
          }
        >
          {chartData.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No budget data yet</p>
          ) : (
            <BudgetBarChart data={chartData} />
          )}
          <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-sm">
            <span className="text-slate-500">Total spent</span>
            <span className="font-bold text-charcoal">{formatLKR(budgetSummary.spent)}</span>
          </div>
        </SectionCard>

        <SectionCard title="Quick Actions" subtitle="Jump to common workflows">
          <div className="space-y-2">
            <QuickActionLink
              href="/planner/events"
              label="Manage weddings"
              description="Create & assign client events"
              icon={<CalendarDays size={18} />}
            />
            <QuickActionLink
              href="/planner/ai"
              label="AI assistant"
              description="Itineraries & vendor match"
              icon={<Sparkles size={18} />}
            />
            <QuickActionLink
              href="/planner/billing"
              label="Upgrade plan"
              description="Unlock more concurrent events"
              icon={<TrendingUp size={18} />}
            />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Upcoming Weddings" subtitle="Next celebrations on your calendar">
            {!overview?.upcomingEvents.length ? (
              <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
                No upcoming client weddings yet.{" "}
                <Link href="/planner/events" className="font-semibold text-primary">
                  Create your first event
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {overview.upcomingEvents.map((event, i) => (
                  <motion.div
                    key={event.eventId}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-primary/20 hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-primary shadow-sm">
                        {event.eventName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal">{event.eventName}</p>
                        <p className="text-sm text-slate-500">
                          <CalendarClock size={12} className="mr-1 inline" />
                          {new Date(event.eventDate).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {event.clientEmail && ` · ${event.clientEmail}`}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Budget {formatLKR(event.totalBudget)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={event.status} />
                      <Link
                        href={`/events/${event.eventId}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-primary/30 bg-white px-3 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-primary hover:text-white"
                      >
                        Open
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-accent p-6 text-white shadow-xl shadow-primary/20"
        >
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-white/80">Planner Pro tip</p>
            <h3 className="mt-2 font-playfair text-2xl font-bold">Scale your studio</h3>
            <p className="mt-2 text-sm text-white/90">
              Upgrade to run more concurrent weddings, unlock AI workflows, and keep every client on track.
            </p>
            <Link
              href="/planner/billing"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-primary shadow-lg transition hover:bg-white/95"
            >
              View plans
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-black/10" />
        </motion.div>
      </div>
    </section>
  );
}
