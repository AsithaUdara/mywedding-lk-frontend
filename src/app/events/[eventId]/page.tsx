// File: src/app/events/[eventId]/page.tsx
"use client";

import React, { use, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { getEventById } from '@/lib/api/events';
import { Calendar } from 'lucide-react';
import TeamSection from '@/features/event-planning/components/TeamSection';
import ChecklistSection from '@/features/event-planning/components/ChecklistSection';
import BudgetSection from '@/features/event-planning/components/BudgetSection';

interface EventDetails {
  id: string;
  eventName: string;
  eventDate: string;
  createdById: string;
}

const EventDetailPage = ({ params }: { params: Promise<{ eventId: string }> }) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { eventId } = use(params);

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect to protect the route and fetch data
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }

    const fetchEventDetails = async () => {
      try {
        const token = await user.getIdToken();
        const eventData = await getEventById(token, eventId);
        
        if (eventData) {
          setEvent(eventData);
        } else {
          setError("Event not found or you don't have permission to view it.");
        }
      } catch (err) {
        setError("Failed to load event details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [user, authLoading, eventId, router]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-cream">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="space-y-12">
            <div>
              <LoadingSkeleton className="h-10 w-2/3 mb-4" />
              <LoadingSkeleton className="h-5 w-1/3" />
            </div>
            <div className="grid grid-cols-1 gap-8">
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <LoadingSkeleton className="h-6 w-1/4 mb-4" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoadingSkeleton key={i} className="h-4 w-full mb-2" />
                ))}
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <LoadingSkeleton className="h-6 w-1/4 mb-4" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoadingSkeleton key={i} className="h-4 w-full mb-2" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        {error ? (
          <div className="p-8 bg-red-100 text-red-700 rounded-lg">
            <h2 className="text-2xl font-bold">Error</h2>
            <p>{error}</p>
          </div>
        ) : event ? (
          <div className="space-y-12">
            {/* --- Event Header --- */}
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
            
            {/* --- Team Section --- */}
            <TeamSection eventId={eventId} />

            {/* --- Checklist Section --- */}
            <ChecklistSection eventId={eventId} />
            
            {/* --- Budget Section --- */}
            <BudgetSection eventId={eventId} />

          </div>
        ) : (
          <p>No event data found.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EventDetailPage;
