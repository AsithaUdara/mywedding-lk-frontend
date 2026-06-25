"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Sparkles,
  Store,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import { getVendorShortlist, type VendorShortlistItem } from "@/shared/lib/api/vendorShortlist";
import { ProcurementEventContext } from "@/modules/planner/procurement/ProcurementEventContext";
import {
  computeProcurementStats,
  shortlistCountsForEvent,
} from "@/modules/planner/procurement/plannerProcurementHelpers";
import { EventPickerSelect } from "@/modules/planner/planning/EventPlanningHeader";
import { usePlannerCreateEventModal } from "@/modules/planner/subscription/PlannerCreateEventProvider";
import { VendorShortlistPanel } from "@/modules/procurement/VendorShortlistPanel";
import { ErrorBanner } from "@/modules/planner/components/ui";
import { EmptyState, PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

export default function PlannerProcurementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("eventId");
  const { openCreateEventModal } = usePlannerCreateEventModal();
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [shortlistsByEvent, setShortlistsByEvent] = useState<Map<string, VendorShortlistItem[]>>(
    new Map()
  );
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerEvents(token);

      const shortlistEntries: [string, VendorShortlistItem[]][] = await Promise.all(
        data.map(async (event) => {
          try {
            const items = await getVendorShortlist(token, event.eventId);
            return [event.eventId, items] as [string, VendorShortlistItem[]];
          } catch {
            return [event.eventId, []] as [string, VendorShortlistItem[]];
          }
        })
      );

      setEvents(data);
      setShortlistsByEvent(new Map(shortlistEntries));
      setEventId((prev) => {
        if (eventIdFromUrl && data.some((e) => e.eventId === eventIdFromUrl)) {
          return eventIdFromUrl;
        }
        if (prev && data.some((e) => e.eventId === prev)) {
          return prev;
        }
        return data[0]?.eventId || "";
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, [user, eventIdFromUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSelectEvent = useCallback(
    (nextEventId: string) => {
      setEventId(nextEventId);
      router.replace(`/planner/procurement?eventId=${encodeURIComponent(nextEventId)}`, {
        scroll: false,
      });
    },
    [router]
  );

  const selected = useMemo(
    () => events.find((e) => e.eventId === eventId),
    [events, eventId]
  );

  const allShortlistItems = useMemo(
    () => [...shortlistsByEvent.values()].flat(),
    [shortlistsByEvent]
  );

  const stats = useMemo(
    () => computeProcurementStats(events, allShortlistItems),
    [events, allShortlistItems]
  );

  const selectedShortlist = useMemo(
    () => shortlistsByEvent.get(eventId) ?? [],
    [shortlistsByEvent, eventId]
  );

  const selectedCounts = useMemo(
    () => shortlistCountsForEvent(selectedShortlist),
    [selectedShortlist]
  );

  if (loading && events.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Procurement"
        description="Build vendor proposals, send to clients for approval, and track through to booking."
        badge="Vendors"
        action={
          events.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <EventPickerSelect
                events={events}
                selectedEventId={eventId}
                onSelectEvent={handleSelectEvent}
              />
              <GlassButton href="/vendors" variant="ghost" className="gap-1.5">
                <Store size={16} aria-hidden />
                Directory
              </GlassButton>
              <GlassButton href="/planner/ai" variant="ghost" className="gap-1.5">
                <Sparkles size={16} aria-hidden />
                AI match
              </GlassButton>
            </div>
          ) : (
            <GlassButton href="/vendors" variant="ghost" className="gap-1.5">
              <Store size={16} aria-hidden />
              Vendor directory
            </GlassButton>
          )
        }
      />

      {error && <ErrorBanner message={error} />}

      {events.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No client events yet"
          description="Create a wedding event before building vendor proposals."
          action={
            <GlassButton type="button" variant="primary" onClick={openCreateEventModal}>
              Create event
            </GlassButton>
          }
          className={cn(rf.panel, "border-0 shadow-none")}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <GlassStatCard
              label="Draft proposals"
              value={stats.draftProposals}
              sub={stats.draftProposals > 0 ? "Ready to send to client" : "No drafts waiting"}
              icon={ClipboardList}
              iconTheme={stats.draftProposals > 0 ? "warning" : "primary"}
            />
            <GlassStatCard
              label="Awaiting client"
              value={stats.awaitingClient}
              sub="Sent — waiting for approval"
              icon={Clock}
              iconTheme="accent"
            />
            <GlassStatCard
              label="Confirmed vendors"
              value={stats.confirmedVendors}
              sub={
                stats.pendingBookings > 0
                  ? `${stats.pendingBookings} booking${stats.pendingBookings === 1 ? "" : "s"} in progress`
                  : "Locked in across portfolio"
              }
              icon={stats.pendingBookings > 0 ? AlertTriangle : CheckCircle2}
              iconTheme={stats.pendingBookings > 0 ? "warning" : "success"}
            />
          </div>

          <GlassSectionCard
            title="Proposal pipeline"
            subtitle={
              selectedCounts.total > 0
                ? `${selectedCounts.total} proposal${selectedCounts.total === 1 ? "" : "s"} for this wedding — click a stage to filter`
                : "Add vendor proposals and track them through to booking"
            }
          >
            {selected && <ProcurementEventContext event={selected} counts={selectedCounts} />}
            {eventId ? (
              <VendorShortlistPanel eventId={eventId} mode="planner" />
            ) : (
              <EmptyState
                title="Select a wedding"
                description="Choose an event from the picker above to manage vendor proposals."
                className="border-0 bg-transparent shadow-none"
              />
            )}
          </GlassSectionCard>
        </>
      )}
    </div>
  );
}
