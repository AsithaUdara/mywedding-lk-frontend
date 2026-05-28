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
import Skeleton from "@/shared/components/ui/Skeleton";
import { Plus, Sparkles } from "lucide-react";

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
  const [newEventInfo, setNewEventInfo] = useState<{ eventId: string; eventName: string } | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingEvents(true);
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
    fetchEvents();
  }, [user, authLoading, router, fetchEvents]);

  const handleEventCreated = (newEvent: { eventId: string; eventName: string }) => {
    console.log("🎉 Event created successfully:", newEvent);
    setNewEventInfo(newEvent);
    setSetupOpen(true);
    console.log("📋 Opening budget setup modal...");
  };

  const handleSetupClosed = () => {
    console.log("✅ Budget setup completed, refreshing events...");
    setSetupOpen(false);
    setNewEventInfo(null);
    fetchEvents();
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
    return <div className="h-screen w-full bg-slate-50" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-roboto text-charcoal">
      <Header onLoginClick={() => {}} />

      <main className="relative mx-auto w-full max-w-7xl flex-grow px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        {/* Ambient depth */}
        <div
          className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-48 -left-16 h-64 w-64 rounded-full bg-amber-100/40 blur-3xl"
          aria-hidden
        />

        {/* Hero */}
        <header className="relative mb-10 lg:mb-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out">
                <Sparkles size={14} className="text-rose-400/90" />
                Your wedding workspace
              </p>
              <h1 className="font-playfair text-4xl font-bold tracking-tight text-charcoal sm:text-5xl">
                Welcome back, {displayName}
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
                Plan every detail in one calm, curated space — timelines, budget, vendors, and
                collaboration for your celebration.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-charcoal px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.02] hover:bg-neutral-900 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30"
            >
              <Plus
                size={18}
                className="transition-transform duration-300 ease-in-out group-hover:rotate-90"
              />
              <span>Create new event</span>
            </button>
          </div>
        </header>

        {/* Insight strip */}
        <section className="relative mb-10 grid gap-4 sm:grid-cols-3 lg:mb-12">
          <div className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/10 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Active events
            </p>
            <p className="mt-2 font-playfair text-3xl font-bold tracking-tight text-charcoal tabular-nums">
              {isLoadingEvents ? "—" : events.length}
            </p>
            <p className="mt-2 text-sm text-slate-500">Celebrations you&apos;re planning</p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/10 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Next milestone
            </p>
            <p className="mt-2 line-clamp-1 font-playfair text-xl font-bold tracking-tight text-charcoal">
              {isLoadingEvents
                ? "—"
                : nextEvent
                  ? nextEvent.eventName
                  : "No events yet"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {nextEvent
                ? new Date(nextEvent.eventDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Create an event to begin"}
            </p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/10 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Planning status
            </p>
            <p className="mt-2 font-playfair text-3xl font-bold tracking-tight text-charcoal">
              {isLoadingEvents ? "—" : events.length > 0 ? "In progress" : "Ready"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {events.length > 0
                ? "Open an event to continue your checklist"
                : "Start with your first celebration"}
            </p>
          </div>
        </section>

        {/* Events panel */}
        <section className="relative rounded-[2rem] border border-white/20 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-100/80 pb-6">
            <div>
              <h2 className="font-playfair text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
                Your events
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">
                Select a celebration to manage guests, budget, tasks, and vendors.
              </p>
            </div>
            {!isLoadingEvents && events.length > 0 && (
              <span className="rounded-full bg-rose-50 px-4 py-1.5 text-xs font-semibold text-rose-800/90 transition-all duration-300 ease-in-out">
                {events.length} {events.length === 1 ? "event" : "events"}
              </span>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mb-8 rounded-2xl border border-red-200/80 bg-red-50/90 px-6 py-4 text-sm text-red-800/90 shadow-sm transition-all duration-300 ease-in-out"
            >
              {error}
            </div>
          )}

          {isLoadingEvents ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between rounded-3xl border border-slate-100/80 bg-white p-6 shadow-sm transition-all duration-300 ease-in-out sm:p-8"
                >
                  <div className="space-y-4">
                    <Skeleton className="h-7 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                  </div>
                  <Skeleton className="mt-8 h-10 w-28 self-end rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <EventList events={events} isLoading={isLoadingEvents} />
          )}
        </section>
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
