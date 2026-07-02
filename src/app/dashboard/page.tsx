"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/shared/components/layout/Header";
import Footer from "@/shared/components/layout/Footer";
import EventList from "@/modules/events/EventList";
import { getEvents, type WeddingEventSummary } from "@/shared/lib/api/events";
import { PageLoadingSkeleton, ErrorBanner } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { RegalFrostShell } from "@/modules/design-system/regal-frost/RegalFrostShell";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { CalendarDays, Heart, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/cn";

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<WeddingEventSummary[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <RegalFrostShell mesh marketing className="min-h-screen">
        <PageLoadingSkeleton />
      </RegalFrostShell>
    );
  }

  return (
    <RegalFrostShell mesh className="flex min-h-screen flex-col">
      <Header onLoginClick={() => {}} />

      <main className="dashboard-workspace-ui relative mx-auto w-full max-w-7xl flex-grow px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <GlassPageHeader
          className="mb-8 lg:mb-10"
          badge={
            <span className={cn(rf.badge, "inline-flex items-center gap-1.5")}>
              <Sparkles size={12} aria-hidden />
              Your wedding workspace
            </span>
          }
          title={`Welcome back, ${displayName}`}
          description="Your planner sets up your celebration. Open an event you've been invited to — budget, vendors, and team live there."
        />

        <section className="mb-8 grid gap-4 sm:grid-cols-3 lg:mb-10">
          <GlassStatCard
            label="Active events"
            value={isLoadingEvents ? "—" : events.length}
            sub="Celebrations you're planning"
            icon={Heart}
            iconTheme="primary"
          />
          <GlassStatCard
            label="Next milestone"
            value={isLoadingEvents ? "—" : nextEvent ? nextEvent.eventName : "No events yet"}
            sub={
              nextEvent
                ? new Date(nextEvent.eventDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Waiting for your planner's invitation"
            }
            icon={CalendarDays}
            iconTheme="accent"
          />
          <GlassStatCard
            label="Planning status"
            value={isLoadingEvents ? "—" : events.length > 0 ? "In progress" : "Ready"}
            sub={
              events.length > 0
                ? "Open an event to continue your checklist"
                : "Start with your first celebration"
            }
            icon={Sparkles}
            iconTheme="success"
          />
        </section>

        <GlassSectionCard
          title="Your events"
          subtitle="Select a celebration to manage guests, budget, tasks, and vendors."
          action={
            !isLoadingEvents && events.length > 0 ? (
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-white/60 bg-white/50", vg.caption)}>
                {events.length} {events.length === 1 ? "event" : "events"}
              </span>
            ) : undefined
          }
        >
          {error && <ErrorBanner message={error} className="mb-6" />}

          {isLoadingEvents ? (
            <div className="py-8">
              <PageLoadingSkeleton />
            </div>
          ) : events.length === 0 ? (
            <div
              className={cn(
                "rounded-xl border border-dashed border-white/60 bg-white/25 px-6 py-10 text-center backdrop-blur-sm"
              )}
            >
              <p className={cn("font-medium", vg.body)}>No celebrations linked yet</p>
              <p className={cn("mt-2", vg.subtitle)}>
                Weddings on MyWedding.lk are created by your planner. When they invite you, use the
                link in your email to sign in and access your event here.
              </p>
              <GlassButton href="/login?returnUrl=/dashboard" variant="ghost" className="mt-4">
                Sign in with invitation
              </GlassButton>
            </div>
          ) : (
            <EventList events={events} isLoading={false} />
          )}
        </GlassSectionCard>
      </main>

      <Footer />
    </RegalFrostShell>
  );
};

export default DashboardPage;
