"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getEventById, getOrganizers, type Organizer } from "@/shared/lib/api/events";
import Skeleton from "@/shared/components/ui/Skeleton";
import { useUI } from "@/shared/context/UIContext";
import { Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import { cp } from "@/modules/client/client-theme";

interface EventHeaderClientProps {
  eventId: string;
}

const EventHeaderClient = ({ eventId }: EventHeaderClientProps) => {
  const { user } = useAuth();
  const { openHub } = useUI();
  const [event, setEvent] = useState<{ eventName: string; eventDate: string } | null>(null);
  const [team, setTeam] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchEventHeaderData = async () => {
      try {
        const token = await user.getIdToken();
        const [eventData, teamData] = await Promise.all([
          getEventById(token, eventId),
          getOrganizers(token, eventId),
        ]);

        if (eventData) {
          setEvent(eventData);

          const eventDateObj = new Date(eventData.eventDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          eventDateObj.setHours(0, 0, 0, 0);

          const timeDiff = eventDateObj.getTime() - today.getTime();
          const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
          setDaysRemaining(days > 0 ? days : 0);
        }

        if (teamData) {
          setTeam(teamData);
        }
      } catch (error) {
        console.error("Failed to fetch event header", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchEventHeaderData();
  }, [user, eventId]);

  if (loading) {
    return (
      <div className={cn(cp.panel, "mb-8")}>
        <Skeleton className="mb-4 h-10 w-2/3 rounded-lg" />
        <Skeleton className="h-6 w-1/3 rounded-lg" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div
      className={cn(
        "relative mb-8 flex flex-col justify-between gap-6 overflow-hidden xl:flex-row xl:items-center",
        cp.panel
      )}
    >
      <div className="pointer-events-none absolute top-0 right-0 h-[400px] w-[400px] -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[240px] w-[240px] -translate-x-1/4 translate-y-1/3 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative z-10 w-full text-center md:text-left xl:w-auto">
        <h1 className="mb-3 font-playfair text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
          {event.eventName}
        </h1>
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground md:justify-start">
          <Calendar size={16} className="text-primary/70" aria-hidden />
          <span>
            {new Date(event.eventDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex w-full flex-col items-stretch gap-4 sm:flex-row xl:w-auto">
        <div className="flex flex-1 flex-col justify-between rounded-2xl border border-border bg-muted/30 p-5 sm:min-w-[220px]">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-left">
              <p className={cp.label}>Team hub</p>
              <p className="text-sm font-bold text-foreground">{team.length} collaborators</p>
            </div>
            <div className="flex -space-x-2.5 overflow-hidden p-0.5">
              {team.slice(0, 3).map((member) => (
                <div
                  key={member.userId}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary/10 bg-primary/10 text-[10px] font-bold text-primary ring-2 ring-card"
                  title={`${member.firstName} ${member.lastName}`}
                >
                  {member.firstName[0]}
                  {member.lastName[0]}
                </div>
              ))}
              {team.length > 3 && (
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-bold text-muted-foreground ring-2 ring-card">
                  +{team.length - 3}
                </div>
              )}
            </div>
          </div>

          <Button type="button" variant="primary" size="sm" onClick={openHub} className="w-full">
            <MessageSquare size={14} aria-hidden />
            Open team hub
          </Button>
        </div>

        {daysRemaining !== null && (
          <div className="flex flex-1 flex-col justify-center rounded-2xl border border-border bg-primary/5 p-5 text-center sm:min-w-[160px]">
            <p className={cp.label}>Countdown</p>
            <div className="mt-2 flex items-baseline justify-center gap-1.5 text-primary">
              <span className="font-playfair text-4xl font-bold leading-none md:text-5xl">
                {daysRemaining}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                days
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventHeaderClient;
