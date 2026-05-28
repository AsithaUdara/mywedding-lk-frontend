import React from "react";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

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
    <article className="group flex flex-col justify-between rounded-3xl border border-slate-100/80 bg-white p-6 shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/10 sm:p-8">
      <div>
        <h3 className="font-playfair text-2xl font-bold tracking-tight text-charcoal">{event.eventName}</h3>
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <Calendar size={16} className="shrink-0 text-slate-400" strokeWidth={2} />
          <span>{formattedDate}</span>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.02] hover:bg-neutral-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30"
        >
          Open
          <ArrowRight
            size={16}
            className="transition-transform duration-300 ease-in-out group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </article>
  );
};

export default EventCard;
