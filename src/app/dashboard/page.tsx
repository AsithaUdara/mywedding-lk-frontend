"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/shared/components/layout/Header";
import Footer from "@/shared/components/layout/Footer";
import EventList from "@/modules/events/EventList";
import CreateEventModal from "@/modules/events/CreateEventModal";
import EventSetupModal from "@/modules/events/EventSetupModal";
import { getEvents } from "@/shared/lib/api/events";
import {
  Button,
  PageHeader,
  SectionCard,
  StatCard,
  PageLoadingSkeleton,
  ErrorBanner,
  Badge,
} from "@/shared/components/ui";
import { CalendarDays, Heart, Sparkles } from "lucide-react";
import { cp } from "@/modules/client/client-theme";
import { cn } from "@/shared/lib/cn";

interface EventSummary {
  id: string;
  eventName: string;
  eventDate: string;
}

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isSetupOpen, setSetupOpen] = useState(false);
  const [newEventInfo, setNewEventInfo] = useState<{ eventId: string; eventName: string } | null>(
    null
  );

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingEvents(true);
      setError(null);
      const token = await user.getIdToken();
      const data = await getEvents(token);
      setEvents(data || []);
    } catch {
      setError("Failed to load your events.");
    } finally {
      setIsLoadingEvents(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }
    void fetchEvents();
  }, [user, authLoading, router, fetchEvents]);

  useEffect(() => {
    if (isLoadingEvents || events.length !== 1) return;
    router.replace(`/events/${events[0].id}`);
  }, [isLoadingEvents, events, router]);

  const handleEventCreated = (newEvent: { eventId: string; eventName: string }) => {
    setNewEventInfo(newEvent);
    setSetupOpen(true);
  };

  const handleSetupClosed = () => {
    setSetupOpen(false);
    setNewEventInfo(null);
    void fetchEvents();
  };

  const nextEvent = useMemo(() => {
    if (events.length === 0) return null;
    const sorted = [...events].sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
    const upcoming = sorted.find((e) => new Date(e.eventDate) >= new Date());
    return upcoming ?? sorted[0];
  }, [events]);

  const displayName = useMemo(() => {
    if (user?.displayName) return user.displayName.split(" ")[0];
    if (user?.email) return user.email.split("@")[0];
    return "there";
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className={cn("min-h-screen", cp.page)}>
        <PageLoadingSkeleton />
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-screen flex-col", cp.page)}>
      <Header onLoginClick={() => {}} />

      <main className="relative mx-auto w-full max-w-7xl flex-grow px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div
          className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-48 -left-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
          aria-hidden
        />

        <PageHeader
          className="relative mb-10 lg:mb-12"
          badge={
            <Badge variant="accent" className="inline-flex items-center gap-1.5">
              <Sparkles size={12} aria-hidden />
              Your wedding workspace
            </Badge>
          }
          title={`Welcome back, ${displayName}`}
          description="Plan every detail in one calm space — timelines, budget, vendors, and collaboration for your celebration."
          action={
            <Button type="button" variant="primary" onClick={() => setCreateOpen(true)}>
              Create new event
            </Button>
          }
        />

        <section className="relative mb-10 grid gap-4 sm:grid-cols-3 lg:mb-12">
          <StatCard
            label="Active events"
            value={isLoadingEvents ? "—" : events.length}
            sub="Celebrations you're planning"
            icon={Heart}
            iconTheme="rose"
          />
          <StatCard
            label="Next milestone"
            value={
              isLoadingEvents ? "—" : nextEvent ? nextEvent.eventName : "No events yet"
            }
            sub={
              nextEvent
                ? new Date(nextEvent.eventDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Create an event to begin"
            }
            icon={CalendarDays}
            iconTheme="accent"
          />
          <StatCard
            label="Planning status"
            value={isLoadingEvents ? "—" : events.length > 0 ? "In progress" : "Ready"}
            sub={
              events.length > 0
                ? "Open an event to continue your checklist"
                : "Start with your first celebration"
            }
            icon={Sparkles}
            iconTheme="primary"
          />
        </section>

        <SectionCard
          title="Your events"
          subtitle="Select a celebration to manage guests, budget, tasks, and vendors."
          action={
            !isLoadingEvents && events.length > 0 ? (
              <Badge variant="muted">
                {events.length} {events.length === 1 ? "event" : "events"}
              </Badge>
            ) : undefined
          }
        >
          {error && <ErrorBanner message={error} className="mb-6" />}

          {isLoadingEvents ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <PageLoadingSkeleton />
            </div>
          ) : (
            <EventList events={events} isLoading={false} />
          )}
        </SectionCard>
      </main>

      <Footer />

      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onEventCreated={handleEventCreated}
      />

      {isSetupOpen && newEventInfo && (
        <EventSetupModal
          isOpen={isSetupOpen}
          onClose={handleSetupClosed}
          eventId={newEventInfo.eventId}
          eventName={newEventInfo.eventName}
        />
      )}
    </div>
  );
};

export default DashboardPage;
