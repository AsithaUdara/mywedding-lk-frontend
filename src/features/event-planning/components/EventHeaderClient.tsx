"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getEventById } from '@/lib/api/events';
import Skeleton from '@/components/ui/Skeleton';
import { Calendar } from 'lucide-react';

interface EventHeaderClientProps {
  eventId: string;
}

const EventHeaderClient = ({ eventId }: EventHeaderClientProps) => {
  const { user } = useAuth();
  const [event, setEvent] = useState<{ eventName: string; eventDate: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchEventHeader = async () => {
      try {
        const token = await user.getIdToken();
        const data = await getEventById(token, eventId);
        if (data) {
          setEvent(data);
        }
      } catch (error) {
        console.error('Failed to fetch event header', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventHeader();
  }, [user, eventId]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-12 w-2/3 mb-4" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div>
      <h1 className="text-4xl lg:text-5xl font-bold font-playfair text-charcoal">{event.eventName}</h1>
      <div className="flex items-center text-lg text-gray-500 mt-4">
        <Calendar size={18} className="mr-3" />
        <span>
          {new Date(event.eventDate).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </span>
      </div>
    </div>
  );
};

export default EventHeaderClient;
