"use client";

import React, { use } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EventHeaderClient from '@/features/event-planning/components/EventHeaderClient';
import QuickInsightsRow from '@/features/event-planning/components/QuickInsightsRow';
import EventNavigation from '@/features/event-planning/components/EventNavigation';
import CollaborationHubSidebar from '@/features/event-planning/components/CollaborationHubSidebar';
import AIChatWidget from '@/features/event-planning/components/AIChatWidget';
import { RealTimeProvider } from '@/context/RealTimeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="h-screen w-full bg-cream" />;
  }

  if (!user) {
    return null;
  }

  return (
    <RealTimeProvider eventId={eventId}>
      <div className="flex flex-col min-h-screen bg-cream">
        <Header onLoginClick={() => { }} />

        <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-12">
          {/* Header section (Hero & Countdown) */}
          <div className="max-w-7xl mx-auto mb-6">
            <EventHeaderClient eventId={eventId} />
          </div>

          {/* Quick Insights Row */}
          <div className="max-w-7xl mx-auto">
            <QuickInsightsRow eventId={eventId} />
          </div>

          {/* Persistent Event Navigation */}
          <div className="max-w-7xl mx-auto">
            <EventNavigation eventId={eventId} />
          </div>

          {/* Page Content (Overview, Checklist, Budget, etc.) */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <Footer />
        <CollaborationHubSidebar eventId={eventId} />
        
        {/* Global AI Chat Widget */}
        <AIChatWidget />
      </div>
    </RealTimeProvider>
  );
}
