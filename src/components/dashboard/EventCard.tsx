// File: src/components/dashboard/EventCard.tsx
import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Event {
  id: string;
  eventName: string;
  eventDate: string;
}

const EventCard = ({ event }: { event: Event }) => {
  return (
    <motion.div whileHover={{ y: -5 }} className="h-full">
      <Link href={`/events/${event.id}`} className="block h-full bg-white rounded-xl shadow-md hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
        <div className="p-6 flex flex-col h-full">
          <h3 className="text-xl font-bold font-playfair text-charcoal mb-3 flex-grow">{event.eventName}</h3>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Calendar size={14} className="mr-2" />
            <span>{new Date(event.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
            <p className="flex items-center font-semibold text-primary">
              Manage Event <ArrowRight size={16} className="ml-2" />
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EventCard;
