"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, UserPlus } from "lucide-react";
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

export default function PlannerInvitationsPage() {
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
        title="Invitations & Team"
        description="Manage collaborators, family, and vendor participants per event."
        badge={`${events.length} active`}
      />

      <StatCard
        index={0}
        label="Events to manage"
        value={events.length}
        sub="Couples, family & vendor access"
        icon={<UserPlus size={22} />}
        color="bg-gradient-to-br from-violet-500 to-purple-600"
      />

      {loading ? (
        <LoadingState label="Loading events…" />
      ) : events.length === 0 ? (
        <EmptyState
          title="No active events"
          description="Invitation management is available on active client weddings."
          action={
            <Link href="/planner/events" className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
              Go to Events
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
              href={`/events/${event.eventId}/team`}
              actionLabel="Manage team"
              badges={
                <span className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">
                  <Mail size={12} />
                  Invites & roles
                </span>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
