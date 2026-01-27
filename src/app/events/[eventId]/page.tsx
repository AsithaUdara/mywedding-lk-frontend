"use client";

import React, { use } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TeamSection from '@/features/event-planning/components/TeamSection';
import ChecklistSection from '@/features/event-planning/components/ChecklistSection';
import BudgetSection from '@/features/event-planning/components/BudgetSection';
import EventHeaderClient from '@/features/event-planning/components/EventHeaderClient';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const EventDetailPage = ({ params }: { params: Promise<{ eventId: string }> }) => {
  const { eventId } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  
  if (loading) {
    return <div className="h-screen w-full bg-cream" />;
  }
  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Header onLoginClick={() => {}}/>
      
      {/* --- PROFESSIONAL LAYOUT FIX --- */}
      {/* The main container now allows content to go edge-to-edge */}
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* We add a max-width container here for the header */}
        <div className="max-w-7xl mx-auto mb-8">
          <EventHeaderClient eventId={eventId} />
        </div>

        {/* --- FINAL RESPONSIVE GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start max-w-7xl mx-auto">
          
          {/* --- MAIN CONTENT COLUMN (Spans 3 columns) --- */}
          <div className="lg:col-span-3 space-y-8">
            <TeamSection eventId={eventId} />
            <BudgetSection eventId={eventId} />
          </div>

          {/* --- SIDEBAR COLUMN (Spans 2 columns) --- */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
               <ChecklistSection eventId={eventId} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventDetailPage;