"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerBookings, getPlannerEvents, PlannerEventListItem, type PlannerBookingListItem } from "@/shared/lib/api/planner";
import { PlannerBookingCard } from "@/modules/planner/bookings/PlannerBookingCard";
import { BookingsToolbar } from "@/modules/planner/bookings/BookingsToolbar";
import {
  type BookingFilter,
  buildWeddingBookingSummaries,
  computeBookingStats,
  filterBookings,
} from "@/modules/planner/bookings/plannerBookingHelpers";
import type { BookingFilterCounts } from "@/modules/planner/bookings/bookingStatusDisplay";
import { PlannerWeddingBookingRow } from "@/modules/planner/bookings/PlannerWeddingBookingRow";
import { ErrorBanner } from "@/modules/planner/components/ui";
import { EmptyState, PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

type ViewTab = "bookings" | "events";

type WeddingFilter = "all" | "attention";

export default function PlannerBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<PlannerBookingListItem[]>([]);
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [view, setView] = useState<ViewTab>("bookings");
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("all");
  const [weddingFilter, setWeddingFilter] = useState<WeddingFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const [bookingData, eventData] = await Promise.all([
        getPlannerBookings(token),
        getPlannerEvents(token),
      ]);
      setBookings(bookingData);
      setEvents(eventData);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message === "Planner subscription expired.") return;
      setError(err instanceof Error ? err.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => computeBookingStats(bookings, events), [bookings, events]);

  const filteredBookings = useMemo(
    () => filterBookings(bookings, bookingFilter),
    [bookings, bookingFilter]
  );

  const weddingSummaries = useMemo(() => {
    const summaries = buildWeddingBookingSummaries(events, bookings);
    if (weddingFilter === "attention") {
      return summaries.filter((summary) => summary.pending > 0);
    }
    return summaries;
  }, [events, bookings, weddingFilter]);

  const allWeddingSummaries = useMemo(
    () => buildWeddingBookingSummaries(events, bookings),
    [events, bookings]
  );

  const filterCounts = useMemo<BookingFilterCounts>(
    () => ({
      all: bookings.length,
      action: filterBookings(bookings, "action").length,
      confirmed: filterBookings(bookings, "confirmed").length,
      completed: filterBookings(bookings, "completed").length,
    }),
    [bookings]
  );

  const bookingFilterLabel =
    ({ all: "All", action: "Needs action", confirmed: "Confirmed", completed: "Completed" } as const)[
      bookingFilter
    ];

  if (loading && bookings.length === 0 && events.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Bookings"
        description="Vendor requests and payments — sync PayHere status or open procurement to manage shortlists."
        badge="Operations"
        action={
          <GlassButton href="/planner/procurement" variant="primary" className="gap-1.5">
            <ClipboardCheck size={16} aria-hidden />
            Procurement
          </GlassButton>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassStatCard
          label="Needs action"
          value={stats.needsAction}
          sub={
            stats.weddingsWithPending > 0
              ? `${stats.weddingsWithPending} wedding${stats.weddingsWithPending === 1 ? "" : "s"}`
              : "No pending requests"
          }
          icon={AlertTriangle}
          iconTheme={stats.needsAction > 0 ? "warning" : "success"}
        />
        <GlassStatCard
          label="Awaiting payment"
          value={stats.awaitingPayment}
          sub="Pending PayHere or deposit"
          icon={CreditCard}
          iconTheme="accent"
        />
        <GlassStatCard
          label="Confirmed"
          value={stats.confirmed}
          sub={stats.completed > 0 ? `${stats.completed} completed` : "Vendor locked in"}
          icon={CheckCircle2}
          iconTheme="primary"
        />
      </div>

      <GlassSectionCard
        title="Booking inbox"
        subtitle={
          view === "bookings"
            ? bookingFilter === "all"
              ? "Every vendor request and payment across your portfolio"
              : `Showing ${filteredBookings.length} of ${stats.total} bookings`
            : weddingFilter === "all"
              ? "Booking activity grouped by client wedding"
              : `${weddingSummaries.length} wedding${weddingSummaries.length === 1 ? "" : "s"} with pending requests`
        }
      >
        <BookingsToolbar
          view={view}
          onViewChange={setView}
          bookingFilter={bookingFilter}
          onBookingFilterChange={setBookingFilter}
          weddingFilter={weddingFilter}
          onWeddingFilterChange={setWeddingFilter}
          filterCounts={filterCounts}
          weddingCount={allWeddingSummaries.length}
          weddingsNeedingAction={allWeddingSummaries.filter((s) => s.pending > 0).length}
        />

        {loading ? (
          <p className={cn("py-8 text-center", vg.subtitle)}>Refreshing bookings…</p>
        ) : view === "bookings" ? (
          filteredBookings.length === 0 ? (
            <EmptyState
              title={bookingFilter === "all" ? "No vendor bookings yet" : "No bookings in this filter"}
              description={
                bookingFilter === "all"
                  ? "Bookings appear when clients request vendors from your managed weddings."
                  : `No ${bookingFilterLabel.toLowerCase()} bookings. You have ${stats.total} total — try All or Needs action.`
              }
              action={
                stats.total > 0 && bookingFilter !== "all" ? (
                  <GlassButton type="button" variant="ghost" onClick={() => setBookingFilter("all")}>
                    Show all bookings
                  </GlassButton>
                ) : (
                  <GlassButton href="/planner/procurement" variant="primary" className="gap-1.5">
                    <ClipboardCheck size={16} aria-hidden />
                    Open procurement
                  </GlassButton>
                )
              }
              className="border-0 bg-transparent shadow-none"
            />
          ) : (
            <ul className="space-y-3" role="list">
              {filteredBookings.map((booking) => (
                <li key={booking.bookingId}>
                  <PlannerBookingCard booking={booking} onSynced={load} />
                </li>
              ))}
            </ul>
          )
        ) : weddingSummaries.length === 0 ? (
          <EmptyState
            title={events.length === 0 ? "No weddings yet" : "No bookings in this view"}
            description={
              events.length === 0
                ? "Booking counts appear when you manage client events."
                : weddingFilter === "attention"
                  ? "No weddings have pending vendor requests right now."
                  : "No booking activity recorded yet for your portfolio."
            }
            action={
              weddingFilter === "attention" ? (
                <GlassButton type="button" variant="ghost" onClick={() => setWeddingFilter("all")}>
                  Show all weddings
                </GlassButton>
              ) : (
                <GlassButton href="/planner/events" variant="primary" className="gap-1.5">
                  <CalendarDays size={16} aria-hidden />
                  Events
                </GlassButton>
              )
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : (
          <ul className="space-y-3" role="list">
            {weddingSummaries.map((summary) => (
              <li key={summary.event.eventId}>
                <PlannerWeddingBookingRow summary={summary} />
              </li>
            ))}
          </ul>
        )}
      </GlassSectionCard>
    </div>
  );
}
