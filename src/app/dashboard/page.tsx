// File: src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EventList from '@/components/dashboard/EventList';
import CreateEventModal from '@/features/event-planning/CreateEventModal';
import { getEvents } from '@/lib/api/events';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { Plus } from 'lucide-react';

interface EventSummary {
  id: string;
  eventName: string;
  eventDate: string;
}

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const data = await getEvents(token);
        // Normalize to EventSummary[] if API returns different keys
        const normalized: EventSummary[] = (data || []).map((e: unknown) => {
          const obj = e as Partial<EventSummary> & { eventId?: string };
          return {
            id: obj.id ?? obj.eventId ?? '',
            eventName: obj.eventName ?? '',
            eventDate: obj.eventDate ?? '',
          };
        });
        setEvents(normalized);
      } catch (err) {
        console.error(err);
        setError('Failed to load your events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, authLoading, router]);

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Header onLoginClick={() => {}} />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold font-playfair text-charcoal">Your Dashboard</h1>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-lg text-white font-semibold shadow-md hover:bg-opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Plus size={18} /> Create New Event
          </button>
        </div>

        {error && (
          <div className="p-6 mb-6 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {loading ? (
          <div className="space-y-6">
            <LoadingSkeleton className="h-8 w-2/3" />
            <LoadingSkeleton className="h-6 w-1/2" />
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
          </div>
        ) : (
          <EventList events={events} isLoading={false} />
        )}
      </main>
      <Footer />

      <CreateEventModal isOpen={isCreateOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
};

export default DashboardPage;
