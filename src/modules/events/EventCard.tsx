import React from "react";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { cp } from "@/modules/client/client-theme";

interface EventCardProps {
  event: {
    id: string;
    eventName: string;
    eventDate: string;
  };
}

const EventCard = ({ event }: EventCardProps) => {
  const formattedDate = new Date(event.eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article
      className={`group flex flex-col justify-between transition-all duration-300 hover:border-primary/25 hover:shadow-md ${cp.cardPad}`}
    >
      <div>
        <h3 className="font-playfair text-2xl font-bold tracking-tight text-foreground">
          {event.eventName}
        </h3>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar size={16} className="shrink-0 text-primary/70" strokeWidth={2} aria-hidden />
          <span>{formattedDate}</span>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <Button href={`/events/${event.id}`} variant="primary" size="sm">
          Open
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </article>
  );
};

export default EventCard;
