import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TeamSection from '@/features/event-planning/components/TeamSection';
import ChecklistSection from '@/features/event-planning/components/ChecklistSection';
import BudgetSection from '@/features/event-planning/components/BudgetSection';
import EventHeaderClient from '@/features/event-planning/components/EventHeaderClient';

const EventDetailPage = async ({ params }: { params: Promise<{ eventId: string }> }) => {
  const { eventId } = await params;

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* --- Event Header (client fetch) --- */}
          <EventHeaderClient eventId={eventId} />

          {/* --- Team Section --- */}
          <TeamSection eventId={eventId} />

          {/* --- Checklist Section --- */}
          <ChecklistSection eventId={eventId} />

          {/* --- Budget Section --- */}
          <BudgetSection eventId={eventId} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventDetailPage;
