// File: src/components/dashboard/EventList.tsx
import React from 'react';
import EventCard from './EventCard';

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
    return <p className="text-center text-gray-500">Loading your events...</p>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
        <h3 className="text-xl font-semibold text-charcoal">No Events Found</h3>
        <p className="text-gray-500 mt-2">Click "Create New Event" to start planning your big day!</p>
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
