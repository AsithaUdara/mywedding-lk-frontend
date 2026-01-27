"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EventList from '@/components/dashboard/EventList';
import CreateEventModal from '@/features/event-planning/CreateEventModal';
import { getEvents } from '@/lib/api/events';
import Skeleton from '@/components/ui/Skeleton';
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
        setEvents(data || []);
      } catch (err) {
        setError('Failed to load your events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return <div className="h-screen w-full bg-cream" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Header onLoginClick={() => {}} />
      
      {/* --- PROFESSIONAL LAYOUT FIX --- */}
      {/* This main container enforces the margins and alignment */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold font-playfair text-charcoal">Your Events</h1>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-lg text-white font-semibold shadow-md hover:bg-opacity-90 transition-transform hover:scale-105"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Plus size={18} /> <span>Create New Event</span>
          </button>
        </div>

        {error && (
          <div className="p-6 mb-6 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        <EventList events={events} isLoading={loading} />
        
      </main>
      <Footer />

      <CreateEventModal isOpen={isCreateOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
};

export default DashboardPage;