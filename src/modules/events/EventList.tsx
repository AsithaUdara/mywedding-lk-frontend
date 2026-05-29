import React from "react";
import EventCard from "./EventCard";
import { EmptyState } from "@/shared/components/ui";
import { CalendarHeart } from "lucide-react";

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
    return null;
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No events yet"
        description='Click "Create new event" to start planning your celebration.'
        icon={CalendarHeart}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventList;
