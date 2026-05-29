"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import { VendorShortlistPanel } from "@/modules/procurement/VendorShortlistPanel";
import { ErrorBanner } from "@/modules/planner/components/ui";
import {
  EmptyState,
  PageHeader,
  PageLoadingSkeleton,
  SectionCard,
  inputClass,
} from "@/shared/components/ui";
export default function PlannerProcurementPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const t = await user.getIdToken();
      const data = await getPlannerEvents(t);
      setEvents(data);
      setEventId((prev) => prev || data[0]?.eventId || "");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(
    () => events.find((e) => e.eventId === eventId),
    [events, eventId]
  );

  if (loading) return <PageLoadingSkeleton />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Vendor procurement"
        description="Build shortlists, send proposals to clients, and track approvals through to booking."
        breadcrumbs={[
          { label: "Planner", href: "/planner/dashboard" },
          { label: "Procurement" },
        ]}
      />

      {error && <ErrorBanner message={error} />}

      {events.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No client events yet"
          description="Create an event under Events before adding vendor proposals."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-[240px] flex-1">
              <label htmlFor="procurement-event" className="mb-1.5 block text-sm font-semibold text-foreground">
                Client event
              </label>
              <select
                id="procurement-event"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className={inputClass}
              >
                {events.map((e) => (
                  <option key={e.eventId} value={e.eventId}>
                    {e.eventName} — {e.clientEmail}
                  </option>
                ))}
              </select>
            </div>
            {selected && (
              <p className="text-sm text-muted-foreground">
                Wedding date:{" "}
                {new Date(selected.eventDate).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </p>
            )}
          </div>

          <SectionCard
            title="Proposal pipeline"
            subtitle="Draft → sent to client → approved → booking requested → vendor confirmed"
          >
            {eventId ? <VendorShortlistPanel eventId={eventId} mode="planner" /> : null}
          </SectionCard>
        </>
      )}
    </div>
  );
}
