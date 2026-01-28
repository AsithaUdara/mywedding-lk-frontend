"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EventList from '@/components/dashboard/EventList';
import CreateEventModal from '@/features/event-planning/CreateEventModal';
import EventSetupModal from '@/features/event-planning/components/EventSetupModal';
import StyleQuizModal from '@/features/event-planning/components/StyleQuizModal';
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
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- COMPLETE MODAL FLOW STATE MANAGEMENT ---
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isSetupOpen, setSetupOpen] = useState(false);
  const [isQuizOpen, setQuizOpen] = useState(false);
  const [newEventInfo, setNewEventInfo] = useState<{ eventId: string; eventName: string } | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingEvents(true);
      const token = await user.getIdToken();
      const data = await getEvents(token);
      setEvents(data || []);
    } catch (err) {
      setError('Failed to load your events.');
    } finally {
      setIsLoadingEvents(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }
    fetchEvents();
  }, [user, authLoading, router, fetchEvents]);

  // Step 1: Create Modal succeeds, triggers this
  const handleEventCreated = (newEvent: { eventId: string; eventName: string }) => {
    console.log('🎉 Event created successfully:', newEvent);
    setNewEventInfo(newEvent);
    setSetupOpen(true);
    console.log('📋 Opening budget setup modal...');
  };

  // Step 2: Budget Setup Modal closes, triggers this
  const handleSetupClosed = () => {
    console.log('✅ Budget setup completed, opening style quiz...');
    setSetupOpen(false);
    setQuizOpen(true);
  };

  // Step 3: Style Quiz Modal closes, triggers this
  const handleQuizClosed = () => {
    console.log('🎨 Style quiz completed, refreshing events...');
    setQuizOpen(false);
    setNewEventInfo(null);
    fetchEvents();
  };

  if (authLoading || !user) {
    return <div className="h-screen w-full bg-cream" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Header onLoginClick={() => {}} />
      
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

        {error && <div className="p-6 mb-6 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        
        {isLoadingEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                ))}
            </div>
        ) : (
            <EventList events={events} />
        )}
      </main>
      <Footer />

      {/* --- RENDER ALL MODALS, CONTROLLED BY STATE --- */}
      <CreateEventModal 
        isOpen={isCreateOpen} 
        onClose={() => setCreateOpen(false)} 
        onEventCreated={handleEventCreated}
      />

      {isSetupOpen && newEventInfo && (
        <EventSetupModal
          isOpen={isSetupOpen}
          onClose={handleSetupClosed}
          eventId={newEventInfo.eventId}
          eventName={newEventInfo.eventName}
        />
      )}
      
      {isQuizOpen && newEventInfo && (
        <StyleQuizModal
          isOpen={isQuizOpen}
          onClose={handleQuizClosed}
          eventId={newEventInfo.eventId}
        />
      )}
    </div>
  );
};

export default DashboardPage;