// File: src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PlusCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EventList from '@/components/dashboard/EventList';
import CreateEventModal from '@/features/event-planning/CreateEventModal';
import { getEvents } from '@/lib/api/events';

interface Event {
  id: string;
  eventName: string;
  eventDate: string;
}

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

  // Effect to protect the route
  useEffect(() => {
    if (!loading && !user) {
      router.push('/'); // Redirect to homepage if not logged in
    }
  }, [user, loading, router]);

  // Effect to fetch events when the user is available
  useEffect(() => {
    const fetchEvents = async () => {
      if (user) {
        try {
          setIsLoadingEvents(true);
          const token = await user.getIdToken();
          const userEvents = await getEvents(token);
          setEvents(userEvents);
        } catch (error) {
          console.error("Failed to fetch events:", error);
          // Handle error (e.g., show a toast notification)
        } finally {
          setIsLoadingEvents(false);
        }
      }
    };

    fetchEvents();
  }, [user]);

  // Don't render anything until we know the auth state
  if (loading || !user) {
    return <div className="h-screen w-full bg-cream"></div>; // Or a loading spinner
  }

  return (
    <>
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-cream)' }}>
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-4xl font-bold font-playfair text-charcoal">Your Events</h1>
                <p className="text-gray-500 mt-2">Manage your upcoming weddings and events.</p>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <PlusCircle size={18} />
                <span>Create New Event</span>
              </button>
            </div>

            <EventList events={events} isLoading={isLoadingEvents} />

          </div>
        </main>
        <Footer />
      </div>

      <CreateEventModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default DashboardPage;
