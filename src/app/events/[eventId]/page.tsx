import React from 'react';
import MiniChecklist from '@/features/event-planning/components/MiniChecklist';
import MiniBudget from '@/features/event-planning/components/MiniBudget';
import RecentActivitiesHub from '@/features/event-planning/components/RecentActivitiesHub';

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch">
      {/* Primary Column - 8/12 span */}
      <div className="lg:col-span-8 space-y-6">
        <MiniChecklist eventId={eventId} />
        <MiniBudget eventId={eventId} />
      </div>

      {/* Sidebar Column - 4/12 span */}
      <div className="lg:col-span-4 h-full min-h-0">
        {/* We keep Recent Activities on the dashboard to make it feel alive */}
        <RecentActivitiesHub eventId={eventId} />
      </div>
    </div>
  );
}