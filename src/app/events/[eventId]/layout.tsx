"use client";

import React, { use } from "react";
import Header from "@/shared/components/layout/Header";
import Footer from "@/shared/components/layout/Footer";
import EventHeaderClient from "@/modules/events/EventHeaderClient";
import QuickInsightsRow from "@/modules/events/QuickInsightsRow";
import EventNavigation from "@/modules/events/EventNavigation";
import CollaborationHubSidebar from "@/modules/collaboration/CollaborationHubSidebar";
import AIChatWidget from "@/modules/ai/AIChatWidget";
import { RealTimeProvider } from "@/shared/context/RealTimeContext";
import { useAuth } from "@/shared/context/AuthContext";
import { useRouter } from "next/navigation";
import { ClientEventShell } from "@/shared/components/layout/ClientEventShell";
import { PageLoadingSkeleton } from "@/shared/components/ui";

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
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <PageLoadingSkeleton />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <RealTimeProvider eventId={eventId}>
      <div className="flex min-h-screen flex-col bg-background font-roboto text-foreground">
        <Header onLoginClick={() => {}} />

        <ClientEventShell
          header={
            <div className="space-y-6">
              <EventHeaderClient eventId={eventId} />
              <QuickInsightsRow eventId={eventId} />
            </div>
          }
          subNav={<EventNavigation eventId={eventId} />}
        >
          {children}
        </ClientEventShell>

        <Footer />
        <CollaborationHubSidebar eventId={eventId} />
        <AIChatWidget />
      </div>
    </RealTimeProvider>
  );
}
