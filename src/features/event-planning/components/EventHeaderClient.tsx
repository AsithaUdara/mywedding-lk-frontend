"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getEventById } from '@/lib/api/events';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { Calendar } from 'lucide-react';

interface EventHeaderClientProps {
  eventId: string;
}

interface EventDetails {
  id: string;
  eventName: string;
  eventDate: string;
}

const EventHeaderClient: React.FC<EventHeaderClientProps> = ({ eventId }) => {
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!user) {
        setError('Please sign in to view this event.');
        setLoading(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const eventData = await getEventById(token, eventId);
        if (eventData) {
          setEvent(eventData);
        } else {
          setError("Event not found or you don't have permission to view it.");
        }
      } catch {
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && eventId) {
      run();
    }
  }, [user, authLoading, eventId]);

  if (authLoading || loading) {
    return (
      <div>
        <LoadingSkeleton className="h-10 w-2/3 mb-4" />
        <LoadingSkeleton className="h-5 w-1/3" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-6 bg-red-100 text-red-700 rounded-lg">{error ?? 'No event data found.'}</div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl lg:text-5xl font-bold font-playfair text-charcoal">{event.eventName}</h1>
      <div className="flex items-center text-lg text-gray-500 mt-4">
        <Calendar size={18} className="mr-3" />
        <span>
          {new Date(event.eventDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
};

export default EventHeaderClient;
