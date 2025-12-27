// File: src/components/dashboard/EventCard.tsx
import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    eventName: string;
    eventDate: string;
  };
}

const EventCard = ({ event }: EventCardProps) => {
  const formattedDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-2xl font-bold text-charcoal mb-2">{event.eventName}</h3>
        <div className="flex items-center text-gray-600">
          <Calendar size={16} className="mr-2" />
          <span>{formattedDate}</span>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <Link href={`/events/${event.id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold shadow-md hover:bg-opacity-90" style={{ backgroundColor: 'var(--color-primary)' }}>
          Open <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
