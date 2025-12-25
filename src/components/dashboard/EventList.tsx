// File: src/components/dashboard/EventList.tsx
import React from 'react';
import EventCard from './EventCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6">
            <LoadingSkeleton className="h-6 w-3/4 mb-3" />
            <LoadingSkeleton className="h-4 w-1/3 mb-6" />
            <div className="flex justify-end">
              <LoadingSkeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
        <h3 className="text-xl font-semibold text-charcoal">No Events Found</h3>
        <p className="text-gray-500 mt-2">Click &quot;Create New Event&quot; to start planning your big day!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventList;
