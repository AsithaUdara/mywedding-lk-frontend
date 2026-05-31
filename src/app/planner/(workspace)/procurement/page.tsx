"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Store,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import { VendorShortlistPanel } from "@/modules/procurement/VendorShortlistPanel";
import { ErrorBanner } from "@/modules/planner/components/ui";
import { EmptyState, PageLoadingSkeleton, inputClass } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

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

  const totals = useMemo(
    () =>
      events.reduce(
        (acc, e) => {
          acc.pending += e.requestedBookings;
          acc.confirmed += e.confirmedBookings;
          return acc;
        },
        { pending: 0, confirmed: 0 }
      ),
    [events]
  );

  if (loading) return <PageLoadingSkeleton />;

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Vendor procurement"
        description="Build shortlists, send proposals to clients, and track approvals through to booking."
        badge="Procurement"
        action={
          <GlassButton href="/vendors" variant="ghost" className="gap-1.5">
            <Store size={16} aria-hidden />
            Vendor directory
          </GlassButton>
        }
      />

      {error && <ErrorBanner message={error} />}

      {events.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No client events yet"
          description="Create an event under Events before adding vendor proposals."
          action={
            <GlassButton href="/planner/dashboard#create-event-dashboard" variant="primary">
              Create event
            </GlassButton>
          }
          className={cn(rf.panel, "border-0 shadow-none")}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GlassStatCard
              label="Managed weddings"
              value={events.length}
              sub="Client events in portfolio"
              icon={ClipboardList}
              iconTheme="primary"
            />
            <GlassStatCard
              label="Pending requests"
              value={totals.pending}
              sub="Across all weddings"
              icon={Clock}
              iconTheme="warning"
            />
            <GlassStatCard
              label="Confirmed vendors"
              value={totals.confirmed}
              sub="Bookings locked in"
              icon={CheckCircle2}
              iconTheme="success"
            />
            <GlassStatCard
              label="Selected event"
              value={selected?.eventName.split(" ")[0] ?? "—"}
              sub={
                selected
                  ? new Date(selected.eventDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Pick a wedding below"
              }
              icon={CalendarDays}
              iconTheme="accent"
            />
          </div>

          <GlassSectionCard
            title="Client event"
            subtitle="Choose which wedding you are building vendor proposals for"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-[240px] flex-1">
                <label htmlFor="procurement-event" className={cn("mb-1.5 block", vg.body, "font-semibold")}>
                  Wedding
                </label>
                <select
                  id="procurement-event"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className={cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm")}
                >
                  {events.map((e) => (
                    <option key={e.eventId} value={e.eventId}>
                      {e.eventName} — {e.clientEmail}
                    </option>
                  ))}
                </select>
              </div>
              {selected && (
                <p className={cn("pb-1", vg.subtitle)}>
                  Client:{" "}
                  <span className="font-medium text-foreground">{selected.clientEmail}</span>
                  {" · "}
                  Budget tracked in event hub
                </p>
              )}
            </div>
          </GlassSectionCard>

          <GlassSectionCard
            title="Proposal pipeline"
            subtitle="Draft → sent to client → approved → booking requested → vendor confirmed"
          >
            {eventId ? <VendorShortlistPanel eventId={eventId} mode="planner" /> : null}
          </GlassSectionCard>
        </>
      )}
    </div>
  );
}
