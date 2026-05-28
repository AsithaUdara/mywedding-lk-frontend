// File: src/components/dashboard/EventList.tsx
import React from 'react';
import EventCard from './EventCard';
import LoadingSkeleton from '@/shared/components/ui/LoadingSkeleton';

interface Event {
  id: string;
  eventName: string;
  eventDate: string;
}

interface EventListProps {
  events: Event[];
  isLoading: boolean;
}

const EventList = ({ events, isLoading }: EventListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-slate-100/80 bg-white p-6 shadow-sm sm:p-8"
          >
            <LoadingSkeleton className="mb-3 h-6 w-3/4 rounded-lg" />
            <LoadingSkeleton className="mb-6 h-4 w-1/3 rounded-lg" />
            <div className="flex justify-end">
              <LoadingSkeleton className="h-10 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200/80 bg-slate-50/50 px-8 py-16 text-center transition-all duration-300 ease-in-out">
        <h3 className="font-playfair text-xl font-bold tracking-tight text-charcoal">No events yet</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Click &quot;Create new event&quot; to start planning your celebration.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventList;

