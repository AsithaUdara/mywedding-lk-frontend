"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, CheckCircle2, PartyPopper } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import {
  EmptyState,
  EventHubCard,
  LoadingState,
  PageHeader,
  ProgressBar,
  SectionCard,
  StatCard,
} from "@/modules/planner/components/ui";
import Link from "next/link";

export default function PlannerBookingsPage() {
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

  const totals = useMemo(
    () =>
      events.reduce(
        (acc, e) => {
          acc.pending += e.requestedBookings;
          acc.confirmed += e.confirmedBookings;
          acc.completed += e.completedBookings;
          return acc;
        },
        { pending: 0, confirmed: 0, completed: 0 }
      ),
    [events]
  );

  const pipelineTotal = totals.pending + totals.confirmed + totals.completed || 1;

  return (
    <section className="space-y-8">
      <PageHeader
        title="Bookings & Payments"
        description="Monitor request pipeline and payment progress across all weddings."
      />

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          index={0}
          label="Pending"
          value={totals.pending}
          icon={<Clock size={22} />}
          color="bg-gradient-to-br from-amber-500 to-orange-500"
        />
        <StatCard
          index={1}
          label="Confirmed"
          value={totals.confirmed}
          icon={<CheckCircle2 size={22} />}
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          index={2}
          label="Completed"
          value={totals.completed}
          icon={<PartyPopper size={22} />}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
      </div>

      <SectionCard title="Portfolio pipeline" subtitle="Aggregated across all events">
        <div className="space-y-5">
          <ProgressBar label="Pending" count={totals.pending} total={pipelineTotal} color="bg-amber-500" />
          <ProgressBar label="Confirmed" count={totals.confirmed} total={pipelineTotal} color="bg-blue-500" />
          <ProgressBar label="Completed" count={totals.completed} total={pipelineTotal} color="bg-emerald-500" />
        </div>
      </SectionCard>

      {loading ? (
        <LoadingState label="Loading bookings…" />
      ) : events.length === 0 ? (
        <EmptyState
          title="No booking activity yet"
          description="Bookings appear when clients request vendors on managed events."
          action={
            <Link href="/planner/events" className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
              View events
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <EventHubCard
              key={event.eventId}
              eventName={event.eventName}
              clientEmail={event.clientEmail}
              href={`/events/${event.eventId}`}
              actionLabel="Open event"
              badges={
                <>
                  <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    Pending {event.requestedBookings}
                  </span>
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                    Confirmed {event.confirmedBookings}
                  </span>
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    Done {event.completedBookings}
                  </span>
                </>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
