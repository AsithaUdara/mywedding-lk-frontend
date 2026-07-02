"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getOrganizers, type Organizer } from "@/shared/lib/api/events";
import Skeleton from "@/shared/components/ui/Skeleton";
import { useUI } from "@/shared/context/UIContext";
import { useTeamHubNotifications } from "@/shared/context/TeamHubNotificationsContext";
import { Calendar, MessageSquare } from "lucide-react";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";
import { AvatarStack } from "@/shared/components/ui/AvatarStack";
import { useEventBranding } from "@/modules/events/EventBrandingProvider";
import { EventPlannerBrand } from "@/modules/events/EventPlannerBrand";

interface EventHeaderClientProps {
  eventId: string;
}

const EventHeaderClient = ({ eventId }: EventHeaderClientProps) => {
  const { user } = useAuth();
  const { openHub } = useUI();
  const { unreadCount } = useTeamHubNotifications();
  const { event, branding, loading: eventLoading } = useEventBranding();
  const [team, setTeam] = useState<Organizer[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTeam = async () => {
      try {
        const token = await user.getIdToken();
        const teamData = await getOrganizers(token, eventId);
        setTeam(teamData);
      } catch (error) {
        console.error("Failed to fetch team", error);
      } finally {
        setTeamLoading(false);
      }
    };

    void fetchTeam();
  }, [user, eventId]);

  const daysRemaining = useMemo(() => {
    if (!event?.eventDate) return null;
    const eventDateObj = new Date(event.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDateObj.setHours(0, 0, 0, 0);
    const days = Math.ceil((eventDateObj.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  }, [event?.eventDate]);

  const loading = eventLoading || teamLoading;

  if (loading) {
    return (
      <div className={cn(rf.panel, "overflow-hidden p-0")}>
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-3">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-10 w-2/3 rounded-lg" />
            <Skeleton className="h-5 w-1/2 rounded-lg" />
          </div>
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <section className={cn(rf.panel, "overflow-hidden p-0")}>
      {branding ? (
        <div className="border-b border-border/50 bg-gradient-to-r from-primary/[0.06] via-white/40 to-primary/[0.03] px-6 py-5 sm:px-8">
          <EventPlannerBrand branding={branding} variant="hero" />
        </div>
      ) : null}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="border-b border-border/50 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <p className={rf.eyebrow}>Your wedding</p>
          <h1 className="mt-2 font-luxury-display text-3xl font-normal tracking-[0.04em] text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {event.eventName}
          </h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={16} className="shrink-0 text-primary/70" aria-hidden />
            <time dateTime={event.eventDate}>
              {new Date(event.eventDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div className="flex flex-col justify-center gap-4 border-b border-border/50 p-6 sm:border-b-0 sm:border-r lg:border-b lg:border-r-0 xl:border-b-0 xl:border-r">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className={rf.label}>Team hub</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {team.length} collaborator{team.length === 1 ? "" : "s"}
                </p>
              </div>
              {team.length > 0 ? (
                <AvatarStack
                  members={team.map((member) => ({
                    userId: member.userId,
                    firstName: member.firstName,
                    lastName: member.lastName,
                    email: member.email,
                  }))}
                />
              ) : null}
            </div>
            <GlassButton
              type="button"
              variant="primary"
              onClick={openHub}
              className="relative w-full justify-center gap-1.5"
            >
              <MessageSquare size={14} aria-hidden />
              Open team hub
              {unreadCount > 0 ? (
                <span
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground"
                  aria-label={`${unreadCount} unread team message${unreadCount === 1 ? "" : "s"}`}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </GlassButton>
          </div>

          {daysRemaining !== null && (
            <div className="flex flex-col items-center justify-center bg-primary/[0.04] px-6 py-8 text-center">
              <p className={rf.label}>Countdown</p>
              <div className="mt-2 flex items-end justify-center gap-1.5 text-primary">
                <span className="font-luxury-display text-4xl font-normal leading-none sm:text-5xl">
                  {daysRemaining}
                </span>
                <span className="pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
                  days
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EventHeaderClient;
