"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckSquare, ListChecks } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import {
  EmptyState,
  EventHubCard,
  LoadingState,
  PageHeader,
  StatCard,
} from "@/modules/planner/components/ui";
import Link from "next/link";

export default function PlannerTasksPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerEvents(token, "Active");
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="space-y-8">
      <PageHeader
        title="Tasks"
        description="Jump into each wedding checklist and coordinate execution."
        badge={`${events.length} active`}
      />

      <StatCard
        index={0}
        label="Active checklists"
        value={events.length}
        sub="Open a wedding to manage tasks"
        icon={<ListChecks size={22} />}
        color="bg-gradient-to-br from-primary to-primary/80"
      />

      {loading ? (
        <LoadingState label="Loading tasks…" />
      ) : events.length === 0 ? (
        <EmptyState
          title="No active weddings"
          description="Tasks appear when you have active client events."
          action={
            <Link href="/planner/events" className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
              Manage events
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
              meta={`Wedding date ${new Date(event.eventDate).toLocaleDateString()}`}
              href={`/events/${event.eventId}/checklist`}
              actionLabel="Open checklist"
              badges={
                <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <CheckSquare size={12} />
                  Task board
                </span>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
