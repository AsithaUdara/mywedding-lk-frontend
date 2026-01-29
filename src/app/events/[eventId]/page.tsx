"use client";

import React, { use, useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TeamSection from '@/features/event-planning/components/TeamSection';
import ChecklistSection from '@/features/event-planning/components/ChecklistSection';
import BudgetSection from '@/features/event-planning/components/BudgetSection';
import MyStyleSection from '@/features/event-planning/components/MyStyleSection';
import StyleQuizModal from '@/features/event-planning/components/StyleQuizModal';
import EventHeaderClient from '@/features/event-planning/components/EventHeaderClient';
import ActivityHub from '@/features/event-planning/components/ActivityHub';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getEventById } from '@/lib/api/events';

interface EventDetails {
  id: string;
  eventName: string;
  eventDate: string;
  totalBudget: number;
  stylePreferences: string | null;
}

const EventDetailPage = ({ params }: { params: Promise<{ eventId: string }> }) => {
  const { eventId } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [isQuizOpen, setQuizOpen] = useState(false);
  
  // Define fetchEvent outside useEffect using useCallback so it can be reused
  const fetchEvent = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingEvent(true);
      const token = await user.getIdToken();
      const data = await getEventById(token, eventId);
      setEvent(data);
      console.log('✅ Event data refreshed:', data);
    } catch (err) {
      console.error('Failed to fetch event:', err);
    } finally {
      setLoadingEvent(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/');
      return;
    }

    fetchEvent();
  }, [user, eventId, router, loading, fetchEvent]);

  const handleRefreshPreferences = () => {
    console.log('🔄 Refreshing event preferences...');
    fetchEvent();
  };

  const handleQuizClosed = () => {
    console.log('🎨 Quiz closed, refreshing event data...');
    setQuizOpen(false);
    fetchEvent(); // Refetch to get updated preferences
  };

  if (loading) {
    return <div className="h-screen w-full bg-cream" />;
  }
  if (!user) {
    return null;
  }

  // Parse the preferences JSON string safely
  const stylePreferences = event?.stylePreferences ? JSON.parse(event.stylePreferences) : null;

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Header onLoginClick={() => {}}/>
      
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Header section */}
        <div className="max-w-7xl mx-auto mb-8">
          <EventHeaderClient eventId={eventId} />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
          
          {/* Main content column - Spans 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            <ActivityHub eventId={eventId} />
            <MyStyleSection preferences={stylePreferences} onRefresh={handleRefreshPreferences} onOpenQuiz={() => setQuizOpen(true)} />
            <TeamSection eventId={eventId} />
            <BudgetSection eventId={eventId} />
          </div>

          {/* Sidebar column - Spans 1 column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
               <ChecklistSection eventId={eventId} />
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Style Quiz Modal */}
      <StyleQuizModal
        isOpen={isQuizOpen}
        onClose={handleQuizClosed}
        eventId={eventId}
      />
    </div>
  );
};

export default EventDetailPage;