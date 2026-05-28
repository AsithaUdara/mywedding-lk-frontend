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
  ProgressBar,
  StatusBadge,
} from "@/modules/planner/components/ui";

const glassCard =
  "rounded-[2rem] border border-white/20 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/10 sm:p-8";
const linkMuted =
  "text-sm font-semibold text-slate-600 underline-offset-2 transition-all duration-300 ease-in-out hover:text-charcoal hover:underline";
const pillBtn =
  "inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.02] hover:bg-neutral-900 hover:shadow-xl hover:shadow-primary/10";

export default function PlannerDashboardPage() {
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

  const stats = [
    {
      label: "Active weddings",
      value: overview?.activeWeddings ?? 0,
      sub: `of ${overview?.maxConcurrentEvents ?? 0} plan limit`,
      icon: Users,
      tone: "bg-violet-100/80 text-violet-900/90",
    },
    {
      label: "Pending bookings",
      value: overview?.pendingBookings ?? 0,
      sub: "Awaiting vendor confirmation",
      icon: Clock4,
      tone: "bg-amber-100/80 text-amber-900/90",
    },
    {
      label: "Confirmed",
      value: overview?.confirmedBookings ?? 0,
      sub: "Ready to execute",
      icon: CheckCircle2,
      tone: "bg-emerald-100/80 text-emerald-900/90",
    },
    {
      label: "Portfolio budget",
      value: formatLKR(budgetSummary.total),
      sub: `${utilizationPct}% utilized`,
      icon: Wallet,
      tone: "bg-rose-100/80 text-rose-900/90",
    },
  ];

  if (loading && !overview) {
    return <LoadingState label="Loading your workspace…" />;
  }

  return (
    <section className="relative space-y-8 lg:space-y-10">
      <div
        className="pointer-events-none absolute -right-8 top-0 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-48 h-56 w-56 rounded-full bg-amber-100/35 blur-3xl"
        aria-hidden
      />

      <header className={`relative ${glassCard}`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 shadow-sm backdrop-blur-md">
              <Sparkles size={14} className="text-violet-500/90" />
              Planner workspace
            </p>
            <h1 className="font-playfair text-4xl font-bold tracking-tight text-charcoal md:text-5xl">
              {overview?.businessName || "Planner dashboard"}
            </h1>
            <p className="text-base leading-relaxed text-slate-500 sm:text-lg">
              {overview
                ? `${overview.activePlanTier} plan · up to ${overview.maxConcurrentEvents} concurrent weddings`
                : "Your command center for every client celebration"}
            </p>
          </div>
          {overview?.activePlanTier && (
            <span className="inline-flex shrink-0 rounded-full border border-violet-200/80 bg-violet-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-violet-900/90">
              {overview.activePlanTier}
            </span>
          )}
        </div>
      </header>

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.article
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className={glassCard}
            >
              <div className={`mb-4 inline-flex rounded-2xl p-3 ${stat.tone}`}>
                <Icon size={22} strokeWidth={2} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {stat.label}
              </p>
              <p className="mt-2 font-playfair text-3xl font-bold tracking-tight text-charcoal tabular-nums">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{stat.sub}</p>
            </motion.article>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <article className={glassCard}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-playfair text-xl font-bold tracking-tight text-charcoal">
                Booking pipeline
              </h2>
              <p className="mt-1 text-sm text-slate-500">Across all managed weddings</p>
            </div>
            <Link href="/planner/bookings" className={linkMuted}>
              View all
            </Link>
          </div>
          <div className="space-y-6">
            <ProgressBar
              label="Pending"
              count={bookingTotals.pending}
              total={bookingTotals.total}
              color="bg-amber-500/80"
            />
            <ProgressBar
              label="Confirmed"
              count={bookingTotals.confirmed}
              total={bookingTotals.total}
              color="bg-violet-600/80"
            />
            <ProgressBar
              label="Completed"
              count={bookingTotals.completed}
              total={bookingTotals.total}
              color="bg-emerald-600/80"
            />
          </div>
        </article>

        <article className={glassCard}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-playfair text-xl font-bold tracking-tight text-charcoal">
                Budget by event
              </h2>
              <p className="mt-1 text-sm text-slate-500">Top weddings by allocation</p>
            </div>
            <Link href="/planner/budget" className={linkMuted}>
              Full report
            </Link>
          </div>
          {chartData.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No budget data yet</p>
          ) : (
            <BudgetBarChart data={chartData} />
          )}
          <div className="mt-6 flex justify-between border-t border-slate-100/80 pt-5 text-sm">
            <span className="text-slate-500">Total spent</span>
            <span className="font-bold tabular-nums text-charcoal">
              {formatLKR(budgetSummary.spent)}
            </span>
          </div>
        </article>

        <article className={glassCard}>
          <div className="mb-6">
            <h2 className="font-playfair text-xl font-bold tracking-tight text-charcoal">
              Quick actions
            </h2>
            <p className="mt-1 text-sm text-slate-500">Jump to common workflows</p>
          </div>
          <div className="space-y-3">
            {[
              {
                href: "/planner/events",
                label: "Manage weddings",
                description: "Create & assign client events",
                icon: CalendarDays,
              },
              {
                href: "/planner/ai",
                label: "AI copilot",
                description: "Itineraries & vendor match",
                icon: Sparkles,
              },
              {
                href: "/planner/billing",
                label: "Upgrade plan",
                description: "Unlock more concurrent events",
                icon: TrendingUp,
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-4 rounded-2xl border border-white/30 bg-white/50 p-4 transition-all duration-300 ease-in-out hover:scale-[1.01] hover:border-white/50 hover:bg-white hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-charcoal text-white shadow-sm transition-all duration-300 ease-in-out group-hover:scale-105">
                  <action.icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold tracking-tight text-charcoal">{action.label}</p>
                  <p className="text-sm text-slate-500">{action.description}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-slate-300 transition-all duration-300 ease-in-out group-hover:translate-x-0.5 group-hover:text-charcoal"
                />
              </Link>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <article className={`lg:col-span-2 ${glassCard}`}>
          <div className="mb-6">
            <h2 className="font-playfair text-xl font-bold tracking-tight text-charcoal">
              Upcoming weddings
            </h2>
            <p className="mt-1 text-sm text-slate-500">Next celebrations on your calendar</p>
          </div>
          {!overview?.upcomingEvents.length ? (
            <p className="rounded-3xl border border-dashed border-slate-200/80 bg-slate-50/50 py-12 text-center text-sm text-slate-500">
              No upcoming client weddings yet.{" "}
              <Link
                href="/planner/events"
                className="font-semibold text-charcoal underline-offset-2 transition-all duration-300 ease-in-out hover:underline"
              >
                Create your first event
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {overview.upcomingEvents.map((event, i) => (
                <motion.div
                  key={event.eventId}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/30 bg-white/60 p-5 backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-[1.01] hover:border-white/50 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-charcoal text-sm font-bold text-white shadow-sm">
                      {event.eventName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold tracking-tight text-charcoal">{event.eventName}</p>
                      <p className="mt-1 text-sm text-slate-500">
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
                    <Link href={`/events/${event.eventId}`} className={pillBtn}>
                      Open
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </article>

        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-[2rem] border border-charcoal/10 bg-charcoal p-8 text-white shadow-xl shadow-charcoal/20 transition-all duration-300 ease-in-out hover:scale-[1.01] hover:shadow-2xl"
        >
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Planner pro tip
            </p>
            <h3 className="mt-3 font-playfair text-2xl font-bold tracking-tight">
              Scale your studio
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              Upgrade to run more concurrent weddings, unlock AI workflows, and keep every client on
              track.
            </p>
            <Link
              href="/planner/billing"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-charcoal shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:bg-white/95"
            >
              View plans
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/5" />
        </motion.aside>
      </div>
    </section>
  );
}
