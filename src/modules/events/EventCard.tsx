import React from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

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
      className={cn(
        "group flex flex-col justify-between rounded-xl border border-white/55 bg-white/40 p-5 backdrop-blur-sm sm:p-6",
        "transition-all duration-200 hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55 hover:shadow-[0_4px_20px_hsl(345_100%_25%/0.08)]"
      )}
    >
      <div>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-glass-body text-lg font-bold text-primary">
          {event.eventName.charAt(0).toUpperCase()}
        </div>
        <h3 className="font-glass-body text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {event.eventName}
        </h3>
        <div className={cn("mt-3 flex items-center gap-2", vg.subtitle)}>
          <Calendar size={16} className="shrink-0 text-primary/70" strokeWidth={2} aria-hidden />
          <span>{formattedDate}</span>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <GlassButton href={`/events/${event.id}`} variant="primary" className="gap-1.5">
          Open
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
        </GlassButton>
      </div>
    </article>
  );
};

export default EventCard;
